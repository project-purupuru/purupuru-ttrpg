---
status: r1 · post-flatline-sdd-r2-deferred
type: sprint-plan
cycle: hackathon-frontier-2026-05
created: 2026-05-07
authority: zksoju (operator) · pending eileen ratification
companion_to: grimoires/loa/{prd.md, sdd.md}
deadline: 2026-05-11
absorbs: 14 SDD-flatline-r2 blockers + 4 PRD-flatline blockers · all become concrete sprint tasks
---

# Sprint Plan · purupuru awareness layer · 4-day Frontier ship

> **4 sprints · 4 days · spine-first · 3 day-1 spikes gate stretch.**
> If day-1 spine fails to run end-to-end, HALT and operator-pair before sprint-2.
> Codex's awareness model is the structural backbone · this plan is the "build one vertical first" interpretation.

---

## Verification model

| level | check | gate |
|---|---|---|
| **task** | acceptance criteria pass · code review · test green | sprint review |
| **sprint** | sprint objective demonstrably met · sprint-flatline-review (Phase 6 · auto-trigger after sprint-1) | next sprint start |
| **spine** | day-1 spine runs end-to-end · all 3 spikes pass-or-degrade | EOD 2026-05-08 |
| **demo** | 3min recording captures full demo loop · cleanly | day 4 EOD |

---

## Sprint 1 · Day 1 (2026-05-08) · DAY-1 SPINE + 3 SPIKES

> **Objective**: end-to-end runnable spine + 3 high-risk spikes resolved · stretch DEFERRED until spine green.
>
> **Single owner critical path**: zksoju.
> **Parallel non-blocking**: gumi (voice corpus authoring) · zerker (Score dashboard scoping).
> **MVD lock**: per PRD r6 §7.5 + SDD §9 · binding.

### tasks

| id | title | AC | dependencies | est |
|---|---|---|---|---|
| S1-T1 | scaffold workspace · pnpm-workspace.yaml updates for `packages/{peripheral-events,world-sources,medium-blink}` + `programs/purupuru-anchor` + `fixtures/` | `pnpm install` resolves · empty packages tsc-clean | zerker's existing pnpm scaffold | 30m |
| S1-T2 | `packages/peripheral-events` skeleton · WorldEvent + BaziQuizState + ClaimMessage Effect Schemas (no implementations beyond decode/encode) · canonical eventId hash function | unit test: schema decode/encode roundtrip · eventIdOf stable across re-encodes | S1-T1 | 1.5h |
| S1-T3 | `packages/world-sources/score-adapter.ts` HYBRID resolver (reads SCORE_API_URL env · falls through to lib/score mock) | unit test: env-flag toggles between mock/real · interface unchanged | S1-T2 + zerker's lib/score | 45m |
| S1-T4 | `packages/medium-blink/quiz-renderer.ts` GET-chain renderer · 5 placeholder questions (zksoju-authored · gumi swaps later) · button-multichoice | renders valid ActionGetResponse shape · 4 buttons per step | S1-T2 | 1h |
| S1-T5 | `apps/web/src/app/api/actions/quiz/start/route.ts` returns Q1 ActionGetResponse via medium-blink renderer | hitting endpoint locally returns valid JSON · matches Solana Actions spec | S1-T4 | 30m |
| S1-T6 | `apps/web/src/app/api/actions/quiz/step/route.ts` chains Q2-Q5 via links.next · HMAC validation gate (placeholder HMAC for spine · proper HMAC in S2) | step transitions work · invalid mac rejected with 400 | S1-T5 | 1h |
| S1-T7 | `apps/web/src/app/api/actions/quiz/result/route.ts` returns archetype card + mint button placeholder (no real mint yet) | hitting Q5-result returns valid Action with 1 button → mint endpoint URL | S1-T6 | 45m |
| S1-T8 | `apps/web/src/app/api/actions/today/route.ts` ambient Blink (post-bridgebuilder REFRAME-1 fix) · reads peripheral-events fixture aggregate · NO interaction | endpoint returns valid ActionGetResponse with title showing aggregate count + element distribution + 2 CTA buttons | S1-T2 | 1h |
| S1-T9 | `apps/web/src/app/api/actions/mint/genesis-stone/route.ts` MOCK · returns either no-op witness tx OR hardcoded mock claim · gates on Spike 2+3 results | hitting POST returns base64 tx · wallet can sign+submit (or test via dialect inspector) | S1-T7 + Spike 2+3 outcomes | 1.5h (mock) · 3h (real after spikes) |
| S1-T10 | vercel preview deploy live · blink endpoints work in dialect inspector | dialect inspector successfully unfurls Q1 + ambient · POST returns tx | S1-T5..T9 | 30m |
| S1-T11 | deck draft v0 · separation-as-moat slide + product demo description + monetization line + UA line + roadmap slide | deck shareable · ≤5 slides · operator-grade rough | parallel to all | 1h |
| S1-Sp1 | **SPIKE 1 · Metaplex Phantom devnet visibility** · mint minimal Metaplex token on devnet · verify Phantom collectibles tab renders | Phantom shows the NFT in collectibles · OR clear FAIL → revert path documented in S1-T9 (PDA-only · "claim record" semantics) | S1-T1 | 1h |
| S1-Sp2 | **SPIKE 2 · ed25519 via instructions sysvar** · minimal Anchor program reads instructions sysvar after Ed25519Program · validate signer pubkey + message bytes match | Anchor program compiles · invariant test passes (signer mismatch rejected) | S1-T1 | 1.5h |
| S1-Sp3 | **SPIKE 3 · partial-sign tx assembly** · backend partial-signs minimal Solana tx · returned via Action POST · Phantom signs as authority and submits | tx confirms on devnet · Phantom shows zero balance change for authority wallet | S1-T1 + S1-Sp2 | 1.5h |

