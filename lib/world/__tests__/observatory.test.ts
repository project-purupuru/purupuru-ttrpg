import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { Observatory } from "../observatory.port";
import { ObservatoryMock } from "../observatory.mock";

describe("Observatory lift", () => {
  it("project returns the seeded projection", async () => {
    const projection = {
      leadingElement: "fire" as const,
      populationTotal: 10,
      elementBreakdown: [
        { element: "fire" as const, count: 6, share: 0.6 },
        { element: "wood" as const, count: 4, share: 0.4 },
      ],
      observedAt: new Date().toISOString(),
    };
    const program = Effect.gen(function* () {
      const o = yield* Observatory;
      return yield* o.project;
    });
    const result = await Effect.runPromise(Effect.provide(program, ObservatoryMock(projection)));
    expect(result.leadingElement).toBe("fire");
    expect(result.populationTotal).toBe(10);
  });
});
