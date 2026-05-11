# API Surface · 2026-05-11

> Public functions and HTTP endpoints. For type shapes see [types.md](./types.md).

## HTTP Endpoints (Solana Actions · Blinks)

### `/api/actions/today`
- `GET → ActionGetResponse` · ambient card (`app/api/actions/today/route.ts:35`)

### `/api/actions/quiz`
- `GET /quiz/start → ActionGetResponse` · Q1 entry-point card (`route.ts:37`)
- `POST /quiz/start → PostResponse` · chain-link target (`route.ts:55`)
- `GET /quiz/step?s=N&...` · per-step card (HMAC-validated state) (`step/route.ts:129`)
- `POST /quiz/step` · advance step (`step/route.ts:146`)
- `GET /quiz/result?...` · archetype reveal card (`result/route.ts:113`)
- `POST /quiz/result` · confirm reveal · advance to mint (`result/route.ts:129`)

### `/api/actions/mint/genesis-stone`
- `POST` · build + partial-sign mint tx (`mint/genesis-stone/route.ts:119`)
- `GET` · pre-flight metadata (`mint/genesis-stone/route.ts:331`)

### `/api/og`
- `GET ?step=N|?archetype=X → SVG` · placeholder OG card (`app/api/og/route.tsx:129`)

### `/actions.json`
- `GET → ActionsManifest` · Solana Actions discovery (`app/actions.json/route.ts`)

## Pages (Next.js App Router · GET only)

`app/page.tsx` (observatory landing) · `app/today/page.tsx` · `app/quiz/page.tsx` · `app/preview/page.tsx` (local Blink preview) · `app/demo/page.tsx` (X-faithful 3-column recording surface) · `app/kit/page.tsx` (design-token playground) · `app/asset-test/page.tsx`

## Substrate Public API · `@purupuru/peripheral-events`

(Re-exported from `packages/peripheral-events/src/index.ts`)

```ts
// Schemas + types
Element, ElementByte, ElementAffinity, OracleSource, SolanaPubkey, SolanaCluster
MintEvent, WeatherEvent, ElementShiftEvent, QuizCompletedEvent, WorldEvent
ClaimMessage, ClaimNonce, QuizStateHash, SignedClaimMessage
Answer, BaziQuizState, CompletedQuizState, QuizStep, QUIZ_COMPLETED_STEP
StoneClaimedSchema, StoneClaimedRaw, StoneClaimedIndexedFields, StoneClaimed

// Functions
eventTagOf(e: WorldEvent): WorldEvent["_tag"]
eventReferencesPuruhani(e: WorldEvent, walletId: SolanaPubkey): boolean
elementToByte(e: Element): number    // 1..5
byteToElement(b: number): Element
buildClaimMessage(params): ClaimMessage
encodeClaimMessage(msg): Uint8Array  // 98 bytes (CLAIM_MESSAGE_SIGNED_BYTES)
signClaimMessage(msg, secretKey): SignedClaimMessage
verifyClaimSignature(signed): boolean
eventIdOf(event, sourceTag): string  // sha256 canonical
verifyEventId(event, sourceTag, expected): boolean
archetypeFromAnswers(answers): Element
quizStateHashOf(state): QuizStateHash
signQuizState(state, hmacKey): string
verifyQuizState(stateB64, hmacKey): BaziQuizState | null

// Constants
PACKAGE_VERSION = "0.0.1"
CLAIM_MESSAGE_SIGNED_BYTES = 98
CURRENT_SCHEMA_VERSION
```

## Renderer Public API · `@purupuru/medium-blink`

(Re-exported from `packages/medium-blink/src/index.ts`)

```ts
renderQuizStart(): ActionGetResponse
renderQuizStep(stepN, state): ActionGetResponse
renderQuizResult(state): ActionGetResponse
// Voice corpus (all data-only):
QUESTIONS    // 8 × {prompt, answers: 3 × {label, element}}
ARCHETYPES   // 5 × {element, name, description, ...}

// Solana Actions types
ActionGetResponse, ActionPostRequest, PostResponse, LinkedAction, ...
```

## Score Adapter · `@purupuru/world-sources`

(Re-exported from `packages/world-sources/src/index.ts`)

```ts
ScoreAdapter (interface)            // public contract
createMockScoreAdapter(): ScoreAdapter   // deterministic stub for local dev/tests
```

## Mint-flow helpers · `lib/blink/`

```ts
checkMintEnv(env?: NodeJS.ProcessEnv): EnvCheckResult       // env-check.ts
loadSponsoredPayer(env?): Keypair                            // sponsored-payer.ts
buildClaimTx(...): VersionedTransaction                      // build-claim-tx
claimNonceAtomic(nonce: ClaimNonce): boolean                 // nonce-store.ts
ACTION_CORS_HEADERS, getBaseUrl(req)                         // cors.ts
```

## On-chain (Rust) · `purupuru_anchor`

```rust
pub fn claim_genesis_stone(ctx: Context<ClaimGenesisStone>, ...) -> Result<()>
// Validates: ed25519 sysvar + claim-signer pubkey + ClaimMessage expiry + KV nonce
// CPIs: Metaplex Token Metadata create_metadata_accounts_v3
```

## Smoke / scripts

```bash
pnpm tsx scripts/sp3-mint-route-smoke.ts           # local
BASE_URL=https://purupuru.world pnpm tsx scripts/sp3-mint-route-smoke.ts  # prod
pnpm vitest run                                    # unit
pnpm test:e2e                                      # Playwright
cd programs/purupuru-anchor && anchor test         # 6 invariants
```
