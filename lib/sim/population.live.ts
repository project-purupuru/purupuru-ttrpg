/**
 * PopulationLive · adapts the existing populationStore singleton into
 * the Population Effect Service.
 */

import { Effect, Layer, Stream } from "effect";
import { Population } from "./population.port";
import { populationStore } from "./population.system";

export const PopulationLive = Layer.succeed(
  Population,
  Population.of({
    current: Effect.sync(() => populationStore.current()),
    spawns: Stream.async((emit) => {
      const unsubscribe = populationStore.subscribe((s) => {
        void emit.single(s);
      });
      return Effect.sync(() => unsubscribe());
    }),
    distribution: Effect.sync(() => populationStore.distribution()),
  }),
);
