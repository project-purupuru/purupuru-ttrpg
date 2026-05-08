// Placeholder voice corpus · zksoju-authored · gumi swaps later (S2-T6).
// Per SDD r2 §7 · cosmic-weather observer voice · sora-tower register.
// 5 questions × 4 answers each = 20 strings · plus 5 archetype reveals.
//
// Voice register per gumi's pitch §"What It's Not": NO progress bars · NO
// monetization language · NO mechanical instruction · feel-first · visual-first.
// Answers should evoke an element WITHOUT naming it directly (let the discovery
// happen through tone · cosmic weather speaks · doesn't explain).

import type { Element } from "@purupuru/peripheral-events"

export interface QuizQuestion {
  step: number // 1..5
  prompt: string // ≤ 280 chars
  answers: ReadonlyArray<{
    label: string // ≤ 30 chars (button label · concise)
    element: Element // which element this answer leans toward
  }>
}

// Five questions · each answer leans toward one element · cumulative scoring
// determines archetype at result step.
export const QUIZ_CORPUS: ReadonlyArray<QuizQuestion> = [
  {
    step: 1,
    prompt:
      "the wind shifts. somewhere a door opens. you turn toward —",
    answers: [
      { label: "the rising green", element: "WOOD" },
      { label: "the burning gold", element: "FIRE" },
      { label: "the still earth", element: "EARTH" },
      { label: "the deep current", element: "WATER" },
    ],
  },
  {
    step: 2,
    prompt:
      "you hold a small thing in your hand. it is —",
    answers: [
      { label: "a seed, waiting", element: "WOOD" },
      { label: "an ember, breathing", element: "FIRE" },
      { label: "a stone, listening", element: "EARTH" },
      { label: "a bell, soft-tongued", element: "METAL" },
    ],
  },
  {
    step: 3,
    prompt:
      "the year turns. you keep one ritual. it is —",
    answers: [
      { label: "tending the garden", element: "WOOD" },
      { label: "lighting the lamp", element: "FIRE" },
      { label: "walking the same path", element: "EARTH" },
      { label: "swimming at dawn", element: "WATER" },
    ],
  },
  {
    step: 4,
    prompt:
      "a friend asks · what is your weather today?",
    answers: [
      { label: "morning rain", element: "WATER" },
      { label: "midday sun", element: "FIRE" },
      { label: "low fog", element: "METAL" },
      { label: "warm soil", element: "EARTH" },
    ],
  },
  {
    step: 5,
    prompt:
      "and the world is —",
    answers: [
      { label: "growing", element: "WOOD" },
      { label: "burning", element: "FIRE" },
      { label: "holding", element: "EARTH" },
      { label: "moving", element: "WATER" },
    ],
  },
] as const

// Archetype reveals · one per element · ≤ 280 chars.
// gumi authors v1 · this is zksoju placeholder for spine demo.
export const ARCHETYPE_REVEALS: Record<Element, string> = {
  WOOD: "the tide reads · WOOD · you hold the green that is becoming. your weather rises. claim the stone of beginnings.",
  FIRE: "the tide reads · FIRE · you carry the burning that does not consume. your weather is light. claim the stone of warmth.",
  EARTH: "the tide reads · EARTH · you are the still center. your weather is steadiness. claim the stone of holding.",
  METAL: "the tide reads · METAL · you are the bell that listens. your weather is clear. claim the stone of resonance.",
  WATER: "the tide reads · WATER · you move with what moves. your weather is depth. claim the stone of currents.",
}

// Quiz titles per step · used as Blink title (≤ 80 chars).
export const QUIZ_STEP_TITLES: Record<number, string> = {
  1: "today's tide reads you · 1 of 5",
  2: "the tide continues · 2 of 5",
  3: "the tide turns · 3 of 5",
  4: "the tide deepens · 4 of 5",
  5: "the tide settles · 5 of 5",
}

// Default ambient prompt for `/api/actions/today` (S1-T8 ambient endpoint).
export const AMBIENT_PROMPT = "the world breathes. take a moment with it."
