---
status: draft
type: prd
cycle: substrate-agentic-translation-adoption-2026-05-12
mode: arch + adopt
input_brief: grimoires/loa/specs/simstim-brief-substrate-agentic-2026-05-12.md
created: 2026-05-12
operator: zksoju
---

# PRD · Substrate-Agentic Translation Layer · Compass Adoption Cycle

## 0 · TL;DR

Conform compass to three already-shipping upstream substrates (`loa-hounfour@7.0.0` schemas · `construct-rooms-substrate` envelope · `loa-straylight` continuity-under-authorization) so that:
1. The **purupuru card game** is built on the same canonical substrate every other loa world will use
2. Compass becomes the worked example of "world adopts the loa stack"
3. Multi-world readiness (Pru / Sprawl / Mibera) emerges as a side-effect of conformance, not a separate workstream

**Core reframe**: the original 5-doc Gemini synthesis (`grimoires/loa/context/07..11-*.md`) proposed inventing a translation layer. KEEPER pre-flight + grounding in upstream repos established that the translation layer **already exists**. This cycle is INTEGRATION, not invention.

## 1 · Problem

### 1.1 · Surface symptom

Compass shipped a substrate-simplification cycle (commit `f4ce25e` · 2026-05-10) that ECS-ified domain code under the four-folder pattern (`domain/ports/live/mock`). Two surfaces remain hand-rolled (`lib/activity/index.ts:42-48` · `lib/sim/population.system.ts:69`) using a `subscribe(cb)` pattern. The substrate doctrine (`construct-effect-substrate`) names this exact pattern as a SIGNAL TO ADOPT into Effect's `PubSub` + `Stream` primitives.

If we migrate without alignment, the envelope shape compass invents will diverge from what the rest of the loa ecosystem already speaks.

### 1.2 · Root problem

Three loa repos already ship the substrate compass needs:

| Need | Already shipping in |
|---|---|
| Cross-construct envelope shape | `construct-rooms-substrate` · `data/trajectory-schemas/construct-handoff.schema.json` (5 enum: Signal/Verdict/Artifact/Intent/Operator-Model) + `room-activation-packet.schema.json` |
| Typed schemas for agent identity, lifecycle, capabilities | `loa-hounfour@7.0.0` · 53 TypeBox schemas · `agent-identity` · `agent-lifecycle-state` · `agent-descriptor` · `audit-trail-entry` · `capability-scoped-trust` · `bridge-enforcement` · `bridge-invariant` |
| Verify⊥judge fence · governed memory · signed assertions · recall receipts | `loa-straylight` · continuity-under-authorization · 9-step force chain (memory → belief → instruction → plan → permission → action → commitment → permanence) |

Authoring a parallel `construct-translation-layer` pack (the original brief direction) would duplicate all three. The operator's stated constraint — "we don't want to end up creating more modules than we need to" — names this risk explicitly.

### 1.3 · Strategic problem

Compass is the next world that will run on the loa substrate. Sprawl, Mibera, and Pru are next. If compass conforms to canonical substrates, the adoption pattern compounds. If compass diverges, every subsequent world has to choose between the upstream canonical and the compass-specific drift, which fragments the ecosystem before it has even consolidated.

## 2 · Goals

### 2.1 · Primary goals (cycle outcome MUST achieve)

- **G1** · Compass conforms to `construct-rooms-substrate` handoff envelope at every cross-bounded-context emission · grep-verifiable
- **G2** · Compass's puruhani daemon shape conforms to `loa-hounfour@7.0.0`'s `agent-identity` + `agent-lifecycle-state` schemas · TypeBox-validated against compass fixtures
- **G3** · Compass's verify⊥judge fence is implemented as straylight signed-assertion + recall-receipt pattern, NOT as an invented `ConstructBoundary` interface
- **G4** · Foundations for the **purupuru card game** ship as cycle's worked example: deterministic battle resolver, card schema extending hounfour, plays a full match end-to-end with zero LLM in critical path
- **G5** · Net LOC negative (target -200 across the cycle) · the conformance work DELETES compass-specific re-implementations of substrate primitives the upstream repos already provide

### 2.2 · Secondary goals (SHOULD achieve)

