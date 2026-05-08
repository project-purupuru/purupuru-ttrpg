/**
 * Activity domain — synthetic on-chain action stream.
 * v0 vocabulary: the "tight 3" (mint / attack / gift) per PRD §4 F4.2.
 *
 * All activity is on-chain by definition; the off-chain side of the
 * awareness layer lives in `lib/weather` and is fused at the world
 * level (weather amplifies wuxing element zones, etc.) — not as
 * separate stream entries.
 */

import type { Element, Wallet } from "@/lib/score";

export type ActionKind = "mint" | "attack" | "gift";

export type ActionOrigin = "on-chain" | "off-chain";

export interface ActivityEvent {
  id: string;
  kind: ActionKind;
  /** Where the action lives — substrate truth (on-chain). */
  origin: ActionOrigin;
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