### sprint-1 acceptance criteria

- [ ] **AC-S1-1**: `pnpm dev` starts apps/web · `/api/actions/quiz/start` returns valid Action GET response
- [ ] **AC-S1-2**: GET-chain quiz Q1→Q5 walkable in dialect inspector (HMAC OK or placeholder)
- [ ] **AC-S1-3**: ambient Blink `/api/actions/today` returns aggregate world stats (from fixture)
- [ ] **AC-S1-4**: vercel preview deploy responds with valid Actions for both quiz + ambient endpoints
- [ ] **AC-S1-5**: ALL 3 spikes pass OR clear fallback path documented in S1-T9 + deck (S1-T11) updated
- [ ] **AC-S1-6**: deck draft has the architectural punchline slide (separation-as-moat) + 4 supporting points

### sprint-1 cut triggers (per SDD §7.5 · binding)

```
EOD 2026-05-08 · spine NOT running end-to-end
  → HALT · operator-pair to fix · ALL stretch deferred · spine is only ship target

Spike 1 FAILS (Phantom devnet Metaplex visibility)
  → S1-T9 reverts to PDA-only · deck S1-T11 swaps "mint" → "claim record" template (pre-staged · 30min swap)
  
Spike 2 OR Spike 3 FAILS
  → S1-T9 reverts to mock witness-only transaction · NO claim_genesis_stone instruction in v0
  → deck reframes to "the mint flow demonstrates the architectural pattern · production audit needed"
```

---

## Sprint 2 · Day 2 (2026-05-09) · LAYER IN STRETCH · GATES ON SPIKES

> **Objective**: build out the proper claim_genesis_stone instruction (gates on Spike 2 passing) · upstream BLINK_DESCRIPTOR PR · gumi voice integration · cmp-boundary lint live.
> 
> **Sprint-1 verification gate**: AC-S1-1 through AC-S1-6 must pass before sprint-2 starts.

### tasks

