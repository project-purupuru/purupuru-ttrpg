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
import { weatherFeed } from "@/lib/weather";
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
  shadow: Graphics;    // soft elliptical contact shadow underneath
  baseScale: number;
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

// Returns the vertex's mutable graphics handles so the ticker can
// modulate visuals (halo alpha, disk/ring brightness) per the
// element-energy state. Halo, disk, and ring all respond — total
// "energy mass" across the 5 vertices is conserved (Flow-Lenia
// per ref doc 03-observatory-visual-references-dig-2026-05-08.md).
interface VertexHandle {
  halo: Graphics;
  disk: Graphics;
  ring: Graphics;
}

function drawVertex(
  layer: Container,
  el: Element,
  v: { x: number; y: number },
): VertexHandle {
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

  return { halo, disk, ring };
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

// Per-element phase offsets for the amplified-halo breath, so the soft
// pulse on whichever element is currently amplified by IRL weather has
// a unique cadence that doesn't lock with the per-sprite breath rates.
const HALO_BREATH_PHASE: Record<Element, number> = {
  wood: 0,
  fire: 1.4,
  earth: 2.7,
  water: 4.1,
  metal: 5.5,
};

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
      const vertexByElement = {} as Record<Element, VertexHandle>;
      for (const el of ELEMENTS) {
        vertexByElement[el] = drawVertex(vertexLayer, el, geometry.vertex(el));
      }
      app.stage.addChild(vertexLayer);

      // ─── Weather coupling — IRL infuses wuxing ─────────────────────────────
      // The off-chain weather signal drives two visual channels:
      //   1. cosmic_intensity → tide-flow amplitude multiplier
      //      (high-energy days = stronger circulation around 生 cycle)
      //   2. amplifiedElement + amplificationFactor → that element's halo
      //      gently pulses brighter (0.18 → ~0.36) while it's amplified
      //
      // Subscribed locally so the canvas reacts without prop-driven
      // re-mounts. Initial state pulled via current() so the first
      // frame already reflects the weather.
      const HALO_BASE_ALPHA = 0.18;
      const HALO_AMP_GAIN = 0.18;
      const initial = weatherFeed.current();
      let cosmicIntensity = Math.max(0, Math.min(1, initial.cosmic_intensity ?? 0));
      let amplifiedElement: Element = initial.amplifiedElement;
      let amplificationFactor = initial.amplificationFactor;
      const unsubWeather = weatherFeed.subscribe((s) => {
        cosmicIntensity = Math.max(0, Math.min(1, s.cosmic_intensity ?? 0));
        amplifiedElement = s.amplifiedElement;
        amplificationFactor = s.amplificationFactor;
      });

      // ─── Element energy — mass-conserved homeostatic state ─────────────────
      // Each vertex carries an "energy" scalar that responds to two
      // drivers: the slow weather-driven equilibrium (amplified element
      // pulled toward 1.4, others toward 0.9 — sum stays at 5.0), and
      // transient event pulses drained from activityStream at an
      // attention-budget rate. An event of element X bumps energy[X]
      // by +0.5 and pulls 0.125 from each of the other four. Decay back
      // to the weather equilibrium with a ~1.5s exponential timeconstant.
      // Reference: dig 2026-05-08 §6 — Flow-Lenia mass-conservation.
      const energy: Record<Element, number> = {
        wood: 1, fire: 1, earth: 1, water: 1, metal: 1,
      };
      const PULSE_BUMP = 0.5;
      const DECAY_TC_MS = 1500;
      const ATTENTION_BUDGET_MS = 500;  // max 2 pulses/sec drained from queue
      const pulseQueue: ActivityEvent[] = [];
      let pulseAccum = 0;
      const onActivity = (e: ActivityEvent) => {
        // Cap queue so a stalled session doesn't accumulate forever
        if (pulseQueue.length < 32) pulseQueue.push(e);
      };
      const unsubActivity = activityStream.subscribe(onActivity);

      function applyPulse(el: Element) {
        energy[el] += PULSE_BUMP;
        const drain = PULSE_BUMP / 4;  // mass-conserved: total Δ = 0
        for (const other of ELEMENTS) {
          if (other === el) continue;
          energy[other] -= drain;
        }
      }

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

      // Shadow layer sits below sprites so all shadows draw before any
      // sprite — prevents one sprite from rendering over a neighbour's
      // shadow at higher z. Implies a ground plane without one existing.
      const shadowLayer = new Container();
      const spriteLayer = new Container();
      const sprites: SpriteEntry[] = [];
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

        const shadow = new Graphics();
        shadow.ellipse(0, 0, 13, 4);
        shadow.fill({ color: 0x000000, alpha: 0.22 });
        shadow.x = entity.position.x;
        shadow.y = entity.position.y + 14;
        shadowLayer.addChild(shadow);

        const entry: SpriteEntry = {
          entity, node, shadow, baseScale,
          vx: 0, vy: 0, migration: null,
        };
        sprites.push(entry);
      }
      app.stage.addChild(shadowLayer);
      app.stage.addChild(spriteLayer);

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

        // ─── Drain attention-budget queue ─────────────────────────────────
        // Cap visible event-pulses to ~2/sec regardless of how fast
        // events arrive — preserves the calm observatory rhythm vs a
        // transaction-explorer firehose (dig 2026-05-08 §3 Watch Dogs
        // Legion Player Attention System).
        pulseAccum += dt;
        while (pulseAccum >= ATTENTION_BUDGET_MS && pulseQueue.length > 0) {
          pulseAccum -= ATTENTION_BUDGET_MS;
          const e = pulseQueue.shift()!;
          applyPulse(e.element);
        }
        // Drop excess accumulator if the queue empties — don't bank
        // budget; the system should settle back to baseline cleanly.
        if (pulseQueue.length === 0 && pulseAccum > ATTENTION_BUDGET_MS) {
          pulseAccum = ATTENTION_BUDGET_MS;
        }

        // ─── Element-energy decay toward weather equilibrium ──────────────
        // amplified element pulled toward 1.4, others toward 0.9 — sum
        // stays at 5.0 (mass-conserved). Exponential approach with
        // 1.5s timeconstant. ampNorm gates how strongly weather biases
        // the equilibrium; at amplificationFactor < 0.85 the bias dies
        // and all five sit at 1.0.
        const ampNorm = Math.max(0, Math.min(1, (amplificationFactor - 0.85) / 0.30));
        const targetAmp = 1 + 0.4 * ampNorm;
        const targetDim = 1 - 0.1 * ampNorm;
        const decay = Math.exp(-dt / DECAY_TC_MS);
        for (const el of ELEMENTS) {
          const target = el === amplifiedElement ? targetAmp : targetDim;
          energy[el] = energy[el] * decay + target * (1 - decay);
        }

        // ─── Apply energy to vertex visuals ───────────────────────────────
        // Halo: alpha follows raw energy; amplified element also carries
        // the slow ~7s breath pulse on top so the lit vertex feels
        // actively driven by something beyond the diagram.
        for (const el of ELEMENTS) {
          const v = vertexByElement[el];
          if (!v) continue;
          const e = energy[el];
          let breathBoost = 0;
          if (el === amplifiedElement && ampNorm > 0) {
            const breath = 0.5 + 0.5 * Math.sin(tMs / 7000 + HALO_BREATH_PHASE[el]);
            breathBoost = HALO_AMP_GAIN * ampNorm * (0.7 + 0.3 * breath);
          }
          // halo: 0.18 baseline · scales with energy (≈0.16 dim, ≈0.25 amp,
          // ≈0.27 fresh-pulse) plus the weather breath on the amplified one
          v.halo.alpha = HALO_BASE_ALPHA * e + breathBoost;
          v.halo.scale.set(0.92 + 0.08 * e);
          // disk + ring: subtle alpha lift with energy, never strong enough
          // to break the ceramic-tile register
          v.disk.alpha = 0.85 + 0.15 * e;
          v.ring.alpha = 0.45 * (0.7 + 0.3 * e);
        }

        // Tide multiplier from cosmic energy. 0 → 1.0 (baseline),
        // 1 → 1.5 (heavier circulation). Subtle on purpose.
        const energyMul = 1 + 0.5 * cosmicIntensity;

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
            const amp = tideMagnitude(s.entity.primaryElement, tMs) * energyMul;
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

          // Shadow tracks the physics anchor (not the wobble) so the
          // sprite appears to bob over a stationary ground point.
          s.shadow.x = s.entity.position.x;
          s.shadow.y = s.entity.position.y + 14;

          // Gentle breath scale — no event-driven pulse here; the
          // user-action interaction model is being designed separately.
          const phase = s.entity.breath_phase;
          const breath = 1 + 0.06 * Math.sin(2 * Math.PI * phase);
          s.node.scale.set(s.baseScale * (reduce ? 1 : breath));
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
          vertexByElement[el] = drawVertex(vertexLayer, el, geometry.vertex(el));
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
        unsubWeather();
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
      className="relative h-full w-full overflow-hidden"
      style={{ perspective: "1400px", perspectiveOrigin: "center 60%" }}
    >
      <div
        ref={containerRef}
        className="relative h-full w-full"
        style={{
          transform: "rotateX(6deg)",
          transformOrigin: "center 55%",
          background:
            "radial-gradient(ellipse 75% 65% at center, color-mix(in oklch, var(--puru-cloud-bright) 80%, var(--puru-cloud-base)) 0%, var(--puru-cloud-base) 38%, var(--puru-cloud-dim) 72%, var(--puru-cloud-deep) 100%)",
        }}
        data-testid="pentagram-canvas"
      >
        <noscript>
          <p className="p-6 text-puru-ink-soft">
            The observatory requires JavaScript to render the wuxing pentagram.
          </p>
        </noscript>
      </div>
    </div>
  );
}

export { OBSERVATORY_SPRITE_COUNT } from "@/lib/sim/entities";
