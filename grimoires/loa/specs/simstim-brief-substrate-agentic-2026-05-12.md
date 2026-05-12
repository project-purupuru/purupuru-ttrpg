# SimStim Brief · Compass adopts hounfour + straylight + rooms substrate

> Drafted 2026-05-12 after KEEPER pre-flight + grounding in `loa-hounfour@7.0.0`, `loa-straylight` (Phase 23a), `construct-rooms-substrate`. The translation-layer doctrine the operator was articulating already exists in these three repos · this cycle is INTEGRATION, not invention.

---

## The reframe (load-bearing)

The original 5-doc set (§07-§11 in `grimoires/loa/context/`) proposed inventing an `EventEnvelope` schema, a `ConstructBoundary` port, and a `construct-translation-layer` pack. The 3-agent flatline review caught most of the fabrication; the patches in §07-§11 cleaned up the worst overreach.

**The deeper reframe surfaced post-patch**: every primitive the 5 docs propose to build **already ships in the loa ecosystem**:

| Proposed in §07-§11 | Already exists in |
|---|---|
| `EventEnvelope` schema | **rooms substrate** · `data/trajectory-schemas/construct-handoff.schema.json` (5 required fields: `construct_slug` · `output_type` ∈ Signal/Verdict/Artifact/Intent/Operator-Model · `verdict` · `invocation_mode` ∈ room/studio/headless · `cycle_id`) AND `room-activation-packet.schema.json` (content-addressable `room_id` via SHA-256/JCS) |
| `ConstructBoundary` (verify⊥judge fence) | **loa-straylight** · governed actor estate · signed assertions · recall receipts · challenge/revocation/commitments · phase 22a/23a schema contract recently locked |
| `daemon-state.schema` | **loa-hounfour@7.0.0** · 53 TypeBox schemas including `agent-identity` · `agent-lifecycle-state` · `agent-descriptor` · `audit-trail-entry` · `capability-scoped-trust` · `bridge-enforcement` · `bridge-invariant` |
| Cross-construct vocabulary | **rooms substrate** typed-streams (Signal/Verdict/Artifact/Intent/Operator-Model are the canonical 5 enum) |

**Operator's stated concern was right**: "we don't want to end up creating more modules than we need to." This brief honors that. We do not author `construct-translation-layer`. We adopt the three substrates that already ship and we conform compass to them. That conformance IS the multi-world readiness.

---

## The cycle goal · in one sentence

**Conform compass to hounfour + straylight + rooms substrate so that the foundations for the purupuru card game ride on the same substrate every other loa world will use.**

Multi-world (Pru / Sprawl / Mibera) readiness is a side-effect of conformance, not a separate workstream.

---

## Pre-flight (read these first · in order)

The implementing session MUST read all of these before writing any code:

1. **`~/Documents/GitHub/construct-rooms-substrate/data/trajectory-schemas/construct-handoff.schema.json`** + `room-activation-packet.schema.json` · the canonical envelope. Don't invent another.
2. **`~/Documents/GitHub/construct-rooms-substrate/scripts/surface-envelope.sh`** · the envelope surfacing script · understand the silent/summary/interactive surface modes
3. **`~/Documents/GitHub/loa-hounfour/README.md`** + `~/Documents/GitHub/loa-hounfour/schemas/` (53 TypeBox schemas, 10 module barrels) · know what's already typed
4. **`~/Documents/GitHub/loa-hounfour/SCHEMA-CHANGELOG.md`** · CONTRACT_VERSION 7.0.0 · MIN_SUPPORTED_VERSION 6.0.0 · breaking-change discipline
5. **`gh api repos/0xHoneyJar/loa-straylight/readme`** · the continuity-under-authorization doctrine · the 9-step force chain (memory → belief → instruction → plan → permission → action → commitment → permanence)
6. **`gh api repos/0xHoneyJar/loa-straylight/issues?state=open` + `pulls?state=open`** · check Phase 23a schema-contract-draft + Phase 22a decision-lock for what Eileen/Jani has signaled about the verify⊥judge boundary
7. **`grimoires/loa/context/07-substrate-architecture-and-layering.md` through `11-translation-layer-canon.md`** · the patched aspiration docs · use as conceptual scaffolding ONLY; the substrates above are the source of truth
8. **`grimoires/loa/a2a/flatline/spec-review-report.md`** · the failure modes · what NOT to do
9. **`compass/lib/`** current state: 2 Effect Layers (weather + sonifier) + 4-folder discipline · `lib/activity/index.ts:42-48` and `lib/sim/population.system.ts:69` are hand-rolled subscribe(cb) (the next adoption target)
10. **`compass/packages/peripheral-events/src/world-event.ts`** · current envelope shape (must align with hounfour or migrate)

