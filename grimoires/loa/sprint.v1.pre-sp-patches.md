---
status: draft
type: sprint-plan
cycle: substrate-agentic-translation-adoption-2026-05-12
mode: arch + adopt
prd: grimoires/loa/prd.md
sdd: grimoires/loa/sdd.md
created: 2026-05-12
operator: zksoju
---

# Sprint Plan · Substrate-Agentic Translation Layer · Compass Adoption

7 sprints (S0-S6) · feature-branch parent `feat/substrate-agentic-adoption` · per-sprint sub-branches `feat/sa-sN-<slug>` · operator pair-points at S0 close · S2 entry · S2 close · S3 close · S4 close · S6 close.

**Critical path** (per SDD §13 dep graph): `S0 → S1 → S2 → (S3 ‖ S4) → S5 → S6`.

**LOC budget** (PRD §3.1):
- Conformance LOC delta (S0+S1+S2+S3+S6 · scoped to `lib/ packages/peripheral-events/` excluding `lib/world/`): ≤ **0 net** · target -100
- World substrate LOC budget (S4 · `lib/world/`): ≤ **+600**
- Cycle net LOC: ≤ **+400**

---

## S0 · Conformance audit (operator pair-point gate · no code)

**Branch**: `feat/sa-s0-conformance-audit`
**LOC budget**: 0
**Duration estimate**: 1-2 days
**Exit gate**: Q7 S0→S1 promotion gate (PRD §3.1 / SDD §15)

### Tasks

| ID | Title | Acceptance |
|---|---|---|
| **S0-T1** | Resolve §10.5 SHA-pin manifest | `grimoires/loa/prd.md §10.5` filled in with resolved SHAs for hounfour + rooms-substrate + straylight |
| **S0-T2** | Map compass domain types → hounfour schemas | `grimoires/loa/context/12-hounfour-conformance-map.md` exists · maps `peripheral-events/src/world-event.ts` + `lib/sim/types.ts` + `lib/weather/types.ts` + `lib/activity/types.ts` to candidate schemas (PRD §5.1.1) OR marks "no upstream equivalent" |
| **S0-T3** | Map compass behaviors → straylight surfaces | Append to S0-T2 doc · each behavior tagged "doc-only this cycle" or "defer N+2" |
| **S0-T4** | Verify Phase 23a status with Eileen | Read straylight Phase 23a `docs/handoffs/phase-23a-mvp-schema-contract-draft.md` at resolved SHA · note any change since 2026-05-12 verification |
| **S0-T5** | Open 3 tracking issues | One issue per upstream repo: `loa-hounfour` · `loa-straylight` · `construct-rooms-substrate` · titled `compass adoption tracker [substrate-agentic-2026-05-12]` · cite at least one compass file:line per issue (PRD G8 quality bar) |
| **S0-T6** | File schema-blocker upstream issues if any | For each blocker found in S0-T2/T3, file an issue with reproducible fixture · 72h timeout protocol per PRD FR-S0-3 |
| **S0-T7** | Verify hounfour npm publish status | `npm view @0xhoneyjar/loa-hounfour version` matches local 7.0.0 OR document install path (file:link / git+url) |
| **S0-T8** | Verify Next.js 16 ESM JSON imports | Quick spike: `import schema from './tmp/test.schema.json' with { type: "json" }` builds clean in dev + production · confirm `tsconfig.resolveJsonModule: true` |
| **S0-T9** | Operator pair-point: S0→S1 promotion gate | NOTES.md decision record · check Q7 sub-conditions (a)(b)(c) PASS or FAIL · if FAIL, pivot to S0.5 negotiation cycle |

### Sprint exit criteria

- All 9 tasks closed
- Q7 promotion gate documented PASS in NOTES.md
- §10.5 SHA-pin manifest filled in
- Operator approves move to S1

---

## S1 · Envelope shell + lift activity/population + pattern-lock

**Branch**: `feat/sa-s1-envelope-shell`
**LOC budget**: ≤ +200 net (counted toward G5a · partially offset by S2 legacy removal)
**Duration estimate**: 3-4 days
**Exit gate**: pattern-lock template documented · all tests green · `pnpm test` ≥ 24

### Tasks

