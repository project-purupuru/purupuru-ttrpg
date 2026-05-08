# Sprint Plan: purupuru-ttrpg observatory — v0.1 idle frame

**Version:** 1.0
**Date:** 2026-05-07
**Author:** Sprint Planner Agent (Loa v0.6.0)
**PRD Reference:** `grimoires/loa/prd.md`
**SDD Reference:** `grimoires/loa/sdd.md` v2.0
**Cycle:** `cycle-001` (observatory-v0)
**Mode:** minimal + batch (per `.loa.config.yaml`)

---

## Executive Summary

This plan covers **v0.1 — idle frame** of the 4-pass iteration ladder defined in `prd.md:198–202` (§9). Sprint 1 (v0.1) gets full task breakdown here; v0.2–v0.4 are listed in the Sprint Overview as a forward trajectory to keep the 4-day ship clock visible. Each subsequent sprint will be planned via `/sprint-plan` after its predecessor completes review+audit.

**v0.1 success-locked items (PRD §9):** layout, type system, sprite distribution, breathing rhythms `[PRD §9 v0.1]`. Two spike outputs gate everything downstream: (1) Pixi-mount pattern under Next 16 + React 19, and (2) sprite-count headroom (1000 → 500 → 250 fallback ladder).

**Total Sprints (in this cycle):** 4 (this plan details Sprint 1 only)
**Sprint 1 Duration:** 1.0 day (single-day sprint due to 4-day ship clock)
**Sprint 1 Dates:** 2026-05-07 → 2026-05-08
**Final Ship Date:** 2026-05-11 (Solana Frontier hackathon submission)

> **Quote anchor (PRD §9):** *"Each pass renders a working surface; we iterate on motion and coupling without re-architecting the layout structure."*

---

## Sprint Overview

| Sprint | Pass | Theme | Key Deliverables | Dependencies |
|--------|------|-------|------------------|--------------|
| **1** | **v0.1** | **Idle frame** | **Pixi mount spike, pentagram canvas, 500–1000 breathing sprites, KpiStrip, activity rail (empty), weather tile (static), intro animation** | **None** |
| 2 | v0.2 | Mocked liveness | Action grammars (mint/attack/gift), mock event stream, ActivityRail row prepend, KpiStrip jitter | Sprint 1 |
| 3 | v0.3 | Weather coupling | mockWeatherFeed real ticks, modulation.ts, zone amplification | Sprint 2 |
| 4 | v0.4 | Polish + ship | FocusCard sheet, glow easing on cycle-balance, intro polish, demo dry-run, Vercel backup | Sprint 3 |

> Note: Only Sprint 1 has full task detail in this document. Sprints 2–4 will each be planned via `/sprint-plan` after the prior sprint passes `/audit-sprint`.

---

## Sprint 1: v0.1 — Idle Frame

**Pass:** v0.1 (PRD §9)
**Scope:** **MEDIUM** (10 tasks, including 2 spikes)
**Duration:** 1.0 day
**Dates:** 2026-05-07 → 2026-05-08

### Sprint Goal

Render the full observatory layout structure at `/observatory` — pentagram + 500–1000 puruhani sprites idle/breathing on per-element rhythm, with KpiStrip showing mock adapter values, an empty/awaiting ActivityRail, a static WeatherTile, and a brief wordmark→sim intro animation — gated by a Pixi-mount validation spike and a sprite-count pre-bench.

> **PRD anchor:** *"Full layout structure renders. Pentagram + 500–1000 sprites idle/breathing on per-element rhythm. KpiStrip shows mock adapter values (distribution / cycle balance / active count / cosmic intensity). Activity rail in empty/awaiting state. Weather tile shows static mocked condition. Brief intro animation (wordmark fade → sim reveal). Pixi-mount-spike completes here."* (`prd.md:199`)

### Deliverables

