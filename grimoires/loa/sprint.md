---
status: flatline-integrated-r1
type: sprint-plan
cycle: card-game-in-compass-2026-05-12
mode: migrate + arch
prd: grimoires/loa/prd.md (r1 · flatline-integrated)
sdd: grimoires/loa/sdd.md (r1 · flatline-integrated)
sprint_review: grimoires/loa/a2a/flatline/card-game-sprint-opus-manual-2026-05-12.json (Opus review + skeptic · 1 CRITICAL + 5 HIGH integrated)
branch: feat/honeycomb-battle (parent · already exists)
sub_branch_prefix: feat/hb-sN-<slug>
created: 2026-05-12
revision: r1 · post-flatline · 1 CRITICAL (S1 split) + 5 HIGH integrated · oxlint+oxfmt tooling swap (operator decree) · whisper determinism moved S7→S1a · time-budget promoted to primary gate · S7 slimmed + new S6.5 testing-infra sprint · sprint count 9→11
operator: zksoju
authored_by: /simstim Phase 5-6 (Opus 4.7 1M)
simstim_id: simstim-20260512-60977bb6
---

# Sprint Plan · Card Game in Compass · Honeycomb Surface Migration

> **r1 · post-flatline integration** (2026-05-12 simstim Phase 6). 1 CRITICAL (SKP-002: S1 overload · split S1 → S1a + S1b) + 5 HIGH (T2 time-budget primary, T3 S7 slim + new S6.5, T4 default to oxlint+ts-pattern, T5 asset rollback to local snapshot, T6 per-sprint failure procedures + S3‖S4 mechanics + quantitative S1 gate + S0 NO-GO branching) integrated. Operator decree: tooling swap to **oxlint** (Rust-based linter · replaces eslint v9) and **oxfmt** (Rust-based formatter · new). Sprint count: **11** (S0 · S1a · S1b · S2 · S3 · S4 · S5 · S5.5 buffer · S6 · S6.5 · S7).

**11 sprints** · parent branch `feat/honeycomb-battle` · per-sprint sub-branches `feat/hb-sN-<slug>`.

Operator pair-points: **S0 close** (GO/CONDITIONAL/NO-GO with numeric criteria) · **S1b close** (Honeycomb pattern-lock with quantitative gate criteria · §pattern-lock-criteria) · **S5 close** (S5.5 firing decision) · **S6 close** (asset extraction validated · cycle near-COMPLETED) · **S7 close** (final audit · cycle COMPLETED marker).

**Critical path**: `S0 → S1a → S1b → S2 → (S3 ‖ S4) → S5 → S5.5? → S6 → S6.5 → S7`.

**Primary gate** (post-flatline-r1): per-sprint **time-budget** from OP-1 table is the binding gate. LOC sub-budgets remain as tracking signals (NOT pass/fail), to detect drift early. Sum target ≤ **+7,500** compass-repo LOC per AC-14.

**Done bar**: every sprint passes `/implement → /review-sprint → /audit-sprint` per PRD r1 G6.

---

## Per-sprint failure handling (NEW · flatline-r1 · IMP-001)

Each sprint declares its **rollback procedure** for mid-sprint failure (not all sprints have a clean revert path).

| Sprint | Mid-sprint failure rollback |
|---|---|
| S0 | Branch is a spike · delete branch · operator restarts S0 with revised approach |
| S1a / S1b | Per-task: branch-off-sub-branch · merge only when task green; if integration breaks, revert the task's commits without affecting parent S1a/S1b branch |
| S2 / S3 / S4 / S5 | Sub-branch isolation: only merged when sprint green; if mid-sprint catastrophe, abandon sub-branch · operator restarts sprint |
| S5.5 | Optional sprint · skipping is rollback |
| S6 | Asset extraction has DEDICATED rollback (per T5/SKP-004 · §asset-rollback-policy); other tasks isolated as above |
| S6.5 | Testing infra isolated to CI / `tests/` dirs · failures don't block runtime |
| S7 | Dev panel + final audit · failures roll back dev-panel commits; whisper determinism is already in S1a so doesn't gate here |