| ID | Title | Acceptance |
|---|---|---|
| **S1-T1** | Vendor envelope JSON schemas | `lib/domain/schemas/construct-handoff.schema.json` + `room-activation-packet.schema.json` copied verbatim from rooms-substrate · `lib/domain/schemas/README.md` names source SHA |
| **S1-T2** | Author `lib/domain/handoff.schema.ts` | Effect Schema mirror per SDD §4.2 · ESM JSON import per BB-003 · `verdict: S.Unknown` placeholder per D6 |
| **S1-T3** | Author `lib/domain/validate-envelope.ts` | AJV runtime validator per SDD §4.3 · throws `EnvelopeValidationError` on parse failure |
| **S1-T4** | Annotate world-event.ts with output_type | Every `_tag: S.Literal` variant in `packages/peripheral-events/src/world-event.ts` gets matching `output_type` per SDD §4.4 |
| **S1-T5** | Author envelope-coverage CI script | `scripts/check-envelope-coverage.sh` per SDD §4.4 · regex-based · zero deps · `.github/workflows/envelope-coverage.yml` invokes |
| **S1-T6** | Lift activityStream to Effect Layer | NEW: `lib/activity/activity.port.ts` · `activity.live.ts` (wraps existing `activityStream`) · `activity.mock.ts` · `__tests__/activity.test.ts` · existing `lib/activity/index.ts` keeps legacy `subscribe(cb)` re-exports with deprecation comment |
| **S1-T7** | Lift populationStore to Effect Layer | NEW: `lib/sim/population.port.ts` · `population.live.ts` · `population.mock.ts` · `__tests__/population.test.ts` · existing `lib/sim/population.system.ts` keeps legacy with deprecation comment |
| **S1-T8** | Extend AppLayer in `lib/runtime/runtime.ts` | Add `ActivityLive` + `PopulationLive` to existing `Layer.mergeAll(...)` · NO new file in `lib/runtime/` |
| **S1-T9** | Author single-runtime CI script | `scripts/check-single-runtime.sh` per SDD §5.3 · `grep -c "ManagedRuntime.make"` lib/+app/ MUST equal 1 · `.github/workflows/single-runtime.yml` invokes |
| **S1-T10** | Document lift-pattern template | `grimoires/loa/specs/lift-pattern-template.md` per SDD §5.4 · 4-file canonical trio + Layer integration step + example component pattern + naming conventions · S4 applies mechanically |
| **S1-T11** | Test substrate green | `pnpm test` returns ≥ 24 + new test files green |
| **S1-T12** | Operator pair-point: pattern-lock review | Operator confirms S1 lift pattern is template-worthy before S2 / S4 apply it |

### Sprint exit criteria

- 12 tasks closed
- All CI checks green (envelope-coverage · single-runtime · existing tests)
- `pnpm test` ≥ 24 passing tests
- S1 commit history is atomic (1 commit per logical change · NFR-ROLLBACK-3)
- Operator approves pattern-lock template

---

## S2 · Hand-port hounfour schemas

**Branch**: `feat/sa-s2-hand-port-hounfour`
**LOC budget**: ≤ +N for hand-ports + ~30 LOC for envelope verdict narrowing · -80 LOC if legacy `subscribe(cb)` removed · net target ≤ 0
**Duration estimate**: 2-3 days
**Exit gate**: All hand-ports pass drift test · operator pair-point on idiom-fit

### Tasks (one per candidate schema · S0 may add/remove)

| ID | Title | Acceptance |
|---|---|---|
| **S2-T1** | Pre-flight: grep verdict callers | Per SDD §4.2.1 · `grep -rE "ConstructHandoff[\"']*\.verdict\|handoff\.verdict" lib/ app/` · expected 0 · operator pair-point on result before narrowing |
| **S2-T2** | Hand-port `agent-identity` | `lib/domain/agent-identity.hounfour-port.ts` + `.mock.ts` + `__tests__/*.{port,drift}.test.ts` + vendored JSON schema · per SDD §3.4 8-step procedure |
| **S2-T3** | Hand-port `agent-lifecycle-state` | Same procedure |
| **S2-T4** | Hand-port `agent-descriptor` | Same procedure |
| **S2-T5** | Hand-port `audit-trail-entry` | Same procedure (uses `Schema.Class` per SDD §8.2) |
| **S2-T6** | Hand-port `domain-event` | Same procedure · this is the source for verdict union |
| **S2-T7** | Hand-port `lifecycle-transition-payload` | Same procedure |
| **S2-T8** | Author `scripts/hounfour-drift.ts` | Per SDD §9.1 · GITHUB_TOKEN auth · 404=red · diff-vs-main |
| **S2-T9** | Author `pnpm hounfour:drift` script | Manual invocation only this sprint · cron CI deferred to S6 |
| **S2-T10** | Narrow envelope verdict union | `lib/domain/handoff.schema.ts` · `verdict: S.Union(<hand-ported types>)` · per S2-T1 result use direct narrowing OR additive `typed_verdict` field |
| **S2-T11** | Remove legacy `subscribe(cb)` | If callers in `app/` have migrated, delete legacy code from `lib/activity/index.ts:42-48` + `lib/sim/population.system.ts:69` (-80 LOC offset) · OPERATOR DECISION at S2 close · may defer |
| **S2-T12** | Operator pair-point: idiom-fit review | Operator reviews each `.hounfour-port.ts` for Effect-Schema idiom · approves before sprint close |

