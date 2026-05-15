/**
 * Card Layer System — barrel export.
 *
 * Consumers route through `@/lib/cards/layers` for the whole layer primitive.
 */

export { CardStack, type CardStackProps } from "./CardStack";
export { resolve } from "./resolve";
export {
  bucketResonance,
  type Face,
  type LayerDefinition,
  type LayerElement,
  type LayerRarity,
  type LayerRegistry,
  type LayerSource,
  type ResolveInput,
  type ResolvedLayer,
  type ResonanceBucket,
  type RevealStage,
  type SelectionLogic,
} from "./types";

import registryJson from "./registry.json";
import type { LayerRegistry } from "./types";

/** Canonical layer registry. */
export const LAYER_REGISTRY: LayerRegistry = registryJson as LayerRegistry;
