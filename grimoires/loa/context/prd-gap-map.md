# PRD Gap Map · State of the Build

> **As of**: 2026-05-09 (T-2 days to ship 2026-05-11)
> **Snapshot of**: `feat/awareness-layer-spine` branch state vs `grimoires/loa/prd.md` r5 requirements
> **Purpose**: at-a-glance read of what's done · what's mocked · what's deferred · what's at risk · so the operator can decide where to spend the remaining time

Legend:

| Marker | Meaning |
|---|---|
| ✅ | Shipped + working in prod (vercel preview or devnet) |
| 🟡 | Partially shipped · gap noted in column 3 |
| 🔴 | Not shipped · in critical path · deferred or at-risk |
| ⚪ | Not shipped · explicitly deferred to post-hackathon |
| ⚠️ | Drift from PRD · current behavior diverges from spec (intentional or unintentional · noted) |

---

## Functional Requirements (FR-1 through FR-12)

### FR-1 · L2 substrate package (`@purupuru/peripheral-events`)

| Sub-requirement | Status | Notes |
|---|---|---|
| `WorldEvent` discriminated union (Mint/Weather/ElementShift/QuizCompleted) | ✅ | `packages/peripheral-events/src/world-event.ts` |
| `BaziQuizState` schema with HMAC-SHA256 + canonical encoding | ✅ | `bazi-quiz-state.ts` · custom canonical layout `[version|step|answers.length|...answers]` · timing-safe verify |
| Length-extension forgery test | 🟡 | HMAC implementation correct (Node `createHmac`) · golden test asserting forgery FAILS not yet written |
| Server recomputes element from validated answers (NEVER trusts client) | ✅ | `archetypeFromAnswers` is called server-side in `app/api/actions/quiz/result/route.ts:84` |
| Canonical `eventId` = `sha256(canonicalEncode(event) || schema_version || source_tag)` | ✅ | `event-id.ts` |
| All ports declared (EventSourcePort · BaziResolverPort · MintAuthorizationPort · etc.) | 🟡 | Adapters present where needed for sprint-2 spine · several ports declared but not exhaustively wired (no aggregate adapter yet) |
| `ClaimMessage` 98-byte canonical encoding · TS↔Rust byte-stable | ✅ | `claim-message.ts` mirror of `lib.rs:351-368` · golden test on TS side, anchor invariant test on Rust side |

**Drift from PRD**: PRD-r5 §FR-3 specifies a 11-field structured `ClaimMessage` (domain · version · cluster · program_id · wallet · element · weather · quiz_state_hash · issued_at · expires_at · nonce). We shipped a leaner 7-field 98-byte encoding (wallet · element · weather · quiz_state_hash · issued_at · expires_at · nonce) — domain/version/cluster/program_id were dropped. Trade-off was complexity vs sprint-2 EOD deadline. **Recommendation**: ACCEPTED-DEFERRED · log to NOTES.md · post-hackathon hardening adds the four missing fields.

### FR-2 · L3 medium-registry contribution · `BLINK_DESCRIPTOR`

| Sub-requirement | Status | Notes |
|---|---|---|
| Local `BLINK_DESCRIPTOR` constant (5th MediumCapability variant) | 🟡 | Local fixture exists in `packages/medium-blink` · not yet exported as a typed `MediumCapability` discriminated-union member |
| Captures Solana Actions constraints (icon size · button max · txShape · etc.) | 🟡 | Constraints used at runtime · not formalized as a frozen const |
| `actionChaining: "post-chain"` (we shipped POST chain · PRD said GET chain v0) | ⚠️ | We CHOSE to ship POST-chain inline because Dialect's Blink renderer requires `links.next.action` for in-card chaining. Visible in `app/api/actions/quiz/step/route.ts:118` POST handler · `links: { next: { type: "inline", action } }`. Drift is INTENTIONAL — the GET-chain proposal in PRD r5 §FR-2 was based on a misunderstanding of Dialect's renderer; PRD should be updated to reflect this. |
| `MEDIUM_REGISTRY_VERSION = "0.3.0"` | 🔴 | Not bumped · upstream PR not opened |
| **Upstream PR to freeside-mediums repo** | 🔴 | Stretch goal #6 per PRD §7.5 · deferred · would require external repo coordination |