| id | title | AC | dependencies | est |
|---|---|---|---|---|
| S2-T1 | `programs/purupuru-anchor/src/lib.rs` claim_genesis_stone instruction · ClaimMessage decoder · ed25519 instructions sysvar verification | invariant tests pass: no_lamport · no_token_mut · double_claim_reject · unsigned_reject · expired_sig_reject · cross_cluster_reject · replay_nonce_reject | Spike 2 PASSED | 4h |
| S2-T2 | `packages/peripheral-events/bazi-quiz-state.ts` proper HMAC-SHA256 (length-extension safe) · canonical-CBOR encoding · constant-time compare | unit test: HMAC validation passes legit state · rejects tampered · length-extension forgery FAILS | S1-T2 | 1.5h |
| S2-T3 | `packages/peripheral-events/claim-message.ts` server-side ClaimMessage signing (ed25519 via @noble/ed25519 or tweetnacl) · structured payload assembly | unit test: signature roundtrip · rejected with wrong key · ClaimMessage byte-stable across versions | S2-T2 | 2h |
| S2-T4 | Vercel KV setup · nonce store with `SET nonce ... NX EX 300` · strongly-consistent reads · single-region iad1 · fail-closed wiring | integration test: parallel mint requests with same nonce · only 1 succeeds · KV-down → 503 | S2-T3 | 2h |
| S2-T5 | upstream `BLINK_DESCRIPTOR` PR to freeside-mediums · v0.3.0 minor (additive · cycle-X sibling to cycle-R) | PR opens against freeside-mediums/main · green CI · self-merge viable if review delays | freeside-mediums repo access | 1.5h |
| S2-T6 | gumi voice integration · 5 questions × 4 answers + 5 archetype reveals + ambient narrative copy · merge into `packages/medium-blink/voice/` | golden test: rendered output uses gumi voice strings · placeholders fully replaced | gumi handoff (parallel · sprint-2 close target · placeholders ready) | 1h integration · gumi authoring TBD |
| S2-T7 | dependency-cruiser CI guard for substrate purity (per HIGH-1) · `.dependency-cruiser.cjs` in peripheral-events + medium-blink | CI fails build if peripheral-events imports next/react/@solana · CI fails if medium-blink imports world-sources directly | S1-T2 | 1h |
| S2-T8 | cmp-boundary lint + golden test suite · 5+ event types × known canonical state fixtures → assertions on no-leak | CI passes · synthetic violation test (`${event.event_id}` interpolation) → CI blocks | S1-T2 + voice | 2h |
| S2-T9 | sponsored-payer keypair generated · funded on devnet (faucet · 5+ SOL) · vercel env vars set (SPONSORED_PAYER_SECRET) | balance > 5 SOL · POST mint endpoint can submit gasless tx | external · devnet faucet | 30m |
| S2-T10 | claim-signer keypair generated · separate from sponsored-payer · vercel env CLAIM_SIGNER_SECRET | keypair exists · ed25519 sign+verify roundtrip works · NOT same key as sponsored-payer | S2-T1 | 30m |

### sprint-2 acceptance criteria

