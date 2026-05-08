// BaziQuizState · HMAC-validated quiz state for GET-chain endpoints
// SDD r2 §3.2 · post-flatline-r4 walletAwareGet:false fix
//
// HMAC over (step, answers) ONLY · NO account.
// Wallet binds at mint POST (per Solana Actions spec · GET is anonymous).
//
// S1-T2 ships the schema only. S2-T2 implements proper HMAC-SHA256 with
// length-extension safety + constant-time compare.

import { Schema as S } from "effect"

// 4-button multichoice answer · per SDD r2 §4.1.
export const Answer = S.Literal(0, 1, 2, 3)
export type Answer = S.Schema.Type<typeof Answer>

// Quiz step (1-5 · five questions).
export const QuizStep = S.Number.pipe(S.between(1, 5))
export type QuizStep = S.Schema.Type<typeof QuizStep>

// Quiz state · URL-encoded between Q1-Q5 GET requests.
//
// Invariant: answers.length === step - 1 (answers from PREVIOUS steps).
// Server validates HMAC at every step transition.
export const BaziQuizState = S.Struct({
  step: QuizStep,
  answers: S.Array(Answer),
  mac: S.String, // hex HMAC-SHA256 · S2-T2 fills implementation
})
export type BaziQuizState = S.Schema.Type<typeof BaziQuizState>

// Final quiz state at result endpoint · all 5 answers present.
export const CompletedQuizState = S.Struct({
  answers: S.Tuple(Answer, Answer, Answer, Answer, Answer),
  mac: S.String,
})
export type CompletedQuizState = S.Schema.Type<typeof CompletedQuizState>
