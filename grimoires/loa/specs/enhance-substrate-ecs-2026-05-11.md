# Session N · Substrate ECS Cycle — Build Doc

> **The cycle goal: delete more code than we write. Name what's already half-here. Funnel through Effect.**
>
> Compass already has proto-ECS shape (`lib/sim/entities.ts:advanceBreath(entity, dtMs)` is literally a System function). This cycle formalizes the pattern, hoists duplication, and ships the doctrine as a construct pack so the next project inherits the move.

---

## Context

We just shipped the demo (commits `787ce05`..`41a4aaa` on main). The app works. The substrate is dirty:
- 190 lines of duplicate theme tokens in `globals.css`
- Element kanji + names redeclared in 3+ places
- Identical `localStorage` try/catch boilerplate in 3 modules
- 5 systems (`weatherFeed`, `populationStore`, `sonifier`, `activityStream`, route handlers) using imperative state that should funnel through Effect
- No barrel for `lib/sim/` so external readers can't find the system surface
- README at 416 lines with 41 em-dashes (operator flagged)

This cycle is **organizational and deletive**. No new behavior. Net LOC must be negative.

**The composition equation that drives everything:**

```
Effect Layer    ≡  ECS World
Effect Service  ≡  ECS System
Effect Schema   ≡  ECS Component
Port interface  ≡  Archetype query
```

We use **Effect as the primary vocabulary** and ECS as the doctrine layer. Suffix convention (`*.port.ts` / `*.live.ts` / `*.system.ts`) makes behavior surfaces grep-enumerable for AI agents and external operators.

---

## Load order (read these first, in this order)

1. **`grimoires/loa/specs/arch-substrate-ecs-2026-05-11.md`** — the architecture doc. Has invariants, blast radius, FAGAN gates.
2. **`grimoires/loa/reality/architecture-overview.md`** — current system topology. Don't duplicate, patch.
3. **`grimoires/loa/reality/interfaces.md`** — service contracts (ScoreReadAdapter, WeatherFeed, etc) → these become Ports.
4. **`grimoires/loa/reality/types.md`** — type contracts → these become Domain Schemas.
5. **`grimoires/loa/reality/hygiene-report.md`** — confirms `.next.OLD-*` deletion is safe.
6. **Reference files (skim, don't memorize):**
   - `lib/sim/entities.ts` — proto-ECS that proves the pattern is already here
   - `app/globals.css` (lines 88-479) — the 190-line theme duplication target
   - `packages/peripheral-events/src/` — shows how Effect Schema is already used
7. **Landscape references (cite in code comments where load-bearing):**
   - https://effect.website/docs/requirements-management/services/
   - https://effect.website/docs/requirements-management/layers/
   - https://github.com/anthropics/skills (CLAUDE.md / SKILL.md per-folder pattern)
   - https://llmstxt.org/ (the index spec)
   - https://programmingisterrible.com/post/139222674273/how-to-write-disposable-code-in-large-systems (Tef · "Easy to delete")

---

## Persona

**Primary:** OSTROM (architect) + ALEXANDER (craft) — both already loaded by the arch doc.

**Code-quality lens:** FAGAN. Inspection method:
- Each `*.live.ts` migration is its own inspection unit (50-200 LOC).
- Defect categories named upfront: error-type leakage · layer-wiring duplication · schema drift · behavior-change-masquerading-as-refactor.
- Author ≠ inspector. After implementing, dispatch `/gpt-review` (FAGAN handle) before merging the PR.

**Files:**
- `.claude/constructs/packs/the-arcade/identity/OSTROM.md` (architect)
- `.claude/constructs/packs/artisan/identity/ALEXANDER.md` (craft)
- FAGAN's lens is captured inline in the arch doc — no separate persona file (it's a discipline, not a character)

---

## What to build (in dependency order)

### Sprint 0 — Pre-flight (no code change)

**0.1 · Capture visual baselines.** Required before ANY refactor begins.

