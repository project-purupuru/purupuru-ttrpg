/**
 * Activity domain — synthetic on-chain action stream.
 * v0 vocabulary: the "tight 3" (mint / attack / gift) per PRD §4 F4.2.
 * v0.1 ships interface + no-op mock; v0.2 ticks events on interval.
 */

import type { Element, Wallet } from "@/lib/score";

export type ActionKind = "mint" | "attack" | "gift";

export interface ActivityEvent {
  id: string;
  kind: ActionKind;
  actor: Wallet;
  target?: Wallet;
  element: Element;
  targetElement?: Element;
  at: string;
}

export interface ActivityStream {
  subscribe(cb: (e: ActivityEvent) => void): () => void;
  recent(n?: number): ActivityEvent[];
}
