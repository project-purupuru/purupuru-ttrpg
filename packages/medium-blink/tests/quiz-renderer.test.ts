// AC for S1-T4: renders valid ActionGetResponse · 4 buttons per step

import { describe, expect, it } from "vitest"

import { BLINK_DESCRIPTOR } from "../src/solana-actions-types"
import {
  renderAmbient,
  renderQuizResult,
  renderQuizStart,
  renderQuizStep,
  validateActionResponse,
} from "../src/quiz-renderer"

const testConfig = { baseUrl: "https://test.purupuru.app" }

describe("renderQuizStart · Q1 entry point", () => {
  const response = renderQuizStart(testConfig)

  it("returns valid ActionGetResponse shape", () => {
    expect(response.title).toBeDefined()
    expect(response.description).toBeDefined()
    expect(response.icon).toBeDefined()
    expect(response.label).toBeDefined()
    expect(response.links?.actions).toBeDefined()
  })

  it("AC · 4 buttons per step", () => {
    expect(response.links?.actions.length).toBe(4)
  })

  it("respects BLINK_DESCRIPTOR title limit (≤80 chars)", () => {
    expect(response.title.length).toBeLessThanOrEqual(BLINK_DESCRIPTOR.titleMaxChars)
  })

  it("respects BLINK_DESCRIPTOR description limit (≤280 chars)", () => {
    expect(response.description.length).toBeLessThanOrEqual(
      BLINK_DESCRIPTOR.descriptionMaxChars,
    )
  })

  it("buttons link to /api/actions/quiz/step (next step path)", () => {
    response.links?.actions.forEach((btn) => {
      expect(btn.href).toContain("/api/actions/quiz/step")
      expect(btn.href).toContain("step=2")
    })
  })

  it("buttons encode answer index in URL state (a1=0..3)", () => {
    const answerIndices = response.links!.actions.map((btn) => {
      const url = new URL(btn.href)
      return url.searchParams.get("a1")
    })
    expect(answerIndices).toEqual(["0", "1", "2", "3"])
  })

  it("validateActionResponse passes", () => {
    const { valid, violations } = validateActionResponse(response)
    expect(valid).toBe(true)
    expect(violations).toEqual([])
  })
})

describe("renderQuizStep · steps 2-5", () => {
  it("step 2 with 1 prior answer renders 4 buttons", () => {
    const response = renderQuizStep({
      step: 2,
      priorAnswers: [1],
      mac: "placeholder",
      config: testConfig,
    })
    expect(response.links?.actions.length).toBe(4)
    expect(response.error).toBeUndefined()
  })

  it("step 5 (final) buttons link to /result not /step", () => {
    const response = renderQuizStep({
      step: 5,
      priorAnswers: [0, 1, 2, 3],
      mac: "placeholder",
      config: testConfig,
    })
    response.links?.actions.forEach((btn) => {
      expect(btn.href).toContain("/api/actions/quiz/result")
    })
  })

  it("step 5 carries all 5 answers in URL params (a1..a5)", () => {
    const response = renderQuizStep({
      step: 5,
      priorAnswers: [0, 1, 2, 3],
      mac: "placeholder",
      config: testConfig,
    })
    const firstBtn = response.links!.actions[0]
    const url = new URL(firstBtn.href)
    expect(url.searchParams.get("a1")).toBe("0")
    expect(url.searchParams.get("a2")).toBe("1")
    expect(url.searchParams.get("a3")).toBe("2")
    expect(url.searchParams.get("a4")).toBe("3")
    expect(url.searchParams.get("a5")).toBe("0") // first answer index of step 5
  })

  it("invalid step (0 or 6) returns error response", () => {
    const r0 = renderQuizStep({ step: 0, priorAnswers: [], mac: "p", config: testConfig })
    expect(r0.error).toBeDefined()
    const r6 = renderQuizStep({ step: 6, priorAnswers: [], mac: "p", config: testConfig })
    expect(r6.error).toBeDefined()
  })

  it("answer count mismatch (step 3 with 1 answer) returns error", () => {
    const response = renderQuizStep({
      step: 3,
      priorAnswers: [0], // should be 2 priors for step 3
      mac: "placeholder",
      config: testConfig,
    })
    expect(response.error).toBeDefined()
    expect(response.error?.message).toContain("mismatch")
  })

  it("all 5 step renders fit within BLINK_DESCRIPTOR limits", () => {
    for (let step = 2; step <= 5; step++) {
      const priors = Array.from({ length: step - 1 }, (_, i) => (i % 4) as 0 | 1 | 2 | 3)
      const response = renderQuizStep({
        step,
        priorAnswers: priors,
        mac: "placeholder",
        config: testConfig,
      })
      const { valid, violations } = validateActionResponse(response)
      expect(valid, `step ${step}: ${violations.join(",")}`).toBe(true)
    }
  })
})

describe("renderQuizResult · archetype reveal + mint button", () => {
  it("returns 2 buttons (claim + ambient)", () => {
    const response = renderQuizResult({ archetype: "FIRE", config: testConfig })
    expect(response.links?.actions.length).toBe(2)
  })

  it("first button links to /api/actions/mint/genesis-stone", () => {
    const response = renderQuizResult({ archetype: "WOOD", config: testConfig })
    expect(response.links!.actions[0].href).toContain("/api/actions/mint/genesis-stone")
    expect(response.links!.actions[0].label).toContain("claim")
  })

  it("renders for all 5 elements with valid limits", () => {
    const elements = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"] as const
    for (const archetype of elements) {
      const response = renderQuizResult({ archetype, config: testConfig })
      const { valid } = validateActionResponse(response)
      expect(valid, `archetype ${archetype}`).toBe(true)
    }
  })
})

describe("renderAmbient · /api/actions/today (REFRAME-1 awareness moat)", () => {
  it("returns valid response · NO interaction (single CTA button to quiz)", () => {
    const response = renderAmbient({
      todayElement: "FIRE",
      mintCount: 47,
      fireSurgeDelta: 12,
      config: testConfig,
    })
    expect(response.links?.actions.length).toBe(1)
    expect(response.links!.actions[0].href).toContain("/api/actions/quiz/start")
  })

  it("title includes today's element + mint count + surge delta", () => {
    const response = renderAmbient({
      todayElement: "WATER",
      mintCount: 12,
      fireSurgeDelta: -3,
      config: testConfig,
    })
    expect(response.title).toContain("12 stones")
    expect(response.title).toContain("water")
    expect(response.title).toContain("-3%")
  })

  it("respects title limit even at high mint counts", () => {
    const response = renderAmbient({
      todayElement: "EARTH",
      mintCount: 99999,
      fireSurgeDelta: 100,
      config: testConfig,
    })
    expect(response.title.length).toBeLessThanOrEqual(BLINK_DESCRIPTOR.titleMaxChars)
  })
})

describe("BLINK_DESCRIPTOR constants", () => {
  it("walletAwareGet is false (per walletAwareGet:false fix · GET is anonymous)", () => {
    expect(BLINK_DESCRIPTOR.walletAwareGet).toBe(false)
  })

  it("inputFieldsAllowed is empty array (button-multichoice only v0)", () => {
    expect(BLINK_DESCRIPTOR.inputFieldsAllowed).toEqual([])
  })

  it("actionChaining is true (GET-chain via links.next)", () => {
    expect(BLINK_DESCRIPTOR.actionChaining).toBe(true)
  })
})
