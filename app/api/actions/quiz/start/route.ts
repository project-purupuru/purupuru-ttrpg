// GET /api/actions/quiz/start · Q1 ActionGetResponse
// Sprint-1 · S1-T5 · per SDD r2 §4.1

import { NextResponse } from "next/server"

import { renderQuizStart } from "@purupuru/medium-blink"

import { ACTION_CORS_HEADERS, getBaseUrl } from "@/lib/blink/cors"

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request)
  const response = renderQuizStart({ baseUrl })
  return NextResponse.json(response, { headers: ACTION_CORS_HEADERS })
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTION_CORS_HEADERS })
}
