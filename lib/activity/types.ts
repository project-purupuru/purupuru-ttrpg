/**
 * Activity domain — the observatory's read-side of the awareness layer.
 *
 * v0 demo simplification (2026-05-10): the rail surfaces a single beat,
 * "[user] joined [element]" — a synthetic stand-in for the canonical
 * `QuizCompletedEvent` archetype-reveal flow on `feat/awareness-layer-spine`.
 * Mints / weather / element-shifts are paused while the lifecycle layer
 * is in design; the feed reads as a continuous "new clan members are
 * arriving" stream that aligns with the canvas (sprites idle in their
 * element wedge) and the KPI strip (5 clan counts).
 *
 * When the lifecycle layer ships and the indexer wires in, additional
 * variants can be added back to the union below; ActivityEvent is kept
 * as a tagged union of size 1 so the rail's pattern-match shape stays.
 */

import type { Element, Wallet } from "@/lib/score";

export type ActionOrigin = "on-chain" | "off-chain";

interface ActivityEventBase {
  id: string;
  origin: ActionOrigin;
  /** Drives row tint and avatar tint — the element the user just joined. */
  element: Element;
  at: string;
}

export interface JoinActivity extends ActivityEventBase {
  kind: "join";
  origin: "off-chain";
  /** Synthetic wallet of the user whose archetype just emerged. */
  actor: Wallet;
}

export type ActivityEvent = JoinActivity;

export type ActionKind = ActivityEvent["kind"];

export interface ActivityStream {
  subscribe(cb: (e: ActivityEvent) => void): () => void;
  recent(n?: number): ActivityEvent[];
}
