---
status: draft-r0
type: sprint-plan
cycle: battle-foundations-2026-05-12
mode: stabilize + game-design-primitive
branch: feat/hb-s7-devpanel-audit
prd: grimoires/loa/prd.md
sdd: grimoires/loa/sdd.md
flatline_review: degraded-no-findings (both rounds, loa#759 regression)
created: 2026-05-12
---

# Battle Foundations — Sprint Plan

Six sprints. ~1700 lines of new code, ~150 lines net change to live UI. Designed for single-PR consolidated landing via `/run sprint-plan`.

## Dependency graph

```
S0 (scaffold)
 ├─ S1 (asset manifest) ─────────┐
 ├─ S2 (reducer extract)─┬───────┼─→ S6 (integration + CI)
 ├─ S3 (dev panel) ──────┼──┐    │
 │                       │  └────┴─→ S5 (visual regression)
 └─                      └──→ S4 (combo discovery)
```

- S1, S2, S3 are independent → parallelizable.
- S4 depends on S2 (reducer hosts discovery check).
- S5 depends on S3 (visual tests use dev panel to set phases).
- S6 closes the cycle: CI wiring, asset validation in pipeline, final typecheck + lint.

## Sprint 0 — Scaffold

Lightweight setup. No new logic.

| Task | Files | AC |
|---|---|---|
| S0-T1 | Create `lib/assets/` directory, empty index | dir exists |
| S0-T2 | Add `puru-dev-panel-enabled` localStorage key + `__PURU_DEV__` global type declaration to `lib/runtime/types.d.ts` | tsc passes |
| S0-T3 | Add npm scripts: `assets:check`, `test:visual`, `test:visual:update` to package.json | scripts exist in package.json |
| S0-T4 | Confirm Playwright config exists; if not, create `playwright.config.ts` with reduced-motion + headless defaults | `pnpm test:visual` exits cleanly with no tests |
| S0-T5 | Create `tests/visual/` and `tests/visual/fixtures/` directories with `.gitkeep` | dirs exist |
| S0-T6 | Branch hygiene: confirm we're on `feat/hb-s7-devpanel-audit` or create `feat/battle-foundations-2026-05-12` | git status clean, branch name correct |

**Sprint exit criteria**: tsc passes, no new tests yet, npm scripts callable (even if no-op).

## Sprint 1 — Asset manifest + validator (FR-1)

| Task | Files | AC |
|---|---|---|
| S1-T1 | `lib/assets/types.ts` — AssetClass, AssetRecord types | tsc passes |
| S1-T2 | `lib/assets/manifest.ts` — port every URL from `lib/cdn.ts` into typed MANIFEST array, plus measured dimensions for known assets | exports: MANIFEST, BRAND, WORLD_SCENES, etc., cardArtChain |
| S1-T3 | `lib/assets/manifest.test.ts` — cardArtChain returns correct order per (cardType, element); MANIFEST has no duplicate ids; fallbackChain is non-empty for every primary | `vitest run lib/assets` passes |
| S1-T4 | `scripts/check-assets.mjs` — HEAD every URL in MANIFEST, exit 1 on any 4xx/5xx, JSON report on stderr | manual: `pnpm assets:check` prints per-asset status |
| S1-T5 | `lib/cdn.ts` reduces to re-export shim with deprecation jsdoc | tsc passes, every existing import keeps working |
| S1-T6 | `pnpm assets:check` exits 0 against the real bucket | AC-1 |
| S1-T7 | Adversarial: add a fake URL, confirm exits 1, then remove | AC-2 |

**Sprint exit criteria**: tsc passes, vitest passes, `pnpm assets:check` exits 0.

## Sprint 2 — Reducer extraction + tests (FR-3)

The riskiest sprint. Touches the hot path.

| Task | Files | AC |
|---|---|---|
| S2-T1 | `lib/honeycomb/match.reducer.ts` — pure `reduce(snapshot, command) → { next, events }` function. Handles begin-match, choose-element, complete-tutorial, tap-position, swap-positions, reset-match. Returns explicit event list. | exports reduce function |
| S2-T2 | `match.live.ts` wired to delegate to reduce() for the 6 deterministic commands. The `lock-in`/`advance-clash`/`advance-round` keep their fiber-driven paths untouched. | `pnpm tsc --noEmit` passes |
| S2-T3 | `match.reducer.test.ts` — test cases per §4.3 of SDD: tap-position (5), swap-positions (3), choose-element (3), phase transitions (12+), combo recompute (2) | `vitest run lib/honeycomb` ≥20 assertions |
| S2-T4 | Regression test: AC-4 — tap-position publishes state-changed event | test passes |
| S2-T5 | Manual smoke test in browser: arrange phase tap/swap visibly works | manual: cards reorder on tap-tap |
| S2-T6 | TypeScript invariant comment in match.live.ts: `// NEVER use Ref.update(stateRef, …) directly. Route through reduce() for deterministic commands or update() for fiber-internal mutations.` | comment present |

**Sprint exit criteria**: tsc, vitest, manual smoke all green. Tap-to-swap regression caught by AC-4.

## Sprint 3 — Dev panel (FR-2)

| Task | Files | AC |
|---|---|---|
| S3-T1 | `match.port.ts` adds `dev:force-phase` + `dev:inject-snapshot` MatchCommand variants. `validCommandsFor` admits them in every phase. | tsc passes |
| S3-T2 | `match.live.ts` handles dev:* commands; rejects them unless `process.env.NODE_ENV !== "production" && globalThis.__PURU_DEV__ === true` | guards in place |
| S3-T3 | `app/battle/_inspect/PhaseScrubber.tsx` — buttons for each MatchPhase, "advance clash step" button | renders, click forces phase |
| S3-T4 | `app/battle/_inspect/SnapshotJsonView.tsx` — collapsible JSON view with hidden verbose arrays | renders, expand/collapse works |
| S3-T5 | `app/battle/_inspect/EventLogView.tsx` — last 5 MatchEvents w/ timestamps | renders, updates on event |
| S3-T6 | `DevConsole.tsx` extends to host the new sub-panels; backtick toggles visibility; persists to localStorage | AC-5 |
| S3-T7 | Manual: force-set phase advances snapshot JSON | AC-6 |
| S3-T8 | NODE_ENV=production gate confirmed (next build doesn't include the panel) | check `next build` output bundle |

**Sprint exit criteria**: backtick toggles dev panel; force-set-phase changes snapshot; production build excludes the panel.

## Sprint 4 — Combo discovery (FR-5)

Depends on S2 (reducer hosts discovery check).

| Task | Files | AC |
|---|---|---|
| S4-T1 | `lib/honeycomb/discovery.ts` — loadDiscovery / recordDiscovery / isFirstTime + COMBO_META | exports complete, tsc passes |
| S4-T2 | `lib/honeycomb/discovery.test.ts` — round-trip persistence, isFirstTime semantics, all 4 combo kinds have unique meta | vitest passes, AC-10 |
| S4-T3 | `match.port.ts` adds `combo-discovered` MatchEvent variant | tsc passes |
| S4-T4 | `match.reducer.ts` emits `combo-discovered` event when newly-active combo found; calls recordDiscovery on first time | reducer test asserts emission |
| S4-T5 | `app/battle/_scene/ComboDiscoveryToast.tsx` — center-screen overlay subscribed to combo-discovered{isFirstTime:true} | renders on event, auto-dismisses at 2.4s |
| S4-T6 | `BattleScene.tsx` mounts ComboDiscoveryToast + sets `data-paused` on `.arena` while toast active | manual: arrange a chain, observe pause + toast |
| S4-T7 | `app/battle/_styles/ComboDiscoveryToast.css` + import in `battle.css` | toast styled correctly |
| S4-T8 | Manual: clear localStorage, build a Shēng Chain, observe ceremony | AC-8 |
| S4-T9 | Manual: build a second Shēng Chain — no ceremony | AC-9 |
| S4-T10 | Reload page — discovery persists | AC-11 |
| S4-T11 | `prefers-reduced-motion` — no breathe, instant in/out | NFR-1 |

**Sprint exit criteria**: All four combo kinds have first-time ceremonies that persist across reload.

## Sprint 5 — Visual regression (FR-4)

Depends on S3 (uses dev panel to set phases).

| Task | Files | AC |
|---|---|---|
| S5-T1 | `playwright.config.ts` — `prefers-reduced-motion: reduce`, headless: true, baseURL: http://localhost:3000, timeout: 30s, snapshotDir | exists, smoke test passes |
| S5-T2 | `tests/visual/fixtures/arrange-seed.json` — deterministic snapshot patch (5 fixed cards, fixed weather) | json valid |
| S5-T3 | `tests/visual/fixtures/clashing-impact-seed.json` — snapshot patch into clashing phase, idx=2, activeClashPhase=impact | json valid |
| S5-T4 | `tests/visual/fixtures/result-player-wins-seed.json` — winner=p1, full rounds history | json valid |
| S5-T5 | `tests/visual/battle.spec.ts` — three tests using `page.evaluate` to call `window.__PURU_DEV__.injectSnapshot(patch)` then screenshot | tests can run, first run generates baselines |
| S5-T6 | Generate baseline screenshots via `pnpm test:visual:update` | baselines committed under `__snapshots__/` |
| S5-T7 | Re-run `pnpm test:visual` — all green against baselines | AC-7, AC-12 |
| S5-T8 | Manual: bump a CSS value, confirm test fails | adversarial verification |

**Sprint exit criteria**: 3 baselines committed, `pnpm test:visual` green.

## Sprint 6 — Integration + CI wiring

| Task | Files | AC |
|---|---|---|
| S6-T1 | `.github/workflows/battle-quality.yml` — add `pnpm assets:check` step + `pnpm test:unit` step | workflow valid |
| S6-T2 | `.github/workflows/visual-regression.yml` (new, optional) — runs `pnpm test:visual` on PR open | optional; commit if time |
| S6-T3 | Pre-commit hook: add `pnpm tsc --noEmit && pnpm test` if husky is present | check `.husky/pre-commit` |
| S6-T4 | Run full local pipeline: `pnpm tsc --noEmit && pnpm oxlint && pnpm test && pnpm assets:check && pnpm test:visual` | all green |
| S6-T5 | Update `CLAUDE.md` (compass) battle section: dev panel hotkey, asset:check workflow, reducer test entry point | doc updated |
| S6-T6 | Final manual flow: pick element → drag-swap → lock-in → discover combo → result | end-to-end smoke green |
| S6-T7 | CYCLE-COMPLETED.md in cycle folder | written |

**Sprint exit criteria**: full local pipeline green; manual smoke green; CLAUDE.md updated; cycle marker present.

## Beads task summary

For `/run sprint-plan`, the following beads tasks will be created (per Loa convention):

```
bd-S0-scaffold (6 subtasks)
bd-S1-asset-manifest (7 subtasks)
bd-S2-reducer-extract (6 subtasks)
bd-S3-dev-panel (8 subtasks)
bd-S4-combo-discovery (11 subtasks)
bd-S5-visual-regression (8 subtasks)
bd-S6-integration (7 subtasks)
```

Total: ~53 tasks. Run-mode will track via `br` and surface circuit-breaker triggers.

## Acceptance criteria roll-up

| AC | Sprint | How verified |
|---|---|---|
| AC-1 | S1-T6 | `pnpm assets:check` green |
| AC-2 | S1-T7 | Adversarial fake URL fails |
| AC-3 | S2-T3 | vitest summary ≥20 |
| AC-4 | S2-T4 | Regression test for tick |
| AC-5 | S3-T6 | Manual: backtick toggle |
| AC-6 | S3-T7 | Manual: force-set advances |
| AC-7 | S5-T7 | `pnpm test:visual` green |
| AC-8 | S4-T8 | Manual: first chain ceremony |
| AC-9 | S4-T9 | Manual: second chain silent |
| AC-10 | S4-T2 | discovery.test.ts coverage |
| AC-11 | S4-T10 | Manual: reload persists |
| AC-12 | S5-T7 | Baseline parity |
| AC-13 | S6-T4 | Full pipeline green |

## Risks (refined from PRD)

| Risk | Sprint affected | Mitigation |
|---|---|---|
| Reducer extraction breaks the in-progress fiber | S2 | Keep `runRound` untouched; only port the 6 deterministic commands; manual smoke per sprint |
| Playwright baselines flaky on CI | S5 | `maxDiffPixels: 200` + reduced motion + networkidle wait |
| Dev panel ships to prod by accident | S3 | NODE_ENV guard + bundle-inspection in S3-T8 |
| Asset bucket changes upstream during sprint | S1 | Validator is the canary; if it fails mid-cycle, fix the manifest, not the bucket |
| Combo discovery toast interferes with clash reveal | S4 | Toast gated to `arrange` / `between-rounds` only |
| Visual baselines drift on monitor color profile | S5 | Snapshots run in headless Chromium with sRGB; commit baselines from CI not from dev machine if it matters |

## Out of scope this cycle

(Restating from PRD for sprint clarity.)

- Three.js / Pixi anything
- Real cosmic weather wiring
- AI opponent personality
- CardPetal refinement
- Mechanics rebalance
- Performance work

## Decisions resolved at sprint draft

- **D-SPR-1**: Sprint ordering — alphabetical-ish dependency chain. S1, S2, S3 parallel-able; S4 → S2; S5 → S3.
- **D-SPR-2**: Run mode? — `/run sprint-plan` for consolidated PR. Per Loa convention.
- **D-SPR-3**: Beads tasks created before implementation, per `NEVER use TaskCreate for sprint tracking when beads available`.
- **D-SPR-4**: Skip Phase 4.5 (Red Team SDD) — `red_team.simstim.auto_trigger` default false; this cycle is not security-sensitive.
- **D-SPR-5**: Skip Phase 6.5 (Flatline beads loop) — `simstim.flatline.beads_loop: false` per current .loa.config.yaml (4d clock).

## Success state (PRD §Success state, restated)

After this cycle:

1. `/battle?dev=1` + backtick = jump straight to any phase.
2. `pnpm test:unit && pnpm test:visual && pnpm assets:check` = green-or-shout.
3. Reducer tests = canonical "what the battle does" spec.
4. First player to make a Shēng Chain gasps because the toast names it.
