/**
 * Population Service · typed surface for compass's spatial sim state.
 * Wraps the populationStore singleton as an Effect Service.
 *
 * Lift-pattern reference: grimoires/loa/specs/lift-pattern-template.md (S1-T10)
 */

import { Context, Effect, Stream } from "effect";
import type { Element } from "@/lib/score";
import type { SpawnedPuruhani } from "./population.system";

export class Population extends Context.Tag("compass/Population")<
  Population,
  {
    readonly current: Effect.Effect<readonly SpawnedPuruhani[]>;
    readonly spawns: Stream.Stream<SpawnedPuruhani>;
    readonly distribution: Effect.Effect<Record<Element, number>>;
  }
>() {}
