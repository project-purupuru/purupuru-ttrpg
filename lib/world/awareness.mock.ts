/**
 * AwarenessMock · in-memory test substrate · per-instance state.
 */

import { Effect, Layer, Ref, Stream } from "effect";
import { Awareness, type AwarenessState, type AwarenessChange } from "./awareness.port";

const defaultSeed: AwarenessState = {
  populationCount: 0,
  distribution: { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 },
  recentEventCount: 0,
  currentWeatherElement: null,
  observedAt: new Date(0).toISOString(),
};

export const AwarenessMock = (seed: AwarenessState = defaultSeed) =>
  Layer.effect(
    Awareness,
    Effect.gen(function* () {
      const ref = yield* Ref.make<AwarenessState>(seed);
      return Awareness.of({
        current: Ref.get(ref),
        changes: Stream.empty as Stream.Stream<AwarenessChange>,
      });
    }),
  );