### Sprint exit criteria

- All hand-port tasks closed (count locked at S0-T2)
- All drift tests green (pinned SHAs match vendored copies)
- `pnpm hounfour:drift` runs clean against current main
- Verdict narrowing landed without breaking callers
- Operator approves idiom-fit

---

## S3 · Doc-only force-chain mapping + compile-time fence (parallel with S4 after S2)

**Branch**: `feat/sa-s3-force-chain-fence`
**LOC budget**: ≤ +50 (just the brand-type fence file · the doc is in grimoires/)
**Duration estimate**: 1-2 days
**Exit gate**: tstyche assertion green · issue opened on straylight

### Tasks

| ID | Title | Acceptance |
|---|---|---|
| **S3-T1** | Read straylight Phase 23a recall-wedge contract | Re-verify state at S3 entry · note any change · operator pair-point if Phase 23b has landed |
| **S3-T2** | Author `grimoires/loa/context/13-force-chain-mapping.md` | Per SDD §6.1 · 9-step force chain table for puruhani lifecycle · each step gets "where does this gate live in compass" answer or "no surface yet · placeholder" |
| **S3-T3** | Author `lib/domain/verify-fence.ts` | Per SDD §6.2 · `unique symbol` brand · `verify()` + `judge()` functions · `VerifyError` + `JudgeError` typed errors · ZERO straylight import |
| **S3-T4** | Add `expect-type` to package.json | Per BB-005 · NOT tstyche · add `test:types` script |
| **S3-T5** | Author `lib/test/judge-fence.spec-types.ts` | Per SDD §6.3 · passing AND failing type assertions · `pnpm test:types` exits 0 only when fence holds |
| **S3-T6** | Add CI step `.github/workflows/test-types.yml` | Q6 surface · failure of either type assertion = CI red |
| **S3-T7** | Open issue on `loa-straylight` | Per FR-S3-4 · cite `lib/domain/verify-fence.ts:1` · ask Phase 23b compatibility question |
| **S3-T8** | Operator pair-point: S3 close | Force-chain doc + fence file approved before merge |

### Sprint exit criteria

- 8 tasks closed
- Compile-time fence assertion green (`pnpm test:types`)
- Force-chain mapping doc reviewed by operator
- Issue opened on straylight (G8 partial)

---

## S4 · World substrate · applies S1 pattern-lock (parallel with S3 after S2)

**Branch**: `feat/sa-s4-world-substrate`
**LOC budget**: ≤ +600 (G5b)
**Duration estimate**: 2-3 days (mechanical · per BB-012 · template-applied)
**Exit gate**: operator iteration test passes · agent navigation test passes

### Tasks (apply S1-T10 lift-pattern-template mechanically)

