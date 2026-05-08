// Quiz renderer · GET-chain Action responses
// SDD r2 §4.1 · per BLINK_DESCRIPTOR (button-multichoice · 5 buttons per step)
// AC: renders valid ActionGetResponse shape · 5 buttons per step (one per element)
//
// Composition flow (Codex §5):
//   peripheral-events BaziQuizState shape
//     → quiz-renderer composes ActionGetResponse
//     → apps/web route returns to client

import type { Element } from "@purupuru/peripheral-events"

import type { ActionGetResponse, LinkedAction } from "./solana-actions-types"
import { BLINK_DESCRIPTOR } from "./solana-actions-types"
import {
  AMBIENT_PROMPT,
  ARCHETYPE_REVEALS,
  QUIZ_CORPUS,
  QUIZ_STEP_TITLES,
} from "./voice-corpus"

// Base URL configuration · injected by app-level wrapper.
// Default to localhost:3000 for tests · prod sets env at runtime.
export interface RendererConfig {
  baseUrl: string // e.g. "https://purupuru-blinks.vercel.app"
  iconBaseUrl?: string // optional CDN · defaults to baseUrl/api/og
}

const defaultConfig: RendererConfig = {
  baseUrl: "http://localhost:3000",
}

// Build the icon URL for a given step · v0 uses static element-themed icons.
// Sprint-2 swaps to dynamic OG image render (S1-T2 + Metaplex art via S1-Sp1).
const iconUrlForStep = (step: number, config: RendererConfig): string => {
  const base = config.iconBaseUrl ?? `${config.baseUrl}/api/og`
  return `${base}?step=${step}`
}

const iconUrlForArchetype = (
  archetype: Element,
  config: RendererConfig,
): string => {
  const base = config.iconBaseUrl ?? `${config.baseUrl}/api/og`
  return `${base}?archetype=${archetype}`
}

// Render the start of the quiz · Q1 with 5 element-leaning answers (one per element).
//
// Pure function · no I/O · returns a valid ActionGetResponse per Solana Actions spec.
export const renderQuizStart = (
  config: RendererConfig = defaultConfig,
): ActionGetResponse => {
  const q = QUIZ_CORPUS[0]
  if (!q) throw new Error("Quiz corpus empty · expected 8 questions")

  const buttons = buildAnswerButtons(q.step, [], q.answers, config)

  return {
    icon: iconUrlForStep(q.step, config),
    title: QUIZ_STEP_TITLES[q.step] ?? "today's tide reads you",
    description: q.prompt,
    label: "answer",
    links: { actions: buttons },
  }
}

// Render a mid-quiz step · steps 2..8 · prior answers in URL state.
//
// Server-side caller validates HMAC over (step, priorAnswers) before rendering.
// S2-T2 implements proper HMAC-SHA256 · this renderer just passes through the mac.
export const renderQuizStep = (params: {
  step: number // 1..8 · the step we're rendering
  priorAnswers: ReadonlyArray<0 | 1 | 2 | 3 | 4>
  mac: string
  config?: RendererConfig
}): ActionGetResponse => {
  const config = params.config ?? defaultConfig

  if (params.step < 1 || params.step > 8) {
    return {
      icon: iconUrlForStep(1, config),
      title: "tide unread",
      description: "the path is unclear · please begin again",
      label: "begin",
      links: {
        actions: [{ label: "begin again", href: `${config.baseUrl}/api/actions/quiz/start` }],
      },
      error: { message: `Invalid step: ${params.step}` },
    }
  }

  const q = QUIZ_CORPUS[params.step - 1]
  if (!q) throw new Error(`Quiz step ${params.step} not in corpus`)

  // Verify answer count matches step (length = step - 1).
  if (params.priorAnswers.length !== params.step - 1) {
    return {
      icon: iconUrlForStep(params.step, config),
      title: "tide unread",
      description: "the path was lost · please begin again",
      label: "begin",
      links: {
        actions: [{ label: "begin again", href: `${config.baseUrl}/api/actions/quiz/start` }],
      },
      error: {
        message: `Answer count mismatch: expected ${params.step - 1}, got ${params.priorAnswers.length}`,
      },
    }
  }

  const buttons = buildAnswerButtons(
    q.step,
    params.priorAnswers,
    q.answers,
    config,
  )

  return {
    icon: iconUrlForStep(q.step, config),
    title: QUIZ_STEP_TITLES[q.step] ?? "today's tide reads you",
    description: q.prompt,
    label: "answer",
    links: { actions: buttons },
  }
}

