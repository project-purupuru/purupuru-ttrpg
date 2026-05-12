import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { Awareness } from "../awareness.port";
import { AwarenessMock } from "../awareness.mock";

describe("Awareness lift", () => {
  it("current returns seeded awareness state", async () => {
    const seed = {
      populationCount: 5,
      distribution: { wood: 1, fire: 2, earth: 1, water: 0, metal: 1 },
      recentEventCount: 7,
      currentWeatherElement: "fire" as const,
      observedAt: new Date().toISOString(),
    };
    const program = Effect.gen(function* () {
      const a = yield* Awareness;
      return yield* a.current;
    });
    const result = await Effect.runPromise(Effect.provide(program, AwarenessMock(seed)));
    expect(result.populationCount).toBe(5);
    expect(result.currentWeatherElement).toBe("fire");
  });
});
