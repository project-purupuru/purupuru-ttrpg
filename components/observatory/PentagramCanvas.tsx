"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Assets,
  BlurFilter,
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
  /** Local night state from weather feed — flips the wrapper texture to cosmos-stars. */
  isNight?: boolean;
  /** Element amplified by the user's location weather — biases wrapper tint
   *  + boosts the matching vertex aura. */
  amplifiedElement?: Element;
}

const ELEMENT_HEX: Record<Element, number> = {
  wood: 0xb8c940,
  fire: 0xd14a3a,
  earth: 0xdcb245,
  water: 0x3a4ec5,
  metal: 0x7e5ca7,
};

// Vertex aura colors — sampled from the dominant non-transparent
// pixels of each /art/elements/ PNG so the glow matches the art's
// own palette rather than a UI swatch. Metal samples as pure gray
// (#a7a7a7); nudged toward cool silver so it reads as glow rather
// than dead pixels.
const AURA_HEX: Record<Element, number> = {
  wood:  0xba7349,
  fire:  0xff8e00,
  earth: 0xa1a55c,
  water: 0x9cd7eb,
  metal: 0xc8ccd6,
};

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

// Element icon PNGs — self-hosted under /public/art/elements/.
// Same-origin paths only — Pixi v8's Assets.load decodes in a
// blob-URL worker that can't follow cross-origin redirects even
// when the remote serves permissive CORS.
const ELEMENT_ICON_URL: Record<Element, string> = {
  wood:  "/art/elements/wood.png",
  fire:  "/art/elements/fire.png",
  earth: "/art/elements/earth.png",
  water: "/art/elements/water.png",
  metal: "/art/elements/metal.png",
};

// Reference geometry — the radius at which the original asset sizes
// (VERTEX_ICON_BASE / AVATAR_DISPLAY_BASE / shadow / aura / focus glow)
// were tuned. On mobile the canvas's min-dimension shrinks, the
// pentagram radius shrinks with it (× 0.38), and we scale every
// pixel-derived asset by `radius / BASE_RADIUS` so the diagram
// reads proportionally instead of vertex icons swallowing the
// pentagram on a narrow screen. Bumped from 228 → 340 to dial down
// laptop/desktop asset sizes ~30% (vertex icons + sprites felt too
// dominant on lg/xl viewports relative to the pentagram). At a
// typical 14" MBP canvas pane (radius ≈ 354) the scale lands at
// ~1.04 — vertex icons render ~104px instead of the original ~155px.
// The floor below keeps mobile sized exactly as before.
const BASE_RADIUS = 340;
const VERTEX_ICON_BASE = 100;
const AVATAR_DISPLAY_BASE = 40;
const SHADOW_RX_BASE = 13;
const SHADOW_RY_BASE = 4;
const SHADOW_OFFSET_BASE = 14;
const AURA_RADIUS_BASE = 32;
const FOCUS_GLOW_R_BASE = 28;

// Sprite contact-shadow vocabulary. Two stacked ellipses inside one
// Graphics object: a softer outer "ambient occlusion" ring at ~1.7×
// the contact radius, and the original tighter contact ellipse on top.
// Stacking the soft ring under the dense disk gives the lil guys a
// readable falloff against the canvas instead of a flat-disk read.
// Both fills ride the same Graphics.alpha (focus-dim modulation),
// so the relative weighting between ring + disk stays constant
// whether a sprite is focused or dimmed.
const SHADOW_OUTER_SCALE = 1.7;
const SHADOW_OUTER_FILL_ALPHA = 0.14;
const SHADOW_INNER_FILL_ALPHA = 0.38;

// Avatar texture sizing — generated bigger than display so retina
// rendering stays crisp regardless of mobile/desktop display target.
const AVATAR_TEX_SIZE = 96;

interface AssetSizes {
  vertexIcon: number;
  avatarDisplay: number;
  shadowRx: number;
  shadowRy: number;
  shadowOffsetY: number;
  auraRadius: number;
  focusGlowR: number;
  focusGlowBreathDelta: number;
}

