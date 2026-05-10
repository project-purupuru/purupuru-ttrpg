/**
 * Activity domain — the observatory's read-side of the awareness layer.
 *
 * v0 vocabulary mirrors the canonical `WorldEvent` discriminated union on
 * `feat/awareness-layer-spine` (packages/peripheral-events/src/world-event.ts):
 *
 *   - MintEvent          → on-chain · claim_genesis_stone (the only mutating verb)
 *   - WeatherEvent       → off-chain · ambient cosmic-weather oracle
 *   - ElementShiftEvent  → off-chain · wallet affinity transition
 *   - QuizCompletedEvent → off-chain · archetype reveal (wallet-agnostic)
 *
 * Observatory keeps lowercase `Element` internally (lib/score). Conversion to
 * the canonical uppercase happens at the awareness boundary if/when an indexer
 * wires in. Drift report: grimoires/loa/context/04-observatory-awareness-drift.md
 */

import type { Element, Wallet } from "@/lib/score";

export type ActionOrigin = "on-chain" | "off-chain";

// Cosmic weather oracle sources · gumi pitched 5; 3 named so far.
export type OracleSource = "TREMOR" | "CORONA" | "BREATH";

interface ActivityEventBase {
  id: string;
  origin: ActionOrigin;
  /**
   * Drives row tint and avatar tint. Per variant:
   *   mint           → archetype element
   *   weather        → dominantElement
   *   element_shift  → deltaElement
   *   quiz_completed → archetype
   */
  element: Element;
  at: string;
}

export interface MintActivity extends ActivityEventBase {
  kind: "mint";
  origin: "on-chain";
  actor: Wallet;
  /** Day's dominant element at mint time. Carries the imprint into the row. */
  weather: Element;
}

export interface WeatherActivity extends ActivityEventBase {
  kind: "weather";
  origin: "off-chain";
  // Wallet-agnostic per canonical schema · no actor.
  /** Wuxing 生 sheng-cycle successor of the dominant element. */
  generativeNext: Element;
  oracleSources: OracleSource[];
}

export interface ElementShiftActivity extends ActivityEventBase {
  kind: "element_shift";
  origin: "off-chain";
  actor: Wallet;
  fromAffinity: Record<Element, number>;
  toAffinity: Record<Element, number>;
}

export interface QuizCompletedActivity extends ActivityEventBase {
  kind: "quiz_completed";
  origin: "off-chain";
  // Wallet-agnostic per canonical · no actor. The "someone discovered fire"
  // beat is genuinely identity-less in the GET-chain Blink (quiz is taken
  // before wallet connect).
}

export type ActivityEvent =
  | MintActivity
  | WeatherActivity
  | ElementShiftActivity
  | QuizCompletedActivity;

export type ActionKind = ActivityEvent["kind"];

export interface ActivityStream {
  subscribe(cb: (e: ActivityEvent) => void): () => void;
  recent(n?: number): ActivityEvent[];
}
