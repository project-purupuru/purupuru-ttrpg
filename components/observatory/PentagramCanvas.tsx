"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
} from "pixi.js";
import { ELEMENTS, scoreAdapter, type Element } from "@/lib/score";
import {
  createPentagram,
  pentagonEdges,
  innerStarEdges,
} from "@/lib/sim/pentagram";
import {
  advanceBreath,
  OBSERVATORY_SPRITE_COUNT,
  restingPositionFor,
  seedPopulation,
} from "@/lib/sim/entities";
import type { Puruhani, PuruhaniIdentity } from "@/lib/sim/types";
import { activityStream, type ActivityEvent } from "@/lib/activity";
import { avatarToCanvas } from "@/lib/sim/avatar";
import {
  tideUnitVectorsFor,
  tideMagnitude,
  orbitalWobble,
} from "@/lib/sim/tides";

interface PentagramCanvasProps {
  onSpriteClick?: (identity: PuruhaniIdentity) => void;
}

const ELEMENT_HEX: Record<Element, number> = {
  wood: 0xb8c940,
  fire: 0xd14a3a,
  earth: 0xdcb245,
  water: 0x3a4ec5,
  metal: 0x7e5ca7,
};

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

// Avatar texture sizing — generated bigger than display so retina
// rendering stays crisp. Display target ≈ 40px on screen.
const AVATAR_TEX_SIZE = 96;
const AVATAR_DISPLAY = 40;

interface Migration {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  duration: number;  // ms
  elapsed: number;   // ms
  newElement: Element | null;  // null = transient interaction (no rotation)
}

interface SpriteEntry {
  entity: Puruhani;
  node: Sprite;
  baseScale: number;
  pulse: number;       // 0..1, decays — drives action-flash
  vx: number;          // wander velocity (px / 16ms-ish frame)
  vy: number;
  migration: Migration | null;
}

function topAffinity(
  affinity: Record<Element, number>,
  primary: Element,
): Element {
  let best: Element = primary;
  let bestVal = -1;
  for (const el of ELEMENTS) {
    if (el === primary) continue;
    if (affinity[el] > bestVal) {
      bestVal = affinity[el];
      best = el;
    }
  }
  return best;
}

function makeAvatarTexture(identity: PuruhaniIdentity, primary: Element, accent: Element): Texture {
  const cnv = avatarToCanvas(identity.pfp, primary, accent, AVATAR_TEX_SIZE);
  return Texture.from(cnv);
}

function drawVertex(
  layer: Container,
  el: Element,
  v: { x: number; y: number },
): void {
  const halo = new Graphics();
  halo.circle(0, 0, 38);
  halo.fill({ color: ELEMENT_HEX[el], alpha: 0.18 });
  halo.x = v.x;
  halo.y = v.y;
  layer.addChild(halo);

  const disk = new Graphics();
  disk.circle(0, 0, 26);
  disk.fill({ color: ELEMENT_HEX[el] });
  disk.x = v.x;
  disk.y = v.y;
  layer.addChild(disk);

  const ring = new Graphics();
  ring.circle(0, 0, 26);
  ring.stroke({ width: 1.5, color: 0xffffff, alpha: 0.45 });
  ring.x = v.x;
  ring.y = v.y;
  layer.addChild(ring);

  const label = new Text({
    text: ELEMENT_KANJI[el],
    style: {
      fontFamily: "ZCOOL KuaiLe, FOT-Yuruka Std, serif",
      fontSize: 28,
      fill: 0xffffff,
      align: "center",
    },
  });
  label.anchor.set(0.5, 0.55);
  label.x = v.x;
  label.y = v.y;
  layer.addChild(label);
}

function drawPentagon(g: Graphics, geometry: ReturnType<typeof createPentagram>): void {
  g.clear();
  for (const [from, to] of pentagonEdges()) {
    const a = geometry.vertex(from);
    const b = geometry.vertex(to);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  }
  g.stroke({ width: 2, color: 0xc4b890, alpha: 0.7 });
}

function drawStar(g: Graphics, geometry: ReturnType<typeof createPentagram>): void {
  g.clear();
  for (const [from, to] of innerStarEdges()) {
    const a = geometry.vertex(from);
    const b = geometry.vertex(to);
    g.moveTo(a.x, a.y).lineTo(b.x, b.y);
  }
  g.stroke({ width: 1, color: 0x9a8b6f, alpha: 0.4 });
}

function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