function computeAssetSizes(radius: number): AssetSizes {
  // Floor at 0.63 of the desktop reference. With BASE_RADIUS=270 the
  // typical mobile pane (radius ≈ 145) computes a scale of ~0.54 which
  // would shrink mobile alongside desktop — clamping to 0.63 keeps
  // mobile sized as it was before the BASE_RADIUS bump while letting
  // larger viewports inherit the new, smaller scale curve. Above the
  // floor it scales linearly with radius.
  const scale = Math.max(0.63, radius / BASE_RADIUS);
  return {
    vertexIcon: VERTEX_ICON_BASE * scale,
    avatarDisplay: AVATAR_DISPLAY_BASE * scale,
    shadowRx: SHADOW_RX_BASE * scale,
    shadowRy: SHADOW_RY_BASE * scale,
    shadowOffsetY: SHADOW_OFFSET_BASE * scale,
    auraRadius: AURA_RADIUS_BASE * scale,
    focusGlowR: FOCUS_GLOW_R_BASE * scale,
    focusGlowBreathDelta: 4 * scale,
  };
}

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
  icon: Sprite | null;
  aura: Graphics;
}

// Aura fill is baked at the boost-max alpha; the Graphics' display alpha
// modulates between rest (matches historical 0.38 effective) and 1.0 when
// the vertex's element is amplified by the live weather feed.
const AURA_BOOST_MAX_ALPHA = 0.62;
const AURA_REST_DISPLAY_ALPHA = 0.61; // 0.62 × 0.61 ≈ 0.378 effective at rest
const AURA_LERP_TC_MS = 420;

