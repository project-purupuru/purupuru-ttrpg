/**
 * Card Layer System — Types.
 *
 * Ported into the purupuru cycle-1 worktree from compass's lib/cards/layers.
 * Decoupled from the honeycomb card/element taxonomy so it stands alone: the
 * layer system is element + rarity driven. The original `cardType` axis is
 * dropped — its only consumer (the `character` layer) was element-driven
 * anyway (all four cardType variants resolved to the same path).
 *
 * Render model: DOM-stacked <img> layers (NOT canvas) — mobile-first,
 * hit-testable, motion-compatible.
 */

export type LayerElement = "wood" | "fire" | "earth" | "metal" | "water" | "harmony";

export type LayerRarity = "common" | "mid" | "rare" | "rarest";

export type RevealStage = 1 | 2 | 3;

export type LayerSource = "immutable" | "adaptive";

export type Face = "front" | "back";

export type ResonanceBucket = "dormant" | "awakening" | "resonant" | "harmonized";

export type SelectionLogic =
  | { readonly type: "element"; readonly variants: Readonly<Record<string, string>> }
  | { readonly type: "rarity"; readonly variants: Readonly<Record<LayerRarity, string>> }
  | {
      readonly type: "resonance";
      readonly thresholds: Readonly<Record<ResonanceBucket, readonly [number, number]>>;
      readonly paths: Readonly<Record<ResonanceBucket, string>>;
      readonly elementSpecific: readonly ResonanceBucket[];
    }
  | { readonly type: "static"; readonly path: string };

export interface LayerDefinition {
  readonly name: string;
  readonly zIndex: number;
  readonly source: LayerSource;
  readonly selectionLogic: SelectionLogic;
  /** If absent, layer applies to all reveal stages. */
  readonly revealStages?: readonly RevealStage[];
  /** If absent, layer applies to all faces. */
  readonly faces?: readonly Face[];
  readonly description?: string;
}

export interface LayerRegistry {
  readonly version: number;
  readonly canvas: { readonly width: number; readonly height: number };
  /** Prepended to non-absolute paths. Local repo paths start with `/`. */
  readonly cdnBase: string;
  readonly layers: readonly LayerDefinition[];
}

export interface ResolvedLayer {
  readonly url: string;
  readonly zIndex: number;
  readonly layerName: string;
  readonly source: LayerSource;
}

export interface ResolveInput {
  readonly registry: LayerRegistry;
  readonly element: LayerElement;
  readonly rarity: LayerRarity;
  readonly revealStage: RevealStage;
  readonly face: Face;
  /** 0-100, drives behavioral layer bucket. Defaults to 50 ("awakening"). */
  readonly resonance?: number;
  /** Adaptive element affinity from score API. Defaults to `element`. */
  readonly elementAffinity?: LayerElement;
}

/** Bucket a 0-100 resonance value into the behavioral layer's keys. */
export function bucketResonance(
  r: number,
  thresholds: Readonly<Record<ResonanceBucket, readonly [number, number]>>,
): ResonanceBucket {
  const order: readonly ResonanceBucket[] = ["dormant", "awakening", "resonant", "harmonized"];
  for (const bucket of order) {
    const range = thresholds[bucket];
    if (range && r >= range[0] && r <= range[1]) return bucket;
  }
  return "dormant";
}
