---
status: flatline-integrated-r1
type: sdd
cycle: card-game-in-compass-2026-05-12
mode: migrate + arch
prd: grimoires/loa/prd.md (r1 · flatline-integrated · 386 lines)
prd_review: grimoires/loa/a2a/flatline/card-game-prd-opus-manual-2026-05-12.json
sdd_review: grimoires/loa/a2a/flatline/card-game-sdd-opus-manual-2026-05-12.json (r1 · 4 HIGH + 6 HIGH skeptic · T1-T5 integrated)
branch: feat/honeycomb-battle
created: 2026-05-12
revision: r1 · post-flatline · T1-T5 integrated (error handling, state-machine rigor, test methodology, asset de-risking, cycle resilience) · T6-T8 MEDIUM deferred to /implement
operator: zksoju
authored_by: /simstim Phase 3-4 (Opus 4.7 1M)
simstim_id: simstim-20260512-60977bb6
---

# SDD · Card Game in Compass · Honeycomb Surface Migration

> **r1 · post-flatline integration** (2026-05-12 simstim Phase 4). Opus review (4 HIGH) + skeptic (6 HIGH) integrated as r1 deltas: §3.3.1 phase × command transition matrix, §3.3.2 compile-time BattlePhase enforcement, §3.3.3 transcendence collision matrix, §3.2 statistical-rigor methodology (Wilson lower-bound + snapshot), §3.4 error handling & SSR-safe localStorage wrapper, §5.6 S0 test-tarball validation, §5.7 S0 escape valves, §6.7 S1 path-convention lock + CI grep, §10 per-sprint LOC sub-budgets + S5.5 buffer sprint. T6-T8 (whisper Ref<number>, UX edge specs, sync-assets trap-cleanup) deferred as /implement-level notes. Flatline orchestrator still broken (loa#863) — same manual bypass as PRD r1.

## 1 · Abstract

This SDD describes **how** compass acquires the full Wuxing card-game experience from the world-purupuru SvelteKit reference, with the Honeycomb (effect-substrate) layer underneath. The PRD owns **what** and **why**; this SDD owns code paths, port shapes, file locations, sprint-task contracts, and acceptance verifications.

**Critical inheritance from PRD r1 (flatline-integrated)**: D9 (S0 spike before sprint commitment), D10 (asset extraction at S6 not S1), D11 (AI = parameterized policy NOT LLM-backed), AC-4 (ALL invariants from `purupuru-game/INVARIANTS.md`), AC-5 (falsifiable behavioral fingerprint per element), AC-14 (LOC budget +7,500), AC-15/16/17 (Lighthouse + axe + playability checklist).

**The SDD's customer is the implementer agent in S0–S7 sprints and the operator pair-points at gates.** Every section names file paths · code shapes · acceptance criteria · NOT design rationale (PRD owns rationale).

## 2 · Stack & decisions

### 2.1 · Confirmed stack (from compass repo state · NOT changed by cycle)

- Next.js 16.2.6 (App Router · Turbopack default)
- React 19.2.4
- TypeScript 5
- Tailwind 4 (`@tailwindcss/postcss` · `@theme` in `app/globals.css`)
- Effect 3.10.0 (Honeycomb substrate · already wired at `lib/runtime/runtime.ts`)
- motion 12.38.0 (framer-motion renamed)
- lucide-react (icon set)
- pnpm 10.x
- Vitest 3.x (test runner)
- Playwright (E2E · for AC-3, AC-6, AC-16)
- Lighthouse (perf · for AC-15)
- axe-core / @axe-core/playwright (a11y · for AC-16)

### 2.2 · New dependencies introduced this cycle

- `@axe-core/playwright` (devDep · AC-16) · ~150 KB
- `lighthouse` (devDep · AC-15) · ~5 MB · runs in CI only

NO runtime production dependencies added. Three.js / R3F / drei / tweakpane / dialkit are explicitly deferred (PRD D5).

### 2.3 · Resolved SDD-level decisions (PRD §11 closures)

| ID | Question | Resolution | Source |
|---|---|---|---|
| Q-SDD-1 | AI opponent algorithm | RESOLVED in PRD r1 D11: parameterized policy with element-specific coefficients · NOT LLM-backed · preserves seed determinism | PRD r1 D11 |
| Q-SDD-2 | BattleField territory geometry constants location | **Own at `lib/honeycomb/battlefield-geometry.ts`** as a new pure module (NOT in `wuxing.ts` which stays focused on elemental physics) · 5 territory centers + grid math + edge constants | SDD decision · separation of concerns |
| Q-SDD-3 | Asset repo naming | RESOLVED in this discovery: **`project-purupuru/purupuru-assets`** (org-aligned · generic scope leaves room for non-art future content) | SDD Phase 3 discovery |
| Q-SDD-4 | Asset release versioning | **Semver** (`v1.0.0`, `v1.1.0`) · matches Loa upstream convention · easier diff-reasoning than date-based when assets change ad-hoc | SDD decision |
| Q-SDD-5 | ElementQuiz question content | **Port verbatim** from world-purupuru's `ElementQuiz.svelte` for v1 (5 atmospheric questions per element). Gumi may author successors as a post-cycle artifact authored at `grimoires/loa/lore/element-quiz-v2.md`. | SDD decision · do-not-block-on-Gumi |
| Q-SDD-6 | Test parity | RESOLVED in PRD r1 AC-4: ALL specific invariants from `~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md` enumerated · fresh tests in compass (not fixture-shared due to data-shape differences) | PRD r1 AC-4 |
| Q-SDD-7 | Dev panel content beyond kaironic | Initial set at S7: **(a)** KaironicPanel (existing) · **(b)** SubstrateInspector (live snapshot of `Battle.current` + emitted events) · **(c)** SeedReplayPanel (current seed display + reset with custom seed input) · **(d)** ComboDebug (last-detected combos + per-position multipliers). 4 tabs in DevConsole. | SDD decision |
| Q-SDD-8 | HelpCarousel vs Tutorial | **MERGE into single `Guide` component with progressive disclosure**: first-match shows teach-by-doing tutorial overlay; subsequent matches show hint-mode (small "?" affordance, swipeable card on tap). Single FR replaces PRD §5.1 FR-9 + FR-10 · component path: `app/battle/_scene/Guide.tsx`. | SDD Phase 3 discovery (operator-chose-merge) |

### 2.4 · Layer-by-layer decision summary

```
┌──────────────────────────────────────────────────────────────────┐
│ APP ZONE                                                          │
│                                                                   │
│  app/battle/page.tsx               Server shell, mounts client    │
│  app/battle/_scene/                Game-surface components (11→10)│
│    BattleScene.tsx (orchestrator · v1 redrawn around new flow)   │
│    EntryScreen.tsx                 (FR-1 · "Enter the Tide")     │
│    ElementQuiz.tsx                 (FR-2 · 5 questions)          │
│    BattleField.tsx                 (FR-3 · spatial arena)        │
│    BattleHand.tsx                  (FR-4 · 5-card lineup)        │
│    CardPetal.tsx                   (FR-5 · holographic tilt)     │
│    OpponentZone.tsx                (FR-6 · face-down lineup)     │
│    TurnClock.tsx                   (FR-7 · clash beat)           │
│    ArenaSpeakers.tsx               (FR-8 · spatial caretaker)    │
│    Guide.tsx                       (FR-9+FR-10 merged · Q-SDD-8) │
│    ResultScreen.tsx                (FR-11 · "tide favored X")    │
│  app/battle/_inspect/              Dev-tuning surfaces (Q-SDD-7) │
│    DevConsole.tsx                  (FR-21 · backtick + ?dev=1)   │
│    KaironicPanel.tsx               (FR-20 · moved from _scene)   │
│    SubstrateInspector.tsx          (NEW · Battle.current live)   │
│    SeedReplayPanel.tsx             (NEW · deterministic replay)  │
│    ComboDebug.tsx                  (NEW · per-position multipliers)│
│  app/battle/_scene/_element-classes.ts  (existing · static maps) │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│ LIB ZONE — HONEYCOMB SUBSTRATE                                   │
│                                                                   │
│  lib/honeycomb/                    The substrate                  │
│    battle.{port,live,mock}.ts      Phase machine (extended)       │
│    clash.{port,live,mock}.ts       NEW · FR-12                   │
│    opponent.{port,live,mock}.ts    NEW · FR-13                   │
│    match.{port,live,mock}.ts       NEW · FR-14                   │
│    wuxing.ts                       Pure constants (extended)      │
│    battlefield-geometry.ts         NEW · Q-SDD-2                  │
│    cards.ts                        Pure factory                   │
│    combos.ts                       Pure detection (extended w/ Garden grace) │
│    conditions.ts                   Pure 5 conditions             │
│    lineup.ts                       Pure validation               │
│    curves.ts                       puru-springs / kaironic vocab │
│    whispers.ts                     Persona/Futaba (fix FR-24)    │
│    seed.ts                         mulberry32 RNG                │
│  lib/runtime/                                                     │
│    runtime.ts                      Single Effect.provide site    │
│    react.ts                        useWeather etc.               │
│    battle.client.ts                useBattle + battleCommand     │
│    opponent.client.ts              NEW · useOpponent             │
│    match.client.ts                 NEW · useMatch                │
└──────────────────────────────────────────────────────────────────┘
```

## 3 · Honeycomb growth implementation (FR-12 · FR-13 · FR-14)

### 3.1 · Clash service (FR-12)

**File**: `lib/honeycomb/clash.port.ts`

```typescript
import { Context, type Effect, type Stream } from "effect";
import type { Card } from "./cards";
import type { BattleCondition } from "./conditions";
import type { Combo } from "./combos";
import type { Element } from "./wuxing";

export interface ClashCard {
  readonly card: Card;
  readonly position: number;        // 0..4
  readonly basePower: number;
  readonly resonance?: number;
}

export interface ClashResult {
  readonly p1Card: ClashCard;
  readonly p2Card: ClashCard;
  readonly p1Power: number;          // post-multiplier
  readonly p2Power: number;
  readonly shift: number;             // |p1Power - p2Power|
  readonly loser: "p1" | "p2" | "draw";
  readonly interaction: "generates" | "overcomes" | "generated_by" | "overcome_by" | "same" | "neutral";
  readonly vfx: "shimmer" | "burst" | "shatter" | "tide";
}

export interface RoundResult {
  readonly round: number;
  readonly clashes: readonly ClashResult[];
  readonly eliminated: readonly string[];     // card ids
  readonly survivors: { p1: readonly Card[]; p2: readonly Card[] };
  readonly chainBonusAtRoundStart: number;
  readonly chainBonusAtRoundEnd: number;
  readonly gardenGraceFired: boolean;
}

export interface ResolveRoundInput {
  readonly p1Lineup: readonly Card[];
  readonly p2Lineup: readonly Card[];
  readonly weather: Element;
  readonly condition: BattleCondition;
  readonly round: number;
  readonly seed: string;
  readonly p1CombosAtRoundStart: readonly Combo[];
  readonly p2CombosAtRoundStart: readonly Combo[];
  readonly previousChainBonus?: number;        // for Garden grace
}

export class Clash extends Context.Tag("purupuru-ttrpg/Clash")<
  Clash,
  {
    readonly resolveRound: (input: ResolveRoundInput) => Effect.Effect<RoundResult>;
    readonly applyCondition: (clashes: readonly ClashResult[], condition: BattleCondition) => readonly ClashResult[];
    readonly emit: Stream.Stream<RoundResult>;
  }
>() {}
```

**Implementation rules** (`lib/honeycomb/clash.live.ts`):

- `resolveRound` is **pure given seed** — same `(seed, round, lineups, weather, condition, combos)` → identical `RoundResult`
- Number-of-clashes = `min(p1Lineup.length, p2Lineup.length)`
- Clashes simultaneous; losers eliminated atomically; numbers-advantage breaks draws (per AC-4)
- R3 transcendence cards immune to numbers-advantage tiebreak (AC-4)
- Metal "Precise" condition: largest shift × 2 (AC-4)
- Forge auto-counter: read opponent element, become Kè-relationship element (AC-4)
- Void mirror: copy opponent base power + card type (AC-4)
- Garden grace: when Garden survives the round, `chainBonusAtRoundEnd = chainBonusAtRoundStart` regardless of card elimination (AC-4)
- Whispers fire via the existing `whispers.ts` · seed = `hashSeed(matchSeed, round, "clash")` (FR-24 determinism)

**Test contract** (`lib/honeycomb/__tests__/clash.test.ts`):

Each invariant from `~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md` is a dedicated `it()`:

| Invariant | Test name |
|---|---|
| Clashes per round = min(p1, p2) | `it("clash count equals min lineup size")` |
| At least one elimination per round | `it("no zero-elimination rounds")` |
| Numbers advantage breaks draws | `it("numbers advantage breaks draws")` |
| R3 transcendence immune to numbers tiebreak | `it("R3 transcendence immune to numbers-advantage tiebreak")` |
| Metal Precise doubles largest shift | `it("Metal Precise doubles largest clash shift")` |
| Each condition operative | `it("Wood Growing scales late positions")` etc × 5 |
| Forge auto-counters opponent element | `it("Forge becomes Kè-counter element vs Fire")` etc × 5 |
| Void mirrors opponent power | `it("Void matches Jani power")` |
| Garden grace carries chain bonus | `it("Garden survives → chain bonus retained at round end")` |
| Type power hierarchy | `it("transcendence > jani > caretaker_b > caretaker_a")` |

≥ 25 dedicated tests (per AC-4 strengthening).

### 3.2 · Opponent service (FR-13 · D11 parameterized policy)

**File**: `lib/honeycomb/opponent.port.ts`

```typescript
import { Context, type Effect } from "effect";
import type { Card } from "./cards";
import type { Element } from "./wuxing";

export interface PolicyCoefficients {
  readonly aggression: number;          // 0..1 · prob of position-1 jani / setup-strike
  readonly chainPreference: number;     // 0..1 · weight toward Shēng chain
  readonly surgePreference: number;     // 0..1 · weight toward single-element surge
  readonly weatherBias: number;          // 0..1 · weight toward weather-blessed picks
  readonly rearrangeRate: number;        // 0..1 · prob of inter-round rearrangement
  readonly varianceTarget: number;       // [0,1] · target lineup variance (Earth low, Water high)
}

/** Per-element policy table · D11 · operator-tunable via DialKit at runtime. */
export const POLICIES: Record<Element, PolicyCoefficients> = {
  fire:  { aggression: 0.75, chainPreference: 0.3, surgePreference: 0.2,  weatherBias: 0.4, rearrangeRate: 0.4, varianceTarget: 0.8 },
  earth: { aggression: 0.2,  chainPreference: 0.4, surgePreference: 0.55, weatherBias: 0.3, rearrangeRate: 0.15, varianceTarget: 0.2 },
  wood:  { aggression: 0.3,  chainPreference: 0.7, surgePreference: 0.2,  weatherBias: 0.55, rearrangeRate: 0.3,  varianceTarget: 0.5 },
  metal: { aggression: 0.5,  chainPreference: 0.45, surgePreference: 0.4, weatherBias: 0.35, rearrangeRate: 0.25, varianceTarget: 0.4 },
  water: { aggression: 0.4,  chainPreference: 0.55, surgePreference: 0.25, weatherBias: 0.7, rearrangeRate: 0.85, varianceTarget: 0.7 },
};

export interface OpponentArrangement {
  readonly lineup: readonly Card[];
  readonly rationale: string;            // for ComboDebug / SubstrateInspector
}

export class Opponent extends Context.Tag("purupuru-ttrpg/Opponent")<
  Opponent,
  {
    readonly buildLineup: (
      collection: readonly Card[],
      element: Element,
      weather: Element,
      seed: string,
    ) => Effect.Effect<OpponentArrangement>;
    readonly rearrange: (
      currentLineup: readonly Card[],
      element: Element,
      weather: Element,
      seed: string,
      round: number,
    ) => Effect.Effect<OpponentArrangement>;
  }
>() {}
```

**Implementation rules** (`lib/honeycomb/opponent.live.ts`):

- `buildLineup` uses `rngFromSeed(seed)` for all stochastic decisions
- Scoring function: each candidate lineup gets a score = `aggression × frontRowFit + chainPreference × shengChainScore + surgePreference × surgeMatch + weatherBias × weatherMatch` — picks the max-scored arrangement after sampling N candidates (N=24 by default · tunable via DialKit)
- `rearrange` triggered with probability `rearrangeRate` between rounds; reuses scoring on survivors
- NO network calls · NO LLM · deterministic given seed (D11 / AC-5)

**Behavioral fingerprint tests** (`lib/honeycomb/__tests__/opponent.test.ts`) (flatline-r1 · IMP-005 + SKP-002):

Per AC-5 — measurement methodology hardened to prevent flakes:

**Sample size**: 50 matches per element-AI vs deterministic player seed-sweep (each match uses `seed = "${baseSeed}-${i}"` for `i in 0..49`). 50 is justified by Wilson-interval coverage: for a target rate of 0.7 with 95% CI half-width ≤ 0.10, N=50 is the minimum (Wilson formula).

**Statistical bound (not point estimate)**: Use Wilson 95% lower-bound, not raw rate. Wilson approximation:

```typescript
function wilsonLowerBound(successes: number, n: number, z = 1.96): number {
  const p = successes / n;
  const denom = 1 + z * z / n;
  return (p + z * z / (2 * n) - z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / denom;
}
```

**Per-element assertions (use Wilson lower bound, not raw rate)**:

| Element | Assertion (Wilson 95% LB) |
|---|---|
| Fire | `wilsonLB(frontRowAggressionCount, 50) >= 0.6` (loose enough to absorb 3-flip flakes per 50 matches; tight enough to reject Earth-AI-mislabeled-as-Fire) |
| Earth | `avgLineupVariance(50) < populationMean - 0.5 × populationStdDev` |
| Wood | `wilsonLB(caretakerJaniSequenceCount, 50) >= 0.5` |
| Metal | `wilsonLB(largestClashPositionOptimizationCount, 50) >= 0.7` |
| Water | `interRoundRearrangementRate >= 2 × otherElementsMean - flakeTolerance` (flakeTolerance = 1 stddev) |

**Deterministic replay variant for CI** (the version of the test that runs every PR): a fixed `baseSeed = "behavioral-fingerprint-canon-v1"` produces a snapshot manifest at `tests/fixtures/opponent-fingerprint-snapshot.json`. CI asserts current run produces byte-identical snapshot. If intentional change (e.g., AI policy tuning at S6), regenerate snapshot via `pnpm test:fingerprint-snapshot` + commit the new file. Flake-free because deterministic; behavior-evolution-friendly because regenerable.

**Population statistics fixture** (`tests/fixtures/opponent-population-stats.json`): pre-computed from 500-match population sweep (50 × 10 base-seeds). Stores `populationMean`, `populationStdDev` per fingerprint metric. Used by the Earth-variance + Water-rearrange-vs-others assertions.

### 3.3 · Match service (FR-14)

**File**: `lib/honeycomb/match.port.ts`

```typescript
import { Context, type Effect, type Stream } from "effect";
import type { Card } from "./cards";
import type { BattleCondition } from "./conditions";
import type { RoundResult } from "./clash.port";
import type { Element } from "./wuxing";

export type MatchPhase =
  | "idle"
  | "entry"           // EntryScreen (FR-1)
  | "quiz"            // ElementQuiz (FR-2 · first-time only)
  | "select"          // CollectionGrid (existing)
  | "arrange"         // BattleHand / BattleField (FR-3/4)
  | "committed"       // both lineups locked
  | "clashing"        // animated clash sequence (NEW)
  | "disintegrating"  // 敗 stamp + card dissolve (NEW)
  | "between-rounds"  // rearrange survivors (NEW)
  | "result";         // ResultScreen (FR-11 · NEW)

export interface MatchSnapshot {
  readonly phase: MatchPhase;
  readonly seed: string;
  readonly weather: Element;
  readonly opponentElement: Element;
  readonly condition: BattleCondition;
  readonly playerElement: Element | null;   // from ElementQuiz; null if not yet completed
  readonly hasSeenTutorial: boolean;
  readonly collection: readonly Card[];
  readonly selectedIndices: readonly number[];
  readonly p1Lineup: readonly Card[];
  readonly p2Lineup: readonly Card[];
  readonly currentRound: number;
  readonly rounds: readonly RoundResult[];
  readonly winner: "p1" | "p2" | "draw" | null;
}

export type MatchEvent =
  | { _tag: "phase-entered"; phase: MatchPhase; at: number }
  | { _tag: "player-element-chosen"; element: Element }
  | { _tag: "tutorial-completed" }
  | { _tag: "lineups-locked" }
  | { _tag: "clash-resolved"; result: RoundResult }
  | { _tag: "round-ended"; round: number; eliminated: readonly string[] }
  | { _tag: "match-completed"; winner: "p1" | "p2" | "draw" };

export type MatchCommand =
  | { _tag: "begin-match"; seed?: string }
  | { _tag: "choose-element"; element: Element }
  | { _tag: "complete-tutorial" }
  | { _tag: "lock-in" }
  | { _tag: "advance-clash" }
  | { _tag: "advance-round" }
  | { _tag: "reset-match"; seed?: string };

export class Match extends Context.Tag("purupuru-ttrpg/Match")<
  Match,
  {
    readonly current: Effect.Effect<MatchSnapshot>;
    readonly events: Stream.Stream<MatchEvent>;
    readonly invoke: (cmd: MatchCommand) => Effect.Effect<void>;
  }
>() {}
```

**Match orchestrates Battle + Clash + Opponent** — wires the phase transitions, calls into clash/opponent at the right beats, persists `playerElement` and `hasSeenTutorial` in `localStorage.compass.match` (with safe-guard for disabled storage per §3.4).

#### 3.3.1 · Phase × Command transition matrix (flatline-r1 · IMP-004)

The only valid `MatchCommand` for a given `MatchPhase`. Implementer rejects any `MatchCommand` not in the row with `BattleError { _tag: "wrong-phase" }`.

| Phase \ Command | begin | choose-elem | complete-tut | lock-in | advance-clash | advance-round | reset |
|---|---|---|---|---|---|---|---|
| `idle` | ✅ | — | — | — | — | — | ✅ |
| `entry` | — | (if first-time) | — | — | — | — | ✅ |
| `quiz` | — | ✅ | — | — | — | — | ✅ |
| `select` | — | — | (Guide tutorial) | (proceed-to-arrange) | — | — | ✅ |
| `arrange` | — | — | — | ✅ | — | — | ✅ |
| `committed` | — | — | — | — | ✅ (auto-advance) | — | ✅ |
| `clashing` | — | — | — | — | ✅ | — | ✅ |
| `disintegrating` | — | — | — | — | — | ✅ | ✅ |
| `between-rounds` | — | — | — | (re-lock) | — | — | ✅ |
| `result` | (re-begin) | — | — | — | — | — | ✅ |

Pure helper in `match.live.ts`:

```typescript
function isValidTransition(phase: MatchPhase, cmd: MatchCommand): boolean {
  // Implementation: exhaustive switch over (phase, cmd) — caller must handle
  // false return with Effect.fail({_tag: "wrong-phase", current: phase, expected: validCommandsFor(phase)})
}
```

#### 3.3.2 · Compile-time BattlePhase consumer enforcement (flatline-r1 · SKP-003 · R11)

The grep-based audit from PRD r1 R11 is upgraded to compile-time enforcement. Every consumer of `BattlePhase` (or `MatchPhase`) MUST end its switch with a `never`-assert:

```typescript
function describePhase(phase: BattlePhase): string {
  switch (phase) {
    case "idle": return "stillness";
    case "select": return "selecting";
    case "arrange": return "arranging";
    case "preview": return "previewing";
    case "committed": return "committed";
    default: {
      const _exhaustive: never = phase;  // 🛡 add new phase → compile error
      throw new Error(`unhandled phase: ${_exhaustive as string}`);
    }
  }
}
```

**ESLint rule** (S1 task · `eslint.config.mjs`): a custom rule `purupuru/exhaustive-phase-switch` flags any `switch (phase)` over a `BattlePhase` or `MatchPhase` typed value missing a `default` branch with `never`-assert.

If the ESLint custom-rule effort is high (>1 day estimated at S1), fall back to runtime `match-phase-audit.test.ts` that fuzz-tests every consumer with every phase value. Either path closes SKP-003.

#### 3.3.3 · Transcendence interaction collision matrix (flatline-r1 · SKP-006)

When 2+ transcendence cards collide in the SAME clash (rare but possible: both players play one in same lineup position), resolution order:

1. **The Forge (克)** reads first · becomes Kè-counter of opponent element
2. **The Void (無)** reads second · mirrors opponent's NOW-RESOLVED type (so Void-vs-Forge → Void becomes a Forge)
3. **The Garden (生)** survives if its side wins this clash; carries chain bonus regardless

Forge-vs-Forge: both auto-counter; both become each other's Kè-counter; resolves as element-mirror (same element after counter) → numbers-advantage tiebreak.

Forge-vs-Garden: Forge plays as Kè-counter of Garden's effective element (which is Wood). Garden plays its base. Clash resolves normally; Garden's grace effect fires regardless of outcome.

Void-vs-Garden: Void mirrors Garden's type+power. Clash resolves as Garden-vs-Garden (tie). Numbers-advantage tiebreak.

Test contract: `lib/honeycomb/__tests__/transcendence-collisions.test.ts` enumerates all 9 pairings (Forge·Garden·Void × Forge·Garden·Void) and asserts each resolution.

### 3.4 · Error handling & SSR safety (flatline-r1 · T1 · IMP-001 + IMP-002)

#### 3.4.1 · localStorage schema + SSR-safe wrapper

`lib/honeycomb/storage.ts` (NEW):

```typescript
export interface CompassMatchStorage {
  readonly version: 1;
  readonly playerElement: Element | null;
  readonly hasSeenTutorial: boolean;
  readonly dismissedHints: readonly string[];
}

const STORAGE_KEY = "compass.match.v1";

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;  // private mode / disabled / quota / Safari incognito
  }
}

export function readMatchStorage(): CompassMatchStorage {
  const fallback: CompassMatchStorage = {
    version: 1,
    playerElement: null,
    hasSeenTutorial: false,
    dismissedHints: [],
  };
  if (!isStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as CompassMatchStorage;
    if (parsed.version !== 1) return fallback;  // future: migrate
    return parsed;
  } catch {
    return fallback;  // corrupt JSON / wrong shape
  }
}

export function writeMatchStorage(state: CompassMatchStorage): void {
  if (!isStorageAvailable()) return;  // graceful no-op
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or other write failure — silent; state lives in-memory only
  }
}
```

**Versioning**: `version: 1` field reserved for future migrations. When a v2 schema lands, `readMatchStorage` switches on the version and migrates v1 → v2 in-place.

**Failure modes handled**:
- SSR (no `window`) → returns fallback
- localStorage disabled (private mode, browser policy) → returns fallback
- Quota exceeded → write is no-op
- Corrupt JSON → returns fallback
- Wrong shape / wrong version → returns fallback

#### 3.4.2 · Asset load failure UX

`app/battle/_scene/_asset.tsx` (NEW pattern · used by CardPetal, EntryScreen):

```typescript
"use client";

import { useState } from "react";

export function ResilientImage({
  src,
  alt,
  fallback,
  ...rest
}: { src: string; alt: string; fallback?: string } & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [errored, setErrored] = useState(false);
  if (errored && !fallback) return null;
  return (
    <img
      src={errored && fallback ? fallback : src}
      alt={alt}
      onError={() => setErrored(true)}
      loading="lazy"
      {...rest}
    />
  );
}
```

For element-tinted card slots, the fallback is an OKLCH-token-driven CSS gradient (no asset required). For caretaker portraits, the fallback is the element kanji glyph at large size.

#### 3.4.3 · Clash state corruption

If `clash.live.ts` produces an invalid `RoundResult` (e.g., negative power, eliminated card not in either lineup, more clashes than min-lineup), Effect's typed error channel surfaces:

```typescript
type ClashError =
  | { _tag: "invariant-violation"; check: string; context: object }
  | { _tag: "unexpected-result-shape"; reason: string };
```

`Match.invoke({ _tag: "advance-clash" })` catches `ClashError` and transitions to a `RecoverableErrorScreen` (NEW component) that offers: [Restart match] / [Report bug] / [Force-resolve as draw]. The recoverable state preserves the seed so the operator/user can reproduce the issue.

`grimoires/loa/notes/clash-error-recovery.md` (S1 deliverable): documents each error tag and the user-facing recovery copy.

**BattlePhase consumer audit (R11)**: `Battle.invoke` extended with new phases requires every consumer to handle them or use a never-assert:

```typescript
// In any switch over BattlePhase:
switch (phase) {
  case "idle": ...
  case "select": ...
  // ... all phases ...
  default:
    const _exhaustive: never = phase;  // compile error if new phase added
    return _exhaustive;
}
```

This pattern enforces by S2 close · grep verifies (`grep -rn "BattlePhase" lib/ | grep "switch"` returns all sites).

## 4 · Component migration patterns (Svelte → React idiom catalog)

These patterns are produced by S0 spike and verified across all 10 component ports (FR-1 through FR-11, minus FR-9/10 merge per Q-SDD-8).

### 4.1 · Reactivity translation

| Svelte 5 | React 19 | Notes |
|---|---|---|
| `let count = $state(0)` | `const [count, setCount] = useState(0)` | Each `$state` becomes a useState pair |
| `let doubled = $derived(count * 2)` | `const doubled = useMemo(() => count * 2, [count])` | Manual dep array |
| `$effect(() => { ... })` | `useEffect(() => { ... }, [deps])` | Cleanup is `return () => {...}` in both |
| `$bindable` two-way binding | controlled component pattern: pass `value` + `onChange` | No clean React equivalent |
| store auto-subscribe (`$store`) | `useSyncExternalStore` OR Effect's `useBattle`-style hook | Honeycomb's port shape covers most stores |
| `{#if}` `{#each}` `{#await}` | JSX conditional / `.map()` / Suspense / `<Await>` | Mechanical |
| `on:click` event modifier | `onClick={(e) => { ... }}` | Mechanical |
| `bind:this` | `useRef<HTMLDivElement>(null)` | Mechanical |

### 4.2 · Effect-to-React idiom (existing prior art)

`lib/runtime/battle.client.ts` (shipped previous turn) is the canonical pattern. Same shape for `match.client.ts` and `opponent.client.ts`:

```typescript
// useMatch hook (mirror of useBattle)
export function useMatch(): MatchSnapshot | null {
  const [snapshot, setSnapshot] = useState<MatchSnapshot | null>(null);
  useEffect(() => {
    const fiber = runtime.runFork(
      Effect.gen(function* () {
        const m = yield* Match;
        const initial = yield* m.current;
        setSnapshot(initial);
        yield* Stream.runForEach(m.events, (event) =>
          Effect.gen(function* () {
            const next = yield* m.current;
            yield* Effect.sync(() => setSnapshot(next));
          }),
        );
      }),
    );
    return () => { runtime.runFork(Fiber.interrupt(fiber)); };
  }, []);
  return snapshot;
}
```

### 4.3 · Drag-reorder (BattleField / BattleHand)

Svelte uses native HTML5 drag events; React translation in `LineupTray.tsx` (shipped) is the prior art. The S0 spike validates this pattern at BattleField scale (5 cards in spatial zones, not 1D row).

Pattern:
- `onDragStart` / `onDragOver` / `onDrop` on each card slot
- Layout animation via `motion`'s `layout` prop (already in `LineupTray.tsx`)
- Drop dispatches `battleCommand.rearrange(fromIdx, toIdx)` to the substrate

### 4.4 · Per-component port table (informational · S2-S7 task contracts)

| FR | World-purupuru source | Compass dest | Estimated LOC (post-spike calibration) | Sprint |
|---|---|---|---|---|
| FR-1 | `lib/battle/EntryScreen.svelte` | `app/battle/_scene/EntryScreen.tsx` | ~200 | S3 |
| FR-2 | `lib/battle/ElementQuiz.svelte` | `app/battle/_scene/ElementQuiz.tsx` | ~350 | S3 |
| FR-3 | `lib/battle/BattleField.svelte` + `(immersive)/battle/+page.svelte` | `app/battle/_scene/BattleField.tsx` | **calibrated at S0** | S2 |
| FR-4 | `lib/battle/BattleHand.svelte` | `app/battle/_scene/BattleHand.tsx` (evolves `LineupTray.tsx`) | ~250 | S2 |
| FR-5 | `lib/battle/CardPetal.svelte` | `app/battle/_scene/CardPetal.tsx` | ~300 | S5 |
| FR-6 | `lib/battle/OpponentZone.svelte` | `app/battle/_scene/OpponentZone.tsx` | ~200 | S4 |
| FR-7 | `lib/battle/TurnClock.svelte` | `app/battle/_scene/TurnClock.tsx` | ~150 | S4 |
| FR-8 | `lib/battle/ArenaSpeakers.svelte` | `app/battle/_scene/ArenaSpeakers.tsx` (evolves `WhisperBubble.tsx`) | ~180 | S4 |
| FR-9+10 | `HelpCarousel.svelte` + `Tutorial.svelte` | `app/battle/_scene/Guide.tsx` (MERGED per Q-SDD-8) | ~400 | S6 |
| FR-11 | `lib/battle/ResultScreen.svelte` | `app/battle/_scene/ResultScreen.tsx` | ~250 | S6 |

Total estimated React surface: **~2,280 LOC** + ~3,500 LOC for the 3 Honeycomb growth ports + tests + dev panel = **~6,000-7,500** matching PRD r1 AC-14.

## 5 · S0 calibration spike spec (D9)

### 5.1 · Target

**BattleField with placeholder cards** (operator-chose-this).

### 5.2 · Deliverable

`app/battle/_scene/BattleField.tsx` (working draft · not yet wired into BattleScene). Reads from a stubbed Match.current snapshot (5 cards in spatial positions). Supports drag-to-reorder between zones. Uses element-tinted zone backgrounds from `app/battle/_scene/_element-classes.ts`. Uses motion `layout` for spring-driven reorder animations.

### 5.3 · Calibration outputs

Three documents authored at S0 close:

1. **`grimoires/loa/notes/s0-spike-translation-catalog.md`** — every Svelte idiom encountered in the BattleField port + its React equivalent + LOC ratio (compass-React-LOC / world-purupuru-Svelte-LOC). The implementer agent + operator BOTH use this as the translation reference for S2-S7.
2. **`grimoires/loa/notes/s0-spike-loc-projection.md`** — per-component LOC projection using the spike's measured ratio against the per-component Svelte source line counts. Compares projection to AC-14 budget (+7,500). If projection > AC-14, spec recalibration trigger.
3. **`grimoires/loa/notes/s0-spike-time-tracking.md`** — clock-time spent per spike sub-task (drag setup, motion integration, element-class wiring, snapshot stubbing, etc.). Feeds D7 timebox decisions in the sprint plan.

### 5.4 · Gates (D9 · MUST pass before S1)

- Spike ≤ **2 working days** of operator clock-time
- LOC projection ≤ **+7,500** in compass (AC-14)
- Operator confirms the translation feels tractable

If any gate fails: pause cycle, present options [recalibrate / split into 2 cycles / reduce scope].

### 5.5 · NOT in S0

- Not wired into BattleScene
- Not connected to real Match service (stub snapshot suffices)
- Not visually-polished (placeholder card frames OK)
- Not asset-bound (S6 wires assets)
- No unit tests required (spike is calibration, not deliverable)

### 5.6 · Asset-sync test-tarball (flatline-r1 · T4 · IMP-003 + SKP-010)

Asset extraction is at S6 (PRD D10), but S0 validates the **contract** with a 1-file test tarball. This proves `scripts/sync-assets.sh` works before we commit to S6's full extraction.

**S0 deliverable**:
1. Operator manually creates `purupuru-assets-v0.0.1-test.tar.gz` containing one PNG (e.g., copy `public/art/puruhani/puruhani-fire.png`)
2. Hosts on GitHub release of a throwaway repo (operator-owned) OR locally at `file:///path/to/test.tar.gz`
3. Compass `scripts/sync-assets.sh` runs against this URL; SHA verifies; extraction succeeds; one file lands in `public/art-test/`
4. Document time-spent in `s0-spike-time-tracking.md`

**Outcome**: contract validated. S1 locks the convention. S6 just scales up.

### 5.7 · S0 escape valves (flatline-r1 · T5 · SKP-001)

If S0 spike runs short of full calibration but partial output is usable:

| Scenario | Decision |
|---|---|
| Spike ≤ 1 day, BUT translation patterns clear, LOC ratio measurable | GO — proceed to S1 with confidence interval |
| Spike runs 2 days exactly, BattleField partial (drag works, motion incomplete) | CONDITIONAL GO — split S1: typed Honeycomb ports first, motion-polish defers to S2 |
| Spike runs 2 days, BattleField broken / un-translatable | NO-GO — present split-cycle option to operator (foundation cycle then game cycle) |
| Spike runs 3+ days exposing fundamental Svelte→React friction (e.g., $effect cleanup race) | NO-GO — recalibrate cycle scope or technology choice (consider Solid/Qwik instead of React?) |

Operator pair-point at S0 close evaluates against this table; output: GO / CONDITIONAL / NO-GO into a decision-receipt at `grimoires/loa/notes/s0-spike-decision.md`.

## 6 · Asset library extraction (D2 · D10 · executed at S6)

### 6.1 · Repository creation (S6 first checkpoint)

```bash
gh repo create project-purupuru/purupuru-assets --public --description "Shared asset library for purupuru-family apps · synced via tagged tarballs · NOT submodule"
cd purupuru-assets
git init
mkdir -p public/{art/{cards,element-effects,puruhani,jani,bears,patterns,art-panels},brand,fonts,data/materials}
# Copy from world-purupuru as source-of-truth
cp -r ~/Documents/GitHub/world-purupuru/public/art/* public/art/
cp -r ~/Documents/GitHub/world-purupuru/public/brand/* public/brand/
cp -r ~/Documents/GitHub/world-purupuru/public/fonts/* public/fonts/
cp -r ~/Documents/GitHub/world-purupuru/public/data/materials/* public/data/materials/
```

### 6.2 · Manifest format (`MANIFEST.json` at repo root)

```json
{
  "version": "1.0.0",
  "files": [
    { "path": "public/art/cards/frame-common.svg", "sha256": "abc123...", "bytes": 4521 },
    { "path": "public/art/puruhani/puruhani-fire.png", "sha256": "def456...", "bytes": 18421 }
  ],
  "total_files": 147,
  "total_bytes": 8421337,
  "released_at": "2026-05-12T12:00:00Z"
}
```

Generated by `purupuru-assets/scripts/build-manifest.sh` (commits the manifest with each release).

### 6.3 · Release procedure (purupuru-assets repo)

```bash
git tag v1.0.0
bash scripts/build-manifest.sh > MANIFEST.json
tar -czf purupuru-assets-v1.0.0.tar.gz public/
sha256sum purupuru-assets-v1.0.0.tar.gz > purupuru-assets-v1.0.0.tar.gz.sha256
gh release create v1.0.0 purupuru-assets-v1.0.0.tar.gz purupuru-assets-v1.0.0.tar.gz.sha256
```

### 6.4 · Compass pin file (`.assets-version` at repo root)

```
v1.0.0
```

Single-line file. Read by `scripts/sync-assets.sh`.

### 6.5 · sync-assets.sh contract (compass `scripts/sync-assets.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

VERSION=$(cat .assets-version)
TARBALL_URL="https://github.com/project-purupuru/purupuru-assets/releases/download/${VERSION}/purupuru-assets-${VERSION}.tar.gz"
SHA_URL="${TARBALL_URL}.sha256"

# 1. Download tarball + sha
curl -sfL -o "/tmp/purupuru-assets-${VERSION}.tar.gz" "$TARBALL_URL"
curl -sfL -o "/tmp/purupuru-assets-${VERSION}.tar.gz.sha256" "$SHA_URL"

# 2. Verify sha256
EXPECTED=$(cat "/tmp/purupuru-assets-${VERSION}.tar.gz.sha256" | awk '{print $1}')
ACTUAL=$(sha256sum "/tmp/purupuru-assets-${VERSION}.tar.gz" | awk '{print $1}')
if [[ "$EXPECTED" != "$ACTUAL" ]]; then
    echo "FAIL: sha256 mismatch. Expected $EXPECTED, got $ACTUAL. Preserving existing public/" >&2
    rm -f "/tmp/purupuru-assets-${VERSION}.tar.gz" "/tmp/purupuru-assets-${VERSION}.tar.gz.sha256"
    exit 1  # Rollback contract per FR-19.5
fi

# 3. Extract (atomic: stage to temp, then swap)
STAGE=$(mktemp -d)
tar -xzf "/tmp/purupuru-assets-${VERSION}.tar.gz" -C "$STAGE"

# 4. Swap atomic
for dir in art brand fonts data/materials; do
    if [[ -d "$STAGE/public/$dir" ]]; then
        rm -rf "public/$dir"
        mv "$STAGE/public/$dir" "public/$dir"
    fi
done

rm -rf "$STAGE" "/tmp/purupuru-assets-${VERSION}.tar.gz" "/tmp/purupuru-assets-${VERSION}.tar.gz.sha256"
echo "OK · synced public/ from purupuru-assets@${VERSION}"
```

### 6.6 · World-purupuru wiring (stretch · FR-17 demoted)

If S6 completes early: replicate `scripts/sync-assets.sh` in world-purupuru's `sites/world/`, commit the `.assets-version` pin. Run sync, verify no diff against current world-purupuru asset state. If diff: investigate (likely world-purupuru has uncommitted local edits — flag for Gumi).

If S6 doesn't complete early: AC-9 is documented as stretch in PRD; follow-up cycle handles world-purupuru migration.

### 6.7 · S1 path-convention lock + CI grep (flatline-r1 · T4 · SKP-010)

Even though full asset extraction is at S6, **at S1 close** we lock the asset-path convention via a CI check. This catches divergence early.

**S1 deliverable**:
1. `scripts/check-asset-paths.sh` — greps `app/`, `lib/`, `public/` for any reference to `public/art/`, `public/data/materials/`, `public/fonts/`, `public/brand/`. Asserts every reference resolves to a path that will exist after S6 extraction (per the canonical world-purupuru directory tree).
2. GitHub Actions step `.github/workflows/asset-paths.yml` runs `check-asset-paths.sh` on every PR.
3. `purupuru-assets/MANIFEST.json` schema is locked at S1 (even though repo doesn't exist yet) — schema lives at `grimoires/loa/schemas/asset-manifest.schema.json` and S6 honors it.

**Output**: by S6, asset extraction is plug-and-play because paths and manifest are already locked. SKP-010 risk closed.

## 7 · Dev panel relocation (FR-20-22.5)

### 7.1 · DevConsole orchestrator

**File**: `app/battle/_inspect/DevConsole.tsx`

```typescript
"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KaironicPanel } from "./KaironicPanel";
import { SubstrateInspector } from "./SubstrateInspector";
import { SeedReplayPanel } from "./SeedReplayPanel";
import { ComboDebug } from "./ComboDebug";

type Tab = "kaironic" | "substrate" | "seed" | "combo";

export function DevConsole() {
  const params = useSearchParams();
  const [open, setOpen] = useState(params.get("dev") === "1");
  const [tab, setTab] = useState<Tab>("kaironic");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`" && !(e.target instanceof HTMLInputElement)) {
        setOpen((o) => !o);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="region"
          aria-label="Developer console"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed top-0 right-0 h-dvh w-[320px] z-[100] bg-puru-cloud-bright/95 backdrop-blur shadow-puru-tile p-4 overflow-y-auto"
        >
          {/* Tabs + content per Tab type */}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
```

### 7.2 · Mount point

`app/battle/page.tsx` server component renders `<BattleScene />` AND `<DevConsole />`:

```typescript
import { BattleScene } from "./_scene/BattleScene";
import { DevConsole } from "./_inspect/DevConsole";

export default function BattlePage() {
  return <>
    <BattleScene />
    <DevConsole />
  </>;
}
```

### 7.3 · Production build env-flag (optional · Q-SDD-7 secondary)

DevConsole can be tree-shaken via `process.env.NEXT_PUBLIC_DEV_CONSOLE === "off"` check at module top:

```typescript
if (process.env.NEXT_PUBLIC_DEV_CONSOLE === "off") {
  // Export a no-op that React tree-shakes
  export function DevConsole() { return null; }
}
```

Default: on. Operator's call when shipping to production.

### 7.4 · Backtick collision handling (R9 mitigation)

The keypress handler checks `e.target instanceof HTMLInputElement` and `instanceof HTMLTextAreaElement` to skip when typing in form fields. The `?dev=1` query param is the documented fallback for AZERTY / extensions.

## 8 · Whisper determinism fix (FR-24 / AC-12)

### 8.1 · Problem (already in `lib/honeycomb/whispers.ts`)

Current `battle.live.ts` calls `whisper(playerElement, mood, Math.floor(Math.random() * 1_000_000))`. The `Math.random` breaks seed-replay (per AC-12).

### 8.2 · Fix

Pass a deterministic counter derived from the match seed + phase-transition index:

```typescript
// In match.live.ts
let whisperCounter = 0;
const emitWhisper = (mood: WhisperMood): Effect.Effect<void> =>
  Effect.gen(function* () {
    const snap = yield* Ref.get(stateRef);
    const seedNum = hashStringToInt(`${snap.seed}|${whisperCounter++}|${mood}`);
    const line = whisper(snap.playerElement ?? snap.weather, mood, seedNum);
    // ... publish event ...
  });
```

`hashStringToInt` is the existing helper from `seed.ts`. Counter persisted in `MatchSnapshot.whisperCounter` so replay reproduces.

### 8.3 · Test (`lib/honeycomb/__tests__/whispers-determinism.test.ts`)

```typescript
it("same seed → same whisper sequence across two match runs", async () => {
  const seed = "test-seed-001";
  const lines1 = await runMatchAndCollectWhispers(seed);
  const lines2 = await runMatchAndCollectWhispers(seed);
  expect(lines1).toEqual(lines2);
});
```

## 9 · Performance · accessibility · playability test plan

### 9.1 · Lighthouse (AC-15)

**Tool**: `lighthouse` (CLI · devDep).
**CI step** in `.github/workflows/battle-quality.yml`:

```yaml
- name: Lighthouse /battle
  run: |
    pnpm build && pnpm start &
    sleep 5
    npx lighthouse http://localhost:3000/battle --only-categories=performance --output=json --output-path=./lh.json --chrome-flags="--headless"
    node scripts/assert-lighthouse.mjs ./lh.json
```

`scripts/assert-lighthouse.mjs` parses JSON and asserts:
- Performance ≥ 80
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

Failures block the audit-sprint gate of the final sprint (AC-15).

### 9.2 · axe-core (AC-16)

**Tool**: `@axe-core/playwright` (devDep).
**Test**: `tests/e2e/battle-a11y.spec.ts`

```typescript
import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

test.describe("Battle a11y", () => {
  for (const phase of ["entry", "quiz", "battlefield", "result"]) {
    test(`${phase} has zero WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(`/battle?phase=${phase}`);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
```

### 9.3 · Playability checklist (AC-17)

**File**: `grimoires/loa/tests/playability-checklist.md`

| # | Check | Verification path |
|---|---|---|
| 1 | No console errors during a full match | Playwright `page.on('pageerror')` listener |
| 2 | Animations complete without jank (≥60fps during arrange + clash) | Playwright `--video=on` + visual eyeball + chrome devtools perf |
| 3 | Error boundary catches catastrophic state | Manual: throw in BattleScene render, verify ErrorBoundary fallback shows |
| 4 | Mid-match refresh handled (resume or restart) | Playwright reload during clash phase; assert ResultScreen OR restart UI shows |
| 5 | All 5 element-AIs played to completion at least once | Playwright sweep · 5 matches with different opponent elements |
| 6 | Rapid-input doesn't desync state | Playwright `.click({count: 10, delay: 0})` on select, assert state ≤5 selectedIndices |
| 7 | ResultScreen renders for win + lose + draw | Three forced-outcome matches |
| 8 | ElementQuiz persists in localStorage | Playwright completes quiz, reloads, asserts skip-quiz behavior |
| 9 | Tutorial fires for first-time match · re-triggerable from settings | Localstorage clear → play → assert tutorial appears; from settings (TBD) re-trigger |
| 10 | Guide hint-mode dismissible + persists dismissed state | Playwright dismiss; reload; assert no hint shown |
| 11 | Screen-reader announces phase transitions | axe-core ARIA assertions + manual VoiceOver pass |
| 12 | Keyboard-only completion of full match flow | Playwright `--no-mouse` simulation; complete a match with only Tab/Space/Enter/Arrows |

All 12 checks gated at final-sprint audit. Failure of any → audit fails (AC-17).

## 10 · Sprint task contracts (flatline-r1 · per-sprint LOC sub-budgets · S5.5 buffer added per SKP-008)

Per-sprint LOC budget = portion of AC-14 (+7,500 total). Sum = 7,500. Buffer of ~500 LOC in S5.5 absorbs spillover.

| Sprint | Theme | LOC sub-budget | Deliverables (acceptance: passes /review-sprint + /audit-sprint) |
|---|---|---|---|
| **S0** | Spike + cycle kickoff | +600 (BattleField draft + 3 notes) | (a) `app/battle/_scene/BattleField.tsx` working drag-reorder draft against stubbed Match snapshot; (b) `s0-spike-translation-catalog.md`, `s0-spike-loc-projection.md`, `s0-spike-time-tracking.md` at `grimoires/loa/notes/`; (c) `s0-spike-decision.md` GO/NO-GO per §5.7; (d) `scripts/sync-assets.sh` validated against 1-file test tarball per §5.6 |
| **S1** | Honeycomb growth | +2,400 (3 ports + tests + transition matrix + ESLint rule) | `lib/honeycomb/{clash,opponent,match}.{port,live,mock}.ts` + tests · BattlePhase consumer compile-time enforcement (ESLint rule OR runtime fuzz fallback per §3.3.2) · §3.3.1 transition matrix codified · §3.3.3 transcendence collision tests · Wired into `lib/runtime/runtime.ts` · AC-4 (clash invariants ≥25 tests · transcendence collision 9 pairings) + AC-5 (behavioral fingerprint per element · Wilson-bound + snapshot) green · `scripts/check-asset-paths.sh` + `.github/workflows/asset-paths.yml` + `grimoires/loa/schemas/asset-manifest.schema.json` per §6.7 |
| **S2** | BattleField + BattleHand | +1,000 | FR-3 + FR-4 ported (BattleField builds on S0 draft). CombosPanel inlined per FR-23. `app/battle/_scene/BattleHand.tsx` evolves `LineupTray.tsx`. |
| **S3** | EntryScreen + ElementQuiz | +800 | FR-1 + FR-2 ported. ElementQuiz content verbatim from world-purupuru per Q-SDD-5. `localStorage.compass.element` persistence via SSR-safe wrapper from §3.4. |
| **S4** | OpponentZone + TurnClock + ArenaSpeakers | +800 | FR-6 + FR-7 + FR-8 ported. ArenaSpeakers evolves WhisperBubble (FR-8 spatial extension). |
| **S5** | CardPetal + visual binding pass | +700 | FR-5 ported. All cards use placeholder element-tinted frames from compass's existing `public/art/cards/` (local copies still). Visual parity QA pass. |
| **S5.5** *(flatline-r1 NEW · buffer)* | Buffer · compress if healthy | +500 (max) | Absorb spillover from S2-S5 if any. If unused: extend to assist S6 (asset extraction proves harder than expected) or polish backlog from S2-S5 review feedback. **Operator decides at S5 close whether S5.5 fires** (full sprint) / compresses (1-2 day cleanup) / skips entirely. |
| **S6** | Asset extraction + ResultScreen + Guide | +700 | (a) Create purupuru-assets repo + first v1.0.0 release per §6; (b) Wire compass `scripts/sync-assets.sh` + `.assets-version` per §6.5 (already proven at S0); (c) FR-11 ResultScreen ported; (d) FR-9+10 merged `Guide.tsx` per Q-SDD-8. Cards switch from local copies to synced assets. |
| **S7** | Dev panel relocation + whisper det + final audit | +0 (mostly relocation, slight delta) | FR-20 through FR-22.5 (DevConsole + 4 tabs per Q-SDD-7). FR-24 whisper determinism per §8 (use `Ref<number>` for fiber safety per T6). Lighthouse CI step + axe-core E2E spec + playability checklist all pass. Final audit blocks the cycle COMPLETED marker. |

**Total LOC budget**: 600 + 2,400 + 1,000 + 800 + 800 + 700 + 500 + 700 + 0 = **7,500** (matches AC-14).

**S5.5 firing decision** (operator pair-point at S5 close):
- If S2-S5 net LOC ≤ +4,000 (i.e., +900 under sub-budget aggregate of +4,900): SKIP S5.5 — straight to S6
- If S2-S5 net LOC = +4,900 to +5,300: COMPRESS S5.5 to 1-2 day polish/test pass
- If S2-S5 net LOC > +5,300: FIRE S5.5 as full sprint (absorbs spillover, fixes accumulated review feedback)

## 11 · Open implementation questions (for /sprint-plan)

These are HOW-altitude questions left for /sprint-plan interview to resolve:

1. **OP-1**: Per-sprint timebox numeric values · the sprint-plan should propose specific operator-clock-time budgets (e.g., "S1 = 2 days · S2 = 3 days") informed by S0 spike output.
2. **OP-2**: `assert-lighthouse.mjs` thresholds — do we want stricter than AC-15 floor (Performance ≥80) for local-dev verification, or just CI-mode strict?
3. **OP-3**: ElementQuiz visual variant — port verbatim from world-purupuru styles, or apply compass's existing OKLCH tokens fresh? (cost difference: ~80 LOC).
4. **OP-4**: SubstrateInspector data shape · expose raw `Battle.current` snapshot JSON-pretty-printed, OR pre-formatted highlights (current phase + selectedIndices + lineup summary)?
5. **OP-5**: Tutorial-mode triggers — when exactly does the merged `Guide.tsx` switch from teach-by-doing to hint-mode? After first completed match? After first lock-in? After ElementQuiz?
6. **OP-6**: Stretch: should world-purupuru sync (FR-17 demoted) be filed as a sibling issue on `world-purupuru` repo NOW so Gumi sees it asynchronously?
7. **OP-7**: Error/boundary shape · IMP-008 deferred from PRD r1 — what's the user-facing error UX for localStorage disabled / asset 404 / clash state corruption?

---

> **Sources**: PRD r1 (`grimoires/loa/prd.md` · all decisions D1-D11 + AC-1-17 + FR-1-24 + R1-12) · flatline review artifact (`grimoires/loa/a2a/flatline/card-game-prd-opus-manual-2026-05-12.json`) · Phase 3 architectural discovery (4 operator-confirmed decisions) · existing compass code reality (`lib/honeycomb/*`, `lib/runtime/*`, `app/battle/*` shipped previous turn · commit `775acd5d` + `7db0fc34`) · world-purupuru source paths (read-only reference) · purupuru-game prototype invariants (`~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md`)
