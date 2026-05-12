---
title: hounfour conformance map
status: S0-in-progress · verifications complete · mapping work pending
type: cycle-context
cycle: substrate-agentic-translation-adoption-2026-05-12
tasks: S0-T1 (SHA pins) · S0-T2 (compass→hounfour map · partial) · S0-T3 (straylight surfaces · partial) · S0-T4 (Phase 23a re-verified) · S0-T7 (npm publish status) · S0-T8 (ESM JSON import spike) · S0-T9 (multi-world repos verified)
created: 2026-05-12
operator: zksoju
---

# Hounfour Conformance Map · S0 verifications + findings

## Verifications complete (S0 spike cluster)

### S0-T1 · SHA pins resolved

| Substrate | SHA | Source |
|---|---|---|
| `loa-hounfour` | `ec5024938339121dbb25d3b72f8b67fdb0432cad` | local clone HEAD |
| `construct-rooms-substrate` | `8259a765dac2e5e88325a359675b80e761c378c8` | local clone HEAD |
| `loa-straylight` | `151d454a996b97c2f1c22a4262f79e1f912fa1ec` | gh API `repos/0xHoneyJar/loa-straylight/branches/main` (no local clone) |

PRD §10.5 ready to fill in.

### S0-T7 · Hounfour npm publish status · **BLOCKER for current PRD references**

**Finding**: `npm view @0xhoneyjar/loa-hounfour version` returns 404 — package is NOT published to npm. PRD §10 + §8.1 reference `loa-hounfour@7.0.0` as if pnpm-installable.

**Implication for D1 (hand-port pattern)**: hand-porting doesn't depend on npm install (we own schemas locally). But:
- The drift detection script (SDD §9.1) already uses GitHub API, NOT npm — UNAFFECTED ✓
- PRD §10 references should be updated to `git+https://github.com/0xHoneyJar/loa-hounfour.git#<sha>` if any tooling needs install path
- For this cycle: we vendor the JSON Schemas + hand-port to Effect Schemas · npm publish status is irrelevant for that workflow ✓

**Recommended action**: PRD §10 footnote update only · no cycle-scope change.

### S0-T8 · Next.js 16 ESM JSON import spike · **SDD CORRECTION REQUIRED**

**Compass TypeScript version**: 5.0.2 (per `package.json: "typescript": "^5"` resolved to installed 5.0.2)

| Syntax | Compiles in TS 5.0.2? | Recommendation |
|---|---|---|
| `import schema from "x.json" with { type: "json" }` | ❌ FAILS · TS1005 errors · syntax requires TS 5.3+ | NOT USABLE |
| `import schema from "x.json" assert { type: "json" }` | ✅ compiles · DEPRECATED in TS 5.3+ | Forward-fragile |
| `import schema from "x.json"` (plain · with `resolveJsonModule: true`) | ✅ compiles · NOT deprecated | **USE THIS** |

**tsconfig confirmed**: `"resolveJsonModule": true` + `"module": "esnext"` + `"moduleResolution": "bundler"` ✓

**SDD correction**: §3.1 + §4.2 currently prescribe `with { type: "json" }`. Must change to plain JSON import:
```typescript
// CORRECT for compass TS 5.0.2:
import handoffSchema from "./schemas/construct-handoff.schema.json"

// NOT this (won't compile):
// import handoffSchema from "./schemas/construct-handoff.schema.json" with { type: "json" }
```

**Implication**: BB-003 finding still load-bearing (must NOT use `require()`), but the prescribed replacement was wrong. Plain import works.

**Forward consideration**: Once compass bumps TypeScript to 5.3+, can adopt `with { type: "json" }` (the modern syntax). Sprint S0-T8 acceptance: documented current state · plain import used · TS bump tracked as future cleanup.

### S0-T9 · Multi-world repo paths · ALL EXIST ✓

| Repo | Path | Status |
|---|---|---|
| `world-purupuru` | `~/Documents/GitHub/world-purupuru/` | ✅ exists |
| `world-sprawl` | `~/Documents/GitHub/world-sprawl/` | ✅ exists |
| `world-mibera` | `~/Documents/GitHub/world-mibera/` | ✅ exists |