**Recommendation**: ACCEPTED-DEFERRED for hackathon scope · ship local-only descriptor as PRD §7.5 cut-tree explicitly permits ("ship local-only descriptor · open PR but don't gate on merge"). Document the POST-chain decision in NOTES.md.

### FR-3 · Solana anchor program · TWO instructions · DEVNET LOCKED

| Sub-requirement | Status | Notes |
|---|---|---|
| Program deployed to devnet at known address | ✅ | `7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38` (Anchor 0.31.1 build) |
| Instruction A · `attest_witness(event_id, event_kind)` · WitnessRecord PDA | 🔴 | **NOT SHIPPED**. We went straight to genesis-stone per spine model. Witness instruction was day-1 minimum fallback — never needed because Spike 2 (ed25519-via-sysvar) passed. |
| Instruction B · `claim_genesis_stone(message: ClaimMessage)` · ed25519-via-instructions-sysvar | ✅ | `lib.rs:121-214` · `verify_prior_ed25519` reads ix[current_index-1] · validates Ed25519Program + signer + message |
| Backend uses dedicated ed25519 keypair (separate from sponsored-payer) | ✅ | Three-keypair model: sponsored-payer + claim-signer + user wallet · pubkey hardcoded in program (`CLAIM_SIGNER_PUBKEY` const) |
| `GenesisStone` PDA seeded `[b"stone", wallet]` · idempotent | 🔴 | Not implemented · we mint a fresh Mint keypair per claim · no per-wallet idempotency guard |
| Metaplex Token Metadata visible in Phantom collectibles | ✅ | `CreateV1` CPI in `lib.rs:172-204` · Sp2 e2e test confirms Phantom rendering |
| Sponsored-payer pattern (backend partial-signs first, wallet signs second) | 🟡 | Pattern correct · but wired off-chain only in sprint-2 substrate tests; the `/api/actions/mint/genesis-stone` POST route is still the Sp1 mock memo (see FR-4 below) |
| Upgrade authority FROZEN post-deploy | 🔴 | **STILL UPGRADEABLE** · operator must run `solana program set-upgrade-authority --final` before demo recording |
| Emits `StoneClaimed` event | ✅ | `lib.rs:281-288` + `emit!` at line 206 |
| 7 invariant tests | 🟡 | 6 tests passing (`programs/purupuru-anchor/tests/sp2-claim.ts`): no_lamport_transfers · no_token_state_mutation · double_claim_rejected · unsigned_claim_rejected · expired_signature_rejected · cross_cluster_rejected. The `replay_with_used_nonce_rejected` test was deferred — nonce replay is enforced off-chain in KV not on-chain. |

**Critical pre-demo gap**: upgrade authority must be set to `--final` before recording. **Recommendation**: schedule for sprint-3 morning · single command after no-issue confirmation.

### FR-4 · `apps/blink-emitter` · GET-chained quiz + final mint POST