---

## Persona

- **OSTROM** (architect) — at the loa-hounfour conformance seam · invariants
- **KEEPER** (`construct-observer`) — surface where compass differs from the canonical pattern
- **FAGAN** (code review) — every adapter migration ships as its own PR · author ≠ reviewer
- **straylight discipline** (per `~/.claude/CLAUDE.md` "Straylight Memory Discipline" section) — every promotion across the force chain (observation → memory → belief → instruction → plan → permission → action → commitment → permanence) requires explicit operator activation OR an existing Loa gate

Files:
- `.claude/constructs/packs/the-arcade/identity/OSTROM.md`
- `.claude/constructs/packs/observer/identity/KEEPER.md`

---

## What to build (dependency-ordered)

### Sprint 0 · Conformance audit (no code change)

**0.1 · Map compass's existing types to hounfour schemas.** For each of compass's domain shapes (`peripheral-events/src/world-event.ts`, `lib/sim/types.ts`, `lib/weather/types.ts`, `lib/activity/types.ts`), find the hounfour schema that overlaps and document the delta. Output: `grimoires/loa/context/12-hounfour-conformance-map.md`.

**0.2 · Identify which compass behaviors are straylight-shaped.** Anything that persists state across sessions (the daemon lifecycle, the YOU sprite that survives reload, the activity stream history) is a straylight candidate. Output: append to the conformance map.

**0.3 · Capture what blocks adoption.** If a hounfour schema is wrong/missing for compass's needs, file an issue against `loa-hounfour` (do NOT patch hounfour locally). If straylight Phase 23a's schema contract diverges from what compass needs, file feedback in the straylight discussion. Output: linked GitHub issues.

**0.4 · Operator pair-point.** Surface the conformance map + blockers. Decide: which schemas to adopt now, which to wait on, which to file upstream. **No code change in Sprint 0.**

### Sprint 1 · Adopt the canonical envelope (the spine)

**1.1 · Replace compass's emerging envelope with the rooms-substrate handoff packet shape.** When activityStream/populationStore migrate from hand-rolled `subscribe(cb)` to Effect Layers, the events emitted MUST conform to `construct-handoff.schema.json`. Output: `lib/domain/handoff.schema.ts` re-exports from rooms substrate (or vendored if the operator-global install isn't suitable for compass deployment).

**1.2 · Adopt the 5 typed-stream output_type values.** Signal · Verdict · Artifact · Intent · Operator-Model. Each event compass emits is one of these. Annotate the existing `world-event.ts` discriminated union accordingly.

**1.3 · One Effect.provide site for the new envelope.** Per the substrate doctrine · enforce via grep rule.

### Sprint 2 · Adopt hounfour's lifecycle schema for the daemon

**2.1 · Map compass's puruhani entity to `agent-identity.schema.json` + `agent-lifecycle-state.schema.json`.** The puruhani is a daemon. Its identity (trader · element · breath_phase) and its lifecycle (dormant → stirring → breathing → soul per Eileen's dNFT spec) ARE hounfour primitives. Adopt the schemas; don't invent.

**2.2 · `lib/domain/puruhani.ts` re-exports from hounfour (or shadow-types until the operator decides on dependency inclusion).** Compass becomes a hounfour CONSUMER · not a hounfour parallel.

**2.3 · Test substrate row · `*.mock.ts` for each lifecycle stage transition** so the card game can be developed against simulated daemon state without provisioning live TBAs.

### Sprint 3 · Adopt straylight's governed-recall for daemon memory

