// BaziQuizState schema · S1-T2 ships shape only · S2-T2 implements proper HMAC

import { Schema as S } from "effect"
import { describe, expect, it } from "vitest"

import { BaziQuizState, CompletedQuizState } from "../src/bazi-quiz-state"

describe("BaziQuizState · GET-chain URL state shape", () => {
  it("decodes valid in-progress state (step 3 with 2 prior answers)", () => {
    const state = {
      step: 3,
      answers: [0, 2],
      mac: "placeholder-mac-from-s1-t2",
    }
    const decoded = S.decodeUnknownSync(BaziQuizState)(state)
    expect(decoded.step).toBe(3)
    expect(decoded.answers).toEqual([0, 2])
  })

  it("rejects step out of range (1-5)", () => {
    expect(() =>
      S.decodeUnknownSync(BaziQuizState)({ step: 0, answers: [], mac: "x" }),
    ).toThrow()
    expect(() =>
      S.decodeUnknownSync(BaziQuizState)({ step: 6, answers: [], mac: "x" }),
    ).toThrow()
  })

  it("rejects invalid answer values (must be 0-3)", () => {
    expect(() =>
      S.decodeUnknownSync(BaziQuizState)({ step: 2, answers: [4], mac: "x" }),
    ).toThrow()
    expect(() =>
      S.decodeUnknownSync(BaziQuizState)({ step: 2, answers: [-1], mac: "x" }),
    ).toThrow()
  })

  it("CompletedQuizState requires exactly 5 answers", () => {
    const completed = {
      answers: [0, 1, 2, 3, 0] as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3],
      mac: "placeholder",
    }
    const decoded = S.decodeUnknownSync(CompletedQuizState)(completed)
    expect(decoded.answers.length).toBe(5)
  })

  it("CompletedQuizState rejects 4 answers (incomplete)", () => {
    expect(() =>
      S.decodeUnknownSync(CompletedQuizState)({
        answers: [0, 1, 2, 3],
        mac: "x",
      }),
    ).toThrow()
  })
})