// Render the result step · archetype reveal + mint button.
//
// Element is RECOMPUTED server-side from validated answers (per HIGH-1 fix · client
// element supply is ignored). Caller passes derived element here.
export const renderQuizResult = (params: {
  archetype: Element
  config?: RendererConfig
}): ActionGetResponse => {
  const config = params.config ?? defaultConfig
  const reveal =
    ARCHETYPE_REVEALS[params.archetype] ??
    "the tide reads you · claim the stone of your weather"

  return {
    icon: iconUrlForArchetype(params.archetype, config),
    title: `${params.archetype.toLowerCase()} · your tide`,
    description: reveal,
    label: "claim your stone",
    links: {
      actions: [
        {
          label: "claim your stone",
          href: `${config.baseUrl}/api/actions/mint/genesis-stone`,
        },
        {
          label: "see today's tide",
          href: `${config.baseUrl}/api/actions/today`,
        },
      ],
    },
  }
}

// Render the ambient `/api/actions/today` Blink (S1-T8 will use this).
// Per bridgebuilder REFRAME-1 fix · awareness-layer thesis demo · NO interaction.
export const renderAmbient = (params: {
  todayElement: Element
  mintCount: number
  fireSurgeDelta: number // percent · positive = up
  config?: RendererConfig
}): ActionGetResponse => {
  const config = params.config ?? defaultConfig

  return {
    icon: iconUrlForArchetype(params.todayElement, config),
    title: `today in the world · ${params.mintCount} stones · ${params.todayElement.toLowerCase()} rises ${params.fireSurgeDelta >= 0 ? "+" : ""}${params.fireSurgeDelta}%`,
    description: AMBIENT_PROMPT,
    label: "the world",
    links: {
      actions: [
        {
          label: "what's my element?",
          href: `${config.baseUrl}/api/actions/quiz/start`,
        },
      ],
    },
  }
}

// Build up to 5 answer buttons for a quiz step · each links to next step's GET endpoint.
//
// State encoded as URL query params: ?step=N&a1=...&aN-1=...&mac=...
// (Server validates HMAC at every transition · S2-T2 mac, real now.)
const buildAnswerButtons = (
  step: number,
  priorAnswers: ReadonlyArray<0 | 1 | 2 | 3 | 4>,
  answers: ReadonlyArray<{ label: string; element: Element }>,
  config: RendererConfig,
): LinkedAction[] => {
  return answers.map((a, idx) => {
    const newAnswers = [...priorAnswers, idx as 0 | 1 | 2 | 3 | 4]
    const nextStep = step + 1

    // Final step → links go to /result · earlier steps → /step
    const path =
      nextStep > 8
        ? "/api/actions/quiz/result"
        : "/api/actions/quiz/step"

    const params = new URLSearchParams()
    if (nextStep <= 8) {
      params.set("step", String(nextStep))
    }
    newAnswers.forEach((ans, i) => params.set(`a${i + 1}`, String(ans)))
    params.set("mac", "placeholder-mac-s1-t4") // sprint-3 wires real HMAC via signQuizState

    const queryString = params.toString()
    const href = `${config.baseUrl}${path}${queryString ? "?" + queryString : ""}`

    return { label: a.label, href }
  })
}

// Validate that a rendered ActionGetResponse fits within BLINK_DESCRIPTOR limits.
// Useful in tests · NOT enforced at runtime (defensive · not coercive).
export const validateActionResponse = (
  response: ActionGetResponse,
): { valid: boolean; violations: string[] } => {
  const violations: string[] = []

  if (response.title.length > BLINK_DESCRIPTOR.titleMaxChars) {
    violations.push(
      `title exceeds ${BLINK_DESCRIPTOR.titleMaxChars} chars: ${response.title.length}`,
    )
  }
  if (response.description.length > BLINK_DESCRIPTOR.descriptionMaxChars) {
    violations.push(
      `description exceeds ${BLINK_DESCRIPTOR.descriptionMaxChars} chars: ${response.description.length}`,
    )
  }
  const buttonCount = response.links?.actions.length ?? 0
  if (buttonCount > BLINK_DESCRIPTOR.buttonsMax) {
    violations.push(
      `button count ${buttonCount} exceeds max ${BLINK_DESCRIPTOR.buttonsMax}`,
    )
  }

  return { valid: violations.length === 0, violations }
}
