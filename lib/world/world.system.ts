/**
 * world.system.ts · orchestrator composition module.
 * NOT a Service Tag (per S4-T6 · check-system-name-uniqueness.sh excludes this file).
 *
 * This file re-exports the world Layers as a convenience for downstream composition,
 * but is NOT in `runtime.ts` AppLayer's mergeAll arg list. The individual *.live.ts
 * Layers ARE.
 */

import { Layer } from "effect";
import { AwarenessLive } from "./awareness.live";
import { ObservatoryLive } from "./observatory.live";
import { InvocationLive } from "./invocation.live";

/**
 * Convenience composition for tests or alternate runtimes that want all
 * world Layers in one go. The AppLayer in lib/runtime/runtime.ts merges
 * each individually for grep-discoverability.
 */
export const WorldLayers = Layer.mergeAll(AwarenessLive, ObservatoryLive, InvocationLive);