- **G6** · Multi-world adoption playbook drafted at `grimoires/loa/specs/per-world-adoption-playbook.md` · 1-page checklist · Pru/Sprawl/Mibera each get 1 paragraph naming what adoption would mean
- **G7** · `construct-effect-substrate` doctrine pack updated with the integration story · status promoted from `candidate` → `validated · 1-project · adopting hounfour as canonical schema source`
- **G8** · Eileen + Jani sign-off (via PR comment or issue thread on `loa-straylight` / `loa-hounfour`) on compass-as-consumer pattern · captured as decision record

### 2.3 · Non-goals (explicit cuts)

- ❌ NO new `construct-translation-layer` pack
- ❌ NO puppet theater MVP (deferred · the card game IS the visualization customer this cycle)
- ❌ NO daemon NFT contract (puruhani materialization stays at "follows hounfour shape, ERC-6551 mint-on-demand later")
- ❌ NO multi-chain envelope abstraction (Solana stays Solana for compass · hounfour schemas are chain-agnostic at the type layer)
- ❌ NO straylight implementation fork (compass adopts the contract; straylight upstream owns the implementation)
- ❌ NO purupuru card game UI polish · MVP is logical-only · UI is its own cycle
- ❌ NO active multi-world build (Pru/Sprawl/Mibera get the playbook only · pilot ship is a future cycle the operator picks)

## 3 · Success metrics

### 3.1 · Quantitative gates (binary pass/fail)

| Metric | Target | How measured |
|---|---|---|
| LOC delta | ≤ -200 net | `git diff --stat main...HEAD \| tail -1` |
| Hounfour schema imports | ≥ 5 distinct schemas referenced in `compass/lib/domain/` | `grep -r "from.*loa-hounfour" lib/` |
| Rooms-substrate envelope conformance | 100% of cross-context emissions pass `construct-handoff.schema.json` validation | runtime validation tests |
| Tests pass at every commit | 128/128 → grows with card game | `pnpm test` |
| Card game E2E | one deterministic battle plays start-to-finish | `pnpm test lib/system/battle.system.test.ts` |
| Upstream issues filed | ≥ 3 against `loa-hounfour` OR `loa-straylight` where compass blocks adoption | `gh issue list --repo 0xHoneyJar/loa-hounfour --search "compass"` |

### 3.2 · Qualitative gates (operator pair-point checks)

| Gate | Test |
|---|---|
| Reframe held | No file in `lib/` defines a parallel translation primitive that hounfour or rooms-substrate already provides |
| Card game is the customer | The card game's data flow (`card-engine.port.ts`) drives substrate adoption decisions, not vice-versa |
| Multi-world cross-applies | Adoption playbook reads as a checklist a contractor could execute against Sprawl or Mibera |
| Eileen/Jani sign-off | At least one explicit upstream signal (PR comment, issue thread, DM screenshot) confirms compass-as-consumer matches their intent |

## 4 · Users / stakeholders

### 4.1 · Operator (zksoju · primary builder)

- Wants foundations for the purupuru card game without inventing substrate
- Wants compass to be a worked example, not a one-off
- Wants the cycle to honor "we don't want to end up creating more modules than we need to"
- Pair-points: after S0 (audit), S2 (hounfour adoption), S3 (straylight adoption · with Eileen/Jani), S4 (card game review with Gumi), S6 (doctrine ratification)

### 4.2 · Eileen (`construct-rooms-substrate` + `loa-straylight` author · upstream signal source)

- Owns the verify⊥judge framework's canonical implementation
- Will signal acceptance of compass-as-consumer via straylight issue thread
- Reference doctrine: `~/vault/wiki/entities/eileen-dnft-conversation.md` (verbs-not-nouns dNFT framing)

### 4.3 · Jani (`loa-hounfour` author · framework architect)

- Owns the schema substrate
- Will signal acceptance of compass conformance via hounfour PR comments or schema-changelog reference
- Did NOT build OperatorOS (clarification per `~/.claude/CLAUDE.md`); Jani builds Loa framework primitives

### 4.4 · Gumi (purupuru card game designer · downstream consumer)

- Reviews card game MVP for design-fit
- Substrate must be invisible to her — she designs cards and their behaviors, not adapter code
- Pair-point at S4 close

### 4.5 · Future world pilot (Sprawl / Mibera / Pru curator · downstream beneficiary)

- Will execute the adoption playbook to bring their world onto the substrate
- Should not need to learn loa internals to follow the checklist

## 5 · Functional requirements (sprint-mapped)