```bash
# Start dev
cd ~/bonfire/compass && pnpm dev > /tmp/baseline-dev.log 2>&1 &

# For each element × each mode, capture a screenshot:
mkdir -p grimoires/loa/visual-baselines/2026-05-11

# (use agent-browser per the patterns we used for the ceremony work)
# Save 10 PNGs: water/fire/wood/earth/metal × light/dark
# See README "Re-test in dev" snippet for clearing localStorage between captures
```

These are the diff baseline for verification. Do not skip.

**0.2 · Confirm test suite green.**
```bash
pnpm typecheck && pnpm vitest run && \
  pnpm --filter @purupuru/peripheral-events test && \
  pnpm --filter @purupuru/medium-blink test
```
Expected: `128 tests passed` total. If anything fails before refactor starts, fix that bug FIRST as a separate commit.

---

### Sprint 1 — Domain hoist + dead-code purge (parallel, low risk)

**1.1 · `lib/domain/element.ts`** · NEW

Single source of truth for element data. Hoists from: `lib/score/types.ts` (Element type) + ad-hoc kanji maps in `KpiStrip.tsx:8-14`, `lib/ceremony/stone-copy.ts:67-108`, `packages/medium-blink/src/voice-corpus.ts`.

```ts
import { Schema } from "effect";

export const Element = Schema.Literal("wood", "fire", "earth", "metal", "water");
export type Element = Schema.Schema.Type<typeof Element>;

export const ELEMENTS: readonly Element[] = ["wood", "fire", "earth", "metal", "water"];

export const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
};

export const ELEMENT_BREATH_MS: Record<Element, number> = {
  wood: 6000, fire: 4000, earth: 5500, metal: 4500, water: 5000,
};

export const ELEMENT_HUE: Record<Element, number> = {
  wood: 113, fire: 28, earth: 84, metal: 310, water: 266,
};
```

**Update consumers** (the deletion side):
- `lib/score/types.ts` — keep type re-export, mark deprecated, plan removal next cycle
- `components/observatory/KpiStrip.tsx:8-14` — delete local `ELEMENT_KANJI`, import from domain
- `lib/ceremony/stone-copy.ts` — replace breath durations with `ELEMENT_BREATH_MS[element]`
- `packages/medium-blink/src/voice-corpus.ts` — confirm usage; import where applicable

**Estimated savings:** ~40 LOC.

**1.2 · `lib/storage-safe.ts`** · NEW

Hoist localStorage try/catch from 3 places.

```ts
export function getSafe(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

export function setSafe(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(key, value); } catch { /* quota / disabled */ }
}

export function removeSafe(key: string): void {
  if (typeof localStorage === "undefined") return;
  try { localStorage.removeItem(key); } catch { /* */ }
}
```

**Update consumers:**
- `lib/theme/persist.ts:40-50` — replace inline try/catch
- `lib/ceremony/stone-copy.ts:116-132` — replace inline try/catch
- `lib/celestial/position.ts:60-67` — replace inline try/catch

**Estimated savings:** ~30 LOC.

**1.3 · Dead code purge** · DELETE

```bash
# 4.2 GB recovery
trash .next.OLD-*

# Confirm unused before deleting
grep -r "mock-memo-tx" --include='*.ts' lib/ app/ packages/
# If 0 matches: trash lib/blink/mock-memo-tx.ts

# asset-test is for local dev only, not referenced from nav
trash app/asset-test/

# cors.ts is 5 LOC — confirm ACTION_CORS_HEADERS is the only export used
grep -r "from.*lib/blink/cors" --include='*.ts' app/ lib/
# If zero usages, inline into the one route that imports it
```

**Estimated deletion:** 4.2 GB build artifacts + ~95 LOC code.

**Sprint 1 commit:** `feat(substrate): domain hoist + dead-code purge` — single commit, tests must pass.

---

### Sprint 2 — Sim suffix rename + barrel (mechanical)

**2.1 · `lib/sim/population.ts` → `lib/sim/population.system.ts`**

```bash
git mv lib/sim/population.ts lib/sim/population.system.ts
```

