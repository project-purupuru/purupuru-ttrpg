---
status: draft-r0
type: sdd
cycle: battle-foundations-2026-05-12
mode: stabilize + game-design-primitive
branch: feat/hb-s7-devpanel-audit
prd: grimoires/loa/prd.md
flatline_review: degraded-no-findings (PRD round, loa#759 regression)
created: 2026-05-12
---

# Battle Foundations — SDD

Architecture for the 5 FRs in `grimoires/loa/prd.md`. Each FR maps to a single file or small file set with clear seams and no shared mutable state.

## §1 System overview

Compass is a Next.js 16 app. Battle lives at `/battle`. The substrate is `lib/honeycomb/*` (pure TS) wrapped by `lib/runtime/*` (Effect services + React hooks). UI lives in `app/battle/_scene/*` (production) and `app/battle/_inspect/*` (dev-only).

This cycle adds three orthogonal layers:

```
┌─────────────────────────────────────────────────────────────┐
│  app/battle/_inspect/  ← (FR-2) DevPanel + PhaseScrubber    │
│  app/battle/_scene/    ← (FR-5) ComboDiscoveryToast         │
├─────────────────────────────────────────────────────────────┤
│  lib/honeycomb/        ← (FR-3) reduce() pure fn extracted  │
│                        ← (FR-5) discovery.ts + storage      │
│  lib/assets/           ← (FR-1) manifest.ts (NEW dir)       │
├─────────────────────────────────────────────────────────────┤
│  scripts/check-assets.mjs   ← (FR-1) CI gate                │
│  tests/visual/              ← (FR-4) Playwright snapshots   │
│  lib/honeycomb/*.test.ts    ← (FR-3) vitest reducer tests   │
└─────────────────────────────────────────────────────────────┘
```

No new dependencies. Vitest 3.2 and Playwright 1.59 are already in `package.json`.

## §2 FR-1 — Asset manifest

### §2.1 Module layout

```
lib/assets/
├── manifest.ts          ← typed registry, sole source of truth
├── types.ts             ← AssetRecord, FallbackChain, ContentType
├── manifest.test.ts     ← unit tests for chain resolution
└── README.md            ← how to add an asset
```

### §2.2 Type model

```ts
// lib/assets/types.ts
export type AssetClass =
  | "scene"      // bus-stop wallpapers
  | "caretaker"  // full-body characters
  | "card"       // card composites
  | "card-art"   // square art panels
  | "brand";     // wordmarks, logos

export interface AssetRecord {
  readonly id: string;                    // stable slug: "scene:wood"
  readonly url: string;                   // primary URL
  readonly fallbacks: readonly string[];  // ordered chain on 4xx
  readonly class: AssetClass;
  readonly dimensions?: { w: number; h: number };
  readonly contentType: string;           // "image/png" etc.
  readonly label?: string;                // human-readable
}
```

### §2.3 Manifest contents

`lib/assets/manifest.ts` re-exports every URL currently in `lib/cdn.ts` as typed records, plus their measured dimensions (HEADed once via the validator). Replaces:

- `WORLD_SCENES`, `WORLD_SCENE_LABELS`
- `CARETAKER_FULL`
- `CARD_SATURATED`, `CARD_PASTEL`, `CARD_ART_PANELS`, `JANI_CARDS`, `JANI_VARIANT`
- `BRAND.*`

Helper:

```ts
export function cardArtChain(
  cardType: CardType,
  element: Element,
): readonly string[];
```

Selects records by id pattern (`card:${cardType}:${element}`) and returns `[primary, ...fallbacks]`. The current ad-hoc helper in `lib/cdn.ts` is removed; `lib/cdn.ts` reduces to a thin re-export shim for one cycle (deprecation comment + jsdoc redirect to `lib/assets/manifest.ts`) so we don't shotgun every import site at once.

### §2.4 Validator

`scripts/check-assets.mjs`:

```js
// Pseudocode shape:
import { MANIFEST } from "../lib/assets/manifest.ts";

const results = await Promise.all(
  MANIFEST.map(async (rec) => {
    const head = await fetch(rec.url, { method: "HEAD" });
    return {
      id: rec.id,
      url: rec.url,
      status: head.status,
      ok: head.ok,
      contentType: head.headers.get("content-type"),
      contentLength: head.headers.get("content-length"),
    };
  }),
);

const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.error("Asset audit failed:", bad);
  process.exit(1);
}
console.log(`✓ ${results.length} assets verified`);
```

- Runs against `lib/assets/manifest.ts` (via `tsx` or `bun` — we have `tsx` already through `dig-search.ts`).
- Output: one line per asset on success, JSON dump on failure.
- Exit: 0 if all green, 1 if any HEAD returns ≥400.

### §2.5 Wiring

- `package.json` adds: `"assets:check": "tsx scripts/check-assets.mjs"`
- `.github/workflows/battle-quality.yml` (already exists) gets an extra step.
- Pre-commit hook (optional, cycle-decision): add to `.husky/pre-commit` if husky is present; otherwise documented in CLAUDE.md.

### §2.6 Failure modes

| Mode | Behavior |
|---|---|
| Network down | Validator exits with `EX_UNAVAILABLE` (69); CI treats as warning |
| Single 403 | Validator exits 1; output names the broken record id |
| Manifest typo | TypeScript catches at compile time (string literal union or template literal id pattern) |

## §3 FR-2 — Dev HUD

### §3.1 Trigger

URL query param `?dev=1`, OR localStorage `puru-dev-panel-enabled=1`, OR backtick key while focused on `<body>`. Hidden by default in production builds via `process.env.NODE_ENV` gate.

### §3.2 Structure

Extends existing `DevConsole.tsx`. New sub-panels:

```
app/battle/_inspect/
├── DevConsole.tsx           ← extended host, mounts all sub-panels
├── PhaseScrubber.tsx        ← NEW · buttons to force phase + advance clash
├── SnapshotJsonView.tsx     ← NEW · collapsible <pre> of MatchSnapshot
├── EventLogView.tsx         ← NEW · last 5 MatchEvents w/ timestamps
├── KaironicPanel.tsx        ← (existing)
├── SubstrateInspector.tsx   ← (existing)
├── SeedReplayPanel.tsx      ← (existing)
└── ComboDebug.tsx           ← (existing)
```

### §3.3 PhaseScrubber

Buttons dispatch internal-only Match commands. Two new commands:

```ts
// match.port.ts MatchCommand union extension
| { readonly _tag: "dev:force-phase"; readonly phase: MatchPhase }
| { readonly _tag: "dev:inject-snapshot"; readonly patch: Partial<MatchSnapshot> }
```

These are **dev-gated**: `match.live.ts` rejects them with `wrong-phase` unless `process.env.NODE_ENV !== "production"` AND `globalThis.__PURU_DEV__ === true`. The dev panel sets the global flag on mount.

### §3.4 EventLogView

Subscribes via `useMatchEvent(() => true, …)` and keeps the last 5 events in a ref. Renders `_tag · t+12ms` per row.

### §3.5 SnapshotJsonView

Renders `JSON.stringify(snapshot, replacer, 2)` inside `<pre>`. Replacer hides verbose arrays (collection, clashSequence) behind `<details>` to keep the panel compact.

### §3.6 Persistence

Backtick toggle writes `puru-dev-panel-enabled` to localStorage so the panel stays open across reloads.

## §4 FR-3 — Reducer harness

### §4.1 Extraction

`match.live.ts` is a fiber + ref + pubsub composition. We extract the synchronous case branches into a pure `reduce`:

```ts
// lib/honeycomb/match.reducer.ts (NEW)
export function reduce(
  snap: MatchSnapshot,
  cmd: MatchCommand,
): { next: MatchSnapshot; events: readonly MatchEvent[] };
```

Handles deterministic commands only:
- `begin-match`, `choose-element`, `complete-tutorial`
- `tap-position`, `swap-positions`
- `reset-match`

Returns the new snapshot AND the events that would have been published. `match.live.ts` keeps the fiber-driven `runRound`, `advance-clash`, `advance-round`, `lock-in` (because lock-in triggers the async fiber). Those continue to live in `match.live.ts`.

### §4.2 Wiring back

`match.live.ts` invoke handlers for the deterministic commands become:

```ts
case "tap-position":
case "swap-positions":
case "begin-match":
case "choose-element":
case "complete-tutorial":
case "reset-match": {
  const snap = yield* Ref.get(stateRef);
  const { next, events } = reduce(snap, cmd);
  yield* Ref.set(stateRef, next);
  for (const e of events) yield* publish(e);
  yield* tick();
  return;
}
```

Net: ~150 lines of branching logic move out of `match.live.ts` into a pure module. The `update(...)` helper bug class is eliminated — `reduce` returns events explicitly, and the wrapper always publishes them.

### §4.3 Tests

`lib/honeycomb/match.reducer.test.ts`:

```ts
describe("reduce", () => {
  describe("tap-position", () => {
    it("first tap on null selectedIndex selects it");
    it("tap same index deselects");
    it("tap different index swaps + clears selection");
    it("out-of-bounds index is no-op");
    it("publishes state-changed event");
  });
  describe("swap-positions", () => {
    it("valid pair swaps + recomputes combos");
    it("equal pair is no-op");
    it("negative or oob pair is no-op");
  });
  describe("choose-element", () => {
    it("populates p1Lineup and p2Lineup");
    it("transitions to arrange");
    it("publishes player-element-chosen + phase-entered");
  });
  describe("phase transitions", () => {
    it.each(VALID_PHASE_PAIRS)("%s -> %s allowed", ...);
    it.each(INVALID_PHASE_PAIRS)("%s -> %s rejected", ...);
  });
  describe("combo recompute", () => {
    it("recomputes p1Combos when lineup changes via swap");
    it("recomputes p1Combos when lineup changes via tap");
  });
});
```

Target ≥20 assertions, runs <500ms.

### §4.4 The reducer bug regression test

A regression test specifically restoring the "Ref.update without tick" bug:

```ts
it("AC-4: tap-position publishes state-changed (catches old Ref.update bug)", () => {
  const snap = arrangePhaseFixture();
  const { events } = reduce(snap, { _tag: "tap-position", index: 0 });
  expect(events.some((e) => e._tag === "state-changed")).toBe(true);
});
```

## §5 FR-4 — Visual regression

### §5.1 Test structure

```
tests/visual/
├── battle.spec.ts                   ← three named cases
├── fixtures/
│   ├── arrange-seed.json            ← deterministic snapshot patches
│   ├── clashing-impact-seed.json
│   └── result-player-wins-seed.json
└── __snapshots__/                   ← committed baselines
    ├── arrange-default.png
    ├── clashing-impact.png
    └── result-player-wins.png
```

### §5.2 Test pattern

```ts
test("arrange phase renders 5 face-up player cards + 5 face-down opponents", async ({ page }) => {
  await page.goto("/battle?dev=1&seed=fixed-seed-123");
  await page.evaluate((patch) => {
    window.__PURU_DEV__.injectSnapshot(patch);
  }, ARRANGE_FIXTURE);
  await page.waitForSelector(".arena[data-phase='arrange']");
  await expect(page).toHaveScreenshot("arrange-default.png", { maxDiffPixels: 200 });
});
```

The `injectSnapshot` global is exposed only when `__PURU_DEV__` is set, which the dev panel mounts.

### §5.3 Determinism

- Fixed seed via URL param.
- `prefers-reduced-motion: reduce` set in playwright config so animations land instantly.
- CDN images preloaded before screenshot via `page.waitForLoadState("networkidle")`.

### §5.4 npm script

```json
"test:visual": "playwright test tests/visual --reporter=line",
"test:visual:update": "playwright test tests/visual --update-snapshots"
```

## §6 FR-5 — Combo discovery

### §6.1 Discovery module

```ts
// lib/honeycomb/discovery.ts (NEW)
import type { ComboKind } from "./combos";

const STORAGE_KEY = "puru-combo-discoveries-v1";

export interface DiscoveryState {
  readonly seen: ReadonlySet<ComboKind>;
}

export function loadDiscovery(): DiscoveryState;
export function recordDiscovery(kind: ComboKind): DiscoveryState;
export function isFirstTime(kind: ComboKind, state: DiscoveryState): boolean;

// Friendly metadata for the toast
export interface ComboDiscoveryMeta {
  readonly kind: ComboKind;
  readonly title: string;        // "Shēng Chain"
  readonly icon: string;         // "相"
  readonly subtitle: string;     // "the generative cycle holds"
  readonly tooltip: string;      // longer explanation
}
export const COMBO_META: Record<ComboKind, ComboDiscoveryMeta>;
```

State is read from localStorage on construction, mutated by `recordDiscovery`, and written back synchronously. SSR-safe (uses the existing `storage.ts` SSR guard).

### §6.2 Match.live integration

After every `update(...)` that recomputes p1Combos (post-tap, post-swap, post-clash), check newly-active combos against the discovery state:

```ts
const newlyActive = nextCombos.filter((c) => !prevCombos.find((p) => p.kind === c.kind));
for (const combo of newlyActive) {
  const state = loadDiscovery();
  const first = isFirstTime(combo.kind, state);
  if (first) recordDiscovery(combo.kind);
  yield* publish({
    _tag: "combo-discovered",
    kind: combo.kind,
    name: combo.name,
    isFirstTime: first,
  });
}
```

This logic moves into `reduce()` from §4 since combo recompute is synchronous. The reducer returns the discovery events alongside `state-changed`.

### §6.3 MatchEvent variant

```ts
// match.port.ts
| { readonly _tag: "combo-discovered"; readonly kind: ComboKind; readonly name: string; readonly isFirstTime: boolean }
```

### §6.4 ComboDiscoveryToast

```
app/battle/_scene/
└── ComboDiscoveryToast.tsx   ← NEW
```

Subscribes via `useMatchEvent((e) => e._tag === "combo-discovered" && e.isFirstTime, handler)`. On fire:

1. Sets `data-paused` on `.arena` (CSS reduces breathing animations + dims non-toast UI).
2. Renders a center-screen tile via Framer-Motion-style transition (project uses `motion`):
   - Initial: opacity 0, scale 0.8
   - Animate: opacity 1, scale 1, with a 600ms hold
   - Exit: opacity 0, scale 0.96 over 400ms
3. Auto-dismisses at 2.4s OR on click (whichever first).
4. Respects `prefers-reduced-motion`: skips scale animation, instant in/out, no pause.

### §6.5 CSS

```css
/* app/battle/_styles/ComboDiscoveryToast.css */
.combo-toast {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
  pointer-events: none;
}
.combo-toast-tile {
  pointer-events: auto;
  padding: var(--space-xl) var(--space-2xl);
  background: var(--puru-cloud-bright);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 40px oklch(0.82 0.14 85 / 0.35);
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-xs);
  animation: combo-rise 600ms var(--ease-puru-settle) forwards;
}
.combo-toast-icon { font-family: var(--font-card); font-size: 4rem; color: var(--puru-honey-rich); }
.combo-toast-title { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 700; }
.combo-toast-subtitle { font-family: var(--font-body); font-size: var(--text-sm); color: var(--puru-ink-dim); font-style: italic; }
.arena[data-paused] { filter: saturate(0.7) brightness(0.85); transition: filter 200ms; }
@media (prefers-reduced-motion: reduce) {
  .combo-toast-tile { animation: none; }
  .arena[data-paused] { filter: none; }
}
```

### §6.6 Combo metadata

```ts
COMBO_META = {
  "sheng-chain": {
    title: "Shēng Chain",
    icon: "相",
    subtitle: "the generative cycle holds",
    tooltip: "A run of cards in the generating cycle. Each link multiplies power.",
  },
  "setup-strike": {
    title: "Setup Strike",
    icon: "的",
    subtitle: "the caretaker focuses the strike",
    tooltip: "A caretaker followed by their element's Jani. +30% to the Jani.",
  },
  "elemental-surge": {
    title: "Elemental Surge",
    icon: "極",
    subtitle: "five winds, one direction",
    tooltip: "All five cards share an element. +25% to every card.",
  },
  "weather-blessing": {
    title: "Weather Blessing",
    icon: "天",
    subtitle: "today's tide carries you",
    tooltip: "Cards matching today's weather element. +15% each.",
  },
};
```

## §7 Cross-cutting concerns

### §7.1 The `update(...)` invariant

Currently `match.live.ts` mixes `Ref.update(stateRef, …)` (silent) and `update(…)` (publishes tick). This is the bug class that caused tap-to-swap to ship broken.

After §4 the reducer-routed handlers ALL go through the same wrapper that publishes events explicitly. The non-reducer handlers (the `runRound` fiber internals) continue to use the `update(...)` helper. We add a lint comment to `match.live.ts` and a code-review checklist item to NEVER call `Ref.update(stateRef, …)` directly in a new handler — always via `reduce()` or `update()`.

(Hardening this to a type-level invariant — e.g. shadowing `Ref.update` to a no-op — is a follow-up cycle; for now we rely on the reducer pattern + reducer tests.)

### §7.2 Discovery + persistence

localStorage access goes through the existing `storage.ts` SSR-safe wrapper. The discovery state is the first user-persistent feature outside the match seed. We don't introduce a new persistence library — this stays in the `storage.ts` shim until we need real persistence.

### §7.3 Performance

- Asset validator runs in CI, not at app startup.
- Reducer tests run on every commit (vitest).
- Visual tests run on PR only (Playwright is slow on CI).
- Combo discovery check is O(combos × seen-set) per snapshot tick — trivial.

### §7.4 No new dependencies

This cycle uses only `vitest`, `@playwright/test`, `tsx`, and the existing app stack. No new runtime deps, no new dev deps.

## §8 File inventory

| File | Action | Approx lines |
|---|---|---|
| `lib/assets/manifest.ts` | NEW | 200 |
| `lib/assets/types.ts` | NEW | 30 |
| `lib/assets/manifest.test.ts` | NEW | 60 |
| `lib/cdn.ts` | MODIFY (shim) | -160 / +30 |
| `lib/honeycomb/match.reducer.ts` | NEW | 250 |
| `lib/honeycomb/match.reducer.test.ts` | NEW | 320 |
| `lib/honeycomb/match.live.ts` | MODIFY | -150 / +40 |
| `lib/honeycomb/match.port.ts` | MODIFY | +6 (2 new commands, 1 new event) |
| `lib/honeycomb/discovery.ts` | NEW | 90 |
| `lib/honeycomb/discovery.test.ts` | NEW | 60 |
| `app/battle/_inspect/DevConsole.tsx` | MODIFY | +40 |
| `app/battle/_inspect/PhaseScrubber.tsx` | NEW | 100 |
| `app/battle/_inspect/SnapshotJsonView.tsx` | NEW | 60 |
| `app/battle/_inspect/EventLogView.tsx` | NEW | 60 |
| `app/battle/_scene/ComboDiscoveryToast.tsx` | NEW | 90 |
| `app/battle/_scene/BattleScene.tsx` | MODIFY | +8 (toast mount + data-paused) |
| `app/battle/_styles/ComboDiscoveryToast.css` | NEW | 60 |
| `app/battle/_styles/battle.css` | MODIFY | +2 import |
| `scripts/check-assets.mjs` | NEW | 80 |
| `tests/visual/battle.spec.ts` | NEW | 120 |
| `tests/visual/fixtures/*.json` | NEW × 3 | 30 each |
| `package.json` | MODIFY | +3 scripts |
| `.github/workflows/battle-quality.yml` | MODIFY | +4 lines |
| `playwright.config.ts` | NEW or MODIFY | 30 |

Total new code: ~1700 lines. Net change to live UI surface: ~10 lines (toast mount, data-paused attr). The rest is infrastructure or new code with isolated reach.

## §9 Phase boundaries

| Phase | Scope |
|---|---|
| S0 | Sprint scaffolding (branch, beads tasks, fixtures dir) |
| S1 | FR-1 asset manifest + validator + lib/cdn shim |
| S2 | FR-3 reducer extraction + tests (the riskiest refactor) |
| S3 | FR-2 dev panel extensions |
| S4 | FR-5 combo discovery (depends on S2 — reducer hosts the discovery check) |
| S5 | FR-4 visual regression (depends on S3 — uses dev panel to set phases) |
| S6 | Integration polish, asset validator CI wiring, final typecheck/lint |

Sprint plan in `grimoires/loa/sprint.md` (Phase 5).

## §10 Decisions resolved at SDD draft

- **D-SDD-1**: Reducer extraction strategy → "deterministic commands only" for this cycle (per PRD D5). `runRound` fiber stays in `match.live.ts`. Future cycle may extract the entire effect tree.
- **D-SDD-2**: Where does `cardArtChain` live? → `lib/assets/manifest.ts` exports it. `lib/cdn.ts` re-exports for one cycle, then deleted.
- **D-SDD-3**: Dev panel feature flag → URL param `?dev=1` OR localStorage `puru-dev-panel-enabled=1` OR backtick. NODE_ENV=production gates the entire panel out of the bundle (with `process.env.NODE_ENV` guard).
- **D-SDD-4**: Visual regression on CI? → Playwright runs on PR-open only, not on every push, to keep CI cost down.
- **D-SDD-5**: Discovery storage version → `puru-combo-discoveries-v1`. Future schema changes bump suffix.
- **D-SDD-6**: Should the toast pause the runRound fiber? → No. FR-5 toast only fires during `arrange` or `between-rounds`, not during `clashing`. The fiber is uninterrupted.

## §11 Open questions (for Phase 4 Flatline review)

- Q1: Should the dev panel be a route segment (`app/battle/_dev/page.tsx`) or a same-route overlay (current plan)? Same-route is simpler but couples bundle.
- Q2: Should combo discovery persist per-wallet (when wallet exists) or per-device (current plan)? Per-device is correct for the hackathon — wallet integration is post-ship.
- Q3: Should we surface a "discoveries: 2/4" badge on the EntryScreen? Could be motivating. Cycle-defer.