The 6 sprints are defined in detail in the input brief and will be elaborated in the SDD. Summary:

### 5.1 · S0 — Conformance audit (no code change)

**FR-S0-1** · Map every compass domain type in `peripheral-events/src/world-event.ts`, `lib/sim/types.ts`, `lib/weather/types.ts`, `lib/activity/types.ts` to a hounfour schema. Document delta. Output: `grimoires/loa/context/12-hounfour-conformance-map.md`.

**FR-S0-2** · Identify compass behaviors that are straylight-shaped (cross-session persistence, signed memory, recall under governance). Append to conformance map.

**FR-S0-3** · For every blocker (hounfour schema is wrong/missing for compass · straylight phase 23a contract diverges from compass need), file an issue against the upstream repo. Do NOT patch upstream locally.

**FR-S0-4** · Operator pair-point. Decide: which schemas adopt now, which wait, which file upstream.

### 5.2 · S1 — Adopt rooms-substrate handoff envelope

**FR-S1-1** · `lib/domain/handoff.schema.ts` re-exports (or vendors) the rooms-substrate `construct-handoff.schema.json` shape. Compass-emitted events conform.

**FR-S1-2** · The 5 typed-stream values (Signal · Verdict · Artifact · Intent · Operator-Model) annotate compass's `world-event.ts` discriminated union.

**FR-S1-3** · The hand-rolled `subscribe(cb)` patterns at `lib/activity/index.ts:42-48` and `lib/sim/population.system.ts:69` migrate to Effect's `PubSub` + `Stream` riding the canonical envelope.

**FR-S1-4** · Single `Effect.provide` site for the new envelope (substrate doctrine invariant). Enforced via grep rule.

### 5.3 · S2 — Adopt hounfour for the daemon

**FR-S2-1** · The puruhani entity maps to `agent-identity.schema.json` + `agent-lifecycle-state.schema.json`. `lib/domain/puruhani.ts` re-exports from hounfour OR shadow-types until operator decides on dependency inclusion (see SDD for vendor-vs-depend decision).

**FR-S2-2** · `*.mock.ts` for each lifecycle stage transition (dormant → stirring → breathing → soul) so card game development isn't blocked on live TBA provisioning.

**FR-S2-3** · Compass becomes a hounfour CONSUMER · not a hounfour parallel. Validators run.

### 5.4 · S3 — Adopt straylight for daemon memory

**FR-S3-1** · Read straylight's `recall-wedge` MVP (Phase 23a schema-contract-draft). Understand what `recall` means in the governed-actor-estate frame.

**FR-S3-2** · Apply the 9-step force chain to the puruhani. Every state transition passes through: observation → memory → belief → instruction → plan → permission → action → commitment → permanence. Each step requires either a substrate write OR an explicit operator activation. Document where each step's gate lives in compass.

**FR-S3-3** · The verify⊥judge fence is implemented using straylight's signed-assertion + recall-receipt pattern. NO invented `ConstructBoundary` type.

**FR-S3-4** · Operator pair-point with Eileen + Jani via straylight issue thread or PR comment.

### 5.5 · S4 — Card game foundations (the cycle's actual goal)

**FR-S4-1** · Define card-play, card-draw, battle-resolve in hounfour terms (`agent-capacity-reservation` + `audit-trail-entry`).

**FR-S4-2** · Ship minimum surface for Gumi to design card mechanics on top:
- `lib/domain/card.schema.ts` extending hounfour primitives
- `lib/ports/card-engine.port.ts`
- `lib/live/card-engine.live.ts` (deterministic battle resolver, no LLM)
- `lib/mock/card-engine.mock.ts`
- `lib/system/battle.system.ts` (turns, phases, win conditions)

**FR-S4-3** · MVP plays a deterministic battle end-to-end. All events conform to handoff envelope. ZERO LLM in critical path. Gumi pair-point.

### 5.6 · S5 — Multi-world readiness (light touch)

**FR-S5-1** · `grimoires/loa/specs/per-world-adoption-playbook.md` · 1-page checklist.

**FR-S5-2** · Stub Pru / Sprawl / Mibera (1 paragraph each) under the playbook. Don't build.

### 5.7 · S6 — Distill upstream

**FR-S6-1** · Update `construct-effect-substrate` (existing pack · NOT a new pack) with what compass learned.