| ID | Title | Acceptance |
|---|---|---|
| **S4-T1** | Audit existing `lib/{sim,weather,activity}/` for system shape | Per FR-S4-1 · document which systems have ports · which mix concerns · which need test substrate |
| **S4-T2** | Author `lib/world/SKILL.md` | Per SDD §7.4 · includes §7.7 state ownership matrix · agent navigation test passes (fresh agent answers "what does awareness do" in ≤3 grep calls) |
| **S4-T3** | Author `lib/world/awareness.{port,live,mock,test}.ts` | Apply lift-pattern-template · `awarenessRef` ownership declared in SKILL.md |
| **S4-T4** | Author `lib/world/observatory.{port,live,mock,test}.ts` | Apply lift-pattern-template · NO writes (read-only declared) |
| **S4-T5** | Author `lib/world/invocation.{port,live,mock,test}.ts` | Apply lift-pattern-template · NOT named "ceremony" per BB-011 · `commandsPubSub` ownership declared |
| **S4-T6** | Author `lib/world/world.system.ts` | Composes all systems · orchestrator role · NOT a Service Tag (just a composition module) |
| **S4-T7** | Extend AppLayer in `lib/runtime/runtime.ts` | Add `AwarenessLive` + `ObservatoryLive` + `InvocationLive` to `Layer.mergeAll` · single-runtime CI rule still passes (count == 1) |
| **S4-T8** | Author 3 example components | `app/_components/awareness-example.tsx` · `observatory-example.tsx` · `invocation-example.tsx` · operator can copy-paste pattern |
| **S4-T9** | Author `scripts/check-world-discipline.sh` | D4 enforcement · grep blocks `@solana` imports + `kvSet`/`kv.put` writes in `lib/world/` |
| **S4-T10** | Author `scripts/check-state-ownership.sh` | BB-006 · §7.7 · grep enforces no system writes to a Ref/PubSub it doesn't declare ownership of in SKILL.md |
| **S4-T11** | Author `scripts/check-system-name-uniqueness.sh` | BB-009 · system names appear exactly once in runtime.ts AppLayer mergeAll args |
| **S4-T12** | Add `find compass/lib -name '*card*' -o -name '*battle*'` CI rule | Q card-game-stays-out gate · per PRD §3.2 |
| **S4-T13** | Operator iteration test | Operator runs `git mv lib/world/awareness.* lib/world/a-rename.*` + updates runtime.ts import · `pnpm test` stays green in 1 commit · per FR-S4-6 |
| **S4-T14** | Agent navigation test | Fresh-context agent dispatched · asked "what does awareness expose and what ports does it have" · answers in ≤3 grep calls per Q operator-vibe-check |

### Sprint exit criteria

- 14 tasks closed
- World substrate composes cleanly
- All CI checks green (envelope-coverage · single-runtime · world-discipline · state-ownership · system-name-uniqueness · card-game-out)
- Operator iteration test passes (1-commit rename works)
- Agent navigation test passes (≤3 grep calls)
- LOC budget G5b ≤ +600 verified

---

## S5 · Multi-world readiness playbook (light touch · evidence-grounded)

**Branch**: `feat/sa-s5-multi-world-playbook`
**LOC budget**: 0 (docs only)
**Duration estimate**: 0.5 day
**Exit gate**: Each per-world paragraph cites real file:line per IMP-S5

### Tasks

| ID | Title | Acceptance |
|---|---|---|
| **S5-T1** | Author `grimoires/loa/specs/per-world-adoption-playbook.md` | 1-page checklist · enumerated steps to adopt the substrate in a new world |
| **S5-T2** | Stub `world-purupuru` paragraph | 1 paragraph · cites at least one file:line in `~/Documents/GitHub/world-purupuru/` that demonstrates shape compass adopted (or absence thereof) |
| **S5-T3** | Stub `world-sprawl` paragraph | Same evidence requirement |
| **S5-T4** | Stub `world-mibera` paragraph | Same evidence requirement |
| **S5-T5** | Cross-link from `lib/world/SKILL.md` | Add reference to playbook so future agents find it |

### Sprint exit criteria

- 5 tasks closed
- Each per-world paragraph passes evidence requirement (file:line citation)
- Playbook reads as a checklist (not aspirational doc)

---

## S6 · Distill upstream

**Branch**: `feat/sa-s6-distill-upstream`
**LOC budget**: -50 to +100 (changes to upstream pack · NOT compass)
**Duration estimate**: 1 day
**Exit gate**: doctrine ratification · drift CI cron live

### Tasks

