// POST /api/actions/mint/genesis-stone · S1-T9 mock memo path
// SDD r2 §4.2 (mock variant) · Sprint-1 day-1 spine · pre-Spike 2+3 validation.
//
// Returns a real Solana memo transaction · no anchor program needed.
// Wallet signs + submits · confirms on devnet.
// Sprint-2 swaps to real claim_genesis_stone tx after Spike 2 (ed25519-via-sysvar) passes.
//
// Per FR-8 cmp-boundary: NO raw IDs in user-visible message · presentation-translated only.

import { NextResponse } from "next/server"

import {
  archetypeFromAnswers,
  type Element,
} from "@purupuru/peripheral-events"
import { ARCHETYPE_REVEALS, QUIZ_CORPUS } from "@purupuru/medium-blink"

import { ACTION_CORS_HEADERS, getBaseUrl } from "@/lib/blink/cors"
import { buildMockMemoTx, composeMintMemo } from "@/lib/blink/mock-memo-tx"

// POST body shape per Solana Actions spec.
interface ActionPostBody {
  account?: string
}

// Parse answers (a1..a8) from URL query · mirrors result endpoint.
const parseAnswersFromQuery = (
  url: URL,
): { answers: Array<0 | 1 | 2 | 3 | 4>; error?: string } => {
  const answers: Array<0 | 1 | 2 | 3 | 4> = []
  for (let i = 1; i <= 8; i++) {
    const raw = url.searchParams.get(`a${i}`)
    const ans = raw ? Number.parseInt(raw, 10) : NaN
    if (!Number.isInteger(ans) || ans < 0 || ans > 4) {
      return { answers: [], error: `Invalid answer parameter a${i}` }
    }
    answers.push(ans as 0 | 1 | 2 | 3 | 4)
  }
  return { answers }
}

// Compute today's cosmic weather element · v0 stub · S3-T8 wires real oracle.
const todayWeatherElement = (): Element => {
  // Deterministic stub keyed off day-of-week · sprint-3 swaps to puruhpuruweather feed.
  const day = new Date().getUTCDay()
  const cycle: Element[] = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"]
  const idx = day % 5
  return cycle[idx] ?? "WOOD"
}

export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request)

  // 1. Parse + validate POST body · `account` is the wallet's public key.
  let body: ActionPostBody
  try {
    body = (await request.json()) as ActionPostBody
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body" } },
      { headers: ACTION_CORS_HEADERS, status: 400 },
    )
  }

  const account = body.account
  if (!account || typeof account !== "string" || account.length < 32) {
    return NextResponse.json(
      { error: { message: "Missing or malformed `account` field" } },
      { headers: ACTION_CORS_HEADERS, status: 400 },
    )
  }

  // 2. Recover quiz answers from URL query (the result button carries them through).
  const url = new URL(request.url)
  const { answers, error } = parseAnswersFromQuery(url)
  if (error) {
    // Fallback: if no answers in URL · use a default WOOD genesis (graceful degrade).
    return NextResponse.json(
      {
        transaction: "",
        message: "We couldn't read your answers · please take the quiz again.",
        error: { message: error },
      },
      { headers: ACTION_CORS_HEADERS, status: 400 },
    )
  }

  // 3. Server-side element derivation (per HIGH-1 fix · client-supplied element ignored).
  const elementVotes = answers.map((idx, qIdx) => {
    const question = QUIZ_CORPUS[qIdx]
    const answer = question?.answers[idx]
    if (!answer) {
      throw new Error(`Quiz answer ${idx} not in step ${qIdx + 1}`)
    }
    return answer.element
  })
  const archetype = archetypeFromAnswers(elementVotes)
  const weather = todayWeatherElement()

  // 4. Build the mock memo transaction · authority = wallet pubkey from POST body.
  let txResult
  try {
    txResult = await buildMockMemoTx({
      authority: account,
      memo: composeMintMemo({ archetype, weather }),
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown"
    return NextResponse.json(
      {
        transaction: "",
        message: "Network's briefly out of reach · please try again.",
        error: { message: `Tx build failed: ${reason}` },
      },
      { headers: ACTION_CORS_HEADERS, status: 503 },
    )
  }

  // 5. Compose daemon-voiced acknowledgment · presentation-translated.
  const reveal =
    ARCHETYPE_REVEALS[archetype] ??
    "Your stone is yours."

  return NextResponse.json(
    {
      transaction: txResult.transactionBase64,
      message: reveal,
    },
    { headers: ACTION_CORS_HEADERS },
  )
}

// GET handler · helps dialect inspector preview the action surface before POST.
export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request)
  return NextResponse.json(
    {
      icon: `${baseUrl}/api/og?action=mint`,
      title: "Claim Your Genesis Stone",
      description:
        "Take the 8-question quiz · find your element · claim the stone that reads you back.",
      label: "claim",
      links: {
        actions: [
          {
            type: "post",
            label: "Take the Quiz",
            href: `${baseUrl}/api/actions/quiz/start`,
          },
        ],
      },
    },
    { headers: ACTION_CORS_HEADERS },
  )
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTION_CORS_HEADERS })
}
