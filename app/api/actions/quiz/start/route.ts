// /api/actions/quiz/start
//   GET  → Q1 ActionGetResponse · the entry-point card
//   POST → chain-link target · returns Q1 inline (when reached from /today's button)
//
// Per Solana Actions spec v2.4 · LinkedAction.type='post' button POSTs to the
// href and expects a PostResponse with `links.next` to drive the chain.

import { NextResponse } from "next/server"

import { renderQuizStart } from "@purupuru/medium-blink"
import type { PostResponse } from "@purupuru/medium-blink"

import { ACTION_CORS_HEADERS, getBaseUrl } from "@/lib/blink/cors"

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request)
  const response = renderQuizStart({ baseUrl })
  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

// POST handler · enables `/today` ambient card's "what's my element?" button
// (type="post") to chain into Q1 inline without leaving the card.
export async function POST(request: Request) {
  const baseUrl = getBaseUrl(request)
  const response: PostResponse = {
    type: "post",
    links: {
      next: {
        type: "inline",
        action: renderQuizStart({ baseUrl }),
      },
    },
  }
  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTION_CORS_HEADERS })
}
