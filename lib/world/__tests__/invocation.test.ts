import { describe, it, expect } from "vitest";
import { Effect, Layer } from "effect";
import { Invocation } from "../invocation.port";
import { InvocationLive } from "../invocation.live";

describe("Invocation lift", () => {
  it("invoke publishes a command without throwing", async () => {
    const program = Effect.gen(function* () {
      const i = yield* Invocation;
      yield* i.invoke({ _tag: "TriggerStoneClaim", element: "fire" });
      return true;
    });
    const result = await Effect.runPromise(Effect.scoped(Effect.provide(program, InvocationLive)));
    expect(result).toBe(true);
  });
});
