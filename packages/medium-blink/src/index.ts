// @purupuru/medium-blink · Blink medium renderer
// SDD r2 §1+§4 · per Codex's awareness model §4

export const PACKAGE_VERSION = "0.0.1" as const

// Renderers · pure functions · ActionGetResponse shape per Solana Actions spec.
export {
  renderAmbient,
  renderQuizResult,
  renderQuizStart,
  renderQuizStep,
  validateActionResponse,
} from "./quiz-renderer.js"

export type { RendererConfig } from "./quiz-renderer.js"

// Voice corpus · placeholder strings (zksoju-authored · gumi swaps in S2-T6).
export {
  AMBIENT_PROMPT,
  ARCHETYPE_REVEALS,
  QUIZ_CORPUS,
  QUIZ_STEP_TITLES,
} from "./voice-corpus.js"

export type { QuizQuestion } from "./voice-corpus.js"

// Solana Actions types + BLINK_DESCRIPTOR constants.
export {
  BLINK_DESCRIPTOR,
} from "./solana-actions-types.js"

export type {
  ActionGetResponse,
  ActionPostResponse,
  BlinkDescriptor,
  LinkedAction,
  NextActionLink,
} from "./solana-actions-types.js"