- [ ] **AC-S2-1**: anchor program devnet-deploys cleanly · all 7 invariant tests pass
- [ ] **AC-S2-2**: full quiz → result → mint flow works end-to-end on devnet (with proper HMAC + ed25519 claim)
- [ ] **AC-S2-3**: BLINK_DESCRIPTOR upstream PR opened (merged or unmerged · doesn't block deploy)
- [ ] **AC-S2-4**: gumi voice integrated OR placeholders shipped with note for v1
- [ ] **AC-S2-5**: dependency-cruiser CI guard live · synthetic violation tested
- [ ] **AC-S2-6**: cmp-boundary golden tests pass

### sprint-2 cut triggers

```
S2-T1 NOT compiling EOD 2026-05-09
  → DROP claim_genesis_stone · revert to witness-only anchor (sprint-1 fallback)
  → KEEP quiz chain · ship as standalone-ish experience without on-chain proof

gumi voice missing 2026-05-09 noon
  → SHIP zksoju placeholders · note in deck "v0 voice · gumi authoring v1" · no scope cut

upstream PR review delays
  → merge into local branch · open PR but don't gate on merge

Vercel KV setup blocked (provisioning · access)
  → REGRESS to local file storage with nonce-table · acknowledge dev-only · production needs KV
```

---

## Sprint 3 · Day 3 (2026-05-10) · DEPLOY · INDEXER · OBSERVABILITY · STRETCH WIRES

> **Objective**: anchor program devnet-deployed · upgrade authority frozen · sybil protection live · observability + tiered alerts · zerker indexer integration starts · ambient Blink optionally wires to real Score (operator's "aliveness from prior collection" stretch).

### tasks

| id | title | AC | dependencies | est |
|---|---|---|---|---|
| S3-T1 | `anchor deploy --provider.cluster devnet` · upgrade authority FROZEN post-deploy (`solana program set-upgrade-authority --new-upgrade-authority None`) | program deployed · authority is None · cannot redeploy | S2-T1 | 1h |
| S3-T2 | `apps/web/src/app/api/actions/mint/genesis-stone/route.ts` real claim_genesis_stone integration · ed25519 signing · partial-sign tx assembly · KV nonce check · result_token validation | E2E: quiz → result → POST mint → wallet signs → tx confirms · indexer sees StoneClaimed · GenesisStone PDA exists | S3-T1 + S2-T1..T4 | 3h |
| S3-T3 | sybil protection · IP rate limit (50 quiz-starts/IP/hour · 5 mint-POSTs/IP/hour) · getBalance ≥0.01 SOL min · vercel rate-limiting middleware | E2E: 51st quiz-start same IP → 429 · wallet with 0 SOL → 503 | S3-T2 | 1.5h |
| S3-T4 | observability · structured JSON logs · vercel dashboards · tiered sponsored-payer alerts (5/2/1 SOL · webhook on each tier) · KV latency p99 monitor | dashboards live · synthetic 5xx spike triggers webhook within 60s · sponsored-payer balance logged every 30s | S3-T2 | 2h |
| S3-T5 | balance-snapshot logging during disabled-halt window (per HIGH-4 fix) · refill script `scripts/refill-sponsored-payer.sh` · backup keypair (`BACKUP_PAYER_SECRET`) | balance log every 30s during demo recording window · refill script runs · halt re-enables post-demo | S3-T4 | 1h |
| S3-T6 | dialect blink registry submission · register prod URL in dialect actions registry | submission filed · registry shows pending or approved | S3-T1 + S3-T2 | 30m |
| S3-T7 | production deploy · `purupuru-ttrpg.vercel.app` (or rename per D-1) · all envs set (prod) | prod URL serves · all endpoints work · sponsored-payer funded ≥10 SOL · KV provisioned | S3-T2..T6 | 1h |
| S3-T8 | ambient Blink wires to real Score API (operator's stretch · "aliveness from prior collection") · SCORE_API_URL set · Sonar GraphQL queries existing PurupuruGenesis Base mints for historical activity feed | ambient `/today` shows real prior activity from Base collection · OR clear fallback to fixture if API unavailable | S2-T3 + zerker handoff | 2h stretch |
| S3-T9 | zerker indexer coordination · he subscribes to `StoneClaimed` events post-deploy · feeds Score · 24h notice given before deploy | zerker confirms indexer scaffold ready · post-deploy Score dashboard shows mint events within 30s | S3-T1 (deploy) + zerker | 0h ours · zerker's lane |

### sprint-3 acceptance criteria

- [ ] **AC-S3-1**: production deploy serves valid Actions for quiz · ambient · mint
- [ ] **AC-S3-2**: anchor program devnet-deployed · upgrade authority is None · invariant tests pass on deployed code
- [ ] **AC-S3-3**: full E2E: judge taps Blink → quiz → result → mint → Phantom shows GenesisStone NFT (Spike 1 passed) OR claim record (Spike 1 failed)
- [ ] **AC-S3-4**: sybil rate limits + sponsored-payer alerts working in production
- [ ] **AC-S3-5**: observability dashboards live · tiered alerts test-fired
- [ ] **AC-S3-6**: dialect blink registry submission filed
- [ ] **AC-S3-7** (stretch): ambient Blink shows real prior-collection activity OR clearly degrades to fixture

### sprint-3 cut triggers

```
S3-T2 mint flow doesn't confirm by EOD
  → ship sprint-2 mock-mint as v0 · note in deck "real mint deferred · spike-validated"

S3-T6 dialect registry rejects submission
  → fall back to direct unfurl with og tags · judges can tap URL directly anyway

S3-T8 ambient stretch wire-to-real fails
  → ship fixture-only ambient · operator's stretch goal slips post-hackathon
  → note in deck "v0 ambient simulated · v1 wires to real Score for aliveness from collection"

S3-T9 zerker indexer not ready
  → demo records without dashboard view · text-only mention · post-hackathon integration
```

---

## Sprint 4 · Day 4 (2026-05-11) · DEMO · DECK · SUBMIT

> **Objective**: 3min demo recorded · deck final · colosseum submission filed before deadline.

### tasks

| id | title | AC | dependencies | est |
|---|---|---|---|---|
| S4-T1 | morning · top up sponsored-payer to >10 SOL · `DISABLE_PAYER_HALT=true` env flag set in vercel | balance > 10 SOL · halt disabled in prod env | S3-T5 | 30m |
| S4-T2 | demo simulator (per D-14 · operator-cooking) · fixture replay OR synthetic generator OR post-recording acceleration · 100x speed for 3min | simulator runs · ambient feed shows accelerated activity during recording | operator decision (D-14) | 0.5h-1.5h |
| S4-T3 | multi-wallet demo recording · operator + zerker tap visibly during recording (per bridgebuilder finding · "shared rite" expression) · 3 distinct wallets visible in feed | recording captures: ambient Blink in feed · quiz tap → result → mint → Phantom collectibles tab shows stone · multiple wallets evident | S4-T1 + S4-T2 | 2h |
| S4-T4 | deck final · separation-as-moat slide · product demo description · monetization (sponsored awareness slots) · UA (twitter native · meet players where they are) · roadmap (evolution path · cross-chain unification · agent layer per gumi's pitch) · team credentials | deck ≤8 slides · cohesive narrative · separates infrastructure-claim from feature-claim · operator + eileen reviewed | S1-T11 + bridgebuilder PRAISE/HIGH integration | 2h |
| S4-T5 | colosseum frontier submission filed · MVP link · user-acquisition strategy paragraph · monetization plan paragraph · team credentials · video link · deck link | submission accepted by colosseum portal · all required fields filled · before 2026-05-11 deadline | S4-T2 + S4-T3 + S4-T4 | 1h |
| S4-T6 | post-recording: re-enable sponsored-payer halt (`DISABLE_PAYER_HALT=false`) | env reverted · halt active · monitoring resumes | S4-T3 complete | 5m |

### sprint-4 acceptance criteria

- [ ] **AC-S4-1**: 3min demo video uploaded · captures ambient Blink + quiz + reveal + mint + Phantom collectible
- [ ] **AC-S4-2**: deck final · separation-as-moat slide leads · monetization + UA + roadmap clear
- [ ] **AC-S4-3**: colosseum submission accepted before deadline
- [ ] **AC-S4-4**: post-recording sponsored-payer halt re-enabled · monitoring resumed

### sprint-4 cut triggers

```
S4-T2 simulator slips
  → post-recording video acceleration in editing (0d work · operator's option C in D-14)

S4-T3 recording captures issues (e.g., live mint fails mid-take)
  → re-record with fresh sponsored-payer top-up · OR ship recorded-with-known-cuts
  → if catastrophic: ship spine-only demo (no mint live · narrate the design)

S4-T4 deck final slips past noon
  → ship draft deck with operator-narrated walkthrough · refine post-submission
```

---

## Cross-sprint dependencies + risks (sprint-flatline-r1 absorbs PRD+SDD blockers)

| risk | likelihood | impact | mitigation | sprint |
|---|---|---|---|---|
| zksoju Solana learning curve eats sprint-1+2 | medium-high | high | minimal scope per instruction · anchor-init template · pair with codex if blocked | S1-S2 |
| Spike 1 (Metaplex Phantom) fails | medium | medium | binary fallback to PDA-only · pre-staged "claim record" deck template | S1 |
| Spike 2 (ed25519 sysvar) fails | low | high | revert to witness-only anchor · ship sprint-2 mock-mint as v0 | S1 |
| KV provisioning blocked | medium | high | local file fallback for dev · production-grade requires KV | S2 |
| gumi voice handoff delays | low (placeholders ready) | low | trigger 3 · ship placeholders | S2 |
| sponsored-payer drained mid-demo | low | high | tiered alerts · refill script · top-up morning-of | S3-S4 |
| dialect blink registry rejects | medium | medium | direct unfurl with og tags fallback | S3 |
| zerker indexer not ready | medium | low | demo records without dashboard · text mention | S3 |
| demo recording catastrophic fail | low | very high | re-record · OR ship spine-only with narration | S4 |
| operator + zerker schedule mismatch for multi-wallet recording | medium | medium | use single-wallet recording with simulated multi-wallet feed | S4 |

---

## Acceptance summary across sprints

```
🦴 SPINE   sprint-1 spine running EOD day-1 · 3 spikes pass-or-degrade
✨ STRETCH sprint-2 + sprint-3 layer in proper crypto · upstream PR · observability · sybil
🚀 DEPLOY  sprint-3 EOD · production live · invariant tests pass · indexer coordinated
🎬 SHIP    sprint-4 EOD · demo recorded · deck final · submission filed before deadline
```

---

## Open decisions still operator-paced (not v0 blocking)

per PRD r6 §9 + SDD §11:

| # | decision | gate |
|---|---|---|
| D-1 | repo rename | low blast · pre-mount preferred |
| D-6 | 2 unnamed of 5 cosmic weather oracles | gumi · sprint-2 |
| D-14 | demo simulator design | operator-cooking · sprint-4 start |
| D-16 | gumi handoff timing | parallel · sprint-2 close target |
| D-17 | zerker indexer ready-by-date | post-anchor-deploy · sprint-3 close |

---

---

## Companion sprints (separate workstreams · same cycle)

- **Sprint 2 · Indexer in-repo** (`grimoires/loa/sprints/indexer-sprint.md` · 2026-05-09) — `feature/indexer-stoneclaimed` branch off `main` · zerker sole owner · demo-ready 2026-05-11 AM · gates on PRD amendment §FR-12 (`prd.md:945-1064`) + SDD §13 (`sdd.md:660-1074`). Does NOT supersede this sprint plan; runs in parallel as a separate ~36h workstream.

---

## Sources

- **PRD r6** (`grimoires/loa/prd.md`) — functional requirements (FR-1 through FR-12)
- **SDD r2** (`grimoires/loa/sdd.md`) — module map · spine + stretch list (post-bridgebuilder + flatline-sdd integration)
- **Codex's awareness operating model** (`grimoires/loa/context/02-awareness-operating-model.md`) — slice-first guidance · "build one vertical first"
- **Bridgebuilder design review** (`.run/bridge-reviews/design-review-simstim-20260507-658e3680.md`) — 14 findings · 4 HIGH integrated · 3 SPECULATION deferred
- **Flatline reviews** (`grimoires/loa/a2a/flatline/`) — r1+r2+r3+r4-PRD + r2-SDD · 14 SDD blockers absorbed as concrete sprint tasks
- **operator decisions across this simstim cycle** — REFRAME-1 ambient Blink added · HIGH-3 hybrid score adapter · stretch wire-to-existing-collection for aliveness
