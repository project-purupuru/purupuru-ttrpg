/**
 * InvocationLive · publishes commands to a PubSub for downstream consumers.
 * Owns the commandsPubSub per state-ownership matrix.
 */

import { Effect, Layer, PubSub, Stream } from "effect";
import { Invocation, type InvocationCommand } from "./invocation.port";

export const InvocationLive = Layer.effect(
  Invocation,
  Effect.gen(function* () {
    const pubsub = yield* PubSub.unbounded<InvocationCommand>();
    return Invocation.of({
      invoke: (cmd) => PubSub.publish(pubsub, cmd).pipe(Effect.asVoid),
      commands: Stream.fromPubSub(pubsub),
    });
  }),
);
