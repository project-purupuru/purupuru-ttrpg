export type { ActionKind, ActivityEvent, ActivityStream } from "./types";
import { mockActivityStream } from "./mock";
import type { ActivityStream } from "./types";

export const activityStream: ActivityStream = mockActivityStream;

// Demo-bridge seed · pushes one curated JoinActivity into the stream.
// Used by ObservatoryClient when arriving via post-mint links.next bridge
// with `?welcome=<element>` query param. See ./mock for full context.
export { seedActivityEvent } from "./mock";