Update every importer (probably ~5 files: `ObservatoryClient.tsx`, `ActivityRail.tsx`, `KpiStrip.tsx`, `PentagramCanvas.tsx`, `lib/activity/index.ts`).

**2.2 · `lib/sim/index.ts`** · NEW barrel

```ts
// Sim system · the in-world entity layer
export * from "./entities";          // Puruhani helpers
export * from "./population.system"; // populationStore + spawnYou + etc.
export * from "./pentagram";         // geometry
export * from "./tides";             // drift dynamics
export * from "./identity";          // identity registry
export * as Avatar from "./avatar";  // canvas avatar pipeline
export * from "./types";             // shared types
```

**Note:** verify bundle size before/after. If tree-shaking regresses for any consumer, keep deep imports for that one and document why.

**Sprint 2 commit:** `refactor(sim): suffix-as-type rename + barrel`.

---

### Sprint 3 — Effect substrate (the heart of the cycle)

**3.1 · `lib/domain/weather.ts`** · NEW (re-export Schema from current `lib/weather/types.ts` shape)

**3.2 · `lib/ports/weather.port.ts`** · NEW

```ts
import { Context, Effect, Stream } from "effect";
import type { WeatherState } from "@/lib/domain/weather";

export class WeatherFeed extends Context.Tag("WeatherFeed")<
  WeatherFeed,
  {
    readonly current: Effect.Effect<WeatherState>;
    readonly stream: Stream.Stream<WeatherState>;
  }
>() {}
```

**3.3 · `lib/live/weather.live.ts`** · NEW Effect-shape of current `lib/weather/live.ts`

Migrate the existing imperative subscribe + Open-Meteo fetch into an Effect Layer that exposes `current` (Effect) + `stream` (Stream of updates). Use `Effect.tryPromise` with explicit `catch` mapping to typed errors (GeolocationError | NetworkError | ParseError).

**3.4 · `lib/mock/weather.mock.ts`** · MOVED from `lib/weather/mock.ts`

Wrap the existing mock implementation in a Layer that satisfies the Port.

**3.5 · `lib/live/sonifier.live.ts`** · NEW Effect-shape of current `lib/audio/sonify.ts`

Use `Effect.acquireRelease` for AudioContext lifecycle. The hidden global state goes away.

**3.6 · `lib/runtime/runtime.ts`** · NEW · the ONE Effect.provide site

```ts
import { Layer, ManagedRuntime } from "effect";
import { WeatherLive } from "@/lib/live/weather.live";
import { SonifierLive } from "@/lib/live/sonifier.live";

export const AppLayer = Layer.mergeAll(WeatherLive, SonifierLive);
export const runtime = ManagedRuntime.make(AppLayer);
```

**3.7 · Wire runtime in `app/layout.tsx`** — single `runtime.runPromise(...)` site for any Effect that needs to escape into a React boundary. Use a thin React adapter (`useEffectQuery(effect)`) for components.

**3.8 · Update consumers** — `ObservatoryClient.tsx` switches from `weatherFeed.subscribe(...)` to consuming the WeatherFeed service via the runtime adapter. Same for any sonifier consumer.

**3.9 · Delete the old shapes** — `lib/weather/live.ts` · `lib/weather/mock.ts` · `lib/weather/types.ts` · `lib/weather/index.ts` · `lib/audio/sonify.ts`. The shape moved to domain/ports/live/mock/runtime.

**Sprint 3 commit:** `feat(substrate): Effect-layered weather + sonifier`. After this commit:
- Run `/gpt-review` (FAGAN) on the diff
- Visual screenshot diff (theme should be unchanged — weather drives theme)
- 128 tests still pass

---

### Sprint 4 — globals.css theme block consolidation

**4.1 · Restructure `app/globals.css`** so theme tokens live in a single override layer.

Current: light at `:root` (88-302) + dark at `[data-theme="old-horai"]` (309-393) + dark mirror at `@media (prefers-color-scheme: dark) :root:not([data-theme])` (395-479) — three near-verbatim blocks.

Target: ONE `:root` block with all tokens at light values. ONE override block with ONLY dark deltas.

