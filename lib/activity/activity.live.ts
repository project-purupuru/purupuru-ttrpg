/**
 * ActivityLive · adapts the existing activityStream singleton into the
 * Activity Effect Service. The singleton is module-scope (browser-only),
 * so the live layer just bridges its callback API into Effect Stream.
 *
 * The legacy `activityStream.subscribe(cb)` and `seedActivityEvent()`
 * functions stay as internal-only implementation details · the public
 * surface IS this Live Layer's Service.
 */

import { Effect, Layer, Stream } from "effect";
import { Activity } from "./activity.port";
import { activityStream, seedActivityEvent } from "./index";

export const ActivityLive = Layer.succeed(
  Activity,
  Activity.of({
    recent: (n = 20) => Effect.sync(() => activityStream.recent(n)),
    events: Stream.async((emit) => {
      const unsubscribe = activityStream.subscribe((e) => {
        void emit.single(e);
      });
      return Effect.sync(() => unsubscribe());
    }),
    seed: (event) => Effect.sync(() => seedActivityEvent(event)),
  }),
);