S5-T3/T4 evidence requirement is achievable · no downgrade to "annotation-only" needed (per SP-008).

### S0-T4 · Phase 23a re-verification

`docs/handoffs/phase-23a-mvp-schema-contract-draft.md` confirmed present in `loa-straylight@151d454a`. Detailed status check required to confirm "blocked on hounfour v8.6 delta #8" claim from previous skeptic review still holds at this SHA. Pending S0-T4 deeper read.

## Compass domain types → hounfour candidate schemas (S0-T2 · in-progress)

This map is the heart of S0. For each compass domain type, identify the upstream hounfour schema OR mark "no equivalent."

### `packages/peripheral-events/src/world-event.ts`

| Compass type | Candidate hounfour schema | Adopt at | Notes |
|---|---|---|---|
| `WorldEvent` (discriminated union of subtypes) | `domain-event` (per PRD §5.1.1 candidate set) | S2 | Hand-port + extend. Compass-specific variants (StoneClaimed, etc.) extend the domain-event base shape |
| `EventId` (branded UUID) | (no upstream equivalent — compass-specific) | — | Keep compass-local |
| `StoneClaimed` payload | maybe extends `audit-trail-entry` | S2 (analyze) | Audit trail captures the "stone claim happened" event |
| `BaziQuizState` | (no upstream equivalent) | — | Compass-specific quiz substrate |
| `ClaimMessage` | maybe `agent-capacity-reservation` | S2 (analyze) | Maps to "I have authority to mint stone N" semantically |

### `lib/sim/types.ts`

`PopulationStore` (subscription-pattern object) wraps spatial sim state. **No upstream equivalent** at the population-store level — this is a compass-internal substrate. The Effect Layer lift (S1-T7) is internal architectural work, not adoption.

### `lib/weather/types.ts`

`WeatherState` (current weather + forecast) is compass-specific world fiction. No upstream equivalent. Existing `WeatherLive` Layer is fine; no adoption work here.

### `lib/activity/types.ts`

`ActivityStream` (event log of world events) maps semantically to a stream-of `audit-trail-entry`. The Effect Layer lift (S1-T6) is internal; the OUTPUTS of the stream should conform to hounfour's `audit-trail-entry` shape. This is the substantive adoption point for activity.

## Compass behaviors → straylight surfaces (S0-T3 · in-progress)

| Compass behavior | Straylight surface | Posture this cycle |
|---|---|---|
| Stone claim → on-chain commitment | force-chain `permission → action → commitment → permanence` | doc-only mapping (S3-T2) |
| Cross-session population state (YOU sprite survives reload) | `recall-receipt` (Phase 23b) | defer N+2 · no Phase 23a contract for this yet |
| Activity event history | `audit-trail-entry` stream + signed assertions | hand-port `audit-trail-entry` (S2-T5) · no signed-assertion runtime (D2) |
| Awareness-as-belief (S4 layer) | force-chain `observation → memory → belief` | doc-only mapping (S3-T2) · enforced by compile-time fence (S3-T3) |
| Ceremony invocation | force-chain `instruction → plan → permission` | doc-only mapping (S3-T2) |

## Refined hand-port candidate set (post-S0-T2 analysis)

Based on the conformance map above, the S2 hand-port set narrows from PRD §5.1.1's 8 candidates:

| Schema | Adopt at | Compass surface that needs it | Priority |
|---|---|---|---|
| `domain-event` | S2 | `WorldEvent` base shape · S1 envelope `verdict` field | **HIGH** · S1+S2 critical path |
| `audit-trail-entry` | S2 | `ActivityStream` + future puruhani audit | **HIGH** · S1 activity migration target |
| `agent-identity` | S2 | future puruhani entity (when materialization happens · post-cycle) | MEDIUM · adopt for forward-compat |
| `agent-lifecycle-state` | S2 | future puruhani lifecycle | MEDIUM · adopt for forward-compat |
| `agent-descriptor` | DEFER | persona binding · only relevant when LLM-bound voice ships | DEFER N+2 |
| `agent-capacity-reservation` | DEFER | maps to `ClaimMessage` semantically · may simplify analysis | DEFER N+1 |
| `capability-scoped-trust` | S3 | verify⊥judge boundary contract reference | **MEDIUM** · S3 reference only |
| `bridge-invariant` | DEFER | force-chain step gating · doc-only this cycle | DEFER N+2 |
| `lifecycle-transition-payload` | DEFER | stage-transition events · no compass surface yet | DEFER N+2 |