```css
:root {
  /* light values + non-flipping tokens (spacing, easing, radii) — single source */
  --puru-cloud-base: oklch(0.94 0.015 90);
  /* … all light tokens … */
  --space-2xs: 2px;  /* doesn't flip */
  /* … */
}

[data-theme="old-horai"],
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* ONLY the tokens that flip — ~50 entries instead of 190 */
    --puru-cloud-base: oklch(0.20 0.012 80);
    /* … */
  }
}
```

**4.2 · Visual diff against baselines.** If any pixel differs unexpectedly, revert and ask operator.

**Estimated savings:** ~140 LOC.

**Sprint 4 commit:** `style(theme): collapse duplicate token blocks`.

---

### Sprint 5 — Docs slim + agent-readable substrate

**5.1 · README slim** — target 41 → ≤25 em-dashes. Move long explanatory paragraphs to the existing user-journey-map.

**5.2 · Move `PROCESS.md` → `grimoires/loa/ops/PROCESS.md`** + add a 1-line README pointer.

**5.3 · Add `public/llms.txt`** — the agent-navigation index per llmstxt.org spec.

**5.4 · Per-package `CLAUDE.md`** — `packages/peripheral-events/CLAUDE.md` + `packages/medium-blink/CLAUDE.md` + `packages/world-sources/CLAUDE.md`. Each declares: boundary · ports · layers provided · forbidden context.

**Sprint 5 commit:** `docs(substrate): agent-readable index + per-package SKILL`.

---

### Sprint 6 — Construct pack draft (the upstream distillation)

**6.1 · Create `~/Documents/GitHub/loa-constructs/packs/effect-substrate/`** with the structure named in the arch doc:

```
SKILL.md                        ← How to organize a TS app around Effect + ECS doctrine
construct.yaml                  ← Pack manifest, status: candidate
patterns/
  domain-ports-live.md          ← The 4-folder pattern
  suffix-as-type.md             ← grep-enumeration discipline
  ecs-effect-isomorphism.md     ← The mapping table
  delete-heavy-cycle.md         ← This recipe, generalized
examples/
  compass-cycle-2026-05-11.md   ← This cycle as a worked example
```

**6.2 · Mark `status: candidate`** until two more projects validate.

**Sprint 6 commit:** `feat(constructs): effect-substrate pack draft (candidate)` in the loa-constructs repo.

---

## Design rules (FAGAN-ready)

- **One `Effect.provide` site.** Lint rule: `grep -r "ManagedRuntime\.make\|Effect\.provide" lib/ app/` should return exactly 1 file (`lib/runtime/runtime.ts`). Any second site fails review.
- **`Effect.tryPromise` MUST declare `catch`.** No untyped errors leak into the channel.
- **Suffix convention enforced.** `*.port.ts` for service interfaces · `*.live.ts` for production Layers · `*.mock.ts` for test Layers · `*.system.ts` for ECS-shaped pipelines. Eslint plugin (later) can enforce, but discipline this cycle.
- **Domain types have no runtime imports.** `lib/domain/*.ts` files import only from `effect/Schema` and other domain files. They are pure data shapes.
- **No new packages.** Internal hoist only. `lib/ → packages/` graduation is a future cycle's call.
- **Test 128/128 at every commit.** Bisectable history.
- **Bundle size delta ≤ +5%** on the observatory route. If we regress more, the barrel is too greedy — switch to deep imports for that consumer.
- **Visual diff zero unexpected pixels.** Theme refactor is the highest-risk visual surface.

---

## What NOT to build (BARTH discipline)

- ❌ **No new packages.** `lib/ → packages/` graduation is a future cycle's call.
- ❌ **No route-handler Effect migration.** They work, they're shipping demo code, leave them.
- ❌ **No tests added.** This is a deletive cycle. New tests would mean we wrote behavior. Don't.
- ❌ **No styling system overhaul.** Tailwind classes stay as-is. Only `globals.css` token block collapses.
- ❌ **No "while I'm here" cleanups.** Anything not in the file list above is out of scope.
- ❌ **No activity/population/nonce-store Effect migration this cycle.** Those are V2.
- ❌ **No README rewrite.** Em-dash reduction + PROCESS move only. The narrative stays.
- ❌ **No Storybook.** kit/page.tsx decision deferred to V2.