- [ ] **D-1**: `/observatory` route loads with full layout (TopBar + KpiStrip + PentagramCanvas + ActivityRail + WeatherTile) on a `≥1280px` viewport `[SDD §4.5]`
- [ ] **D-2**: Pentagram canvas renders 5 vertices in canonical wuxing positions (Wood top, Fire upper-right, Earth lower-right, Metal lower-left, Water upper-left) `[SDD §3.3]`
- [ ] **D-3**: `N` puruhani sprites (target 500–1000, floor 500 if pre-bench fails) rendered at affinity-weighted resting positions, each animating per-element breathing cadence `[PRD §4 F4.7, F4.3]`
- [ ] **D-4**: KpiStrip displays live values from `scoreAdapter.getElementDistribution()` and `scoreAdapter.getEcosystemEnergy()` `[SDD §1.4 KpiStrip]`
- [ ] **D-5**: ActivityRail renders empty/awaiting state (no events yet — wired for v0.2) `[PRD §9 v0.1]`
- [ ] **D-6**: WeatherTile renders one static mocked `WeatherState` (no ticks yet — wired for v0.3) `[PRD §9 v0.1]`
- [ ] **D-7**: Intro animation runs once on first paint (wordmark fade → sim reveal, ≤1.2s) `[PRD §4 F4.6, SDD R-5]`
- [ ] **D-8**: Pixi-mount pattern documented in `grimoires/loa/NOTES.md` (resolves PRD §10 Q-pixi) `[PRD §10]`
- [ ] **D-9**: Pre-bench numbers recorded for 500/750/1000 sprite counts on the demo machine; final N selected `[PRD NFR-2]`
- [ ] **D-10**: Existing kit landing at `/` is unchanged (preserved as brand asset) `[SDD §4.3]`

### Acceptance Criteria