**Universal**: any sprint that doesn't pass `/review-sprint + /audit-sprint` enters a re-work cycle. Operator pair-point determines: re-work in place (default) · split into S<N>a/S<N>b (if scope is wrong) · abort to operator-led recovery (if architectural).

---

## S3 ‖ S4 parallelization mechanics (NEW · flatline-r1 · IMP-002 · SKP-005)

Both S3 (EntryScreen + ElementQuiz) and S4 (OpponentZone + TurnClock + ArenaSpeakers) touch `app/battle/_scene/BattleScene.tsx`. To parallelize safely:

**Ownership rule**: **S3 OWNS BattleScene edits** (since S3 introduces the phase routing branches for `entry`/`quiz`). S4 components MUST be designed as **drop-in additions** to BattleScene by S3. S4 PRs only ADD components and props; never edits the orchestrator.

**Branch flow**:
1. S3 branches first: `feat/hb-s3-entry-quiz` off `feat/hb-s2-battlefield-hand`
2. S4 branches off S3 (NOT off S2): `feat/hb-s4-opponent-clock-speakers` off `feat/hb-s3-entry-quiz`
3. S3 closes first (review+audit) → merge to parent · then S4 catches up via rebase
4. S4 closes second
5. If true parallelism needed (two operator-clock streams), de-parallelize: sequence S3 → S4 instead

**Conflict resolution**: If S4 sub-branch can't rebase cleanly onto closed S3 (e.g., BattleScene shape changed in S3 review), S4 operator clock pauses; S3+S4 reconvene at a 30-min sync to redesign drop-in interface.

---

## S1 pattern-lock criteria (NEW · flatline-r1 · IMP-003)

At S1b close, operator pair-point evaluates the Honeycomb pattern-lock with **quantitative criteria** (subjective "feels right" alone is not enough):

| Criterion | Target |
|---|---|
| All 3 new ports (clash + opponent + match) typecheck clean | `pnpm tsc --noEmit` zero errors |
| All invariant tests green | `pnpm vitest run lib/honeycomb` ≥ 25 clash tests + ≥ 9 transcendence-collision tests + opponent snapshot match + match-transition matrix tests |
| BattlePhase exhaustiveness enforced | `scripts/check-asset-paths.sh`-equivalent (or fuzz test) passes; no `switch (phase)` without `never`-default exists |
| Single Effect.provide site preserved | `scripts/check-single-runtime.sh` passes (single `ManagedRuntime.make` in repo) |
| Substrate file count is reasonable | `find lib/honeycomb -name "*.ts" \\| wc -l` ≤ 30 files (catches over-fragmentation) |
| Cumulative LOC ≤ +3,000 (S0+S1a+S1b tracking signal) | Manual git diff stat |

If ≥1 fails: operator decides re-work-in-place vs descope (per failure-handling section).

---

## Asset rollback policy (NEW · flatline-r1 · SKP-004 · T5)

`scripts/sync-assets.sh` (S0 proof · S6 full) implements **rollback to committed local snapshot** on any sync failure:

1. **Pre-sync**: Snapshot current `public/art/`, `public/data/materials/`, `public/fonts/`, `public/brand/` to `.assets-backup/` (gitignored).
2. **Sync**: Per SDD §6.5 (sha256 verify · atomic stage+swap).
3. **Failure path**: If sha verify fails OR tar extraction fails OR final-state check fails → restore from `.assets-backup/`, exit non-zero, alert operator. NO change to `public/`.
4. **Post-sync verify**: Compare key file checksums to MANIFEST.json. Mismatch → rollback.
5. **CI test**: `tests/e2e/sync-assets-rollback.spec.sh` exercises full cycle: backup → tamper tarball → sync → assert rollback restored. Runs in S1b CI workflow.

If asset repo itself is unavailable (network down, GH outage), compass keeps the committed local snapshot indefinitely. Cycle continues; S6 asset task waits for repo recovery; CI passes against local copies via FR-19.5 rollback contract.

---

## S0 NO-GO branching (NEW · flatline-r1 · IMP-004 · SKP-007)

Pre-committed NUMERIC criteria for S0 decision (per `grimoires/loa/notes/s0-spike-decision.md`):

