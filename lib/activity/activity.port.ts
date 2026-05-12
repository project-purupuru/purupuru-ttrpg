/**
 * Activity Service · the typed surface for compass's activity stream.
 * Wraps the existing activityStream as an Effect Service Tag so consumers
 * compose via the runtime's AppLayer rather than calling subscribe(cb).
 *
 * Lift-pattern reference: grimoires/loa/specs/lift-pattern-template.md (S1-T10)
 * SDD §7.2 contract: read · subscribe · write
 */

import { Context, Effect, Stream } from "effect";
import type { ActivityEvent } from "./types";

export class Activity extends Context.Tag("compass/Activity")<
  Activity,
  {
    readonly recent: (n?: number) => Effect.Effect<readonly ActivityEvent[]>;
    readonly events: Stream.Stream<ActivityEvent>;
    readonly seed: (event: ActivityEvent) => Effect.Effect<void>;
  }
>() {}