**3.1 · Read straylight's recall-wedge MVP** (`docs/mvp/straylight-recall-wedge.md` · accessible via gh api) · understand what `recall` means in the governed-actor-estate frame.

**3.2 · Apply the 9-step force chain to the puruhani.** Every state transition passes through: observation → memory → belief → instruction → plan → permission → action → commitment → permanence. Each step requires either a substrate write OR an explicit operator activation. Document where each step's gate lives in compass.

**3.3 · The verify⊥judge fence is now well-defined as substrate-anchored** · `verify` runs on hounfour-typed events that have a substrate-truth pointer. `judge` runs in finn-runtime (or a per-world judge implementing the same straylight interface). Don't invent a `ConstructBoundary` type · use straylight's signed-assertion + recall-receipt pattern as the boundary.

**3.4 · Operator pair-point.** Confirm with Eileen/Jani (via straylight issues) that compass's adoption pattern matches their intent. If they want compass as a Phase X integration target, declare it.

### Sprint 4 · Card game foundations (the cycle's actual goal)

**4.1 · The card game is the customer.** Define what a "card play" event looks like in hounfour terms (likely `agent-capacity-reservation` + `audit-trail-entry`). Define what a "card draw" looks like as a Signal stream. Define what a "battle resolve" is as a Verdict. The card game's data flow becomes the worked example that proves the substrate adoption.

**4.2 · Ship the minimum surface needed** for Gumi to design card mechanics on top:
- `lib/domain/card.schema.ts` — extends hounfour's capability/agent schemas
- `lib/ports/card-engine.port.ts` — typed gameplay surface
- `lib/live/card-engine.live.ts` — first impl (deterministic battle resolver, no LLM judgment yet)
- `lib/mock/card-engine.mock.ts` — for component tests
- `lib/system/battle.system.ts` — turns, phases, win conditions

**4.3 · No LLM-bound judgment in the card game's MVP.** Per `mibera-as-NPC` doctrine — voice/vibe/NPC personality is a separate layer that the card game can OPT INTO via straylight's signed-assertion pattern. The MVP is deterministic.

### Sprint 5 · Multi-world readiness sweep (light touch)

**5.1 · Document the adoption playbook** · `grimoires/loa/specs/per-world-adoption-playbook.md` · 1-page cheat sheet: "to adopt the substrate in a new world, depend on these 3 packages (hounfour, rooms-substrate, straylight when available), follow the 4-folder pattern, conform your domain types to these hounfour schemas, surface envelopes per the rooms substrate."

**5.2 · Stub out** what Pru / Sprawl / Mibera each look like under the adoption playbook · 1 paragraph per world. Don't build the adoption · just name what shipping it would mean. The operator may pick one to pilot in the next cycle.

### Sprint 6 · Distill upstream

**6.1 · Update construct-effect-substrate** (NOT a new pack) with what compass learned. Specifically: how the four-folder pattern composes with hounfour-as-domain-source · how the suffix discipline survives schema evolution · how the rooms-substrate envelope is the standard cross-construct event shape.

**6.2 · `status: candidate` → `status: validated · 1-project · adopting hounfour as canonical schema source`.** The pack absorbs the integration story; it does not absorb invented primitives.

**6.3 · Operator pair-point.** Ratify the doctrine update before publishing.

---

## Cuts from V1 (BARTH discipline · explicit)

- ❌ **No `construct-translation-layer` pack.** Translation already lives in hounfour + rooms substrate + straylight. Authoring a parallel pack would be the exact mistake the operator's question warned against.
- ❌ **No puppet theater MVP.** §10 was over-elaboration. The card game IS the visualization customer. If card-game UX needs a viz, build it for the card game's needs · not as an "observational agent surface."
- ❌ **No daemon NFT contract.** Stays at "follows hounfour's `agent-identity` + `agent-lifecycle-state` shape, ERC-6551 materialization is mint-on-demand per puruhani-as-spine." No new contract this cycle.
- ❌ **No multi-chain envelope abstraction.** Solana stays Solana for compass. Hounfour's schemas are chain-agnostic at the type layer; chain-binding lives in adapters.
- ❌ **No new tests for new behavior.** Conformance work should be REFACTOR + ADOPT, not net-new feature ship. Card game (Sprint 4) is where new tests land · everything before is migration.
- ❌ **No straylight implementation.** Straylight is upstream · we ADOPT the contract, we don't fork the implementation. If a phase isn't ready for compass yet, defer.