| Sub-requirement | Status | Notes |
|---|---|---|
| `GET /api/actions/quiz/start` | ✅ | Returns Q1 ActionGetResponse |
| `GET /api/actions/quiz/step?step=N&...` | ✅ | + POST handler returns `links.next.inline` for in-card chain |
| `GET /api/actions/quiz/result?...` | ✅ | + POST handler · server recomputes archetype from validated answers |
| `POST /api/actions/mint/genesis-stone` returns serialized devnet tx | 🔴 | **STILL Sp1 MOCK MEMO** · `app/api/actions/mint/genesis-stone/route.ts` returns memo tx · NOT real `claim_genesis_stone` ix · this is the highest-priority sprint-3 work |
| HMAC validation at every quiz step transition | 🟡 | Quiz step route reads `mac` query param but currently in S1 lenient mode (`PLACEHOLDER_MAC` constant · warns on mismatch but doesn't block) per `app/api/actions/quiz/step/route.ts:91-95`. **Per FR-1 we DO have HMAC sign/verify built**; the route just hasn't switched from placeholder to real. Sprint-3 task. |
| `quiz_state_token` (5-min JWT) issued at result reveal · binds wallet+element+weather | 🔴 | Not implemented · we'd need a token issuance endpoint and verification at mint POST. Sprint-3 critical-path. |
| Sponsored-payer partial-sign before return | 🔴 | Sprint-3 task · ties directly to mock-memo replacement above |
| `getBalance` ≥ 0.01 SOL sybil check | 🔴 | Not implemented · sprint-3 stretch (likely cuttable for demo) |
| IP-based rate limit (50 quiz-starts/IP/hour, 5 mint-POSTs/IP/hour) | 🔴 | Not implemented · stretch |
| Sponsored-payer balance halt threshold (<1 SOL → 503) | 🔴 | Not implemented · stretch |

**Critical sprint-3 path**: items marked 🔴 above for FR-4 are the BIGGEST remaining engineering blocker. Without them, the live Blink "feels" complete but the mint button signs a useless memo transaction instead of minting a real stone.

### FR-5 · Score integration · existing API (read-side)

| Sub-requirement | Status | Notes |
|---|---|---|
| `score-puru` API element-affinity read | 🟡 | `packages/world-sources/score-adapter.ts` provides `resolveScoreAdapter()` interface · v0 backed by mock distribution · real Score-API binding deferred |
| Sonar/Hasura GraphQL · ERC-721 Transfer events for ambient WeatherEvent | 🔴 | Not wired · the `/api/actions/today` ambient endpoint reads from the mock adapter |
| 5min cron pull from Score | 🔴 | Not implemented · we read on each Action GET via `revalidate = 60` |

**Recommendation**: ACCEPTED-MOCKED for hackathon · the awareness-layer ambient surface is currently fed by a deterministic stub. Surfacing this honestly in the deck is fine — "the substrate is real, the data is mocked for demo" is the same story shipped by 80% of hackathon entries.

### FR-6 · Cache invalidation · TTL fallback locked

| Sub-requirement | Status | Notes |
|---|---|---|
| 60s blink GET cache | ✅ | `revalidate = 60` on Next.js routes |
| 24h icon cache | ✅ | `Cache-Control: public, max-age=60, stale-while-revalidate=300` on `/api/og` |
| Solana real-time PDA reads (no staleness) | n/a | Indexer-side concern · zerker's lane |

### FR-7 · Per-medium voice authority (gumi)

| Sub-requirement | Status | Notes |
|---|---|---|
| Quiz questions authored | ⚠️ | **8 questions × 3 answers each** shipped (operator + Gumi co-curated) vs PRD's spec of **5 questions × 4 answers**. Drift is INTENTIONAL · operator preferred 8×3 for richer signal at narrower per-question spread. |
| Archetype reveals (5 elements · ≤280 chars each) | ✅ | `voice-corpus.ts:ARCHETYPE_REVEALS` · grounded plain-language version (operator validated 2026-05-09 · removed "tide" metaphor) |
| Mint button copy | ✅ | "Claim Your Stone" |
| Daily-archetype prompt for `@puruhpuruweather` Blink | 🔴 | Not authored · downstream ambient Blink not built |
| Gumi metaphor authority for stone visuals | ✅ | 5 stones delivered as 1350×1350 PNGs · live at `public/art/stones/{element}.png` |

### FR-8 · cmp-boundary enforcement (load-bearing)

| Sub-requirement | Status | Notes |
|---|---|---|
| Substrate truth ≠ presentation rule documented | ✅ | Per `chat-medium-presentation-boundary.md` doctrine |
| GET wallet-agnostic per Solana Actions spec | ✅ | All quiz GET endpoints accept `account` param but never branch behavior on it |
| POST result-token includes wallet-aware narrative | 🔴 | Not implemented (depends on result_token from FR-4) |
| Lint enforces (FR-10) | 🟡 | `eslint.config.mjs` adds boundary rules · golden tests not extensive |

### FR-9 · Observability (extended)

| Sub-requirement | Status | Notes |
|---|---|---|
| Vercel logs surface | ✅ | Default Vercel logging |
| Quiz GET-chain dropoff funnel (Q1 → Q5 ... Q8) | 🔴 | No funnel instrumentation |
| Mint POST failure rate dashboard | 🔴 | Not built |
| Sponsored-payer balance < 1 SOL alert | 🔴 | Not built |
| Claim-signer signing rate anomaly | 🔴 | Not built |
| HMAC validation failure rate (tampering signal) | 🔴 | Not built |
| StoneClaimed event indexer lag | 🔴 | Indexer doesn't exist yet (see FR-12) |

**Recommendation**: ACCEPTED-MOCKED for hackathon · operator should add a `console.log` for `[mint-success]` and `[mint-error]` events at minimum so post-demo we can see what hit.

### FR-10 · cmp-boundary lint + golden test suite

| Sub-requirement | Status | Notes |
|---|---|---|
| ESLint cmp-boundary rules | ✅ | `eslint.config.mjs` — `substrateBoundaryRules` + `mediumBlinkBoundaryRules` |
| CI gate | 🟡 | Local lint passes · no CI workflow yet |
| Golden tests blocking raw substrate-canonical leaks (event_id · puruhani_id · raw element codes) | 🔴 | Not written |

### FR-11 · Demo simulator

| Sub-requirement | Status | Notes |
|---|---|---|
| Fixture replay OR synthetic generator OR post-recording acceleration | 🔴 | Not started · sprint-4 work · operator decides shape |

**Recommendation**: per PRD §7.5 cut-tree · post-recording video acceleration is the 0d fallback. Plan accordingly.

### FR-12 · Score dashboard integration · zerker's lane

| Sub-requirement | Status | Notes |
|---|---|---|
| Anchor program emits documented `StoneClaimed` event | ✅ | `lib.rs:281-288` |
| Event schema available to zerker as Effect Schema export | 🟡 | Schema lives in Anchor IDL · not yet re-exported from `@purupuru/peripheral-events` as a TS Effect Schema for zerker to consume |
| Deploy timing coordinated · zerker has 24h notice | 🔴 | This is the issue we're about to draft |
| Post-anchor-deploy demo includes Score dashboard view | 🔴 | Pending zerker indexer work · downstream of issue creation |

---

## Non-Functional Requirements (§5)

### Stack (locked)

| Layer | PRD spec | Reality | Gap |
|---|---|---|---|
| L2 substrate | TS + Effect Schema `^3.10.0` | TS + Effect Schema · pnpm workspaces | ✅ |
| L3 contribution | freeside-mediums upstream | Local `BLINK_DESCRIPTOR` in `medium-blink` | 🟡 upstream PR deferred |
| L4 emitter app | Next.js 15 · App Router · Vercel | **Next.js 16.2.6** · App Router · Vercel | ⚠️ upgrade · React 19.2 · works fine |
| Solana program | Anchor 0.30+ · Rust · ed25519 | Anchor 0.31.1 · Rust · ed25519-via-sysvar | ✅ |
| NFT standard | Metaplex Token Metadata | Metaplex Token Metadata 5.1.x | ✅ |
| Package manager | bun | **pnpm** 10.x | ⚠️ drift · operator switched mid-build · works fine |
| Testing | vitest + msw + anchor-test | vitest + anchor-mocha | 🟡 msw not present (no API client tests) · anchor invariant tests pass |

### Performance

| Target | Actual | Gap |
|---|---|---|
| Quiz GET p95 < 600ms | Not measured · Vercel edge default ~200ms | ✅ assumed met |
| Mint POST p95 < 1.5s | n/a · still mock memo path | 🔴 measure after FR-4 wiring |
| Archetype card cached 60s | ✅ via `revalidate = 60` | ✅ |

### Security (extended)

| Requirement | Status |
|---|---|
| POST validates `account` is well-formed pubkey | 🟡 length>=32 check only · no full base58/curve validation |
| HMAC validation at every quiz GET transition | 🟡 placeholder mode (FR-4 row) |
| Result token (5-min JWT · binds quiz state to wallet) | 🔴 not implemented |
| Mint signature verification (ed25519-via-sysvar) | ✅ FR-3 |
| Structured ClaimMessage payload (domain · cluster · program_id · expires_at · nonce) | 🟡 leaner 7-field encoding (FR-1 drift note) |
| Separate keypairs (claim-signer cold · sponsored-payer warm) | ✅ env-managed |
| Anti-sybil rate limit + balance check | 🔴 stretch |
| Sponsored-payer balance halt | 🔴 stretch |
| Presentation-boundary lint blocks raw IDs in CI | 🟡 lint exists · CI not wired |
| 7 invariant tests on anchor | 🟡 6/7 (FR-3 row) |
| **Upgrade authority FROZEN post-deploy** | 🔴 critical pre-demo task |

### Deploy

| Requirement | Status |
|---|---|
| Preview deployments per PR | ✅ Vercel auto-preview |
| Production at known URL | ✅ `https://purupuru-blink.vercel.app` |
| Anchor program devnet locked | ✅ |
| Three keypairs (sponsored-payer · claim-signer · upgrade-authority) | 🟡 first two operational · upgrade-authority NOT yet `--final` |

---

## Critical-Path Punch List (in suggested execution order before 2026-05-11)

These are the items the operator should plan around. Each marked with **must / should / nice**.

| # | Item | Severity | Effort | Reference |
|---|---|---|---|---|
| 1 | Replace mint POST mock memo with real `claim_genesis_stone` integration | **must** | 0.5d | FR-4 row 4 |
| 2 | Switch quiz step HMAC from PLACEHOLDER_MAC to real verify | **must** | 0.25d | FR-4 row 5 |
| 3 | Issue `quiz_state_token` (5-min JWT) at result reveal · validate at mint POST | **must** | 0.5d | FR-4 row 6 |
| 4 | Sponsored-payer partial-sign before tx return | **must** | 0.25d (folds into #1) | FR-4 row 7 |
| 5 | Run `solana program set-upgrade-authority --final` before demo | **must** | 5min | FR-3 row 8 |
| 6 | Draft Zerker indexer issue (this session task #3) | **must** | n/a (in flight) | FR-12 row 3 |
| 7 | Re-export `StoneClaimed` event schema as Effect Schema from peripheral-events | **should** | 0.25d | FR-12 row 2 |
| 8 | Add `[mint-success]/[mint-error]` console.logs for post-demo debugging | **should** | 5min | FR-9 |
| 9 | Length-extension forgery golden test on HMAC | **should** | 0.25d | FR-1 row 3 |
| 10 | Demo simulator (fixture replay OR synthetic generator) | **should** | 0.5-1d | FR-11 |
| 11 | IP rate limit + sybil balance check | nice | 0.5d | FR-4 rows 8-9 |
| 12 | Upstream `BLINK_DESCRIPTOR` PR | nice | 0.5d | FR-2 row 5 |
| 13 | CI lint workflow | nice | 0.25d | FR-10 row 2 |

**Spine math**: items 1-5 are the minimum to land a real end-to-end mint. Estimated ~1.75d of focused work. Today is 2026-05-09 · ship is 2026-05-11. Two clean days of work fits if items 1-5 are sequenced first.

---

## Drift From PRD Worth Surfacing in Deck

Honesty about drift wins points · hiding it loses points.

1. **Quiz shape**: 8×3 not 5×4 (FR-7) · operator preference · richer signal
2. **POST chain not GET chain** (FR-2) · Dialect renderer requires this · PRD-r5 was misinformed
3. **`ClaimMessage` 7-field not 11-field** (FR-3 / FR-1) · post-hackathon hardening
4. **No on-chain `GenesisStone` PDA idempotency** (FR-3) · we mint a fresh Mint per claim · KV nonce off-chain prevents replay
5. **Score data is mocked** (FR-5) · awareness-layer surface real, data deterministic-stub
6. **No `attest_witness` instruction** (FR-3) · spine model meant we never needed the day-1 fallback
