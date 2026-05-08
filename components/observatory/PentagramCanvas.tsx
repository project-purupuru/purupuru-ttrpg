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
import { avatarToCanvas } from "@/lib/sim/avatar";
import {
  tideUnitVectorsFor,
  tideMagnitude,
  orbitalWobble,
} from "@/lib/sim/tides";

interface PentagramCanvasProps {
  onSpriteClick?: (identity: PuruhaniIdentity) => void;
  /** Wallet of the currently-focused puruhani; non-focused sprites dim. */
  focusedTrader?: string | null;
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
  lastTrailAt: number;  // elapsed ms at which we last dropped a trail dot
}

interface SpriteEntry {
  entity: Puruhani;
  node: Sprite;
  shadow: Graphics;    // soft elliptical contact shadow underneath
  baseScale: number;
  vx: number;          // wander velocity (px / 16ms-ish frame)
  vy: number;
  migration: Migration | null;
  focusAlpha: number;  // 0..1 — smoothly tracks focus dim/restore target
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

// Per-channel lerp between two hex colors. t=0 → a, t=1 → b.
// Used for the smooth tint transition when sprite focus dim/restores.
function lerpHex(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

export function PentagramCanvas({ onSpriteClick, focusedTrader = null }: PentagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  // Read-by-Pixi-ticker mirror of the focusedTrader prop — keeps the
  // canvas useEffect from re-initializing on every focus change while
  // letting the ticker observe the latest selection each frame.
  const focusedTraderRef = useRef<string | null>(null);
  useEffect(() => {
    focusedTraderRef.current = focusedTrader;
  }, [focusedTrader]);

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

      // ─── Element energy — slow weather-driven equilibrium ──────────────────
      // Each vertex carries an "energy" scalar pulled toward a target
      // determined by the weather state: amplified element targets 1.4,
      // others target 0.9 — sum stays at 5.0 (mass-conserved per
      // Flow-Lenia, dig 2026-05-08 §6). Exponential approach with 1.5s
      // timeconstant means amplifiedElement transitions smoothly when
      // weather shifts. Per-event pulses live in the activity rail; the
      // canvas reads as ambient world mood only.
      const energy: Record<Element, number> = {
        wood: 1, fire: 1, earth: 1, water: 1, metal: 1,
      };
      const DECAY_TC_MS = 1500;

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
          focusAlpha: 1,
        };
        sprites.push(entry);
      }
      app.stage.addChild(shadowLayer);

      // ─── Migration trails — fading watercolor breadcrumbs ──────────────
      // Sprites in flight drop a soft element-tinted blob every 70ms.
      // Each blob ages out over 2.4s, so a typical 3s migration leaves
      // a visible arc that decays after the sprite lands. Three concentric
      // alpha-stacked circles per dot give the watercolor edge feel
      // without needing a BlurFilter (per dig 2026-05-08 §2 Strava
      // Global Heatmap — bilinear smoothing of historical paths into
      // emergent texture rather than hard polylines).
      interface TrailDot {
        x: number;
        y: number;
        color: number;
        age: number;
      }
      const trails: TrailDot[] = [];
      const TRAIL_LIFE_MS = 1900;
      const TRAIL_EMIT_MS = 110;
      const TRAILS_MAX = 200; // hard cap as a safety net

      const trailsLayer = new Container();
      const trailsG = new Graphics();
      trailsLayer.addChild(trailsG);
      app.stage.addChild(trailsLayer);

      app.stage.addChild(spriteLayer);

