// Bazi Resolver · derive archetype Element from quiz answers
// SDD r2 §3.4 · ECS system per Codex's awareness model §7
//
// Pure function · counts element votes across answers · returns dominant element.
// Tie-break: WOOD > FIRE > EARTH > METAL > WATER (canonical wuxing order).
//
// S1-T7 result route uses this · S2-T2 wires HMAC validation upstream.

import { createHash } from "node:crypto"

import type { Element } from "./world-event"

// 8 questions × 5 answers = each answer leans toward one of the 5 elements.
// Caller passes the ELEMENT each answer maps to (looked up from medium-blink corpus).
// 5-answer-per-Q gives every element a direct option in every question · cumulative
// vote count over 8 Qs produces a stable archetype (max 8 votes per element ·
// archetype is the element with the most votes after canonical tie-break).
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
// Synchronous · Node crypto · same approach as event-id.ts. peripheral-events
// is server-only by design (SDD §1 L2 substrate) so node:crypto is in scope.
export const quizStateHashOf = (
  answers: ReadonlyArray<0 | 1 | 2 | 3>,
): string => {
  return createHash("sha256").update(answers.join(",")).digest("hex")
}
