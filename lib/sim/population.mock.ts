/**
 * PopulationMock · in-memory test substrate.
 */

import { Effect, Layer, Stream } from "effect";
import { Population } from "./population.port";
import type { Element } from "@/lib/score";
import type { SpawnedPuruhani } from "./population.system";

export const PopulationMock = (seed: readonly SpawnedPuruhani[] = []) => {
  const buffer: SpawnedPuruhani[] = [...seed];
  const subscribers = new Set<(s: SpawnedPuruhani) => void>();

  const distribution = (): Record<Element, number> => {
    const out: Record<Element, number> = { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 };
    for (const s of buffer) out[s.primaryElement]++;
    return out;
  };

  return Layer.succeed(
    Population,
    Population.of({
      current: Effect.sync(() => [...buffer]),
      spawns: Stream.async((emit) => {
        const cb = (s: SpawnedPuruhani) => {
          void emit.single(s);
        };
        subscribers.add(cb);
        return Effect.sync(() => {
          subscribers.delete(cb);
        });
      }),
      distribution: Effect.sync(distribution),
    }),
  );
};
