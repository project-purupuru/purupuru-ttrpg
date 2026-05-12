/**
 * AwarenessLive · composes weather + activity + population into the
 * consolidated world-belief Service. Owns awarenessRef + awarenessChanges PubSub
 * (per SKILL.md state ownership matrix).
 *
 * The Layer.effect setup captures Population + Activity from its own
 * environment (provided by AppLayer.mergeAll), so the resulting Service
 * methods have no remaining requirements (R = never).
 */

import { Effect, Layer, Ref, Stream } from "effect";
import type { Element } from "@/lib/score";
import { Awareness, type AwarenessState, type AwarenessChange } from "./awareness.port";
import { Population } from "@/lib/sim/population.port";
import { Activity } from "@/lib/activity/activity.port";

const ZERO_DIST: Record<Element, number> = { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 };

const initial: AwarenessState = {
  populationCount: 0,
  distribution: ZERO_DIST,
  recentEventCount: 0,
  currentWeatherElement: null,
  observedAt: new Date().toISOString(),
};

export const AwarenessLive = Layer.effect(
  Awareness,
  Effect.gen(function* () {
    const ref = yield* Ref.make<AwarenessState>(initial);
    // Capture deps at Layer setup time · the resulting Service methods
    // have R = never (deps are closed over).
    const population = yield* Population;
    const activity = yield* Activity;

    return Awareness.of({
      current: Effect.gen(function* () {
        const dist = yield* population.distribution;
        const current = yield* population.current;
        const recent = yield* activity.recent(50);
        const next: AwarenessState = {
          populationCount: current.length,
          distribution: dist,
          recentEventCount: recent.length,
          currentWeatherElement: null,
          observedAt: new Date().toISOString(),
        };
        yield* Ref.set(ref, next);
        return next;
      }),
      // Placeholder: change-stream surface exists for downstream composability;
      // future cycles wire population/weather deltas through.
      // Stream.empty<never> structurally fits Stream.Stream<AwarenessChange> via never-bottom.
      changes: Stream.empty as Stream.Stream<AwarenessChange>,
    });
  }),
);