export function PentagramCanvas({ onSpriteClick }: PentagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    let cancelled = false;
    let rafCleanup: (() => void) | undefined;
    const host = containerRef.current;
    if (!host) return;

    const app = new Application();
    appRef.current = app;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }
      host.appendChild(app.canvas);

      const center = { x: app.screen.width / 2, y: app.screen.height / 2 };
      const radius = Math.min(app.screen.width, app.screen.height) * 0.38;
      let geometry = createPentagram(center, radius);
      let tideUnits = tideUnitVectorsFor(geometry);

      // ─── Pentagon edges (生 generation) ────────────────────────────────────
      const pentagonG = new Graphics();
      drawPentagon(pentagonG, geometry);

      // ─── Inner-star edges (克 destruction) ─────────────────────────────────
      const starG = new Graphics();
      drawStar(starG, geometry);

      app.stage.addChild(pentagonG);
      app.stage.addChild(starG);

      // ─── Vertex glyphs (large halo + filled disk + ring + kanji) ───────────
      let vertexLayer = new Container();
      for (const el of ELEMENTS) {
        drawVertex(vertexLayer, el, geometry.vertex(el));
      }
      app.stage.addChild(vertexLayer);

      // ─── Entities ──────────────────────────────────────────────────────────
      const entities: Puruhani[] = await seedPopulation(
        OBSERVATORY_SPRITE_COUNT,
        scoreAdapter,
        geometry,
      );
      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }

      const spriteLayer = new Container();
      const sprites: SpriteEntry[] = [];
      const spritesByActor = new Map<string, SpriteEntry>();
      const baseScale = AVATAR_DISPLAY / AVATAR_TEX_SIZE;

      for (const entity of entities) {
        const accent = topAffinity(entity.affinity, entity.primaryElement);
        const tex = makeAvatarTexture(entity.identity, entity.primaryElement, accent);
        const node = new Sprite(tex);
        node.anchor.set(0.5);
        node.scale.set(baseScale);
        node.x = entity.position.x;
        node.y = entity.position.y;
        node.eventMode = "static";
        node.cursor = "pointer";
        node.on("pointertap", () => onSpriteClick?.(entity.identity));
        spriteLayer.addChild(node);
        const entry: SpriteEntry = {
          entity, node, baseScale,
          pulse: 0, vx: 0, vy: 0, migration: null,
        };
        sprites.push(entry);
        spritesByActor.set(entity.trader, entry);
      }
      app.stage.addChild(spriteLayer);

      // ─── Activity stream — interaction movement on event ───────────────────
      const onActivity = (event: ActivityEvent) => {
        const entry = spritesByActor.get(event.actor);
        if (entry) {
          entry.pulse = 1;
          // Attack/gift: actor "walks toward" target element vertex
          if (event.targetElement) {
            const v = geometry.vertex(event.targetElement);
            const dx = v.x - entry.entity.position.x;
            const dy = v.y - entry.entity.position.y;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
              const speed = 14;
              entry.vx += (dx / len) * speed;
              entry.vy += (dy / len) * speed;
            }
          }
        }
        if (event.target) {
          const tEntry = spritesByActor.get(event.target);
          if (tEntry) tEntry.pulse = 0.6;
        }
      };
      const unsubActivity = activityStream.subscribe(onActivity);

      // ─── Migration scheduler ───────────────────────────────────────────────
      // With 80 sprites we want roughly one migration every 1.5s — frequent
      // enough that the diagram is visibly mutable, sparse enough that the
      // motion isn't dominated by transitions.
      let migrationAccum = 0;
      const MIGRATION_TICK_MS = 1500;

      function pickDifferent(curr: Element): Element {
        let other: Element = curr;
        let tries = 0;
        while (other === curr && tries < 6) {
          other = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)] as Element;
          tries++;
        }
        return other;
      }

      function startMigration(s: SpriteEntry) {
        if (s.migration) return;
        const newEl = pickDifferent(s.entity.primaryElement);
        const positionRng = () => Math.random();
        const newPos = restingPositionFor(
          newEl, s.entity.affinity, geometry, positionRng,
        );
        s.migration = {
          fromX: s.entity.position.x,
          fromY: s.entity.position.y,
          toX: newPos.x,
          toY: newPos.y,
          duration: 2500 + Math.random() * 1500,
          elapsed: 0,
          newElement: newEl,
        };
        s.vx = 0;
        s.vy = 0;
      }

      function commitMigration(s: SpriteEntry) {
        if (!s.migration) return;
        const m = s.migration;
        if (m.newElement) {
          s.entity.primaryElement = m.newElement;
          s.entity.resting_position = { x: m.toX, y: m.toY };
          // Regenerate avatar texture with new primary tint — face/personality
          // (pfp seed) stays the same; body color shifts to the new element.
          const accent = topAffinity(s.entity.affinity, m.newElement);
          const oldTex = s.node.texture;
          s.node.texture = makeAvatarTexture(s.entity.identity, m.newElement, accent);
          oldTex.destroy(true);
        }
        s.migration = null;
      }

      function easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      // ─── Main ticker ───────────────────────────────────────────────────────
      let tMs = 0;
      // Tuning notes:
      //   tide-strength = 0.030 → equilibrium offset ≈ 24px in tide direction
      //   anchor k = 0.0012  → counters tide so cluster doesn't escape
      //   With amp ∈ [0.6, 1.4] the offset breathes between ~14px and ~34px,
      //   producing the visible "circulation" along the 生 generation arc.
      const TIDE_STRENGTH = 0.030;

      const ticker = (delta: { deltaMS: number }) => {
        const dt = delta.deltaMS;
        tMs += dt;

        // Migration scheduler — one sprite every MIGRATION_TICK_MS ms
        if (!reduce) {
          migrationAccum += dt;
          while (migrationAccum >= MIGRATION_TICK_MS) {
            migrationAccum -= MIGRATION_TICK_MS;
            const idx = Math.floor(Math.random() * sprites.length);
            startMigration(sprites[idx]);
          }
        }

        for (const s of sprites) {
          if (!reduce) advanceBreath(s.entity, dt);

          if (s.migration) {
            // Cross-zone migration — eased lerp from→to
            s.migration.elapsed += dt;
            const t = Math.min(1, s.migration.elapsed / s.migration.duration);
            const eased = easeInOutCubic(t);
            s.entity.position.x = s.migration.fromX +
              (s.migration.toX - s.migration.fromX) * eased;
            s.entity.position.y = s.migration.fromY +
              (s.migration.toY - s.migration.fromY) * eased;
            if (t >= 1) commitMigration(s);
          } else if (!reduce) {
            // ─── Wuxing tide-flow ─────────────────────────────────────────
            const tide = tideUnits[s.entity.primaryElement];
            const amp = tideMagnitude(s.entity.primaryElement, tMs);
            s.vx += tide.x * amp * TIDE_STRENGTH * dt;
            s.vy += tide.y * amp * TIDE_STRENGTH * dt;

            // Anchor spring (slightly tighter than the 1000-sprite era so
            // the cluster identity stays clear with fewer members).
            const dxRest = s.entity.resting_position.x - s.entity.position.x;
            const dyRest = s.entity.resting_position.y - s.entity.position.y;
            const k = 0.0012;
            s.vx += dxRest * k * dt;
            s.vy += dyRest * k * dt;

            // Damping
            const damping = 0.94;
            s.vx *= damping;
            s.vy *= damping;
            // Velocity cap
            const speed = Math.hypot(s.vx, s.vy);
            const maxSpeed = 4;
            if (speed > maxSpeed) {
              s.vx = (s.vx / speed) * maxSpeed;
              s.vy = (s.vy / speed) * maxSpeed;
            }
            s.entity.position.x += s.vx;
            s.entity.position.y += s.vy;
          }

          // Per-sprite orbital wobble — applied as a render-time offset on
          // top of the physics state, so it never accumulates into the
          // velocity loop. Keeps each individual visibly alive.
          if (!reduce && !s.migration) {
            const wob = orbitalWobble(s.entity.breath_phase, tMs);
            s.node.x = s.entity.position.x + wob.x;
            s.node.y = s.entity.position.y + wob.y;
          } else {
            s.node.x = s.entity.position.x;
            s.node.y = s.entity.position.y;
          }

          // Pulse decay + scale (with gentle breath jiggle)
          if (s.pulse > 0) s.pulse = Math.max(0, s.pulse - dt / 600);
          const phase = s.entity.breath_phase;
          const breath = 1 + 0.06 * Math.sin(2 * Math.PI * phase);
          const pulseScale = 1 + s.pulse * 0.4;
          s.node.scale.set(s.baseScale * (reduce ? 1 : breath) * pulseScale);
        }
      };
      app.ticker.add(ticker);

      // ─── Resize handling ───────────────────────────────────────────────────
      const ro = new ResizeObserver(() => {
        const cx = app.screen.width / 2;
        const cy = app.screen.height / 2;
        const r = Math.min(app.screen.width, app.screen.height) * 0.38;
        geometry = createPentagram({ x: cx, y: cy }, r);
        tideUnits = tideUnitVectorsFor(geometry);

        // Re-build vertex layer
        app.stage.removeChild(vertexLayer);
        vertexLayer.destroy({ children: true });
        vertexLayer = new Container();
        for (const el of ELEMENTS) {
          drawVertex(vertexLayer, el, geometry.vertex(el));
        }
        app.stage.addChild(vertexLayer);

        // Re-anchor sprites at new resting positions; cancel in-flight migrations
        for (let i = 0; i < sprites.length; i++) {
          const s = sprites[i];
          const positionRng = rng(i + 1009);
          const resting = restingPositionFor(
            s.entity.primaryElement,
            s.entity.affinity,
            geometry,
            positionRng,
          );
          s.entity.resting_position = resting;
          s.entity.position = { ...resting };
          s.node.x = resting.x;
          s.node.y = resting.y;
          s.migration = null;
          s.vx = 0;
          s.vy = 0;
        }

        drawPentagon(pentagonG, geometry);
        drawStar(starG, geometry);
      });
      ro.observe(host);

      rafCleanup = () => {
        app.ticker.remove(ticker);
        unsubActivity();
        ro.disconnect();
      };
    })();

    return () => {
      cancelled = true;
      rafCleanup?.();
      const a = appRef.current;
      if (a) {
        try {
          a.destroy(true, { children: true });
        } catch {
          // StrictMode double-effect: destroy may race with init; ignore.
        }
        appRef.current = null;
      }
    };
  }, [onSpriteClick]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      data-testid="pentagram-canvas"
    >
      <noscript>
        <p className="p-6 text-puru-ink-soft">
          The observatory requires JavaScript to render the wuxing pentagram.
        </p>
      </noscript>
    </div>
  );
}

export { OBSERVATORY_SPRITE_COUNT } from "@/lib/sim/entities";
