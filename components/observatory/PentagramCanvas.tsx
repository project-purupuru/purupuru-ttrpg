"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";
import { ELEMENTS, scoreAdapter, type Element } from "@/lib/score";
import { createPentagram, pentagonEdges, innerStarEdges } from "@/lib/sim/pentagram";
import {
  advanceBreath,
  OBSERVATORY_SPRITE_COUNT,
  seedPopulation,
} from "@/lib/sim/entities";
import type { Puruhani } from "@/lib/sim/types";

interface PentagramCanvasProps {
  onSpriteClick?: (trader: string) => void;
}

const ELEMENT_FALLBACK_HEX: Record<Element, number> = {
  wood: 0x4a8c3f,
  fire: 0xd14a3a,
  earth: 0xb87c3a,
  water: 0x3a6fb8,
  metal: 0xc8c8c8,
};

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
      const radius = Math.min(app.screen.width, app.screen.height) * 0.36;
      const geometry = createPentagram(center, radius);

      // ─── Pentagon edges (生 generation) ────────────────────────────────────
      const lines = new Graphics();
      lines.alpha = 0.55;
      for (const [from, to] of pentagonEdges()) {
        const a = geometry.vertex(from);
        const b = geometry.vertex(to);
        lines.moveTo(a.x, a.y).lineTo(b.x, b.y);
      }
      lines.stroke({ width: 1.5, color: 0xa8a8a8 });

      // ─── Inner-star edges (克 destruction) ─────────────────────────────────
      const star = new Graphics();
      star.alpha = 0.22;
      for (const [from, to] of innerStarEdges()) {
        const a = geometry.vertex(from);
        const b = geometry.vertex(to);
        star.moveTo(a.x, a.y).lineTo(b.x, b.y);
      }
      star.stroke({ width: 1, color: 0x808080 });

      app.stage.addChild(lines);
      app.stage.addChild(star);

      // ─── Vertex glyphs ─────────────────────────────────────────────────────
      const vertexLayer = new Container();
      for (const el of ELEMENTS) {
        const v = geometry.vertex(el);
        const dot = new Graphics();
        dot.circle(0, 0, 6);
        dot.fill({ color: ELEMENT_FALLBACK_HEX[el] });
        dot.x = v.x;
        dot.y = v.y;
        vertexLayer.addChild(dot);
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
      const sprites: Array<{ entity: Puruhani; node: Sprite | Graphics; baseScale: number }> = [];

      for (const entity of entities) {
        const tex = textures[entity.primaryElement];
        let node: Sprite | Graphics;
        let baseScale: number;
        if (tex) {
          const sprite = new Sprite(tex);
          sprite.anchor.set(0.5);
          baseScale = 16 / Math.max(sprite.texture.width, sprite.texture.height);
          sprite.scale.set(baseScale);
          node = sprite;
        } else {
          const g = new Graphics();
          g.circle(0, 0, 5);
          g.fill({ color: ELEMENT_FALLBACK_HEX[entity.primaryElement] });
          baseScale = 1;
          node = g;
        }
        node.x = entity.position.x;
        node.y = entity.position.y;
        node.eventMode = "static";
        node.cursor = "pointer";
        node.on("pointertap", () => onSpriteClick?.(entity.trader));
        spriteLayer.addChild(node);
        sprites.push({ entity, node, baseScale });
      }
      app.stage.addChild(spriteLayer);

      // ─── Idle ticker ───────────────────────────────────────────────────────
      const ticker = (delta: { deltaMS: number }) => {
        if (reduce) return;
        for (const s of sprites) {
          advanceBreath(s.entity, delta.deltaMS);
          const phase = s.entity.breath_phase;
          const breathScale = 1 + 0.08 * Math.sin(2 * Math.PI * phase);
          s.node.scale.set(s.baseScale * breathScale);
        }
      };
      app.ticker.add(ticker);
      rafCleanup = () => app.ticker.remove(ticker);

      // ─── Resize handling ───────────────────────────────────────────────────
      const ro = new ResizeObserver(() => {
        const cx = app.screen.width / 2;
        const cy = app.screen.height / 2;
        const r = Math.min(app.screen.width, app.screen.height) * 0.36;
        const g = createPentagram({ x: cx, y: cy }, r);
        // Re-place vertex dots
        vertexLayer.removeChildren();
        for (const el of ELEMENTS) {
          const v = g.vertex(el);
          const dot = new Graphics();
          dot.circle(0, 0, 6);
          dot.fill({ color: ELEMENT_FALLBACK_HEX[el] });
          dot.x = v.x;
          dot.y = v.y;
          vertexLayer.addChild(dot);
        }
        // Re-anchor sprites
        for (const s of sprites) {
          const blended = g.affinityBlend(s.entity.affinity);
          s.entity.resting_position = blended;
          s.entity.position = { ...blended };
          s.node.x = blended.x;
          s.node.y = blended.y;
        }
        // Re-draw edges
        lines.clear();
        for (const [from, to] of pentagonEdges()) {
          const a = g.vertex(from);
          const b = g.vertex(to);
          lines.moveTo(a.x, a.y).lineTo(b.x, b.y);
        }
        lines.stroke({ width: 1.5, color: 0xa8a8a8 });
        star.clear();
        for (const [from, to] of innerStarEdges()) {
          const a = g.vertex(from);
          const b = g.vertex(to);
          star.moveTo(a.x, a.y).lineTo(b.x, b.y);
        }
        star.stroke({ width: 1, color: 0x808080 });
      });
      ro.observe(host);
      const prevCleanup = rafCleanup;
      rafCleanup = () => {
        prevCleanup?.();
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
