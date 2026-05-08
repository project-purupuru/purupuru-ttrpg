// GET /api/actions/quiz/result?step=8&a1=...&a8=...&mac=...
// Sprint-1 · S1-T7 · bumped to 8 questions in sprint-2 (operator-authored corpus)
//
// Server recomputes element from validated answers · ignores client-supplied.

import { NextResponse } from "next/server"

import { archetypeFromAnswers } from "@purupuru/peripheral-events"
import { QUIZ_CORPUS, renderQuizResult } from "@purupuru/medium-blink"

import { ACTION_CORS_HEADERS, getBaseUrl } from "@/lib/blink/cors"

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request)
  const url = new URL(request.url)
  const params = url.searchParams

  // Parse all 8 answers (final result endpoint).
  const answers: Array<0 | 1 | 2 | 3 | 4> = []
  for (let i = 1; i <= 8; i++) {
    const raw = params.get(`a${i}`)
    const ans = raw ? Number.parseInt(raw, 10) : NaN
    if (!Number.isInteger(ans) || ans < 0 || ans > 4) {
      return NextResponse.json(
        {
          icon: `${baseUrl}/api/og?step=1`,
          title: "tide unread",
          description: "the path was lost · please begin again",
          label: "begin",
          links: {
            actions: [
              { label: "begin again", href: `${baseUrl}/api/actions/quiz/start` },
            ],
          },
          error: { message: `Invalid answer parameter a${i}` },
        },
        { headers: ACTION_CORS_HEADERS, status: 400 },
      )
    }
    answers.push(ans as 0 | 1 | 2 | 3 | 4)
  }

  // Server-side element derivation: each answer leans toward an element
  // (per QUIZ_CORPUS) · tally votes · canonical tie-break.
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

  const archetype = archetypeFromAnswers(elementVotes)
  const response = renderQuizResult({ archetype, config: { baseUrl } })
  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTION_CORS_HEADERS })
}