| Numeric outcome | Decision |
|---|---|
| LOC projection ≤ +7,500 AND time ≤ 2 days AND tractability confirmed | **GO** → S1a |
| LOC projection +7,501 to +9,000 OR time 2-3 days | **CONDITIONAL** → mandatory descope (drop Tutorial OR Guide-merge OR ArenaSpeakers spatial extension) before S1a |
| LOC projection > +9,000 OR time > 3 days OR fundamental Svelte→React friction (e.g., $effect cleanup race) | **NO-GO** → split into 2 cycles: (a) foundation cycle (Honeycomb growth only · S0+S1a+S1b) ships first; (b) game-surface cycle (S2-S7) is a follow-up |

Operator can override the numeric outcome at S0 close with a written rationale captured in the decision receipt. The numbers exist to prevent vibes-based GO when the spike is materially over budget.

---

## S0 · Calibration spike + tooling migration + cycle kickoff

**Branch**: `feat/hb-s0-spike-tooling`
**Time budget**: **1 working day** (per OP-1 table)
**LOC tracking**: ~+600 (BattleField draft + 4 notes + tooling configs)
**Gates**: GO/CONDITIONAL/NO-GO operator decision per numeric criteria above.

### Tasks

**T0.1 · BattleField drag-reorder spike** (~3-4h · same as r0)

(Implementation identical to r0 T0.1 · see SDD §5)

**T0.2 · Svelte → React translation catalog** (~1h · same as r0)

**T0.3 · LOC projection note** (~30min · same as r0)

**T0.4 · Time-tracking note** (~ongoing · same as r0)

**T0.5 · Asset-sync test-tarball + rollback validation** (~1.5h · flatline-r1 extended per T5)

Same as r0 T0.5 PLUS: validate the rollback path. After successful 1-file sync, manually tamper the test tarball's sha and re-sync. Assert: rollback fires; `public/art-test/` restored from backup. Document in `grimoires/loa/notes/s0-asset-rollback-validation.md`.

**T0.6 · S0 decision receipt** (~15min · flatline-r1 strengthened)

Author `grimoires/loa/notes/s0-spike-decision.md` per the NUMERIC criteria table (§S0 NO-GO branching). GO / CONDITIONAL / NO-GO with cited numbers and rationale.

**T0.7 · oxlint + oxfmt tooling migration** (~3h · NEW · operator decree 2026-05-12)

Migration:

