// Operator-authored quiz corpus · 8 questions × 5 answers each (one per element).
// Per SDD r2 §3.2 + §4.1 · GET-chained quiz · HMAC-validated state per step.
//
// 8 × 5 = 40 element-leaning answers · cumulative vote count over 8 Qs produces
// a stable archetype (max 8 votes per element · canonical wuxing tie-break:
// WOOD > FIRE > EARTH > METAL > WATER per bazi-resolver.ts).
//
// Voice register: situational vignettes · feel-first · the questions read your
// instinct, not your knowledge. NO mechanical "pick your favorite element" ·
// the element emerges from the choice you'd actually make.

import type { Element } from "@purupuru/peripheral-events"

export interface QuizQuestion {
  step: number // 1..8
  prompt: string // ≤ 280 chars
  answers: ReadonlyArray<{
    label: string // ≤ 80 chars (button label · concise but operator authored full phrasings)
    element: Element // which element this answer leans toward
  }>
}

// Eight questions · each answer leans toward one element · cumulative scoring
// determines archetype at the result step.
export const QUIZ_CORPUS: ReadonlyArray<QuizQuestion> = [
  {
    step: 1,
    prompt:
      "Your friend cancels plans last minute. What's your first reaction?",
    answers: [
      { label: "Meh. Already had a backup plan anyway", element: "METAL" },
      { label: "Ooh. At last, a free evening", element: "WATER" },
      { label: "Annoyed. You don't say anything though", element: "WOOD" },
      { label: "You text back immediately: \"why\"", element: "FIRE" },
      { label: "You check if someone else wants to hang out instead", element: "EARTH" },
    ],
  },
  {
    step: 2,
    prompt: "I finish what I start.",
    answers: [
      { label: "Agree", element: "EARTH" },
      { label: "Depends on whether it's still actually worth finishing", element: "METAL" },
      { label: "I kind of start a lot of things", element: "FIRE" },
      { label: "I finish the things that matter to me", element: "WOOD" },
      { label: "I lose interest. I don't feel bad about it", element: "WATER" },
    ],
  },
  {
    step: 3,
    prompt:
      "You're in a group chat and someone says something incredibly confidently wrong.",
    answers: [
      { label: "You correct them", element: "METAL" },
      { label: "You let someone else handle it", element: "WATER" },
      { label: "You wait to see if they figure it out on their own", element: "WOOD" },
      { label: "You correct them immediately perhaps a little too harshly", element: "FIRE" },
      { label: "You privately message them", element: "EARTH" },
    ],
  },
  {
    step: 4,
    prompt: "Pick the one that sounds most like a weekend:",
    answers: [
      { label: "Sleep in, wing it. See what happens", element: "WATER" },
      { label: "Work on something you've been building", element: "WOOD" },
      { label: "Cook, clean, catch up with someone", element: "EARTH" },
      { label: "Go out. Doesn't matter where", element: "FIRE" },
      { label: "Finally organize that thing that's been bothering you", element: "METAL" },
    ],
  },
  {
    step: 5,
    prompt:
      "Someone you just met is telling you their whole life story. You:",
    answers: [
      { label: "Listen. People don't do this unless they need to", element: "WOOD" },
      { label: "Match their energy and share yours back", element: "FIRE" },
      { label: "Enjoy it. You love when people open up", element: "EARTH" },
      { label: "Notice what they're not saying", element: "METAL" },
      { label: "Feel everything they're feeling", element: "WATER" },
    ],
  },
  {
    step: 6,
    prompt: "Your phone is at 3%. You have no charger. What stresses you most?",
    answers: [
      { label: "Not being reachable", element: "EARTH" },
      { label: "Not being able to look something up", element: "METAL" },
      { label: "Nothing. It'll charge eventually", element: "WATER" },
      { label: "Missing something happening right now", element: "FIRE" },
      { label: "Not being able to check on someone", element: "WOOD" },
    ],
  },
  {
    step: 7,
    prompt: "Be honest. How messy is your room right now?",
    answers: [
      { label: "Clean where it matters, messy where it doesn't", element: "METAL" },
      { label: "Messy but I know where everything is", element: "WATER" },
      { label: "Clean. It bugs me when it's not", element: "EARTH" },
      { label: "I'll deal with it later", element: "FIRE" },
      { label: "Messy in waves. I clean when I feel like nesting", element: "WOOD" },
    ],
  },
  {
    step: 8,
    prompt: "Someone asks you for advice. You usually:",
    answers: [
      { label: "Ask them questions until they answer it themselves", element: "WOOD" },
      { label: "Tell them what you'd do", element: "FIRE" },
      { label: "Listen first, respond carefully", element: "EARTH" },
      { label: "Bluntly give them the honest answer even if it's uncomfortable", element: "METAL" },
      { label: "Tell them what they clearly already know but can't admit", element: "WATER" },
    ],
  },
] as const

// Archetype reveals · one per element · ≤ 280 chars.
// Placeholder voice · operator/gumi can rewrite for v1 voice register.
export const ARCHETYPE_REVEALS: Record<Element, string> = {
  WOOD: "the tide reads · WOOD · you hold the green that is becoming. your weather rises. claim the stone of beginnings.",
  FIRE: "the tide reads · FIRE · you carry the burning that does not consume. your weather is light. claim the stone of warmth.",
  EARTH: "the tide reads · EARTH · you are the still center. your weather is steadiness. claim the stone of holding.",
  METAL: "the tide reads · METAL · you are the bell that listens. your weather is clear. claim the stone of resonance.",
  WATER: "the tide reads · WATER · you move with what moves. your weather is depth. claim the stone of currents.",
}

// Quiz titles per step · used as Blink title (≤ 80 chars).
export const QUIZ_STEP_TITLES: Record<number, string> = {
  1: "today's tide reads you · 1 of 8",
  2: "the tide continues · 2 of 8",
  3: "the tide listens · 3 of 8",
  4: "the tide turns · 4 of 8",
  5: "the tide deepens · 5 of 8",
  6: "the tide presses · 6 of 8",
  7: "the tide settles · 7 of 8",
  8: "the tide reads · 8 of 8",
}

// Default ambient prompt for `/api/actions/today` (S1-T8 ambient endpoint).
export const AMBIENT_PROMPT = "the world breathes. take a moment with it."
