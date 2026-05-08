// Bazi Resolver · derive archetype Element from quiz answers
// SDD r2 §3.4 · ECS system per Codex's awareness model §7
//
// Pure function · counts element votes across answers · returns dominant element.
// Tie-break: WOOD > FIRE > EARTH > METAL > WATER (canonical wuxing order).
//
// S1-T7 result route uses this · S2-T2 wires HMAC validation upstream.

import type { Element } from "./world-event"

// 5 questions × 4 answers = each answer leans toward one element.
// Caller passes the ELEMENT each answer maps to (looked up from medium-blink corpus).
export const archetypeFromAnswers = (
  elementVotes: ReadonlyArray<Element>,
): Element => {
  if (elementVotes.length === 0) {
    return "WOOD" // sentinel · empty quiz fallback (should not occur in practice)
  }

  const tallies: Record<Element, number> = {
    WOOD: 0,
    FIRE: 0,
    EARTH: 0,
    METAL: 0,
    WATER: 0,
  }
  for (const e of elementVotes) {
    tallies[e]++
  }

  // Canonical wuxing tie-break order.
  const canonicalOrder: Element[] = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"]
  let dominant: Element = "WOOD"
  let highest = -1
  for (const e of canonicalOrder) {
    if (tallies[e] > highest) {
      highest = tallies[e]
      dominant = e
    }
  }
  return dominant
}

// Hash quiz state (answers) for ClaimMessage's quizStateHash field.
// Server recomputes this at mint time · ClaimMessage binds claim to validated answers.
//
// Synchronous · Node crypto · same approach as event-id.ts (no Web Crypto type deps).
export const quizStateHashOf = (
  answers: ReadonlyArray<0 | 1 | 2 | 3>,
): string => {
  // Lazy import keeps this file pure when imported into bundler-only contexts
  // that don't ship Node's "crypto" (e.g. browser builds). Server routes have it.
  const { createHash } = require("node:crypto") as typeof import("node:crypto")
  return createHash("sha256").update(answers.join(",")).digest("hex")
}