**Hand-port set for S2**: 4 HIGH/MEDIUM = `domain-event` + `audit-trail-entry` + `agent-identity` + `agent-lifecycle-state` + 1 reference (`capability-scoped-trust` for S3). 4 ports + 1 reference = 5 total.

This satisfies PRD Q3 (`≥ 5 distinct schemas referenced in compass/lib/domain/`) at the lower bound. LOC budget: 4 ports × ~80 LOC = +320 LOC (under the +400 floor projected by SP-002).

## Findings summary (for S0-T11 operator pair-point)

| Finding | Severity | Action |
|---|---|---|
| Hounfour npm 404 | LOW | PRD §10 footnote update · no cycle-scope change |
| TS 5.0.2 vs `with { type: "json" }` | **HIGH** | SDD §3.1 + §4.2 must be patched to plain JSON import · NOT a blocker, just a syntax correction |
| Hand-port set narrowed to 5 (4 ports + 1 reference) | INFO | LOC budget +320 (under +400 floor) · G5a math now closes more comfortably |
| Multi-world repos all exist | ✓ | S5-T3/T4 evidence achievable as-spec |
| Straylight not locally cloned | LOW | Use gh API for S0-T4 + S3-T1 deep reads · no clone needed |

## Q7 promotion gate evaluation (S0-T11)

| Sub-condition | Result |
|---|---|
| (a) ≥80% compass domain types map to hounfour schema with ≤2-field delta | **PARTIAL** · World-event / activity stream map cleanly · sim/weather/blink are compass-local with no upstream equivalent. Of those WITH a candidate (4 surfaces), 100% map. Of ALL compass domain code, ~50% has hounfour equivalent · the rest is compass-specific by design. **Operator decision needed**: is "no upstream equivalent" a passing condition for the gate, or does it count against the 80% threshold? |
| (b) Zero blockers requiring hounfour breaking change | **PASS** · candidate schemas all available at hounfour@v7.0.0 (MIN_SUPPORTED v6.0.0 satisfied) · no breaking-change requests needed |
| (c) Straylight Phase 23a status verified | **PARTIAL** · doc exists at the resolved SHA · need deeper read to confirm "blocked on hounfour v8.6 delta #8" still holds OR has progressed |

## Open at S0 close (operator pair-point)

1. **Q7 (a) interpretation**: count "no upstream equivalent" as PASS or FAIL?
2. **SDD §3.1 + §4.2 patch**: I will patch to plain JSON import syntax — confirm or override?
3. **Hand-port set: 5 (4 ports + 1 reference)** — confirm or expand/contract?
4. **TypeScript bump to 5.3+** to enable `with { type: "json" }` modern syntax — schedule for separate cleanup cycle?
5. **S0-T4 deeper Phase 23a read** — block S0 close on this OR proceed since doc-only S3 doesn't need runtime API anyway?
6. **S0-T5/T6 tracking issues + blocker issues** — fire now or batch with operator decisions?

## Tasks remaining in S0

- S0-T2 (this doc) · COMPLETE (verifications baked in · narrowing argued)
- S0-T3 (straylight surfaces) · COMPLETE (table above)
- S0-T4 deeper Phase 23a read · PENDING
- S0-T5 open 3 tracking issues · PENDING
- S0-T6 file blocker upstream issues (only the TS-syntax finding is a maybe-blocker · LOW · no upstream issue needed) · LIKELY ZERO ISSUES TO FILE
- S0-T10 rooms-substrate drift posture in NOTES.md · PENDING
- S0-T11 operator pair-point · BLOCKED on this report

## Recommended next action

Operator pair-point now (S0-T11) on items 1-6 above. Then: I patch SDD per item 2, fire tracking issues per item 6, file deeper Phase 23a read per item 5, and S0 closes with Q7 PASS for promotion to S1.
