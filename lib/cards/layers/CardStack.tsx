"use client";

/**
 * CardStack — DOM-stacked `<img>` layers, the card-composition primitive.
 *
 * Each resolved layer becomes an absolutely-positioned `<img>` with proper
 * z-index ordering. Mobile-first (no canvas), hit-testable at the wrapper,
 * motion-compatible (each layer is a regular DOM node).
 *
 * Element + rarity driven (see types.ts — the honeycomb `cardType` axis was
 * dropped in the cycle-1 port). Pair with `registry.json`; pass a `registry`
 * prop to override (e.g. a kit playground).
 */

import { useMemo } from "react";

import registryJson from "./registry.json";
import { resolve } from "./resolve";
import type {
  Face,
  LayerElement,
  LayerRarity,
  LayerRegistry,
  ResolveInput,
  ResolvedLayer,
  RevealStage,
} from "./types";

const DEFAULT_REGISTRY = registryJson as LayerRegistry;

export interface CardStackProps {
  readonly element: LayerElement;
  /** Defaults to "common". */
  readonly rarity?: LayerRarity;
  /** Defaults to 3 (full reveal). */
  readonly revealStage?: RevealStage;
  /** Defaults to "front". */
  readonly face?: Face;
  /** 0-100, drives the behavioral layer. Defaults to 50. */
  readonly resonance?: number;
  /** Optional override for the registry. */
  readonly registry?: LayerRegistry;
  /** Alt text — applied to the top-most layer (others get aria-hidden). */
  readonly alt?: string;
  /** Optional class merged onto the wrapper. */
  readonly className?: string;
}

export function CardStack({
  element,
  rarity = "common",
  revealStage = 3,
  face = "front",
  resonance = 50,
  registry = DEFAULT_REGISTRY,
  alt,
  className,
}: CardStackProps): React.ReactElement {
  const layers: readonly ResolvedLayer[] = useMemo(() => {
    const input: ResolveInput = {
      registry,
      element,
      rarity,
      revealStage,
      face,
      resonance,
    };
    return resolve(input);
  }, [registry, element, rarity, revealStage, face, resonance]);

  const topIndex = layers.length - 1;

  return (
    <div
      className={`card-stack${className ? ` ${className}` : ""}`}
      data-face={face}
      data-element={element}
      data-rarity={rarity}
      data-reveal={revealStage}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        aspectRatio: `${registry.canvas.width} / ${registry.canvas.height}`,
      }}
    >
      {layers.map((layer, i) => (
        <img
          key={layer.layerName}
          className={`card-stack-layer card-stack-layer-${layer.layerName}`}
          data-layer={layer.layerName}
          data-source={layer.source}
          src={layer.url}
          alt={i === topIndex ? (alt ?? "") : ""}
          aria-hidden={i === topIndex ? undefined : true}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            zIndex: layer.zIndex,
          }}
        />
      ))}
    </div>
  );
}