- [ ] **AC-1**: `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass clean (NFR-1) `[SDD §8 phase-boundary rule]`
- [ ] **AC-2**: Loading `/observatory` shows the pentagram + sprites within 2s of network idle on the demo machine (TTI <2s) `[SDD §6.4]`
- [ ] **AC-3**: Sustained frame rate ≥60 fps at idle with the chosen sprite count (target 1000, floor 500); recorded with browser DevTools performance panel `[SDD §6.4, PRD NFR-2]`
- [ ] **AC-4**: Each of the 5 element groups visibly breathes at its declared cadence (`--breath-fire: 4s`, `--breath-water: 5s`, etc.) — verifiable by toggling `prefers-reduced-motion` and observing breathing freezes `[SDD §1.4 PentagramCanvas, app/globals.css:189–193, NFR-3]`
- [ ] **AC-5**: With `prefers-reduced-motion: reduce`, breathing animations are static and intro animation skips to final frame `[PRD NFR-3, GROUNDED app/globals.css:548–555]`
- [ ] **AC-6**: With `prefers-color-scheme: dark`, Old Horai theme tokens apply throughout the layout `[PRD NFR-4, GROUNDED app/globals.css:301–375]`
- [ ] **AC-7**: KpiStrip values are deterministic on reload (mock determinism preserved — same hash → same numbers) `[GROUNDED lib/score/mock.ts:13–82]`
- [ ] **AC-8**: Affinity-blend invariant holds: a wallet with `{wood:100,fire:0,earth:0,water:0,metal:0}` resolves to exactly the wood vertex; `{wood:60,fire:40,...}` resolves to t=0.4 along the wood→fire pentagon edge `[PRD §4 F4.7, SDD §3.2 PentagramGeometry]`
- [ ] **AC-9**: Smoke E2E test (Playwright) — `loads /observatory and renders ≥500 sprites within 3s` — passes locally `[SDD §7.2]`
- [ ] **AC-10**: Visual identity rule honored: solid colors only on persistent UI (KpiStrip, ActivityRail, WeatherTile, TopBar); glows/tweens may be translucent `[GROUNDED app/globals.css:27, SDD §4.1]`
- [ ] **AC-11**: Adapter binding pattern preserved — `lib/activity/index.ts` and `lib/weather/index.ts` each have exactly one `export const … = mock…` binding line at the bottom, matching `lib/score/index.ts:17` verbatim `[GROUNDED, SDD §5.3]`

### Technical Tasks

> Goal IDs auto-assigned from PRD §6 Success Criteria:
> **G-1** = Live demo runs end-to-end at Frontier (judge "gets it" in ~30s)
> **G-2** = Visual identity is unmistakably purupuru
> **G-3** = Mocked-vs-real boundary is honest
> **G-4** = Sim is "alive" — entities breathe, react, migrate

- [ ] **Task 1.1**: **SPIKE — Pixi mount under Next 16 + React 19** (~30 min, time-boxed) → **[G-1]**
  - Validate `useEffect`-based mount pattern with cleanup; confirm RSC → client island boundary at `<canvas>` works with `"use client"` directive
  - Confirm StrictMode double-effect doesn't break Pixi instance disposal
  - Read `node_modules/next/dist/docs/` for any v16-specific guidance before assuming APIs `[GROUNDED AGENTS.md:2–4]`
  - **Output**: 1-page note appended to `grimoires/loa/NOTES.md` documenting the pattern; resolves PRD §10 Q-pixi `[PRD §10, SDD §1.4 PentagramCanvas, R-1]`

- [ ] **Task 1.2**: **SPIKE — Sprite-count pre-bench (500 / 750 / 1000)** (~45 min, time-boxed) → **[G-1, G-4]**
  - Stand up a minimal Pixi scene (no full sim) rendering N sprite tints with the per-element breathing tween
  - Measure sustained fps at each count on the demo machine using DevTools Performance + `requestAnimationFrame` deltas
  - Decide final N for D-3: 1000 if ≥60 fps held; else 750; else 500 floor; else trigger `ParticleContainer` switch `[PRD NFR-2, SDD §6.4, R-2]`
  - **Output**: numbers logged in `grimoires/loa/NOTES.md`; final N committed in code as `OBSERVATORY_SPRITE_COUNT` constant

- [ ] **Task 1.3**: Add Vitest + Playwright dev dependencies and minimal config (NEW dependencies per SDD §2.1) → **[G-3]**
  - `pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom`
  - `pnpm add -D @playwright/test && pnpm exec playwright install webkit chromium`
  - Add `vitest.config.ts` (jsdom env), `playwright.config.ts` (webkit + chromium), and `test`/`test:e2e` scripts in `package.json` `[SDD §2.1, §7.1]`
  - Pin to ranges declared in SDD: vitest `^1.6+`, playwright `^1.45+`

- [ ] **Task 1.4**: Create `lib/activity/{types,mock,index}.ts` (STUB level) → **[G-3]**
  - `types.ts`: `ActionKind`, `ActivityEvent`, `ActivityStream` interfaces verbatim from `sdd.md:298–331`
  - `mock.ts`: `mockActivityStream` with `subscribe()` returning a no-op unsubscribe and `recent()` returning `[]` (no events fire in v0.1; full implementation in Sprint 2)
  - `index.ts`: type re-exports + `export const activityStream: ActivityStream = mockActivityStream` (single binding line, matches `lib/score/index.ts:17`) `[SDD §5.3, AC-11]`

- [ ] **Task 1.5**: Create `lib/weather/{types,mock,index}.ts` (STUB level) → **[G-3]**
  - `types.ts`: `Precipitation`, `WeatherState`, `WeatherFeed` interfaces verbatim from `sdd.md:341–363`
  - `mock.ts`: `mockWeatherFeed` returning a single static `WeatherState` from `current()` (e.g., `{precipitation: "clear", amplifiedElement: "fire", amplificationFactor: 1.0, ...}`); `subscribe()` returns no-op unsubscribe (no ticks in v0.1; full implementation in Sprint 3)
  - `index.ts`: type re-exports + single binding line `[SDD §5.3, AC-11]`

- [ ] **Task 1.6**: Create `lib/sim/types.ts` + `lib/sim/pentagram.ts` (pure functions) → **[G-2, G-4]**
  - `types.ts`: `Puruhani`, `PentagramGeometry` per `sdd.md:371–393`
  - `pentagram.ts`: `vertex(element, radius)`, `pentagonEdge(from, to)`, `innerStarEdge(from, to)`, `affinityBlend(affinity)` per `sdd.md:131`
  - Vertex angles fixed: Wood 270°, Fire 342°, Earth 54°, Metal 126°, Water 198° `[SDD §3.3]`
  - **Unit tests** (Vitest): `vertex("wood")` returns top point; `affinityBlend({wood:100,...})` equals `vertex("wood")`; `affinityBlend({wood:60,fire:40,...})` lies on wood→fire pentagon edge at t=0.4 `[AC-8, SDD §7.2]`

- [ ] **Task 1.7**: Create `lib/sim/entities.ts` (Puruhani registry + idle tick) → **[G-4]**
  - Function `seedPopulation(N, scoreAdapter): Puruhani[]` — generates N entities each with stable id (ulid), mock-derived trader address, `primaryElement` sampled from `getElementDistribution()`, `affinity` from `getWalletProfile().elementAffinity`, `resting_position = pentagram.affinityBlend(affinity)`, `breath_phase` initialized to a random offset 0..1
  - Idle tick handler advances `breath_phase` by `dt / breathPeriodMs(primaryElement)` mod 1.0
  - **Unit test**: seedPopulation(500) returns exactly 500 distinct ids, each at a deterministic position given a seeded mock `[SDD §1.4 entities.ts]`

- [ ] **Task 1.8**: Create `app/observatory/page.tsx` (server shell) + `components/observatory/ObservatoryClient.tsx` (client island root) → **[G-1, G-2]**
  - `app/observatory/page.tsx`: server component, renders `<TopBar />` + `<ObservatoryClient />` mount point. NEW route — does not overwrite `/` `[SDD §4.3 decision]`
  - `ObservatoryClient.tsx`: `"use client"` directive, owns `IntroAnimation` lifecycle, sets up `ObservatoryContext` with `{ scoreAdapter, activityStream, weatherFeed }` bindings, renders `<KpiStrip />` + `<PentagramCanvas />` + `<ActivityRail />` + `<WeatherTile />` in `grid-cols-[1fr_380px]` per the PRD layout idiom `[PRD F4.5, SDD §1.4]`

- [ ] **Task 1.9**: Create `components/observatory/PentagramCanvas.tsx` (Pixi mount + idle render) → **[G-2, G-4]**
  - Mount `pixi.js` `Application` in `useEffect` with proper cleanup on unmount per Task 1.1 spike output
  - Load sprite atlases via `Assets.load()` from `/public/art/puruhani/puruhani-{element}.png` (5 textures, one per element) `[GROUNDED PRD §4 F3]`
  - Render pentagram: 5 vertex glyphs + outer pentagon edges (Sheng) + inner-star edges (Ke) using `Graphics`
  - Render N entity sprites tinted by `primaryElement` at `resting_position`; ticker drives breath via `Math.sin(2π * breath_phase)` → scale modulation
  - Read per-element breath cadence from CSS custom properties (`getComputedStyle(document.documentElement).getPropertyValue('--breath-fire')` etc.) so the canvas honors the design-token source of truth `[SDD §4.1]`
  - Honor `prefers-reduced-motion`: if reduce, freeze breath_phase advancement (still render, no scale tween) `[AC-5, NFR-3]`
  - Wire `onSpriteClick` callback prop (no-op in v0.1; consumed in Sprint 4 by FocusCard) — declared but not invoked-into-FocusCard yet `[SDD §1.4 PentagramCanvas]`

- [ ] **Task 1.10**: Create chrome components: `TopBar.tsx`, `KpiStrip.tsx`, `ActivityRail.tsx` (empty state), `WeatherTile.tsx` (static state), `IntroAnimation.tsx` → **[G-1, G-2]**
  - `TopBar.tsx`: wordmark (use `/public/brand/purupuru-wordmark.svg` light, `purupuru-wordmark-white.svg` dark) + ambient meta (e.g., active count read from entities.ts) `[GROUNDED PRD §4 F3]`
  - `KpiStrip.tsx`: 5 element tiles, each reading `getElementDistribution()[element]` + the cosmic intensity slot reading `getEcosystemEnergy().cosmic_intensity`. Solid backgrounds (no opacity) `[AC-10, SDD §4.1]`
  - `ActivityRail.tsx`: 380px right-rail column, empty/awaiting state — small "awaiting first event" text in `font-puru-mono`. No subscription wiring yet (deferred to Sprint 2) `[PRD §9 v0.1, SDD §1.4]`
  - `WeatherTile.tsx`: bottom of right-rail, renders `weatherFeed.current()` as a static condition card (icon + amplified-element label + temperature + cosmic intensity) `[SDD §1.4 WeatherTile]`
  - `IntroAnimation.tsx`: `motion`-driven wordmark fade-in (~400ms hold + 800ms cross-fade) → reveals sim layer behind it. Hard-cap 1.2s per `R-5`. Skip to final frame on `prefers-reduced-motion` `[PRD §4 F4.6, SDD R-5, AC-5]`
  - **Smoke component tests** (Vitest + Testing Library): each component renders without throwing in jsdom, both with and without `prefers-reduced-motion` mock `[SDD §7.2]`

### Dependencies

- **None** (first sprint of cycle-001).
- **External**: existing `lib/score/` adapter is already shipped `[GROUNDED lib/score/index.ts:17]` and consumed unchanged. All sprite/font/SVG assets already in `/public` `[GROUNDED PRD §4 F3]`.
- **Implicit**: Spike 1.1 outputs gate Task 1.9; Spike 1.2 outputs gate the final value of N in Task 1.7.

### Security Considerations

- **Trust boundaries**: All inputs are first-party. No user-supplied data, no network calls outside `next/font/google` (already in scope) `[SDD §1.6, §1.9]`.
- **External dependencies**: 5 new dev dependencies (Task 1.3): `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`. All pinned to ranges; `pnpm-lock.yaml` will lock exact versions. No new runtime deps.
- **Sensitive data**: None. No env vars, no API keys, no auth tokens, no PII. Mock determinism is hash-based but inputs are synthetic addresses, not real wallets `[GROUNDED lib/score/mock.ts]`.
- **Asset trust**: All sprites/fonts/SVGs first-party under `/public` `[SDD §1.9]`.

### Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **R1.1 (= SDD R-1)**: Pixi mount under Next 16 has unexpected behavior (StrictMode double-effect, RSC boundary edge case) | Med | High | **Time-boxed spike Task 1.1 BEFORE any other canvas work.** Fallback: drop StrictMode in dev mode; document workaround in NOTES.md `[SDD §9 R-1]` |
| **R1.2 (= SDD R-2)**: 1000 sprites can't sustain 60 fps | Med | High | **Pre-bench Task 1.2** is the explicit gate. Fallback ladder: 1000 → 750 → 500 → `ParticleContainer`. Demo at 500 still satisfies success criteria `[PRD §6, SDD §9 R-2]` |
| **R1.3**: CSS-var read for breath cadence inside Pixi tick is too slow (`getComputedStyle` on every frame) | Low | Med | Read once at canvas mount, cache in a `Map<Element, number>`, refresh only on theme toggle. Listen for `prefers-color-scheme` change to invalidate cache |
| **R1.4 (= SDD R-5)**: Intro animation overstays its welcome | Low | Med | Hard-cap 1.2s in code; reviewer flags any lengthening in Sprint 1 review `[SDD §9 R-5]` |
| **R1.5 (= SDD R-8)**: Undocumented Next 16 breaking change blocks the spike | Low | High | `AGENTS.md:2–4` warning is acted on: read `node_modules/next/dist/docs/` BEFORE writing any Next-API touchpoint code (in `app/observatory/page.tsx`) `[SDD §9 R-8]` |
| **R1.6**: Sprite atlas/texture loading failures (asset path 404, format mismatch) | Low | Med | Per-element solid-color circle fallback already specified `[SDD §6.1]`. Implement in Task 1.9 from the start, not as a post-incident patch |
| **R1.7**: Affinity-blend math regression (a wallet ends up off the pentagram) | Low | Med | Unit tests (Task 1.6) cover the canonical edge cases. Add a property-based check: ∀ valid affinity, blended position lies within the pentagram bounding circle |

### Success Metrics

- **Quantitative**:
  - Final sprite count (target ≥500, stretch 1000) at sustained ≥60 fps idle on demo machine
  - Time to interactive on `/observatory` <2s on demo machine `[SDD §6.4]`
  - Vitest unit-test coverage on `lib/sim/pentagram.ts` ≥80% `[SDD §7.1]`
  - Playwright smoke E2E green: `loads /observatory and renders ≥500 sprites within 3s`
- **Qualitative**:
  - Pixi-mount pattern documented and reusable for Sprints 2–4
  - All persistent UI surfaces use solid colors (no opacity) per the load-bearing visual identity rule `[GROUNDED app/globals.css:27]`
  - Layout matches the PRD §4 F4.5 idiom: TopBar + KpiStrip + `grid-cols-[1fr_380px]`

---

## Risk Register (Sprint-1 scope; full register in SDD §9)

| ID | Risk | Sprint | Probability | Impact | Mitigation | Owner |
|----|------|--------|-------------|--------|------------|-------|
| R1.1 | Pixi mount surprise under Next 16 | 1 | Med | High | Time-boxed spike Task 1.1 first | zerker |
| R1.2 | 1000 sprites < 60 fps on demo machine | 1 | Med | High | Pre-bench Task 1.2 + 1000→750→500 fallback ladder | zerker |
| R1.3 | `getComputedStyle` per-frame CSS-var read is slow | 1 | Low | Med | Read once at mount, cache, invalidate on theme change | zerker |
| R1.4 | Intro animation overstays | 1 | Low | Med | Hard-cap 1.2s in code | zerker |
| R1.5 | Next 16 undocumented breaking change | 1 | Low | High | Read `node_modules/next/dist/docs/` before any Next-API touch | zerker |
| R1.6 | Sprite asset loading failure | 1 | Low | Med | Implement solid-color circle fallback in Task 1.9 from the start | zerker |
| R1.7 | Affinity-blend regression (sprite off-pentagram) | 1 | Low | Med | Unit-test canonical cases + bounding-circle property check | zerker |

---

## Success Metrics Summary (Sprint 1)

| Metric | Target | Measurement Method | Sprint |
|--------|--------|-------------------|--------|
| Sprite count at 60 fps idle | ≥500 (stretch 1000) | DevTools Performance panel on demo machine | 1 |
| TTI on `/observatory` | <2s | DevTools Lighthouse on demo machine | 1 |
| Unit-test coverage on `lib/sim/pentagram.ts` | ≥80% | `vitest --coverage` | 1 |
| E2E smoke pass | green | `pnpm playwright test` | 1 |
| Build cleanliness | typecheck + lint + build clean | `pnpm typecheck && pnpm lint && pnpm build` | 1 |
| Pixi-mount pattern documented | 1-page note in NOTES.md | manual review | 1 |
| Pre-bench numbers recorded | 500/750/1000 fps captured | manual review of NOTES.md log | 1 |

---

## Dependencies Map

```
Sprint 1 (v0.1) ─▶ Sprint 2 (v0.2) ─▶ Sprint 3 (v0.3) ─▶ Sprint 4 (v0.4)
   │                  │                  │                  │
   └─ Idle frame      └─ Liveness        └─ Weather         └─ FocusCard +
      Pixi spike         (mint/attack/      coupling           polish + ship
      Pre-bench          gift grammars)     (modulation.ts)
      Layout LOCK        Action LOCK        Weather LOCK
