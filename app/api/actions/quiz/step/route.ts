// GET /api/actions/quiz/step?step=N&a1=...&aN-1=...&mac=...
// Sprint-1 · S1-T6 · per SDD r2 §4.1
//
// Server validates HMAC before rendering · S1 ships placeholder check ·
// S2-T2 implements proper HMAC-SHA256 with length-extension safety.

import { NextResponse } from "next/server"

import { renderQuizStep } from "@purupuru/medium-blink"

import { ACTION_CORS_HEADERS, getBaseUrl } from "@/lib/blink/cors"

const PLACEHOLDER_MAC = "placeholder-mac-s1-t4"

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request)
  const url = new URL(request.url)
  const params = url.searchParams

  // Parse + validate step.
  const stepRaw = params.get("step")
  const step = stepRaw ? Number.parseInt(stepRaw, 10) : NaN
  if (!Number.isInteger(step) || step < 2 || step > 8) {
    return NextResponse.json(
      {
        icon: `${baseUrl}/api/og?step=1`,
        title: "tide unread",
        description: "the path is unclear · please begin again",
        label: "begin",
        links: {
          actions: [
            { label: "begin again", href: `${baseUrl}/api/actions/quiz/start` },
          ],
        },
        error: { message: "Invalid step parameter" },
      },
      { headers: ACTION_CORS_HEADERS, status: 400 },
    )
  }

  // Parse prior answers (a1..aN-1) into typed array.
  const priorAnswers: Array<0 | 1 | 2 | 3 | 4> = []
  for (let i = 1; i < step; i++) {
    const raw = params.get(`a${i}`)
    const ans = raw ? Number.parseInt(raw, 10) : NaN
    if (!Number.isInteger(ans) || ans < 0 || ans > 4) {
      return NextResponse.json(
        {
          error: { message: `Invalid answer parameter a${i}` },
        },
        { headers: ACTION_CORS_HEADERS, status: 400 },
      )
    }
    priorAnswers.push(ans as 0 | 1 | 2 | 3 | 4)
  }

  // HMAC validation (placeholder S1 · S2-T2 implements proper)
  const mac = params.get("mac") ?? ""
  if (mac !== PLACEHOLDER_MAC) {
    // S1 lenient mode · log + continue. S2-T2 fails closed.
    console.warn("[quiz/step] non-placeholder mac · S1 lenient")
  }

  const response = renderQuizStep({
    step,
    priorAnswers,
    mac,
    config: { baseUrl },
  })

  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTION_CORS_HEADERS })
}
