# External Integrations · 2026-05-11

## Solana (write-side)

| Integration | Cluster | Pubkey / endpoint | Purpose |
|-------------|---------|-------------------|---------|
| Anchor program `purupuru_anchor` | devnet | `7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38` | `claim_genesis_stone` ix |
| Metaplex Token Metadata | devnet | `TOKEN_METADATA_PROGRAM_ID` (mainnet-pinned via `mpl-token-metadata` crate) | NFT metadata + master edition |
| Ed25519 sysvar | runtime | `INSTRUCTIONS_SYSVAR_ID` | sysvar inspection for ed25519 sig verify pattern |
| Solana RPC | devnet | `https://api.devnet.solana.com` (default · override via `SOLANA_RPC_URL`) | tx submit · balance check |
| `@solana/web3.js@^1.95.0` | client lib | — | tx assembly |
| `@coral-xyz/anchor@^0.31.1` | client lib | — | typed Program client |
| `@solana/wallet-adapter-{phantom,react,react-ui}` | client | — | Phantom wallet integration |

## Solana (read-side · indexer)

| Integration | Owner | Status |
|-------------|-------|--------|
| `project-purupuru/radar` (zerker's repo) | zerker | LIVE indexer subscribes to `StoneClaimed` events; observatory rail consumes via `NEXT_PUBLIC_RADAR_URL` |

## Vercel KV (Upstash Redis-compatible)

- **Purpose**: nonce replay protection (`NX EX 300` atomic claim)
- **Lib**: `@vercel/kv@^3.0.0`
- **Env**: `KV_REST_API_URL` + `KV_REST_API_TOKEN` (auto-set by KV provisioning)
- **Code**: `lib/blink/nonce-store.ts`

## Solana Actions (protocol)

- **Spec**: Solana Actions v2.4 (Dialect)
- **Lib**: `@dialectlabs/blinks@^0.22.5` (preview surface only · production endpoints implement spec directly)
- **Discovery**: `app/actions.json/route.ts` (manifest)
- **Endpoints**: `app/api/actions/{today,quiz/{start,step,result},mint/genesis-stone}/route.ts`

## Score read-adapter (currently mock)

- **Lib**: `@purupuru/world-sources` (`packages/world-sources/src/score-adapter.ts`)
- **Status**: interface stable · implementation = deterministic mock
- **Future**: real Score backend via `SCORE_API_URL` env (currently unset / unused)

## IRL weather (mocked)

- **Status**: weather oracle is a day-of-week stub per `app/api/actions/mint/genesis-stone/route.ts:4-9`
- **Future**: real-world weather → element mapping in `lib/weather/`

## Telegram (untested · structurally compatible)

- **Status**: same `/api/actions/*` endpoints honor the Solana Actions spec; should unfurl in Telegram clients without code changes
- **Verification**: not yet tested in Telegram client

## Twitter (the v0 distribution)

- **Status**: Blink unfurls in Twitter feed · LIVE
- **Links**: tweet → quiz/start → quiz/step (chain) → quiz/result → mint/genesis-stone → Phantom

## Voice / lore (substrate side)

- `grimoires/the-speakers/taste.md` (Gumi-curated voice register)
- `packages/medium-blink/src/voice-corpus.ts` (8 questions × 3 answers + 5 archetype reveals)
- `grimoires/vocabulary/lexicon.yaml` (canonical product terms)

## Eval harness

- `evals/` (eval suites, graders, fixtures · Loa eval-running tooling)
