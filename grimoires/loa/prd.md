---
status: draft-r0
type: prd
cycle: battle-foundations-2026-05-12
mode: stabilize + game-design-primitive
branch: feat/hb-s7-devpanel-audit
predecessor_cycle: card-game-in-compass-2026-05-12 (shipped 2026-05-12)
input_brief: in-conversation Tier 1 + Tier 2-combo proposal
flatline_review: pending (Phase 2)
created: 2026-05-12
---

# Battle Foundations — Stop Flying Blind, Surface the Game

## Problem

The Honeycomb battle ships end-to-end (substrate + UI port complete this morning). It is functionally correct: pick element → arrange 5 → lock-in → staggered clash → result. But every time we touch it, we lose a half-day to one of three failure modes:

1. **Asset paths drift silently.** We discovered `jani-trading-card-earth.png` was 403 in the browser, not at build time. We discovered the face-down image path was wrong by *looking at a screenshot*. The CDN bucket has 24 declared paths, 1 is broken, and we found it by accident.

2. **State machine evolves blind.** `MatchSnapshot` now carries 24 fields. The `runRound` fiber publishes 8 ticks per round. We have zero tests on the reducer and zero way to scrub through phases without playing the game end-to-end. The "tap to swap" regression (forgot the `update()` helper) shipped to the user.

3. **No through-line from "card game" to "Purupuru."** The game plays, but it doesn't teach. A new player completes a Shēng Chain by accident and nothing names it. The closest comp (Balatro) earns its replay value by *naming the combo the first time you make it*. Purupuru has 4 combos and 0 discovery hooks.

These are NOT framework problems. They are missing primitives that every 0.0001% indie dev ships before they ship gameplay polish.

## Goals

| Goal | Verified by |
|---|---|
| G1. Asset paths fail at **build time**, never at runtime. | `pnpm assets:check` returns non-zero on a 4xx, CI runs it pre-merge. |
| G2. Battle is **testable as a pure reducer** without React, Effect, or DOM. | `match.reducer.test.ts` walks `(snapshot, command) → snapshot` deterministically, ≥20 transition tests. |
| G3. Battle is **scrubable in-browser** via a dev HUD. | `/battle?dev=1` shows current phase, snapshot JSON, and lets you force-set phase / advance clash step / inject lineup. |
| G4. Battle has **visual regression coverage** at 3 key phases. | Playwright captures snapshots of arrange / clashing / result and a `--check` mode fails on diff. |
| G5. Combo discovery has a **first-time ceremony.** | First time the player composes each of {Shēng Chain, Setup Strike, Elemental Surge, Weather Blessing}, the UI pauses ~600ms, names it, breathes, persists "seen" to localStorage. |

## Non-goals

- Three.js anything. (Explicitly deferred two cycles per session decision.)
- Real cosmic weather wiring. (Mock daily seed continues to work.)
- AI opponent personality. (Stub opponent stays; per-element AI is for the next cycle.)
- Card detail "petal" view. (Already scaffolded, not refined this cycle.)
- Multi-round battle balance. (Mechanics are world-purupuru-canonical, not tweaked here.)
- Performance optimization. (Hackathon clock; this cycle is correctness + iteration speed.)

## Users + stakeholders

- **Primary**: the operator (zksoju) — needs faster /battle iteration.
- **Implicit**: future Claude sessions — the dev HUD and reducer tests are the safety net that lets a future session land changes without breaking the substrate.
- **Downstream**: hackathon demo audience (ships 2026-05-11, already past — extended demo window). The combo discovery ledger is the thing that makes the game feel like Purupuru-not-just-a-card-game when someone plays it for the first time.

## Functional requirements

### FR-1: Asset manifest as typed module
- Move every CDN URL out of inline strings and into `lib/assets/manifest.ts`.
- Each entry is a typed record: `{ id, url, fallbackChain, dimensions?, contentType }`.
- Build-time validator script `scripts/check-assets.mjs` HEADs every URL, prints status per asset, exits non-zero on any 4xx/5xx.
- npm script `pnpm assets:check`. Wired into pre-commit and CI.
- Manifest export `cardArtChain(cardType, element)` returns the ordered fallback array (replaces ad-hoc helper in `lib/cdn.ts`).

### FR-2: Dev HUD
- New route segment `/battle?dev=1` mounts `<DevPanel />` (already partially scaffolded in `app/battle/_inspect/DevConsole.tsx`).
- Panel shows: current phase · last 5 events · selected card · full snapshot JSON (collapsible).
- Action buttons: `→ arrange` / `→ clashing` / `→ result` / `replay clash step` / `inject lineup [debug seed]`.
- Hotkey: backtick toggles visibility. Hidden by default. Persisted to localStorage.

### FR-3: Reducer test harness
- New file `lib/honeycomb/match.reducer.test.ts`.
- Extract a `reduce(snapshot, command) → snapshot` pure function from `match.live.ts` — the substrate logic without Effect/fiber wrapping.
- Tests cover: phase transitions (12 valid pairs), tap-position state machine (3 cases: empty, same, swap), swap-positions (3 cases: valid/oob/equal), lock-in commitment, garden grace persistence, caretaker A shield activation.
- Target: 20+ assertions, runs in <500ms via vitest.

### FR-4: Visual regression bench
- New file `tests/visual/battle.spec.ts` (Playwright).
- Three named snapshots: `arrange-default`, `clashing-impact`, `result-player-wins`.
- Each test: navigate `/battle?dev=1&seed=fixed-seed-123`, force-set phase via DevPanel, screenshot, compare to baseline.
- Baseline lives in `tests/visual/__snapshots__/`. Commit baselines.
- npm script `pnpm test:visual`. Run pre-push.

