/**
 * ActivityMock · in-memory test substrate. NO module-singleton state.
 * Each instance gets its own buffer + subscribers.
 */

import { Effect, Layer, Stream } from "effect";
import { Activity } from "./activity.port";
import type { ActivityEvent } from "./types";

export const ActivityMock = (seed: readonly ActivityEvent[] = []) => {
  const buffer: ActivityEvent[] = [...seed];
  const subscribers = new Set<(e: ActivityEvent) => void>();

  return Layer.succeed(
    Activity,
    Activity.of({
      recent: (n = 20) => Effect.sync(() => buffer.slice(-n).reverse()),
      events: Stream.async((emit) => {
        const cb = (e: ActivityEvent) => {
          void emit.single(e);
        };
        subscribers.add(cb);
        return Effect.sync(() => {
          subscribers.delete(cb);
        });
      }),
      seed: (event) =>
        Effect.sync(() => {
          buffer.push(event);
          for (const cb of subscribers) cb(event);
        }),
    }),
  );
};
