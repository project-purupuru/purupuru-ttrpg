# Entry Points · 2026-05-11

## Application

| Surface | Entry | Required env |
|---------|-------|--------------|
| Next.js dev server | `pnpm dev` (next dev · Turbopack) | none for browse · mint flow needs full env |
| Next.js prod | `pnpm build && pnpm start` | full mint env |
| Vercel deploy | `git push` to deploy branch | full mint env in Vercel project settings |

## Solana Actions endpoints

| Surface | URL | Method |
|---------|-----|--------|
| Quiz start | `/api/actions/quiz/start` | GET (Q1 card) · POST (chain-link) |
| Quiz step N | `/api/actions/quiz/step?s=N&...` | GET (card) · POST (advance) |
| Quiz result | `/api/actions/quiz/result?...` | GET (reveal) · POST (advance to mint) |
| Mint stone | `/api/actions/mint/genesis-stone` | GET (preflight) · POST (build tx) |
| Today (ambient) | `/api/actions/today` | GET |
| Manifest | `/actions.json` | GET |
| OG card | `/api/og?step=N | ?archetype=X` | GET (SVG) |

## Pages

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `app/page.tsx` | Observatory landing |
| `/today` | `app/today/page.tsx` | Ambient landing (direct-URL) |
| `/quiz` | `app/quiz/page.tsx` | Quiz landing (direct-URL) |
| `/preview` | `app/preview/page.tsx` | Local Blink preview surface |
| `/demo` | `app/demo/page.tsx` | X-faithful 3-column recording surface |
| `/kit` | `app/kit/page.tsx` | Design-token playground |
| `/asset-test` | `app/asset-test/page.tsx` | Asset URL probes |

## Test entry points

```bash
pnpm vitest run                                              # all unit
pnpm vitest run --coverage                                   # with coverage
pnpm test:watch                                              # watch
pnpm test:e2e                                                # Playwright
pnpm --filter @purupuru/peripheral-events test               # substrate only
pnpm --filter @purupuru/medium-blink test                    # renderer only
pnpm --filter @purupuru/world-sources test                   # score adapter only
cd programs/purupuru-anchor && anchor test                   # Rust invariants (6)
pnpm tsx scripts/sp3-mint-route-smoke.ts                     # local mint smoke
BASE_URL=https://purupuru.world pnpm tsx scripts/sp3-mint-route-smoke.ts  # prod smoke
```

## Build / typecheck / lint

```bash
pnpm install
pnpm typecheck                  # tsc --noEmit
pnpm lint                       # eslint
pnpm build                      # next build
cd programs/purupuru-anchor && anchor build
```

## Required env (mint flow · per lib/blink/env-check.ts)

`CLAIM_SIGNER_SECRET_BS58` · `SPONSORED_PAYER_SECRET_BS58` (or `..._SECRET_JSON`) · `QUIZ_HMAC_KEY` · `KV_REST_API_URL` · `KV_REST_API_TOKEN`

## Optional env

`SOLANA_RPC_URL` · `NEXT_PUBLIC_APP_URL` · `OBSERVATORY_URL` · `NEXT_PUBLIC_RADAR_URL` · `SCORE_API_URL`

## Pre-demo runbook

`grimoires/loa/context/05-pre-demo-checklist.md` — end-to-end checklist including upgrade-authority freeze (`solana program set-upgrade-authority --final` · IRREVERSIBLE).