1. Remove `eslint: ^9` devDep · add `oxlint` + `oxfmt` (latest stable each)
2. Author `oxlint.config.json` at repo root (mirror world-purupuru's pattern or use defaults). Rules: keep TypeScript + React + Next.js recommended sets; allow current code style.
3. Replace `package.json` scripts:
   ```json
   "lint": "oxlint",
   "lint:fix": "oxlint --fix",
   "fmt": "oxfmt --write .",
   "fmt:check": "oxfmt --check .",
   "check": "oxlint && oxfmt --check . && tsc --noEmit"
   ```
4. Run `pnpm lint` on full codebase. Expect: zero NEW warnings vs prior eslint output. If new warnings: triage (suppress with `eslint-disable`-equivalent OR fix inline).
5. Add `.github/workflows/lint.yml` running `pnpm check` on PRs.
6. Document migration outcome in `grimoires/loa/notes/s0-tooling-migration.md`: existing warnings count, new warnings count, suppression list (if any).

**Acceptance**: `pnpm check` clean; CI workflow registered; documentation authored.

**Rationale**: Operator decree per Phase-6 flatline triage. Aligns compass with world-purupuru's tooling (which already uses oxlint per `oxlint.config.json` in that repo). Rust-based tooling is 10-100× faster than JS-based; faster CI; faster local iteration.

### Sprint exit criteria

- All 7 tasks closed with acceptance met
- BattleField.tsx working drag-reorder; type-clean
- 5 notes authored at `grimoires/loa/notes/` (translation-catalog · loc-projection · time-tracking · asset-rollback-validation · s0-spike-decision · tooling-migration)
- Asset test-tarball + rollback both proven
- oxlint + oxfmt in place; `pnpm check` clean
- **OPERATOR PAIR-POINT**: read `s0-spike-decision.md`; act on GO / CONDITIONAL / NO-GO per numeric criteria
- `/review-sprint S0` + `/audit-sprint S0` pass
- `sprint-0-COMPLETED.md` marker present

---

## S1a · Clash + Match + transition matrix + whisper determinism

**Branch**: `feat/hb-s1a-clash-match`
**Time budget**: **3 working days** (per OP-1 split · was S1 6 days · now 3+3 across S1a+S1b)
**LOC tracking**: ~+1,500
**Depends on**: S0 GO

### Tasks

**T1a.1 · clash.{port,live,mock}.ts** (~6h)

Per SDD §3.1. Same as r0 T1.1.

**T1a.2 · clash invariant test suite** (~4h · AC-4)

Per SDD §3.1 test contract. Same as r0 T1.2.

**T1a.3 · transcendence collision test** (~1h · SDD §3.3.3)

Same as r0 T1.3.

**T1a.4 · match.{port,live,mock}.ts + transition matrix** (~6h · FR-14 · SDD §3.3.1)

Same as r0 T1.6.

**T1a.5 · match transition matrix test** (~1.5h)

Same as r0 T1.7.

**T1a.6 · Whisper determinism fix** (~2h · FR-24 · SDD §8 · MOVED FROM S7 per SKP-008)

`whispers.ts` `whisper()` invocation uses a deterministic counter from match seed. Counter held in `Ref<number>` (fiber-safe). MatchSnapshot includes `whisperCounter` field. Test at `lib/honeycomb/__tests__/whispers-determinism.test.ts` (AC-12). MOVED HERE because the Match service contract emits whispers from S1a forward; downstream sprints depend on determinism.

### Sprint exit criteria

- All 6 tasks closed
- `pnpm tsc --noEmit` clean
- All clash + match + whisper tests green
- Match service wired into runtime
- LOC tracking ~+1,500 (within sub-budget)
- `/review-sprint S1a` + `/audit-sprint S1a` pass
- `sprint-1a-COMPLETED.md` marker present

---

## S1b · Opponent fingerprint + Storage + CI infra + path-lock + geometry

**Branch**: `feat/hb-s1b-opponent-infra`
**Time budget**: **3 working days**
**LOC tracking**: ~+900
**Depends on**: S1a

### Tasks

**T1b.1 · opponent.{port,live,mock}.ts** (~5h · D11 · AC-5)

Same as r0 T1.4.

**T1b.2 · behavioral fingerprint test suite** (~3h · AC-5 · flatline-r1 modified per SKP-006)

**CI variant**: Snapshot-only assertion at `tests/fixtures/opponent-fingerprint-snapshot.json`. Runs in CI; deterministic; fast.

**Local-only characterization suite**: Wilson LB statistical assertions move to `tests/local/opponent-characterization.test.ts` (gitignored from CI). Operator runs locally when tuning AI policies; not gated in PR review.

This addresses SKP-006: CI-flaky statistical tests would block PRs spuriously. Snapshot pinning is exact; LB is exploratory.

**T1b.3 · BattlePhase compile-time enforcement** (~2h · SDD §3.3.2 · MODIFIED per SKP-003 + operator decree)

**Default to fallback path** (was Option B in SDD): `lib/honeycomb/__tests__/match-phase-audit.test.ts` runtime fuzz that imports every file matching `lib/**/*.ts` + `app/**/*.tsx`, parses switches over `BattlePhase`/`MatchPhase`, asserts each has `default` with `never`-assert.

**Or use ts-pattern**: install `ts-pattern` devDep · refactor switches to `match(phase).with(...).exhaustive()` pattern · the `.exhaustive()` is compile-time enforced by ts-pattern.

**Custom oxlint rule (Option A · DEFERRED)**: only if T1b.3 Option B/ts-pattern proves insufficient and operator has prior oxlint rule authorship · NOT default · 1-day spike before commitment.

**T1b.4 · localStorage SSR-safe wrapper** (~2h · SDD §3.4.1 · T1)

Same as r0 T1.9.

**T1b.5 · clash error recovery doc + RecoverableErrorScreen scaffold** (~2h · SDD §3.4.3)

Same as r0 T1.10.

**T1b.6 · S1 path-convention lock + CI grep** (~2h · SDD §6.7 · T4)

Same as r0 T1.11. NOTE: `.github/workflows/asset-paths.yml` already includes `pnpm check` from S0 T0.7 · just append the asset-paths grep.

**T1b.7 · battlefield-geometry.ts** (~1h · Q-SDD-2)

Same as r0 T1.12.

### Sprint exit criteria

- All 7 tasks closed
- `pnpm tsc --noEmit` clean
- All test suites green (opponent snapshot + match-phase-audit + storage + path-lock)
- CI workflow `asset-paths.yml` registered AND `lint.yml` from S0 still green
- ts-pattern (if chosen) installed; switches refactored
- LOC tracking ~+900
- **OPERATOR PAIR-POINT** at S1b close: evaluate against §S1 pattern-lock criteria. If ≥1 fails: re-work decision.
- `/review-sprint S1b` + `/audit-sprint S1b` pass
- `sprint-1b-COMPLETED.md` marker present

---

## S2 · BattleField + BattleHand (port + relocate CombosPanel inline)

**Branch**: `feat/hb-s2-battlefield-hand`
**Time budget**: **2.5 working days**
**LOC tracking**: ~+1,000
**Depends on**: S1b (Honeycomb pattern-lock confirmed)

### Tasks

(Tasks T2.1-T2.5 identical to r0 sprint plan · see prior version. No flatline-r1 changes to S2 tasks.)

### Sprint exit criteria

(Same as r0 S2)

---

## S3 · EntryScreen + ElementQuiz (owns BattleScene edits · per §S3‖S4 mechanics)

**Branch**: `feat/hb-s3-entry-quiz` (off `feat/hb-s2-battlefield-hand`)
**Time budget**: **2 working days**
**LOC tracking**: ~+800
**Depends on**: S2 · S4 branches FROM S3

### Tasks

(Same as r0 · S3 owns BattleScene phase routing edits. S4 must drop in additively.)

### Sprint exit criteria

(Same as r0 + interface to S4 documented at `grimoires/loa/notes/s3-battlescene-extension-points.md`)

---

## S4 · OpponentZone + TurnClock + ArenaSpeakers (drop-in additions per §S3‖S4 mechanics)

**Branch**: `feat/hb-s4-opponent-clock-speakers` (off `feat/hb-s3-entry-quiz`)
**Time budget**: **2 working days**
**LOC tracking**: ~+800
**Depends on**: S3 (extension points must be defined first)

### Tasks

(Same as r0 · components must mount through extension points from S3; do NOT edit BattleScene orchestrator directly.)

### Sprint exit criteria

(Same as r0)

---

## S5 · CardPetal + visual binding pass

**Branch**: `feat/hb-s5-cardpetal-visuals`
**Time budget**: **2 working days**
**LOC tracking**: ~+700
**Depends on**: S3 + S4

### Tasks

(Same as r0)

### Sprint exit criteria

(Same as r0 + **OPERATOR PAIR-POINT**: S5.5 firing decision per SDD §10 matrix)

---

## S5.5 · Buffer sprint (optional · operator-decides at S5 close)

**Branch**: `feat/hb-s55-buffer` (only created if fires)
**Time budget**: 0-1 working days
**LOC tracking**: ≤ +500 (buffer · doesn't count against AC-14)
**Depends on**: S5 + operator decision

### Tasks (only if fires)

(Same as r0)

### Sprint exit criteria (only if fires)

(Same as r0)

---

## S6 · Asset extraction + ResultScreen + Guide

**Branch**: `feat/hb-s6-assets-result-guide`
**Time budget**: **2.5 working days**
**LOC tracking**: ~+700
**Depends on**: S5 (or S5.5 if it fired)

### Tasks

(Tasks T6.1-T6.7 same as r0 PLUS:)

**T6.8 · Full asset-rollback CI test** (~1h · flatline-r1 · SKP-004)

`tests/e2e/sync-assets-rollback.spec.sh` exercises:
1. Snapshot pre-sync `public/art/` state
2. Tamper test tarball sha (manual edit)
3. Run `sync-assets.sh`
4. Assert: rollback fires · `public/art/` restored from `.assets-backup/` · script exits non-zero
5. Restore good tarball
6. Run `sync-assets.sh` clean · `public/art/` matches manifest

Registered in `.github/workflows/battle-quality.yml` (per S6.5 T6.5.1 setup).

### Sprint exit criteria

(Same as r0 + asset rollback CI test green)

---

## S6.5 · Testing infrastructure (NEW · flatline-r1 · SKP-010 · T3)

**Branch**: `feat/hb-s65-test-infra`
**Time budget**: **2 working days**
**LOC tracking**: ~+400 (mostly CI configs · little runtime code)
**Depends on**: S6

### Tasks

**T6.5.1 · Lighthouse CI workflow** (~2h · AC-15)

`.github/workflows/battle-quality.yml`:
- Step: build compass with `pnpm build`
- Step: start dev server in background
- Step: `npx lighthouse http://localhost:3000/battle ...`
- Step: `node scripts/assert-lighthouse.mjs ./lh.json` — fails if Perf<80, LCP>2.5s, INP>200ms, CLS>0.1
- Step: also runs asset-rollback test from S6 T6.8

**T6.5.2 · axe-core E2E spec** (~2h · AC-16)

`tests/e2e/battle-a11y.spec.ts` per SDD §9.2. 4 sub-tests (entry · quiz · battlefield · result) × WCAG 2.1 AA. `@axe-core/playwright` devDep added.

**T6.5.3 · Playability checklist + Playwright automation** (~3h · AC-17)

`grimoires/loa/tests/playability-checklist.md` per SDD §9.3 (12 checks). Automated checks via Playwright at `tests/e2e/battle-playability.spec.ts`. Manual checks (jank · screen-reader) deferred to S7 operator-confirmed pass.

**T6.5.4 · `scripts/assert-lighthouse.mjs`** (~1h)

Parses Lighthouse JSON output; asserts AC-15 thresholds; exits non-zero on fail with diagnostic output.

**T6.5.5 · Pre-existing baseline policy** (~30min · SKP-007 / IMP-006)

Document at `grimoires/loa/notes/quality-gate-baseline-policy.md`: how Lighthouse + axe handle pre-existing violations vs new ones. Default: baseline-comparison (CI fails only if NEW violations land · pre-existing violations tracked as backlog). Tooling: a baseline manifest at `tests/fixtures/lighthouse-baseline.json` + `axe-baseline.json` updated on each green run.

### Sprint exit criteria

- All 5 tasks closed
- Lighthouse CI workflow green against /battle (AC-15)
- axe E2E spec green against all 4 phases (AC-16)
- Playability automated checks green; checklist authored (AC-17)
- Baseline policy documented
- LOC tracking ~+400
- `/review-sprint S6.5` + `/audit-sprint S6.5` pass
- `sprint-6.5-COMPLETED.md` marker present

---

## S7 · Dev panel relocation + final audit (SLIMMED per flatline-r1 · SKP-010)

**Branch**: `feat/hb-s7-devpanel-audit`
**Time budget**: **2 working days** (was 3 days in r0 · slimmed because testing infra moved to S6.5 and whisper det moved to S1a)
**LOC tracking**: ~+0 (mostly relocations)
**Depends on**: S6.5

### Tasks

**T7.1 · DevConsole.tsx** (~3h · FR-21 · SDD §7.1)

(Same as r0)

**T7.2 · KaironicPanel relocation** (~30min · FR-20)

(Same as r0)

**T7.3 · SubstrateInspector.tsx** (~2h · Q-SDD-7)

(Same as r0)

**T7.4 · SeedReplayPanel.tsx** (~2h · Q-SDD-7)

(Same as r0)

**T7.5 · ComboDebug.tsx** (~1.5h · Q-SDD-7)

(Same as r0)

**T7.6 · BattleScene cleanup** (~30min · FR-22)

(Same as r0)

**T7.7 · Manual playability pass** (~2h · AC-17 manual checks)

Operator-confirmed playability checks that can't be automated: animation jank (chrome devtools perf), screen-reader announces (VoiceOver pass), keyboard-only completion of full match. Document outcome at `grimoires/loa/tests/playability-manual-pass.md`.

**T7.8 · Final audit + COMPLETED marker** (~2h)

Run full audit suite (same as r0 T7.11). If any fail: file as `sprint-bug-N` against the PR; address before COMPLETED.

### Sprint exit criteria

- All 8 tasks closed
- DevConsole reachable via backtick AND `?dev=1`; 4 tabs functional
- Default /battle render shows NO dev tools (AC-6)
- Manual playability pass operator-confirmed (AC-17 manual checks)
- All CI green (Lighthouse + axe + playability automation + asset rollback + typecheck + tests + lint)
- LOC tracking ~+0
- `/review-sprint S7` + `/audit-sprint S7` pass
- **CYCLE COMPLETED MARKER** at `grimoires/loa/cycles/card-game-in-compass-2026-05-12/CYCLE-COMPLETED.md` (AC-11)
- `sprint-7-COMPLETED.md` marker present

---

## Cycle exit · merge gate

(Same as r0)

---

## Cross-sprint considerations

### Beads tasks

Each task above becomes a beads task at sprint start, created by `/run sprint-plan`. Beads is the single source of truth (NEVER TaskCreate per CLAUDE.md).

### Per-sprint time-budget table (UPDATED · r1 · primary gate per SKP-001 · LOC becomes tracking signal)

| Sprint | Time budget (binding gate) | LOC tracking (signal) | Operator commitment |
|---|---|---|---|
| S0 | 1 day | ~+600 | 1 day |
| S1a | 3 days | ~+1,500 | 3 days |
| S1b | 3 days | ~+900 | 3 days |
| S2 | 2.5 days | ~+1,000 | 2.5 days |
| S3 | 2 days | ~+800 | 2 days |
| S4 | 2 days | ~+800 | 2 days |
| S5 | 2 days | ~+700 | 2 days |
| S5.5 | 0-1 day (if fires) | ~+500 max | 0-1 day |
| S6 | 2.5 days | ~+700 | 2.5 days |
| S6.5 | 2 days | ~+400 | 2 days |
| S7 | 2 days | ~+0 (relocations) | 2 days |
| **Total** | **22-23 working days** | **~+7,500** (matches AC-14) | **~5 calendar weeks @ 1 dev** |

**Binding gate**: TIME. If real elapsed time exceeds 1.5× the sprint estimate, fire operator pair-point to re-scope. LOC is tracked for early-drift detection but does NOT pass/fail a sprint.

### Open implementation questions

(Same as r0 OP-1 through OP-7 · plus:)

- **OP-9** *(NEW · flatline-r1)*: Tooling migration scope (T0.7) — should we also migrate from `pnpm` to `bun`? world-purupuru uses bun. Out-of-scope for this cycle (just oxlint + oxfmt this round) unless operator decides at S0.
- **OP-10** *(NEW · flatline-r1)*: ts-pattern adoption depth — only for BattlePhase exhaustiveness, or refactor other discriminated unions across the substrate?

---

## References

- **PRD**: `grimoires/loa/prd.md` (r1 · flatline-integrated)
- **SDD**: `grimoires/loa/sdd.md` (r1 · flatline-integrated)
- **PRD flatline**: `grimoires/loa/a2a/flatline/card-game-prd-opus-manual-2026-05-12.json`
- **SDD flatline**: `grimoires/loa/a2a/flatline/card-game-sdd-opus-manual-2026-05-12.json`
- **Sprint flatline**: `grimoires/loa/a2a/flatline/card-game-sprint-opus-manual-2026-05-12.json`
- **Predecessor cycle (archived)**: `grimoires/loa/archive/substrate-agentic-translation-adoption-2026-05-12/`
- **Game design canon**: `~/Documents/GitHub/purupuru-game/grimoires/loa/game-design.md` · `~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md`
- **UI/UX reference (read-only)**: `~/Documents/GitHub/world-purupuru/sites/world/src/lib/{battle,game,scenes}/`
- **Substrate doctrine**: `~/Documents/GitHub/construct-effect-substrate/`
- **Tooling reference**: world-purupuru's `oxlint.config.json` + `biome.json` patterns
- **Framework regression**: [0xHoneyJar/loa#863](https://github.com/0xHoneyJar/loa/issues/863) — `/flatline-review` broken in 3 ways on 1.157.0
- **Simstim run**: `simstim-20260512-60977bb6` · state at `.run/simstim-state.json`