```

**Internal dependency chain (within Sprint 1):**

```
Task 1.1 (Pixi spike) ────▶ Task 1.9 (PentagramCanvas)
Task 1.2 (Pre-bench) ─────▶ Task 1.7 (entities.ts: final N)
Task 1.3 (test deps) ─────▶ Task 1.6, 1.7, 1.10 (unit + smoke tests)
Task 1.4 (lib/activity) ──▶ Task 1.8 (ObservatoryClient context)
Task 1.5 (lib/weather) ───▶ Task 1.8, 1.10 (WeatherTile)
Task 1.6 (pentagram.ts) ──▶ Task 1.7 (entities.ts uses affinityBlend)
Task 1.7 (entities.ts) ───▶ Task 1.9 (PentagramCanvas seeds population)
Task 1.8 (Observatory shell) ─▶ Task 1.9, 1.10 (mounts canvas + chrome)
```

Critical path: 1.3 → 1.6 → 1.7 → 1.9. Spikes 1.1 + 1.2 run in parallel as the very first work.

---

## Appendix

### A. PRD Feature Mapping (v0.1 scope only)

| PRD Feature | Sprint | Sprint-1 Coverage | Status |
|-------------|--------|-------------------|--------|
| FR-1 (kit at `/`) | — | preserved unchanged (D-10) | ✅ Already shipped |
| FR-2 (token-driven utilities) | 1 | KpiStrip, TopBar, chrome components consume tokens (Task 1.10) | Planned |
| FR-3 (Score adapter) | 1 | KpiStrip + entities.ts consume `scoreAdapter` (Tasks 1.7, 1.10) | Planned (consumption, not modification) |
| FR-4 (`/observatory` pentagram + N entities) | 1 | Tasks 1.6, 1.7, 1.8, 1.9 | Planned |
| FR-5 (action grammars) | **2** | — | **Deferred to Sprint 2** |
| FR-6 (FocusCard click) | **4** | sprite-click callback declared but not wired to sheet | **Deferred to Sprint 4** |
| FR-7 (weather tile) | 1 (static) → 3 (live) | static state in v0.1 (Task 1.10); live ticks in v0.3 | Partial in Sprint 1 |
| FR-8 (intro animation) | 1 | Task 1.10 IntroAnimation.tsx | Planned |

| PRD NFR | Sprint-1 Coverage |
|---------|-------------------|
| NFR-1 (working build) | AC-1: typecheck + lint + build clean |
| NFR-2 (500–1000 sprites) | Tasks 1.2 (pre-bench) + 1.7 + 1.9 + AC-3 |
| NFR-3 (`prefers-reduced-motion`) | AC-5 + Task 1.9 + Task 1.10 IntroAnimation |
| NFR-4 (`prefers-color-scheme: dark`) | AC-6 (already wired in `app/globals.css:301–375`) |
| NFR-5 (solid colors only) | AC-10 + Task 1.10 |
| NFR-6 (~30s comprehension) | Measured at demo time; v0.1 establishes the surface |

### B. SDD Component Mapping (v0.1 scope only)

| SDD Component | Sprint | Status |
|---------------|--------|--------|
| `app/observatory/page.tsx` (server shell) | 1 | Task 1.8 |
| `<ObservatoryClient />` | 1 | Task 1.8 |
| `<PentagramCanvas />` | 1 | Task 1.9 |
| `<KpiStrip />` | 1 | Task 1.10 |
| `<ActivityRail />` (empty state) | 1 (v0.2 wires events) | Task 1.10 |
| `<WeatherTile />` (static) | 1 (v0.3 wires ticks) | Task 1.10 |
| `<TopBar />` | 1 | Task 1.10 |
| `<IntroAnimation />` | 1 | Task 1.10 |
| `<FocusCard />` | **4** | Deferred to Sprint 4 |
| `lib/activity/{types,mock,index}.ts` (STUB) | 1 (v0.2 implements) | Task 1.4 |
| `lib/weather/{types,mock,index}.ts` (STUB) | 1 (v0.3 implements) | Task 1.5 |
| `lib/sim/types.ts` | 1 | Task 1.6 |
| `lib/sim/pentagram.ts` | 1 | Task 1.6 |
| `lib/sim/entities.ts` | 1 | Task 1.7 |
| `lib/sim/migrations.ts` | **2** | Deferred to Sprint 2 |
| `lib/sim/modulation.ts` | **3** | Deferred to Sprint 3 |

### C. PRD Goal Mapping

PRD §6 Success Criteria do not have explicit IDs in source. Auto-assigned for traceability:

| Goal ID | Goal Description (from PRD §6) | Contributing Tasks (this sprint) | v0.1 Coverage | Validation Task |
|---------|--------------------------------|-----------------------------------|---------------|-----------------|
| **G-1** | Live demo runs end-to-end at Frontier (judge sees ambient simulation within ~30s) | Sprint 1: Tasks 1.1, 1.2, 1.8, 1.10 | **partial** — first paint + intro + layout achieved; "ambient" requires v0.2 liveness | Sprint 4: Task 4.E2E (deferred) |
| **G-2** | Visual identity is unmistakably purupuru | Sprint 1: Tasks 1.6, 1.9, 1.10 | **complete** — wuxing palette, breathing rhythms, brand fonts, pentagram all visible | Sprint 4: Task 4.E2E (deferred) |
| **G-3** | Mocked-vs-real boundary is honest | Sprint 1: Tasks 1.3, 1.4, 1.5 | **partial** — adapter shapes shipped; fuller honesty visible once mocks tick (v0.2/v0.3) | Sprint 4: Task 4.E2E (deferred) |
| **G-4** | Sim is "alive" — entities breathe, react, migrate | Sprint 1: Tasks 1.2, 1.6, 1.7, 1.9 | **partial** — entities BREATHE; "react" is v0.2; "migrate" is v0.2 | Sprint 4: Task 4.E2E (deferred) |

**Goal Coverage Check:**
- [x] All 4 PRD goals have ≥1 contributing task in Sprint 1
- [x] No orphan tasks — every Task 1.N maps to ≥1 goal
- [ ] **DEFERRED**: E2E validation task lives in Sprint 4 (the final sprint of cycle-001), not in Sprint 1. This sprint plan documents Sprint 1 only; Sprint 4 task `4.E2E` will be created when `/sprint-plan` is run for v0.4.

> ⚠️ **WARNING**: This sprint plan covers only Sprint 1 of a 4-sprint cycle. Goals G-1, G-3, and G-4 are intentionally only PARTIALLY covered in v0.1 per the PRD §9 iteration ladder — they complete in subsequent sprints. The final E2E validation task (`Task 4.E2E`) will be authored when Sprint 4 is planned. Reviewers should not flag this as an orphaned-goal warning; the ladder structure is the plan.

**Per-Sprint Goal Contribution (forecast across the cycle):**

- Sprint 1 (v0.1): G-1 partial, G-2 complete, G-3 partial, G-4 partial (breathe only)
- Sprint 2 (v0.2): G-1 partial, G-3 complete, G-4 partial (breathe + react/migrate via mint/attack/gift)
- Sprint 3 (v0.3): G-4 complete (full breathe + react + migrate + weather coupling)
- Sprint 4 (v0.4): G-1 complete (FocusCard makes the demo land in 30s) + E2E validation task `4.E2E`

### D. Spike Outputs Required for Sprint 2 Kickoff

Before `/sprint-plan` is run for Sprint 2 (v0.2), the following Sprint-1 spike outputs must be in `grimoires/loa/NOTES.md`:

1. **Pixi mount pattern** (Task 1.1): the validated `useEffect` shape with cleanup, including any StrictMode workarounds. This unblocks all subsequent canvas tweaks.
2. **Sprite-count decision** (Task 1.2): the chosen N (500 / 750 / 1000) with the measured fps numbers. This is the PRD NFR-2 resolution and locks the population layer for all 4 passes.
3. **Adapter binding pattern confirmation** (Tasks 1.4, 1.5): both `lib/activity/index.ts` and `lib/weather/index.ts` must have the canonical single-binding line — Sprint 2 implements the live mock streams against these shapes without changing the binding.

---

*Generated by Sprint Planner Agent (planning-sprints skill, Loa v0.6.0). Cycle: cycle-001. Mode: minimal+batch.*
