// /api/actions/quiz/result?step=8&a1=...&a8=...&mac=...
//   GET  → ActionGetResponse with archetype reveal + claim button
//   POST → PostResponse with reveal action inline (chain target from quiz/step Q8 button)
//
// Server recomputes archetype from validated answers · ignores client-supplied.
// Per Solana Actions spec v2.4 · POST handlers exist so type="post" buttons
// from the previous step can chain in-card without a fresh fetch.

import { NextResponse } from "next/server"

import { archetypeFromAnswers } from "@purupuru/peripheral-events"
import {
  QUIZ_CONFIG,
  QUIZ_CORPUS,
  renderQuizResult,
  type ActionGetResponse,
  type PostResponse,
} from "@purupuru/medium-blink"

import { ACTION_CORS_HEADERS, getBaseUrl } from "@/lib/blink/cors"

// Parse and validate URL query · returns either parsed answers or an error response.
function parseResultQuery(url: URL):
  | { ok: true; answers: Array<0 | 1 | 2 | 3 | 4> }
  | { ok: false; response: ReturnType<typeof NextResponse.json> } {
  const params = url.searchParams
  const baseUrl = `${url.protocol}//${url.host}`
  const answers: Array<0 | 1 | 2 | 3 | 4> = []

  for (let i = 1; i <= QUIZ_CONFIG.totalSteps; i++) {
    const raw = params.get(`a${i}`)
    const ans = raw ? Number.parseInt(raw, 10) : NaN
    const question = QUIZ_CORPUS[i - 1]
    const maxIdx = question ? question.answers.length - 1 : 0
    if (
      !Number.isInteger(ans) ||
      ans < 0 ||
      ans > maxIdx ||
      ans > 4
    ) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            icon: `${baseUrl}/api/og?step=1`,
            title: "Something's off",
            description: "Your answers got out of sync · start over to read you fresh.",
            label: "begin",
            links: {
              actions: [
                {
                  type: "post",
                  label: "Begin Again",
                  href: `${baseUrl}/api/actions/quiz/start`,
                },
              ],
            },
            error: {
              message: `Invalid answer parameter a${i} (must be 0..${maxIdx} for question ${i})`,
            },
          },
          { headers: ACTION_CORS_HEADERS, status: 400 },
        ),
      }
    }
    answers.push(ans as 0 | 1 | 2 | 3 | 4)
  }
  return { ok: true, answers }
}

// Resolve archetype Element from validated answers via voice-corpus mapping.
function resolveArchetype(answers: Array<0 | 1 | 2 | 3 | 4>): ReturnType<typeof archetypeFromAnswers> {
  const elementVotes = answers.map((idx, qIdx) => {
    const question = QUIZ_CORPUS[qIdx]
    if (!question) {
      throw new Error(`Quiz corpus missing question ${qIdx + 1}`)
    }
    const answer = question.answers[idx]
    if (!answer) {
      throw new Error(`Quiz answer ${idx} not present at step ${qIdx + 1}`)
    }
    return answer.element
  })
  return archetypeFromAnswers(elementVotes)
}

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request)
  const url = new URL(request.url)
  const parsed = parseResultQuery(url)
  if (!parsed.ok) return parsed.response

  const archetype = resolveArchetype(parsed.answers)
  const response = renderQuizResult({ archetype, config: { baseUrl } })
  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request)
  const url = new URL(request.url)
  const parsed = parseResultQuery(url)
  if (!parsed.ok) return parsed.response

  const archetype = resolveArchetype(parsed.answers)
  const action: ActionGetResponse = renderQuizResult({
    archetype,
    config: { baseUrl },
  })

  const response: PostResponse = {
    type: "post",
    links: { next: { type: "inline", action } },
  }
  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTION_CORS_HEADERS })
}