**FR-S6-2** · Pack status: `candidate` → `validated · 1-project · adopting hounfour as canonical schema source`.

**FR-S6-3** · Operator pair-point ratifies before publishing.

## 6 · Non-functional requirements

### 6.1 · Security

- **NFR-SEC-1** · Verify⊥judge fence is substrate-anchored. LLM-bound `judge` cannot consume an unverified envelope at the type level. Compile-time fence required.
- **NFR-SEC-2** · No private keys committed. Solana keypair handling unchanged from current compass posture.
- **NFR-SEC-3** · Adopted schemas validate at parse boundaries (TypeBox `Type.Check`). Untrusted input rejected with typed error.
- **NFR-SEC-4** · OWASP Top 10 review at each PR (no SQLi · no XSS in card game UI when added · no command injection in adapters).
- **NFR-SEC-5** · Straylight 9-step force chain MUST hold for every puruhani state transition. Skipping a step is a security defect.

### 6.2 · Performance

- **NFR-PERF-1** · Card game battle resolution p95 < 100ms (single battle, deterministic, no I/O).
- **NFR-PERF-2** · Envelope validation overhead < 5ms p95 per cross-context event.
- **NFR-PERF-3** · No regression in compass current weather/sonifier pipeline latency.

### 6.3 · Compatibility

- **NFR-COMPAT-1** · MIN_SUPPORTED_VERSION for hounfour: v6.0.0 (per hounfour SCHEMA-CHANGELOG). Compass declares its hounfour version dependency explicitly.
- **NFR-COMPAT-2** · If hounfour ships a breaking change mid-cycle, compass pins to the version in use at S2 close until S6 distill picks up the bump.
- **NFR-COMPAT-3** · Solana adapter layer remains chain-binding-only. Hounfour-typed envelopes are chain-agnostic.

### 6.4 · Maintainability

- **NFR-MAINT-1** · Suffix discipline holds: `*.port.ts` · `*.live.ts` · `*.mock.ts` · `*.system.ts` · `*.schema.ts`. CI lint enforces.
- **NFR-MAINT-2** · Every package keeps a SKILL.md current with adopted substrate dependencies.
- **NFR-MAINT-3** · NOTES.md decision log captures every substrate-adoption choice.

## 7 · Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-1 | Hounfour schemas don't fit compass needs · adoption stalls | medium | high | S0 audit surfaces this BEFORE code change · file upstream issues · operator decides defer-vs-fork-vs-shim per schema |
| R-2 | Straylight Phase 23a contract changes mid-cycle | medium | medium | S3 reads the current contract · pins compass adapter to that revision · re-evaluates at S6 |
| R-3 | Eileen/Jani pair-point delayed (humans in the loop) | high | low | Compass ships its adoption regardless; sign-off becomes a soft gate, not a hard block |
| R-4 | Card game design changes mid-S4 (Gumi feedback) | medium | medium | S4 ships logical-only MVP first; UI iteration is its own cycle |
| R-5 | LOC delta goes positive instead of negative | medium | medium | Conformance work shifts into "shadow-types-only" mode if hard imports prove too costly · still wins on canonical envelope |
| R-6 | Vendoring vs hard-importing hounfour: wrong choice | medium | medium | SDD §3 makes this an explicit decision · operator pair-point at S2 entry |
| R-7 | Card game pulls compass into Solana-specific binding too early | low | medium | Card game uses hounfour types; Solana materialization is opt-in adapter |
| R-8 | Cycle scope creeps to puppet theater | low | high | Brief explicitly cuts puppet theater · CI lint blocks any new file matching `puppet-*.ts` |
| R-9 | Straylight not yet stable enough for compass to adopt | medium | high | S3 may downgrade to "adopt the contract surface only · defer the implementation hooks" if Phase 23a is still in flux. Operator pair-point at S3 entry. |
| R-10 | Multi-world playbook (S5) becomes premature standardization | low | medium | S5 is light touch · 1 paragraph per world · not a build |

## 8 · Dependencies

### 8.1 · Upstream

- **`loa-hounfour@7.0.0`** · 53 schemas · MIN_SUPPORTED 6.0.0 · authoritative source of agent/capability types
- **`construct-rooms-substrate`** · canonical envelope schemas · operator-global install via `~/.claude/scripts/`
- **`loa-straylight`** Phase 23a · continuity-under-authorization contract · still in flux (must read current state at S3 entry)

