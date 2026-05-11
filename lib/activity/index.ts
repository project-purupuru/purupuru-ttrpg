/**
 * Activity stream — primary source is populationStore spawn events,
 * with a small side-channel for ad-hoc "seeded" events (post-mint
 * welcome bridge, etc.).
 *
 * Architecture:
 *   - populationStore is the source of truth for "who is on the map".
 *   - subscribe() bridges populationStore spawns through toJoin() into
 *     the ActivityEvent shape, AND fans out any seedActivityEvent() calls
 *     to the same subscribers.
 *   - recent() merges populationStore-derived events + seeded extras,
 *     sorted newest-first by timestamp.
 */

import { populationStore, type SpawnedPuruhani } from "@/lib/sim/population";
import type { ActivityEvent, ActivityStream, JoinActivity } from "./types";

export type { ActionKind, ActivityEvent, ActivityStream } from "./types";

function toJoin(s: SpawnedPuruhani): JoinActivity {
  return {
    id: `e-${s.seed}`,
    kind: "join",
    origin: "off-chain",
    element: s.primaryElement,
    actor: s.trader,
    at: s.joinedAt,
  };
}

// One-off events injected via seedActivityEvent. Kept in a local buffer
// so recent() can replay them alongside the populationStore-derived ones.
const extras: ActivityEvent[] = [];
const subscribers = new Set<(e: ActivityEvent) => void>();

// Bridge populationStore → our subscriber set. Attaches lazily on first
// subscribe; runs once for the lifetime of the module.
let bridgeAttached = false;
function attachBridge(): void {
  if (bridgeAttached) return;
  bridgeAttached = true;
  populationStore.subscribe((s) => {
    const e = toJoin(s);
    for (const cb of subscribers) {
      try {
        cb(e);
      } catch {
        // isolate subscriber errors
      }
    }
  });
}

export const activityStream: ActivityStream = {
  subscribe(cb) {
    attachBridge();
    subscribers.add(cb);
    return () => {
      subscribers.delete(cb);
    };
  },
  recent(n = 20) {
    const fromPop = populationStore.current().map(toJoin);
    const all = [...fromPop, ...extras];
    all.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return all.slice(0, n);
  },
};

/**
 * Demo-bridge seed · pushes one curated JoinActivity into the stream.
 * Used by ObservatoryClient when arriving via the post-mint links.next
 * bridge with `?welcome=<element>` query param so the user's just-minted
 * stone visibly joins the lobby — stand-in until the real indexer wires
 * StoneClaimed events through.
 */
export function seedActivityEvent(event: ActivityEvent): void {
  extras.push(event);
  for (const cb of subscribers) {
    try {
      cb(event);
    } catch {
      // isolate subscriber errors
    }
  }
}