function drawVertex(
  layer: Container,
  el: Element,
  v: { x: number; y: number },
  iconTextures: Record<Element, Texture> | null,
  sizes: AssetSizes,
): VertexHandle {
  // Diffuse aura — blurred circle behind the icon so each vertex
  // carries an element-keyed energy field. Smaller base radius +
  // strong blur reads as glow rather than disk.
  const aura = new Graphics();
  aura.circle(0, 0, sizes.auraRadius);
  aura.fill({ color: AURA_HEX[el], alpha: AURA_BOOST_MAX_ALPHA });
  // Display alpha is the modulation channel — fill is baked at the boosted
  // max so the ticker can smoothly lerp display alpha between rest and 1.0
  // depending on whether this vertex's element is currently amplified.
  aura.alpha = AURA_REST_DISPLAY_ALPHA;
  // Padding lets the blur tail render past the Graphics bounding box —
  // without it the soft falloff gets clipped to the source rectangle
  // and the aura reads as a hard square edge instead of fading out.
  const auraBlur = new BlurFilter({ strength: 18 });
  auraBlur.padding = 48;
  aura.filters = [auraBlur];
  aura.x = v.x;
  aura.y = v.y;
  layer.addChild(aura);

  let icon: Sprite | null = null;
  const tex = iconTextures?.[el];
  if (tex) {
    icon = new Sprite(tex);
    icon.anchor.set(0.5);
    // Uniform scale that fits the icon inside a sizes.vertexIcon box.
    // Setting width/height directly would non-uniformly squish icons
    // whose source PNGs aren't square (e.g. jani-face is 399×384).
    const dim = Math.max(tex.width, tex.height) || sizes.vertexIcon;
    const scale = sizes.vertexIcon / dim;
    icon.scale.set(scale);
    icon.x = v.x;
    icon.y = v.y;
    layer.addChild(icon);
  } else {
    // Pre-load fallback — keep the kanji glyph briefly until textures arrive.
    const label = new Text({
      text: ELEMENT_KANJI[el],
      style: {
        fontFamily: "ZCOOL KuaiLe, FOT-Yuruka Std, serif",
        fontSize: sizes.vertexIcon * 0.28,
        fill: 0xffffff,
        align: "center",
      },
    });
    label.anchor.set(0.5, 0.55);
    label.x = v.x;
    label.y = v.y;
    layer.addChild(label);
  }

  return { icon, aura };
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

export function PentagramCanvas({
  onSpriteClick,
  focusedTrader = null,
  isNight,
  amplifiedElement,
}: PentagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  // Read-by-Pixi-ticker mirror of the focusedTrader prop — keeps the
  // canvas useEffect from re-initializing on every focus change while
  // letting the ticker observe the latest selection each frame.
  const focusedTraderRef = useRef<string | null>(null);
  useEffect(() => {
    focusedTraderRef.current = focusedTrader;
  }, [focusedTrader]);
  // Same ref-mirror pattern for amplifiedElement so the aura ticker
  // smoothly chases the latest weather state without re-initializing
  // the Pixi stage on every weather poll.
  const amplifiedElementRef = useRef<Element | undefined>(undefined);
  useEffect(() => {
    amplifiedElementRef.current = amplifiedElement;
  }, [amplifiedElement]);

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
      // `let` so the resize handler can swap in fresh sizes when the
      // host element flexes (mobile rotation, mobile-panel-tab swap
      // shrinking the canvas pane). `assetSizes` is the single source
      // of truth for every pixel-derived asset size in this canvas.
      let assetSizes = computeAssetSizes(radius);

      // ─── Pentagon edges (生 generation) ────────────────────────────────────
      const pentagonG = new Graphics();
      drawPentagon(pentagonG, geometry);

      // ─── Inner-star edges (克 destruction) ─────────────────────────────────
      const starG = new Graphics();
      drawStar(starG, geometry);

      app.stage.addChild(pentagonG);
      app.stage.addChild(starG);

      // ─── Vertex glyphs (large halo + element icon sprite) ──────────────────
      // Preload all five element icon textures in parallel; cache for the
      // resize re-build. Falls back to the kanji glyph if any URL fails.
      let iconTextures: Record<Element, Texture> | null = null;
      try {
        const entries = await Promise.all(
          ELEMENTS.map(async (el) => {
            const tex = (await Assets.load(ELEMENT_ICON_URL[el])) as Texture;
            return [el, tex] as const;
          }),
        );
        iconTextures = Object.fromEntries(entries) as Record<Element, Texture>;
      } catch (err) {
        console.warn("[pentagram] element icon preload failed", err);
      }
      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }

      let vertexLayer = new Container();
      const vertexByElement = {} as Record<Element, VertexHandle>;
      for (const el of ELEMENTS) {
        vertexByElement[el] = drawVertex(
          vertexLayer,
          el,
          geometry.vertex(el),
          iconTextures,
          assetSizes,
        );
      }
      app.stage.addChild(vertexLayer);

      // ─── Weather coupling — IRL infuses wuxing ─────────────────────────────
      // cosmic_intensity → tide-flow amplitude multiplier (high-energy
      // days = stronger circulation around 生 cycle). The amplifiedElement
      // signal still tracks but no longer drives a vertex visual now that
      // the colored halos are gone — per-event amplification reads via
      // the WeatherTile + sprite tide-flow.
      const initial = weatherFeed.current();
      let cosmicIntensity = Math.max(0, Math.min(1, initial.cosmic_intensity ?? 0));
      const unsubWeather = weatherFeed.subscribe((s) => {
        cosmicIntensity = Math.max(0, Math.min(1, s.cosmic_intensity ?? 0));
      });

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

      for (const entity of entities) {
        const accent = topAffinity(entity.affinity, entity.primaryElement);
        const tex = makeAvatarTexture(entity.identity, entity.primaryElement, accent);
        const node = new Sprite(tex);
        node.anchor.set(0.5);
        const baseScale = assetSizes.avatarDisplay / AVATAR_TEX_SIZE;
        node.scale.set(baseScale);
        node.x = entity.position.x;
        node.y = entity.position.y;
        node.eventMode = "static";
        node.cursor = "pointer";
        node.on("pointertap", () => onSpriteClick?.(entity.identity));
        spriteLayer.addChild(node);

        const shadow = new Graphics();
        // Outer ambient ring first (paints under), tighter contact disk
        // on top — see SHADOW_* constants for the rationale.
        shadow.ellipse(0, 0, assetSizes.shadowRx * SHADOW_OUTER_SCALE, assetSizes.shadowRy * SHADOW_OUTER_SCALE);
        shadow.fill({ color: 0x000000, alpha: SHADOW_OUTER_FILL_ALPHA });
        shadow.ellipse(0, 0, assetSizes.shadowRx, assetSizes.shadowRy);
        shadow.fill({ color: 0x000000, alpha: SHADOW_INNER_FILL_ALPHA });
        shadow.x = entity.position.x;
        shadow.y = entity.position.y + assetSizes.shadowOffsetY;
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
      // Peak Graphics.alpha for the shadow container — modulates the
      // composite of both stacked ellipses (outer ring + contact disk).
      // Keep separate from the per-fill SHADOW_*_FILL_ALPHA constants:
      // this one governs focus-dim amplitude, those govern shadow ink
      // weight. Effective per-shape opacity = SHADOW_BASE_ALPHA × fill.alpha.
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
          s.shadow.y = s.entity.position.y + assetSizes.shadowOffsetY;

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

        // ─── Vertex aura amplification — boost the matching element ────────
        // Each aura's display alpha smoothly chases its target: 1.0 when
        // that vertex's element is currently amplified by the user's local
        // weather, AURA_REST_DISPLAY_ALPHA otherwise. Fill is baked at
        // AURA_BOOST_MAX_ALPHA so display-alpha modulation produces an
        // effective 0.38 → 0.62 alpha sweep on the boosted vertex.
        const amplifiedEl = amplifiedElementRef.current;
        const auraLerp = 1 - Math.exp(-dt / AURA_LERP_TC_MS);
        for (const el of ELEMENTS) {
          const handle = vertexByElement[el];
          if (!handle) continue;
          const target = el === amplifiedEl ? 1 : AURA_REST_DISPLAY_ALPHA;
          handle.aura.alpha += (target - handle.aura.alpha) * auraLerp;
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
            const r = assetSizes.focusGlowR + assetSizes.focusGlowBreathDelta * breathPhase;
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
        // Recompute responsive asset sizes for the new pane dimensions.
        // Mutating the same `assetSizes` binding the ticker closes over
        // means focus glow + shadow offsets pick up the new values on
        // the next tick without needing to re-bind the ticker.
        assetSizes = computeAssetSizes(r);

        // Re-build vertex layer. Re-insert at the original z-position
        // (just above the inner-star edges) so it stays UNDER shadow,
        // trails, and sprite layers — addChild() would push it to the
        // top and occlude sprites on every resize.
        app.stage.removeChild(vertexLayer);
        vertexLayer.destroy({ children: true });
        vertexLayer = new Container();
        for (const el of ELEMENTS) {
          vertexByElement[el] = drawVertex(
            vertexLayer,
            el,
            geometry.vertex(el),
            iconTextures,
            assetSizes,
          );
        }
        const starIdx = app.stage.getChildIndex(starG);
        app.stage.addChildAt(vertexLayer, starIdx + 1);

        // Re-anchor sprites at new resting positions; cancel in-flight migrations
        const newBaseScale = assetSizes.avatarDisplay / AVATAR_TEX_SIZE;
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
          // Apply new responsive avatar scale; ticker's per-tick
          // breath multiplier rides this baseScale on the next frame.
          s.baseScale = newBaseScale;
          s.node.scale.set(newBaseScale);
          // Redraw shadow geometry at the new dimensions — clear()
          // wipes both ellipses, ellipse()+fill() pairs re-issue them
          // (outer ring first, tighter contact disk on top). shadow.y
          // is updated by the ticker every frame from assetSizes.shadowOffsetY.
          s.shadow.clear();
          s.shadow.ellipse(0, 0, assetSizes.shadowRx * SHADOW_OUTER_SCALE, assetSizes.shadowRy * SHADOW_OUTER_SCALE);
          s.shadow.fill({ color: 0x000000, alpha: SHADOW_OUTER_FILL_ALPHA });
          s.shadow.ellipse(0, 0, assetSizes.shadowRx, assetSizes.shadowRy);
          s.shadow.fill({ color: 0x000000, alpha: SHADOW_INNER_FILL_ALPHA });
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

  // ─── Wrapper background — day/night texture + amplified-element tint ───
  // Texture flips on isNight: warm grain by day, cosmos starfield by night.
  // The translucent overlay carries a subtle hint of the user's currently-
  // amplified element (~12%) so a fire day reads warm, water day reads cool,
  // etc. — without ever competing with the Pixi stage. is_night undefined
  // (initial paint, before first weather fetch) falls back to the day
  // texture; amplifiedElement undefined falls back to plain cloud-base.
  const textureUrl = isNight
    ? "/art/patterns/cosmos-stars.webp"
    : "/art/patterns/grain-warm.webp";
  const overlayColor = amplifiedElement
    ? `color-mix(in oklch, var(--puru-cloud-base) 88%, var(--puru-${amplifiedElement}-vivid) 12%)`
    : "var(--puru-cloud-base)";
  const tintedOverlay = `color-mix(in oklch, ${overlayColor} 50%, transparent)`;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        perspective: "1400px",
        perspectiveOrigin: "center 60%",
        // Background lives on the OUTER wrapper (no tilt) so the inner
        // rotateX(6deg) on the canvas mount can't reveal page-void along
        // the top edge. Texture tints through at ~50% via a translucent
        // overlay biased by amplifiedElement — no blend mode (which warps
        // unevenly under the perspective).
        background: [
          `linear-gradient(${tintedOverlay}, ${tintedOverlay})`,
          `url('${textureUrl}') center / 120px 120px repeat`,
          "var(--puru-cloud-base)",
        ].join(", "),
      }}
    >
      <div
        ref={containerRef}
        className="relative h-full w-full"
        style={{
          transform: "rotateX(6deg)",
          transformOrigin: "center 55%",
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
