# ARCH · Substrate ECS Cycle — Effect-Layered Systems + Delete-Heavy Refactor

> **Mode:** ARCH (OSTROM) + craft lens (ALEXANDER) + code-quality lens (FAGAN)
> **Date:** 2026-05-11
> **RUN_ID:** 20260511-3f171e
> **Operator mandate:** delete more code than we write · organize around ECS · funnel through Effect · simplify README · upstream into constructs

---

## The load-bearing insight (synthesized from DIG)

ECS and Effect are isomorphic. Same structure, different vocabulary.

| ECS noun | Effect noun | This repo today |
|---|---|---|
| World | Layer | The provided runtime |
| System | Service | `weatherFeed`, `populationStore`, `sonifier` |
| Component | Schema record | `Puruhani`, `WeatherState`, `ActivityEvent` |
| Archetype query | Port interface | `WeatherFeed`, `ScoreReadAdapter`, `PopulationStore` |
| Entity | Schema-validated record + identity | `SpawnedPuruhani` (has `trader` ID + components) |

**The cycle is not "adopt ECS." The cycle is "name what's already half-here, formalize it via Effect, delete the duplication that obscured it."** `lib/sim/entities.ts` already has `advanceBreath(entity, dtMs)` — a System function. We're labeling the pattern, not inventing it.

---

## Invariants

1. **Substrate truth ≠ presentation** — Solana + Anchor + Metaplex + HMAC quiz state stay authoritative. No on-chain mutation in this cycle.
2. **Three-keypair model** — sponsored-payer / claim-signer / user wallet boundaries non-negotiable.
3. **OKLCH token vocabulary** — element vivids/tints/dims stay stable. Theme tokens are the brand.
4. **`/api/actions/*` HTTP contracts** — Solana Actions spec compliance preserved. Internal refactor never changes request/response shape.
5. **Test suite green** — 128 unit tests across all packages must pass at every commit. Refactor regressions are caught here.

---

## OSTROM's three questions

### 1. What's the invariant?

