// Quiz renderer · driven by quiz-config.ts (single source of truth for shape)
// SDD r2 §4.1 · per BLINK_DESCRIPTOR
//
// Default config: 8 questions × 3 buttons (Gumi feedback · 5 looks ugly).
// Buttons emit `type: "post"` so Dialect renderer treats them as chain links
// (POST returns next action inline) NOT transaction buttons (would require wallet).
//
// Composition flow (Codex §5):
//   peripheral-events BaziQuizState shape
//     → quiz-renderer composes ActionGetResponse
//     → apps/web route returns to client

import type { Element } from "@purupuru/peripheral-events"

import { QUIZ_CONFIG, selectAnswers, shouldButtonsPost } from "./quiz-config"
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
  // Reveal card · serve the ACTUAL stone PNG from /public/art/stones/.
  // This is the same artifact the user is about to mint · visual continuity
  // from "the tide reads · WOOD" reveal → claim button → wallet receives
  // exactly what's shown. Bypasses /api/og's SVG generator (which is for
  // mid-quiz step icons that should stay element-agnostic per operator's
  // design intent · the stones DO carry element identity by construction
  // since they're the artifact of a specific element claim).
  return `${config.baseUrl}/art/stones/${archetype.toLowerCase()}.png`
}

// Render the start of the quiz · Q1 with N element-leaning answers (N = config.buttonsPerStep).
//
// Pure function · no I/O · returns a valid ActionGetResponse per Solana Actions spec.
//
// Title vs description: per Dialect's UI hierarchy the TITLE is the visually
// prominent element (bold white) and the DESCRIPTION is the dim subhead.
// We use title=question (the prompt the user actually answers) so the quiz
// content gets the prominent slot · the step indicator becomes the soft
// atmospheric subhead.
export const renderQuizStart = (
  config: RendererConfig = defaultConfig,
): ActionGetResponse => {
  const q = QUIZ_CORPUS[0]
  if (!q) {
    throw new Error(
      `Quiz corpus empty · expected ${QUIZ_CONFIG.totalSteps} questions`,
    )
  }

  const buttons = buildAnswerButtons(q.step, [], q.answers, config)

  return {
    icon: iconUrlForStep(q.step, config),
    title: q.prompt, // question is the visually prominent element
    description: QUIZ_STEP_TITLES[q.step] ?? "today's tide reads you", // step indicator as subhead
    label: "answer",
    links: { actions: buttons },
  }
}

// Render a mid-quiz step · steps 2..QUIZ_CONFIG.totalSteps · prior answers in URL state.
//
// Server-side caller validates HMAC over (step, priorAnswers) before rendering.
// S2-T2 implements proper HMAC-SHA256 · this renderer just passes through the mac.
export const renderQuizStep = (params: {
  step: number // 1..QUIZ_CONFIG.totalSteps · the step we're rendering
  priorAnswers: ReadonlyArray<0 | 1 | 2 | 3 | 4>
  mac: string
  config?: RendererConfig
}): ActionGetResponse => {
  const config = params.config ?? defaultConfig

  if (params.step < 1 || params.step > QUIZ_CONFIG.totalSteps) {
    return {
      icon: iconUrlForStep(1, config),
      title: "tide unread",
      description: "the path is unclear · please begin again",
      label: "begin",
      links: {
        actions: [{ type: "post", label: "Begin Again", href: `${config.baseUrl}/api/actions/quiz/start` }],
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
        actions: [{ type: "post", label: "Begin Again", href: `${config.baseUrl}/api/actions/quiz/start` }],
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
    title: q.prompt, // question gets the prominent slot
    description: QUIZ_STEP_TITLES[q.step] ?? "today's tide reads you", // step indicator → subhead
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

  // Title-case the element name · "Wood" · "Fire" · etc · for the
  // identity-locating phrase. Title Case for CTAs throughout.
  const elementName =
    params.archetype.charAt(0) + params.archetype.slice(1).toLowerCase()

  return {
    icon: iconUrlForArchetype(params.archetype, config),
    title: `Your Tide is ${elementName}.`,
    description: reveal,
    label: "Claim Your Stone",
    links: {
      actions: [
        {
          // claim → real mint flow (sprint-3 wires real claim_genesis_stone tx)
          // type:"transaction" so wallet adapter prompts for sig at click time
          type: "transaction",
          label: "Claim Your Stone",
          href: `${config.baseUrl}/api/actions/mint/genesis-stone`,
        },
        {
          // ambient → chains to next inline action (no wallet needed)
          type: "post",
          label: "See Today's Tide",
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
          // chain into the quiz · POST returns Q1 inline so user starts the quiz
          // without leaving the ambient card
          type: "post",
          label: "What's My Element?",
          href: `${config.baseUrl}/api/actions/quiz/start`,
        },
      ],
    },
  }
}

// Build answer buttons for a quiz step · count + selection driven by QUIZ_CONFIG.
//
// State encoded as URL query params: ?step=N&a1=...&aN-1=...&mac=...
// Each button gets `type` matching the configured chainStyle:
//   "inline-post" → type:"post" → POST handler returns next action inline
//   "external-link" → type:"external-link" → simple navigation
const buildAnswerButtons = (
  step: number,
  priorAnswers: ReadonlyArray<0 | 1 | 2 | 3 | 4>,
  answers: ReadonlyArray<{ label: string; element: Element }>,
  config: RendererConfig,
): LinkedAction[] => {
  // Apply selection strategy · slice corpus to QUIZ_CONFIG.buttonsPerStep
  const selected = selectAnswers(answers, step - 1)

  const buttonType = shouldButtonsPost() ? "post" : "external-link"

  return selected.map(({ originalIndex, answer }) => {
    const newAnswers = [...priorAnswers, originalIndex as 0 | 1 | 2 | 3 | 4]
    const nextStep = step + 1

    // Final step → links go to /result · earlier steps → /step
    const path =
      nextStep > QUIZ_CONFIG.totalSteps
        ? "/api/actions/quiz/result"
        : "/api/actions/quiz/step"

    const params = new URLSearchParams()
    if (nextStep <= QUIZ_CONFIG.totalSteps) {
      params.set("step", String(nextStep))
    }
    newAnswers.forEach((ans, i) => params.set(`a${i + 1}`, String(ans)))
    params.set("mac", "placeholder-mac-s1-t4") // sprint-3 wires real HMAC via signQuizState

    const queryString = params.toString()
    const href = `${config.baseUrl}${path}${queryString ? "?" + queryString : ""}`

    return { type: buttonType, label: answer.label, href }
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