---

## Verification gates (per sprint)

- **Sprint 0**: conformance map exists · ≥3 issues filed upstream where compass blocks adoption
- **Sprint 1**: handoff envelope shape adopted · grep `construct-handoff.schema` returns ≥1 import in `lib/domain/`
- **Sprint 2**: puruhani type re-exports from hounfour OR shadow-types are JSON-Schema-equivalent (run hounfour's validators against compass fixtures)
- **Sprint 3**: 9-step force chain documented per puruhani transition · straylight's recall pattern adopted at least at the `assert/recall` API level
- **Sprint 4**: card game MVP plays a deterministic battle end-to-end · all events conform to handoff envelope · zero LLM in critical path
- **Sprint 5**: adoption playbook reads as a checklist a contractor could execute
- **Sprint 6**: construct-effect-substrate doctrine updated · no parallel pack created

Cycle close: net LOC negative (target -200 — the conformance work should DELETE compass-specific re-implementations of what the substrates already provide). 128/128 tests still pass at every commit.

---

## SimStim pair-points (HITL surfaces)

- **After Sprint 0** · operator confirms which schemas to adopt now vs file upstream vs defer
- **After Sprint 2** · Eileen/Jani sign-off on compass-as-hounfour-consumer pattern (via PR comment or DM)
- **After Sprint 3** · operator + Eileen + Jani decide whether compass becomes a straylight Phase X integration target
- **After Sprint 4** · Gumi reviews card-game MVP for design-fit (the substrate must be invisible to her)
- **After Sprint 6** · ratify construct-effect-substrate doctrine update before publishing

---

## Key references

| topic | path |
|---|---|
| The aspiration (post-flatline patched) | `grimoires/loa/context/07..11-*.md` |
| The flatline review (what to NOT do) | `grimoires/loa/a2a/flatline/spec-review-report.md` |
| The kickoff that started this | `grimoires/loa/specs/enhance-substrate-ecs-2026-05-11.md` |
| Architecture doc | `grimoires/loa/specs/arch-substrate-ecs-2026-05-11.md` |
| **The canonical envelope** | `~/Documents/GitHub/construct-rooms-substrate/data/trajectory-schemas/construct-handoff.schema.json` |
| **The schema substrate** | `~/Documents/GitHub/loa-hounfour` (53 schemas, v7.0.0, MIN_SUPPORTED 6.0.0) |
| **The governance substrate** | `https://github.com/0xHoneyJar/loa-straylight` (Phase 23a schema contract draft, governed-recall MVP) |
| Operator-global rooms substrate | `~/.claude/scripts/compose-dispatch.sh` + `~/.claude/scripts/surface-envelope.sh` |
| Vault doctrine library | `~/vault/wiki/concepts/multi-axis-daemon-architecture.md` · `continuous-metadata-as-daemon-substrate.md` · `mibera-as-npc.md` · `damp-as-default-voice-substrate.md` · `puruhani-as-spine.md` · `eileen-dnft-conversation.md` |

---

## Success criteria (binding to operator's stated wins)

Per the KEEPER pre-flight, the operator named three personal wins (all three, with a 2 → 3 priority shift):

1. **Spin up new worlds in days, not weeks** · the adoption playbook (Sprint 5) is the artifact
2. **External operators can contribute meaningfully** · the suffix discipline + agent-readable substrate make the card game's contribution surface findable in a single grep · the per-package SKILL.md from the prior cycle stays current
3. **Foundations for the purupuru card game** (the actual goal) · Sprint 4 is the customer · everything else exists to serve it

If Sprint 4 ships a deterministic battle that conforms to the canonical envelope and uses hounfour-typed agent identities, the cycle is shippable.

If the construct-effect-substrate doctrine update (Sprint 6) names "adopting hounfour as canonical schema source" as a load-bearing pattern, the cycle has compounded upstream.