      // ─── Focus glow — soft element-tinted ring under the selected sprite ──
      // Sits above shadows but below sprites so it reads as a halo on the
      // ground rather than a bezel painted over the avatar. Single Graphics
      // updated per-tick — drawn only when focusedTraderRef has a match.
      const focusGlow = new Graphics();
      focusGlow.alpha = 0;
      app.stage.addChildAt(focusGlow, app.stage.getChildIndex(spriteLayer));
      const FOCUS_LERP_TC_MS = 280;
      const SHADOW_BASE_ALPHA = 0.22;
      // When dimmed, tint multiplies the avatar texture toward this hex so
      // non-selected sprites read as recessed-into-shadow rather than
      // see-through. 0x4a4a4a ≈ 29% brightness — keeps the silhouette
      // and avatar features readable while clearly de-emphasised.
      const FOCUS_DIM_TINT = 0x4a4a4a;

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
          // Negative seed so the very first trail dot drops on the next
          // tick rather than waiting EMIT_MS — keeps short migrations
          // from missing the first dot entirely.
          lastTrailAt: -1000,
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
        // Halo only — disk and ring stay constant (set once at construction)
        // so the kanji glyph reads as a stable artifact. The halo carries
        // both the slow energy bias (amplifiedElement glows brighter) and
        // the ~7s breath pulse layered on top of the amplified element.
        for (const el of ELEMENTS) {
          const v = vertexByElement[el];
          if (!v) continue;
          const e = energy[el];
          let breathBoost = 0;
          if (el === amplifiedElement && ampNorm > 0) {
            const breath = 0.5 + 0.5 * Math.sin(tMs / 7000 + HALO_BREATH_PHASE[el]);
            breathBoost = HALO_AMP_GAIN * ampNorm * (0.7 + 0.3 * breath);
          }
          v.halo.alpha = HALO_BASE_ALPHA * e + breathBoost;
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
            // Drop a trail dot at every TRAIL_EMIT_MS of migration time.
            // Color is the *origin* element so the trail reads as
            // "where this puruhani is leaving from" — fading behind it
            // as it crosses to its new zone.
            if (
              !reduce &&
              s.migration.elapsed - s.migration.lastTrailAt >= TRAIL_EMIT_MS &&
              trails.length < TRAILS_MAX
            ) {
              s.migration.lastTrailAt = s.migration.elapsed;
              trails.push({
                x: s.entity.position.x,
                y: s.entity.position.y,
                color: ELEMENT_HEX[s.entity.primaryElement],
                age: 0,
              });
            }
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

          // ─── Focus tint — darken non-selected sprites when one is focused ──
          // focusAlpha smoothly approaches 1 when this sprite is the
          // focused one (or nothing is focused), otherwise 0. Mapped onto
          // a tint multiplier so dimmed sprites stay fully opaque (avatars
          // recognisable, just recessed into shadow) instead of going
          // see-through. Shadow alpha rides a half-amplitude version so
          // ground-presence stays partially visible on the dim crowd.
          const focusedT = focusedTraderRef.current;
          const focusTarget = focusedT === null || s.entity.trader === focusedT ? 1 : 0;
          const focusLerp = 1 - Math.exp(-dt / FOCUS_LERP_TC_MS);
          s.focusAlpha += (focusTarget - s.focusAlpha) * focusLerp;
          s.node.tint = lerpHex(FOCUS_DIM_TINT, 0xffffff, s.focusAlpha);
          s.shadow.alpha = SHADOW_BASE_ALPHA * (0.55 + 0.45 * s.focusAlpha);
        }

        // ─── Migration trails — age + soft-edged render ─────────────────────
        // Each dot drawn as 3 concentric alpha-stacked circles so the
        // edge feels watercolor rather than flat-disk. Always clear+
        // redraw so a single Graphics holds the whole field — under
        // typical activity (1-3 active migrations) this is ≤90 circles.
        trailsG.clear();
        for (let i = trails.length - 1; i >= 0; i--) {
          const trail = trails[i];
          trail.age += dt;
          if (trail.age >= TRAIL_LIFE_MS) {
            trails.splice(i, 1);
            continue;
          }
          const u = trail.age / TRAIL_LIFE_MS;
          const fade = 1 - u;
          // Three soft layers: outer halo (faintest, biggest) → mid-ring →
          // dense core. The core dims slightly faster than the halo so
          // older trails read as soft clouds, fresher ones as bright dots.
          trailsG.circle(trail.x, trail.y, 16);
          trailsG.fill({ color: trail.color, alpha: fade * 0.06 });
          trailsG.circle(trail.x, trail.y, 9);
          trailsG.fill({ color: trail.color, alpha: fade * fade * 0.13 });
          trailsG.circle(trail.x, trail.y, 4);
          trailsG.fill({ color: trail.color, alpha: fade * fade * 0.26 });
        }

        // ─── Focus glow — draw soft element-tinted ring under selected ─────
        // Single Graphics, redrawn each frame from scratch. Cheap enough
        // (1 circle + breath) and keeps the position dead-true to the
        // sprite's render-time offset (wobble + tide + migration all
        // already baked into s.node.x/y above).
        const focusedT = focusedTraderRef.current;
        if (focusedT) {
          const target = sprites.find((s) => s.entity.trader === focusedT);
          if (target) {
            const breathPhase = 0.5 + 0.5 * Math.sin(tMs / 1300);
            const r = 28 + 4 * breathPhase;
            const color = ELEMENT_HEX[target.entity.primaryElement];
            focusGlow.clear();
            focusGlow.circle(target.node.x, target.node.y + 2, r + 6);
            focusGlow.fill({ color, alpha: 0.10 });
            focusGlow.circle(target.node.x, target.node.y + 2, r);
            focusGlow.stroke({ width: 1.5, color, alpha: 0.55 });
            focusGlow.alpha = Math.min(1, focusGlow.alpha + dt / 200);
          } else {
            focusGlow.alpha = Math.max(0, focusGlow.alpha - dt / 200);
          }
        } else {
          focusGlow.alpha = Math.max(0, focusGlow.alpha - dt / 200);
          if (focusGlow.alpha === 0) focusGlow.clear();
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