The shape of `lib/sim/Puruhani` (the entity), the OKLCH element palette (the components' visual signature), and the HTTP action contracts. Everything else is implementation.

### 2. What's the blast radius?

| Tier | Artifacts | Count | Risk |
|---|---|---|---|
| NEW | barrel files (`lib/sim/index.ts`, `lib/weather/index.ts` reshape) · element-registry · storage-safe · runtime layer · construct pack draft · `grimoires/loa/ops/` move | ~6 files | LOW additive |
| MODIFIED | `globals.css` (theme block collapse, ~190 lines removed) · `lib/weather/live.ts` (Effect) · `lib/audio/sonify.ts` (Effect) · `lib/sim/*.ts` (rename + barrel) · 12+ component imports · README | ~18 files | MEDIUM — many mechanical changes |
| DELETED | `.next.OLD-*` · `lib/blink/mock-memo-tx.ts` (if confirmed unused) · `app/asset-test/` · `lib/blink/cors.ts` (if redundant) · root `PROCESS.md` (after move) | 5 paths | HIGH visibility / LOW risk — git-recoverable |

### 3. What breaks if I'm wrong?

- **Theme regression** — bad `globals.css` collapse → element colors drift. **Mitigation:** screenshot all 5 element ceremonies before + after, diff visually.
- **Effect migration error in `weatherFeed`** → theme stops flipping at sunrise/sunset. **Mitigation:** keep both adapters live behind a feature flag for 1 deploy; remove after.
- **Sim barrel breaks tree-shaking** → bundle bloats. **Mitigation:** verify build output size pre- and post-refactor. Threshold: do not regress observatory route bundle by > 5%.
- **Construct pack draft drifts from compass reality** — published doctrine that doesn't match shipping code. **Mitigation:** the pack ships as `status: candidate` until two more projects validate it.

---

## The Effect-layered architecture (THIS cycle's deliverable)

```
lib/
├── domain/                          ← NEW · Schema + types only (pure)
│   ├── element.ts                   ← Element token, ELEMENT_KANJI, ELEMENT_NAMES, breath durations
│   ├── puruhani.ts                  ← Puruhani Schema (re-export from sim/types)
│   ├── weather.ts                   ← WeatherState Schema (re-export from weather/types)
│   ├── stone.ts                     ← Stone canonical shape (unified from blink + peripheral-events)
│   └── activity.ts                  ← ActivityEvent discriminated union
│
├── ports/                           ← NEW · Context.Tag service interfaces
│   ├── weather.port.ts              ← WeatherFeedPort (replaces WeatherFeed interface)
│   ├── score.port.ts                ← ScoreReadAdapterPort
│   ├── population.port.ts           ← PopulationSystemPort
│   ├── sonifier.port.ts             ← SonifierPort
│   └── storage.port.ts              ← LocalStorageSafePort
│
├── live/                            ← NEW · Production Layer implementations
│   ├── weather.live.ts              ← Live Open-Meteo adapter (was lib/weather/live.ts)
│   ├── score.live.ts                ← Live score adapter (zerker's lane · stub for now)
│   ├── sonifier.live.ts             ← Live AudioContext sonifier
│   └── storage.live.ts              ← Live localStorage with try/catch
│
├── mock/                            ← NEW · Test/dev Layer implementations
│   ├── weather.mock.ts              ← Was lib/weather/mock.ts
│   └── score.mock.ts                ← Was lib/score/mock.ts
│
├── sim/                             ← MODIFIED · stays here · entity registry
│   ├── index.ts                     ← NEW barrel · exports everything sim needs
│   ├── entities.ts                  ← Puruhani helpers (existing, light cleanup)
│   ├── population.system.ts         ← RENAMED from population.ts · the System
│   ├── pentagram.ts                 ← geometry · unchanged
│   ├── tides.ts                     ← drift math · unchanged
│   ├── identity.ts                  ← identity registry · unchanged
│   └── avatar.ts                    ← avatar canvas · unchanged
│
├── runtime/                         ← NEW · Layer.mergeAll + ManagedRuntime
│   ├── runtime.ts                   ← single Effect.provide site
│   └── README.md                    ← "this is the World; here's how to add a System"
│
└── (deleted)                        ← lib/weather/, lib/score/, lib/audio/sonify.ts, lib/theme/persist.ts
                                       all collapse into domain/ + ports/ + live/ + mock/
```

**Suffix convention enforced everywhere:**

| Suffix | Meaning | grep enumerates |
|---|---|---|
| `*.port.ts` | Context.Tag service interface (no impl) | Every behavior boundary |
| `*.live.ts` | Production Layer | Every production effect |
| `*.mock.ts` | Test/dev Layer | Every test substitute |
| `*.system.ts` | ECS System · Effect.gen pipeline | Every transform over components |
| `*.component.ts` | (deferred) discrete component schemas | (reserve) |

**One `Effect.provide` site:** `lib/runtime/runtime.ts` exports a `ManagedRuntime` that's imported once in `app/layout.tsx`. Routes / components consume services via `Effect.gen`, never construct their own.

---

## ALEXANDER · craft specifications

### `globals.css` token-block consolidation

**Current:** light mode tokens at `:root` (lines 88-302) · old-horai dark at `[data-theme="old-horai"]` (309-393) · system-dark mirror (395-479). Each block is a NEAR-VERBATIM copy with only the OKLCH values changed.

**Target shape:**

```css
:root {
  /* Tokens that DON'T flip on theme — once */
  --space-2xs: 2px;
  --radius-sm: 6px;
  --ease-puru-flow: cubic-bezier(...);
  /* … */
}

@layer theme {
  :root,
  :root:not([data-theme]) {
    /* light values — single source */
    --puru-cloud-base: oklch(0.94 0.015 90);
    /* … */
  }
  
  [data-theme="old-horai"],
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      /* dark overrides ONLY · ~50 tokens not ~190 lines */
      --puru-cloud-base: oklch(0.20 0.012 80);
      /* … */
    }
  }
}
```

**Estimated savings:** ~140 lines of duplicate token declarations · single source of truth for any new token.

### Element registry consolidation

**New file `lib/domain/element.ts`:**

```ts
import { Schema } from "effect";

export const Element = Schema.Literal("wood", "fire", "earth", "metal", "water");
export type Element = Schema.Schema.Type<typeof Element>;

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

**Consumers updated:** `KpiStrip`, `KpiCell`, `stone-copy.ts`, `voice-corpus.ts`, anywhere that re-declares an element table. **Estimated savings:** ~40 lines + a single source of truth.

### Suffix-naming as a teaching surface

Every workspace package gets a `CLAUDE.md` or `SKILL.md` declaring:
- **Boundary** — what this package owns
- **Ports** — services it exposes
- **Layers provided** — what it can plug into
- **Forbidden context** — what it must not import

This is the agent-readable substrate. A fresh Claude session can `grep` suffix patterns + read CLAUDE.md per package and understand the system in one pass.

### `llms.txt` at root

`public/llms.txt` shipped now declares structure for AI agent consumption:

```
# Purupuru / Compass — Awareness Layer

> Twitter Blink → quiz → mint → observatory · Solana devnet

## Architecture
- [Architecture overview](grimoires/loa/reality/architecture-overview.md)
- [Effect-layered substrate](grimoires/loa/specs/arch-substrate-ecs-2026-05-11.md)

## Domain (Schema)
- [Element](lib/domain/element.ts)
- [Puruhani](lib/domain/puruhani.ts)
- [Stone](lib/domain/stone.ts)

## Ports (Service interfaces)
- [Weather](lib/ports/weather.port.ts)
- [Population](lib/ports/population.port.ts)
- …
```

---

## FAGAN · code-quality lens

> Michael Fagan's inspection method · structured, adversarial, catches what eyes miss.

**Per-target FAGAN review checklist for the implementing session:**

| FAGAN principle | This cycle's instance |
|---|---|
| **Define the unit of inspection** | Each `*.live.ts` migration is its own inspection unit (~50-200 LOC each). Don't inspect the whole cycle at once. |
| **Defect categories named upfront** | (1) Error-type leakage (untyped throw escapes), (2) Layer wiring duplication (more than one `Effect.provide`), (3) Schema drift (lib/domain version ≠ lib/live version), (4) Behavior change masquerading as refactor (any semantic delta in module output) |
| **Inspect before integrating** | Each Effect migration ships as a separate PR. No mega-PR. Bridgebuilder reviews each before merge. |
| **Track defects to closure** | Use `grimoires/loa/a2a/bug-*` for any defect surfaced. Don't fold fixes into the refactor PR. |
| **The author is not the inspector** | The session that wrote the Effect migration does NOT review its own PR. `/gpt-review` (FAGAN handle) reviews it. |

**Specific FAGAN failure modes for this cycle:**

1. **The "while I'm here" refactor** — implementing session sees an unrelated thing to clean up, conflates it with the cycle, blows scope. **Counter:** the build doc enumerates files. Anything not in the file list requires an explicit operator nod or a follow-up sprint.
2. **Effect.tryPromise without catch typing** — leaves untyped errors in the channel. **Counter:** every `tryPromise` must declare a `catch` taking the failure mode and mapping to a domain error.
3. **Two Effect.provide sites** — fastest way to break Effect's invariants. **Counter:** runtime.ts is the ONLY caller of `ManagedRuntime.make`. Lint rule: grep for `ManagedRuntime` should return 1 file.
4. **CSS theme regression** — collapse touches every theme consumer. **Counter:** SCREENSHOT-DIFF protocol. Pre-refactor: capture all 5 ceremonies × both modes. Post-refactor: pixel-diff. Threshold: any cosmetic diff requires operator review.

---

## Shipping scope (BARTH discipline)

### V1 · ship this cycle

1. **lib/domain/** · NEW · element + puruhani + weather + stone + activity schemas hoisted from current types files
2. **lib/ports/** · NEW · 5 port files for the services that survive
3. **lib/live/weather.live.ts** · Effect migration of `lib/weather/live.ts`
4. **lib/live/sonifier.live.ts** · Effect migration of `lib/audio/sonify.ts`
5. **lib/runtime/runtime.ts** · single ManagedRuntime + ONE `Effect.provide` site in `app/layout.tsx`
6. **lib/element-registry.ts** · ELEMENT_KANJI + ELEMENT_BREATH_MS unification + all consumer updates
7. **lib/storage-safe.ts** · localStorage try/catch helper + 3-site adoption (theme/persist, stone-copy, celestial/position)
8. **globals.css** · theme-block consolidation (~140 lines deleted)
9. **lib/sim/** · suffix rename to `population.system.ts` + add barrel `lib/sim/index.ts`
10. **Dead code purge** · `.next.OLD-*` · `lib/blink/mock-memo-tx.ts` (if unused) · `app/asset-test/` · `lib/blink/cors.ts` (if redundant)
11. **README slim** · em-dash density reduction · move PROCESS.md to `grimoires/loa/ops/`
12. **llms.txt** · single-file agent-navigation index at `public/llms.txt`
13. **Per-package CLAUDE.md** · workspace packages each get a SKILL declaration
14. **Construct pack draft** · `~/Documents/GitHub/loa-constructs/packs/effect-substrate/` capturing the doctrine · `status: candidate`

### V2 · next cycle (not now)

- activityStream → Effect Hub migration
- nonce-store → Effect Layer
- Route handlers → Effect.gen pipelines
- world-sources package merge into lib/score
- app/kit/ decision (delete vs. promote to system-reference)
- (deferred) `*.component.ts` suffix · only when we have multiple discrete component schemas to separate

### Explicitly CUT from V1

- ❌ **No new packages.** `lib/` reorganization only · no promotion to `packages/` this cycle.
- ❌ **No route-handler Effect migration.** They work · don't touch shipping demo code.
- ❌ **No styling system overhaul.** Tailwind classes stay as-is · only `globals.css` token block collapses.
- ❌ **No "while I'm here" code rewrites.** Anything not on the V1 list is out of scope.
- ❌ **No tests added.** Only existing tests must pass. New behavior would mean we wrote code · we're deleting.

---

## How constructs get distilled upstream

After cycle close, the doctrine ships as a construct pack:

**`~/Documents/GitHub/loa-constructs/packs/effect-substrate/`**

```
SKILL.md                    ← "How to organize a TS app around Effect + ECS doctrine"
construct.yaml              ← Pack manifest
patterns/
  domain-ports-live.md      ← The 4-folder pattern (domain, ports, live, mock)
  suffix-as-type.md         ← *.port.ts / *.live.ts / *.system.ts grep-enumeration
  ecs-effect-isomorphism.md ← The mapping table
  delete-heavy-cycle.md     ← The "delete more than you write" recipe
examples/
  compass-cycle-2026-05-11.md  ← This cycle as a worked example
```

`status: candidate` until two more projects validate. Promotion to `active` happens after dogfooding in (e.g.) the next freeside-* repo refactor.

---

## Verification gates

1. **Pre-refactor screenshot pack** — all 5 ceremonies × light + dark = 10 reference PNGs in `grimoires/loa/visual-baselines/2026-05-11/`
2. **`pnpm typecheck` clean** at every commit
3. **`pnpm vitest run` 128/128** at every commit
4. **`pnpm build` succeeds** + bundle size delta logged
5. **Post-refactor screenshot diff** — 10 PNGs at same viewport, pixel-diff against baseline · any divergence requires operator review
6. **`/gpt-review` (FAGAN) passes** on the final PR before merge

---

## What success looks like

- A fresh Claude session can `grep -r '\*\.port\.ts' lib/` and enumerate every behavior boundary in 1 second.
- An external operator reads `public/llms.txt` + `README.md` + one package `CLAUDE.md` and can build immediately.
- Net LOC change is **negative** (target: -300 LOC after this cycle ships).
- The construct pack draft is usable in the next project we touch.

**The honest deletion goal:** if we write 100 LOC and delete 400 LOC, we did this right.