| ID | Title | Acceptance |
|---|---|---|
| **S6-T1** | Update `construct-effect-substrate` pack | Status `candidate` → `validated · 1-project · adopting hounfour as canonical schema source · hand-port pattern documented` |
| **S6-T2** | Add hand-port pattern reference to pack SKILL.md | Document the `*.hounfour-port.ts` convention · the 8-step S2-Tn procedure |
| **S6-T3** | Add `examples/compass-adoption-example.md` | Walk through compass's adoption as worked example · file paths · LOC numbers · gotchas |
| **S6-T4** | Activate `.github/workflows/hounfour-drift.yml` cron | Per SDD §9.2 · weekly Monday 6am UTC · authenticated GITHUB_TOKEN |
| **S6-T5** | Operator decision: compass-as-fixture? | Per SDD-D4 / IMP-016 · should compass become a downstream CI gate for hounfour? Operator pair-point · capture decision · execute or defer |
| **S6-T6** | Final NOTES.md decision log entry | All cycle decisions captured · ready for next cycle's reference |
| **S6-T7** | Operator pair-point: doctrine ratification | construct-effect-substrate doctrine update approved before publishing |

### Sprint exit criteria

- 7 tasks closed
- Doctrine pack updated and operator-approved
- Drift CI cron active
- Compass-as-fixture decision captured (do or defer)

---

## Cross-sprint conventions

### PR title format (per PRAISE-001)

Every PR in this cycle includes `[adopt:<substrate>]` tag:
- S1 PRs: `[adopt:rooms-substrate]`
- S2 PRs: `[adopt:hounfour:<schema-name>]`
- S3 PRs: `[adopt:straylight:doc-only]`
- S4 PRs: `[adopt:lift-pattern]`
- S5 PRs: `[adopt:playbook]`
- S6 PRs: `[adopt:distill]`

### Atomic commit contract (NFR-ROLLBACK-3)

- One logical change per commit
- S2: one commit per schema (`adopt-hounfour-<name>: hand-port + drift test + mock + Layer wire`)
- Cross-sprint commits FORBIDDEN

### Test-failure pause threshold (NFR-ROLLBACK-2)

- `pnpm test` failures > 5 simultaneous → automatic pause + operator pair-point
- CI auto-comments on PR

### Operator pair-points (mandatory)

| Gate | After sprint | Decision |
|---|---|---|
| Q7 promotion | S0 close | Proceed to S1 OR pivot to S0.5 |
| Pattern-lock | S1 close | Approve template for S4 mechanical apply |
| Verdict-callers | S2 entry | Direct narrow OR additive `typed_verdict` |
| Idiom-fit | S2 close | Approve hand-ports |
| Force-chain | S3 close | Approve doc + fence |
| Iteration test | S4 close | Approve world substrate |
| Doctrine | S6 close | Ratify pack update |

### Beads task IDs

Tasks above translate 1:1 to beads tasks (`br create`) at sprint start. ID format `<sprint>-T<N>` matches PR template.

---

## Cuts (BARTH discipline · enforced by CI lint forever)

- ❌ No `construct-translation-layer` pack: `find . -path '*/construct-translation-layer*'` empty
- ❌ No `lib/adapters/` folder: `find lib -path '*adapter*'` empty
- ❌ No card game in compass: `find compass/lib -name '*card*' -o -name '*battle*'` empty (S4-T12)
- ❌ No straylight runtime imports: `grep -r "from.*loa-straylight" lib/` empty
- ❌ No TypeBox: `grep -r "@sinclair/typebox" package.json` empty
- ❌ No puppet theater: `find . -name 'puppet-*.ts'` empty
- ❌ No solana imports in `lib/world/`: `grep -rE "from ['\"]@solana" lib/world/` empty
- ❌ No new files in `lib/runtime/` this cycle: file count in `lib/runtime/` at S6 close == 2

## Verification gates summary

Per PRD §3.1 quantitative gates:

| Gate | Measured at | Passing condition |
|---|---|---|
| Q1 conformance LOC delta | S6 close | ≤ 0 net (target -100) |
| Q2 world-substrate LOC | S4 close | ≤ +600 |
| Q3 hand-ported schemas | S2 close | ≥ 5 distinct |
| Q4 envelope coverage | S1 close · CI | 100% variants tagged |
| Q5 tests baseline | every PR | 24/24 → ≥ 24 + new |
| Q6 compile-time fence | S3 close · CI | tstyche/expect-type assertion green |
| Q7 S0→S1 gate | S0 close | NOTES.md PASS |
| Q8 tracking issues | S0 close | 3/3 with file:line citation |
| Q9 atomic commits | every commit | reviewable as 1-commit-per-change |
| Q10 drift CI | S6 close | `.github/workflows/hounfour-drift.yml` active |
