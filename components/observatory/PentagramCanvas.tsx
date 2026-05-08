"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Assets,
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
import type { Puruhani } from "@/lib/sim/types";
import { activityStream, type ActivityEvent } from "@/lib/activity";

interface PentagramCanvasProps {
  onSpriteClick?: (trader: string) => void;
}

const ELEMENT_HEX: Record<Element, number> = {
  wood: 0x4a8c3f,
  fire: 0xd14a3a,
  earth: 0xb87c3a,
  water: 0x3a6fb8,
  metal: 0xc8c8c8,
};

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

interface SpriteEntry {
  entity: Puruhani;
  node: Sprite | Graphics;
  baseScale: number;
  pulse: number; // 0..1, decays — drives action-flash
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

      // ─── Sprite textures ───────────────────────────────────────────────────
      const textures: Partial<Record<Element, Texture>> = {};
      try {
        await Promise.all(
          ELEMENTS.map(async (el) => {
            textures[el] = await Assets.load(`/art/puruhani/puruhani-${el}.png`);
          }),
        );
      } catch {
        // Fall back to solid-color circles if asset load fails (R1.6 mitigation)
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

      const spriteLayer = new Container();
      const sprites: SpriteEntry[] = [];
      const spritesByActor = new Map<string, SpriteEntry>();

      for (const entity of entities) {
        const tex = textures[entity.primaryElement];
        let node: Sprite | Graphics;
        let baseScale: number;
        if (tex) {
          const sprite = new Sprite(tex);
          sprite.anchor.set(0.5);
          baseScale = 14 / Math.max(sprite.texture.width, sprite.texture.height);
          sprite.scale.set(baseScale);
          node = sprite;
        } else {
          const g = new Graphics();
          g.circle(0, 0, 4);
          g.fill({ color: ELEMENT_HEX[entity.primaryElement] });
          baseScale = 1;
          node = g;
        }
        node.x = entity.position.x;
        node.y = entity.position.y;
        node.eventMode = "static";
        node.cursor = "pointer";
        node.on("pointertap", () => onSpriteClick?.(entity.trader));
        spriteLayer.addChild(node);
        const entry: SpriteEntry = { entity, node, baseScale, pulse: 0 };
        sprites.push(entry);
        spritesByActor.set(entity.trader, entry);
      }
      app.stage.addChild(spriteLayer);

      // ─── Activity stream — flash actor sprites on event ────────────────────
      const onActivity = (event: ActivityEvent) => {
        const entry = spritesByActor.get(event.actor);
        if (entry) entry.pulse = 1;
        if (event.target) {
          const tEntry = spritesByActor.get(event.target);
          if (tEntry) tEntry.pulse = 0.6;
        }
      };
      const unsubActivity = activityStream.subscribe(onActivity);

      // ─── Idle ticker ───────────────────────────────────────────────────────
      const ticker = (delta: { deltaMS: number }) => {
        for (const s of sprites) {
          if (!reduce) advanceBreath(s.entity, delta.deltaMS);
          const phase = s.entity.breath_phase;
          const breath = 1 + 0.08 * Math.sin(2 * Math.PI * phase);
          // Pulse decay (action flash) — eases toward 0 over ~0.6s
          if (s.pulse > 0) {
            s.pulse = Math.max(0, s.pulse - delta.deltaMS / 600);
          }
          const pulseScale = 1 + s.pulse * 1.2;
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

        // Re-build vertex layer
        app.stage.removeChild(vertexLayer);
        vertexLayer.destroy({ children: true });
        vertexLayer = new Container();
        for (const el of ELEMENTS) {
          drawVertex(vertexLayer, el, geometry.vertex(el));
        }
        app.stage.addChild(vertexLayer);

        // Re-anchor sprites at new resting positions
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
