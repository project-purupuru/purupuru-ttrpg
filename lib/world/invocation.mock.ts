/**
 * InvocationMock · captures invoked commands into a buffer for assertion.
 */

import { Effect, Layer, Ref, Stream } from "effect";
import { Invocation, type InvocationCommand } from "./invocation.port";

export const InvocationMock = () =>
  Layer.effect(
    Invocation,
    Effect.gen(function* () {
      const buffer = yield* Ref.make<InvocationCommand[]>([]);
      return Invocation.of({
        invoke: (cmd) => Ref.update(buffer, (b) => [...b, cmd]),
        commands: Stream.empty as unknown as Stream.Stream<InvocationCommand>,
      });
    }),
  );