---

## Verify

After each sprint:

```bash
# Type clean
cd ~/bonfire/compass && pnpm typecheck

# Tests green
pnpm vitest run
pnpm --filter @purupuru/peripheral-events test
pnpm --filter @purupuru/medium-blink test

# Build clean
pnpm build

# Visual baseline diff (compare to grimoires/loa/visual-baselines/2026-05-11/)
# (use agent-browser per the patterns from the ceremony work)
```

After Sprint 6 (cycle close):

```bash
# Net LOC delta (must be negative)
git diff --stat <pre-cycle-sha>..HEAD | tail -1

# Confirm < 1 ManagedRuntime site
grep -r "ManagedRuntime\.make" lib/ app/ | wc -l   # → 1

# Confirm grep-enumerable behavior surface
find lib -name '*.port.ts' | wc -l       # → ≥ 5
find lib -name '*.live.ts' | wc -l       # → ≥ 2
find lib -name '*.system.ts' | wc -l     # → ≥ 1

# Em-dash density check
grep -c '—' README.md   # → ≤ 25
```

---

## SimStim mode for next session

The operator's stated intent is to run **/simstim** for this cycle. SimStim's HITL accelerated workflow fits because:

- Sprints 1, 2, 4, 5 are mechanical (rename + import update + dead-code purge) — can be auto-applied with operator pair-points only at sprint boundaries.
- Sprint 3 (Effect migration) needs operator review at the Layer boundary — SimStim's pair-point is the right shape.
- Sprint 6 (construct pack) is the synthesis — needs the human-in-the-loop to ratify the doctrine before publishing.

Pair-points planned:
- **After Sprint 0** — operator confirms baseline screenshots look like the intended demo state
- **After Sprint 3** — FAGAN review of the Effect migration before tests dependency
- **After Sprint 4** — visual diff review (theme refactor)
- **After Sprint 6** — construct pack review before publishing as candidate

---

## Key references

| topic | path |
|---|---|
| Architecture doc (read first) | `grimoires/loa/specs/arch-substrate-ecs-2026-05-11.md` |
| Current architecture overview | `grimoires/loa/reality/architecture-overview.md` |
| Service contracts (→ become Ports) | `grimoires/loa/reality/interfaces.md` |
| Type contracts (→ become Domain Schemas) | `grimoires/loa/reality/types.md` |
| Hygiene confirmations | `grimoires/loa/reality/hygiene-report.md` |
| Effect canonical patterns | https://effect.website/docs/requirements-management/services/ |
| Effect Layer + ManagedRuntime | https://effect.website/docs/requirements-management/layers/ |
| ECS-as-organization (koota) | https://github.com/pmndrs/koota |
| llms.txt spec | https://llmstxt.org/ |
| Anthropic SKILL.md pattern | https://github.com/anthropics/skills |
| "Easy to delete" doctrine (Tef) | https://programmingisterrible.com/post/139222674273/how-to-write-disposable-code-in-large-systems |
| Inato fp-ts → Effect migration story | https://medium.com/inato/how-we-migrated-our-codebase-from-fp-ts-to-effect-b71acd0c5640 |

---

## Success criteria (bind to the operator's mandate)

- ✅ **Net LOC negative** (target -300, hard floor 0 — write nothing without deleting at least equally)
- ✅ **One `Effect.provide` site** (proves the substrate is unified)
- ✅ **Suffix convention adopted** (proves grep-enumerable behavior)
- ✅ **README ≤ 25 em-dashes** (proves the legibility move)
- ✅ **construct pack draft published** as `status: candidate` (proves the upstream loop closes)
- ✅ **128/128 tests pass** at cycle close (proves no regression)
- ✅ **Visual diff zero unexpected pixels** (proves theme refactor was conservative)

When all six gates pass, the cycle is shippable.