### FR-5: Combo discovery ledger
- New module `lib/honeycomb/discovery.ts`. Tracks first-time discovery per `ComboKind` × per-element-resonance.
- Persisted to localStorage under `puru-combo-discoveries-v1`.
- New `MatchEvent` variant `combo-discovered` with `{ kind, name, isFirstTime }`.
- Match.live publishes this event whenever `detectCombos` finds a combo not previously seen.
- UI: new component `<ComboDiscoveryToast />` mounts in BattleScene, subscribes to `combo-discovered` events with `isFirstTime: true`. On fire: pauses ~600ms (sets a visual `data-paused` attr on `.arena`), renders a center-screen tile with combo icon + name + tooltip, breathes, fades.
- After first discovery, combo still highlights in the existing CombosPanel but no ceremony.

## Acceptance criteria

| ID | Criterion | Verification |
|---|---|---|
| AC-1 | `pnpm assets:check` exits 0 on a green bucket. | CI run on PR. |
| AC-2 | `pnpm assets:check` exits non-zero if I add a fake URL. | Adversarial test: add `cdn("fake/missing.png")` to manifest, expect failure. |
| AC-3 | `pnpm test:unit` passes ≥20 reducer assertions. | `vitest` summary. |
| AC-4 | Tap-to-swap regression is caught by reducer tests. | Restore the `Ref.update` bug locally; tests fail. |
| AC-5 | `/battle?dev=1` panel toggles via backtick. | Manual: press backtick, panel appears. |
| AC-6 | Dev panel "force-set phase: clashing" advances the snapshot. | Manual: click button, see phase change in snapshot JSON. |
| AC-7 | `pnpm test:visual` passes against committed baselines on a fixed seed. | Playwright run. |
| AC-8 | First Shēng Chain made by a fresh player triggers ComboDiscoveryToast for ~2s. | Manual: clear localStorage, play, arrange a chain, lock-in, observe toast. |
| AC-9 | Second Shēng Chain in same session does NOT trigger the ceremony. | Same flow, second time. |
| AC-10 | All 4 combo kinds have unique discovery names + icons. | `discovery.ts` definitions reviewed. |
| AC-11 | Discovery state persists across reload. | Manual: lock-in, reload, observe discovery is "seen." |
| AC-12 | The current battle UI does not regress against committed Playwright baselines. | `pnpm test:visual` green. |
| AC-13 | TypeScript exits 0; oxlint exits 0. | CI. |

## Non-functional requirements

- **NFR-1**: ComboDiscoveryToast respects `prefers-reduced-motion` (no breathe animation, no pause delay).
- **NFR-2**: Dev panel never ships to production (`process.env.NODE_ENV === "production"` short-circuits).
- **NFR-3**: Asset manifest fits in a single file under 300 lines (forced honesty about URL count).
- **NFR-4**: Reducer tests deterministic — no `Math.random()`, no `Date.now()` without a seeded clock.
- **NFR-5**: Visual baselines tolerant of ±2px / ±5% pixel diff (Playwright `maxDiffPixels`).

## Risks + dependencies

| Risk | Severity | Mitigation |
|---|---|---|
| Playwright install on this machine | low | `pnpm dlx playwright install --with-deps` if not present |
| Bridgebuilder Phase 3.5 review surfaces a major REFRAME on the reducer design | medium | Accept-minor or accept-major both fine; not a blocker |
| `match.live.ts` is a monolith — extracting a pure reducer means refactoring the in-progress fiber | medium | Extract incrementally: `reduce()` handles deterministic transitions; fiber-driven async clash reveal stays in `runRound()` |
| ComboDiscoveryToast pausing the arena breaks the in-flight clash reveal fiber | medium | Toast only fires during `arrange` or `between-rounds`, never during `clashing` |
| Asset bucket changes upstream | low | Validator is run pre-merge, not post-merge. Drift caught in PR. |

## Decisions (open at PRD draft)

- **D1**: Are reducer tests vitest or bats? → **vitest** (TypeScript-native; bats is for shell scripts).
- **D2**: Does the dev panel sit beside DevConsole or replace it? → **extend DevConsole** — it's already there with KaironicPanel and SubstrateInspector; add a PhaseScrubber and SnapshotJsonView.
- **D3**: Where does discovery state live? → localStorage (no backend), keyed `puru-combo-discoveries-v1`.
- **D4**: Toast position? → center-screen overlay, z-index above arena, dismissible by click or auto-fade after 2.4s.
- **D5**: Reducer extraction scope — full extraction of match.live.ts logic, or just the tap/swap/lock-in commands that are deterministic? → **deterministic-only** for this cycle. Async clash reveal stays in fiber; reducer covers everything that runs synchronously.

## What this cycle does NOT touch

- The clash mechanics math (combo bonuses, type power, conditions) — already canon-aligned.
- Card art compositing pipeline.
- The substrate doctrine (`construct-effect-substrate`).
- Loa framework regressions filed earlier today (#863).

## Success state

After this cycle, a future Claude session can:

1. Open `/battle?dev=1`, hit backtick, jump straight to `phase: result` to test the result screen — without playing 3 rounds first.
2. Run `pnpm test:unit && pnpm test:visual && pnpm assets:check` and trust the green.
3. Read the reducer tests as the canonical "what does the battle do" spec.
4. Watch a friend play /battle for the first time and see them gasp when they discover Setup Strike, because the toast names it for them.

The first three are infrastructure. The fourth is what makes Purupuru not just a card game.