### 8.2 · Internal compass state

- Current `compass/lib/` four-folder discipline (shipped commit `f4ce25e`)
- 128 passing tests baseline
- Solana Anchor + Metaplex Token Metadata stack for puruhani materialization (later cycle, not this one)

### 8.3 · Tools

- Loa framework v1.39+ for the simstim workflow + flatline + bridgebuilder
- 3 model providers READY (opus + gpt-5.3-codex + gemini-2.5-pro)

## 9 · Out-of-scope (explicit)

- Puppet theater MVP (deferred · cycle N+2 candidate)
- Three.js renderer for daemon visualization
- Multi-chain envelope abstraction
- ERC-6551 TBA materialization (compass stays Solana-anchored)
- Straylight implementation fork
- Card game UI · animations · art · sound
- Multi-world active pilots (Pru/Sprawl/Mibera)
- LLM-in-card-game (subjective NPC reactions stay in a separate layer the card game OPTS into)
- Cross-construct messaging beyond what rooms-substrate already provides
- Anchor program changes
- Onboarding flow changes
- Gamified UI flourishes for the existing observatory/ceremony pages

## 10 · References

- **Input brief**: `grimoires/loa/specs/simstim-brief-substrate-agentic-2026-05-12.md` (190 lines)
- **Patched aspiration docs**: `grimoires/loa/context/07..11-*.md` (5 files post-flatline review)
- **Original flatline review report**: `grimoires/loa/a2a/flatline/spec-review-report.md`
- **Substrate cycle (predecessor)**: `grimoires/loa/specs/enhance-substrate-ecs-2026-05-11.md` + commit `f4ce25e`
- **Canonical envelope**: `~/Documents/GitHub/construct-rooms-substrate/data/trajectory-schemas/construct-handoff.schema.json` + `room-activation-packet.schema.json`
- **Schema substrate**: `~/Documents/GitHub/loa-hounfour/README.md` + `schemas/` + `SCHEMA-CHANGELOG.md`
- **Governance substrate**: `https://github.com/0xHoneyJar/loa-straylight` (Phase 23a)
- **Operator-global rooms substrate**: `~/.claude/scripts/compose-dispatch.sh` + `~/.claude/scripts/surface-envelope.sh`
- **Vault doctrine library**: `~/vault/wiki/concepts/multi-axis-daemon-architecture.md` · `continuous-metadata-as-daemon-substrate.md` · `mibera-as-npc.md` · `damp-as-default-voice-substrate.md` · `puruhani-as-spine.md` · `eileen-dnft-conversation.md` · `freeside-as-layered-station.md`
- **Operator decree**: "we don't want to end up creating more modules than we need to" (KEEPER pre-flight, 2026-05-12)
- **Operator decree**: "lay the foundations to focus on building the purupuru card game NOT some random observational agent surface" (KEEPER pre-flight, 2026-05-12)

## 11 · Open questions for SDD phase

1. **Vendor vs hard-import hounfour** · pin a version in `package.json` and import directly, OR copy the relevant `.schema.ts` files and own them locally? Trade-off: import = upstream gravity (good for canonical) but fragile to hounfour breaking changes; vendor = local control but drift risk.
2. **Straylight integration depth** · adopt the contract surface only (compile-time conformance), OR wire actual recall/assertion calls (runtime conformance)? Depends on Phase 23a readiness at S3 entry.
3. **Single Effect.provide site location** · `app/layout.tsx` (current host), OR a new `lib/runtime/world.runtime.ts` that the layout imports? SDD §5 decision.
4. **Card game data persistence** · in-memory only for MVP, OR ride the same Solana/Convex/whatever-comes substrate as the rest of compass? The brief says deterministic + no LLM but doesn't address durability.
5. **Solana ↔ hounfour binding** · where does the chain-specific adapter live? `lib/adapters/solana.adapter.ts` is a candidate location, but the adapter shape needs naming.

These questions transition into SDD decisions in Phase 3.

## 12 · Acceptance summary

This PRD is accepted when:

- The 6 sprint scopes are each grounded in a concrete file list (handled in Sprint Plan)
- Eileen + Jani have at least seen the conformance approach (operator pair-point at S0 close)
- The reframe ("adopt, don't invent") is captured in NOTES.md as a load-bearing decision
- The card game customer (Gumi) is informed she'll have a logical MVP to design against by S4 close
