# Example · compass substrate-ECS cycle · 2026-05-11

The first project adoption of `effect-substrate`. Compass is a Solana
hackathon awareness layer with a Pixi.js observatory, Effect Schema
substrate, and Twitter Blink presentation surface.

## Before-state

```
lib/
├── weather/                     ← imperative singleton (subscribe pattern)
│   ├── index.ts
│   ├── live.ts (389 lines · Open-Meteo fetch + geolocation chain)
│   ├── mock.ts
│   └── types.ts
├── audio/sonify.ts              ← module singleton (getSonifier())
├── score/                       ← Element type · ELEMENTS const
├── sim/
│   ├── population.ts            ← already half-ECS, no suffix discipline
│   ├── entities.ts (advanceBreath() is a System function in disguise)
│   ├── pentagram.ts · tides.ts · identity.ts · avatar.ts
│   └── types.ts
├── ceremony/stone-copy.ts       ← breathDurMs duplicated from element data
├── theme/persist.ts             ← inline localStorage try/catch (3x)
├── celestial/position.ts        ← same try/catch pattern
└── ...
app/asset-test/                  ← 1100-line orphan dev route (untracked)
app/globals.css                  ← 215-line :root + 85-line dark + 85-line dark mirror
```

Observatory components (`KpiStrip`, `PentagramCanvas`, `StatsTile`,
`FocusCard`, `WeatherTile`) each declared their own `ELEMENT_KANJI` map.

## After-state

```
lib/
├── domain/                      ← NEW · Schema + types only (pure)
│   ├── element.ts               ← Element Schema · KANJI · BREATH_MS · HUE
│   └── weather.ts               ← WeatherState · Precipitation · INITIAL state
├── ports/                       ← NEW · Context.Tag service interfaces
│   ├── weather.port.ts
│   └── sonifier.port.ts
├── live/                        ← NEW · Production Layer implementations
│   ├── weather.live.ts          ← Open-Meteo chain wrapped at Layer boundary
│   └── sonifier.live.ts         ← Web Audio singleton wrapped at Layer boundary
├── mock/                        ← NEW · Test/dev Layer implementations
│   └── weather.mock.ts
├── runtime/                     ← NEW · single Effect.provide site
│   ├── runtime.ts               ← Layer.mergeAll + ManagedRuntime
│   └── react.ts                 ← useWeather() hook + sonifier handle
├── storage-safe.ts              ← NEW · getSafe/setSafe/removeSafe
├── sim/
│   ├── index.ts                 ← NEW barrel · grep-enumerable system surface
│   ├── population.system.ts     ← RENAMED (was population.ts)
│   ├── entities.ts · pentagram.ts · tides.ts · identity.ts · avatar.ts
│   └── types.ts
└── (deleted: lib/weather/ · lib/audio/)
app/ (deleted: asset-test/)
```

Per-package `CLAUDE.md` added at `packages/{peripheral-events,medium-blink,world-sources}/`.

## Sprint commits

| Sprint | Commit | LOC delta | Tests | Notes |
|---|---|---|---|---|
| 0 | (prep) | — | 128/128 | Visual baselines deferred |
| 1 | `2efa107` | **−1242** | 128/128 | Domain hoist + dead-code purge (asset-test was −1128) |
| 2 | `c3e8ea2` | +15 | 128/128 | Suffix rename + barrel |
| 3 | `6af15a7` | **−9** | 128/128 | Effect substrate · ONE Effect.provide site |
| 4 | (skipped) | 0 | 128/128 | Failsafe-preserving · @media block kept |
| 5 | `98a2660` | +131 (docs) | 128/128 | README em-dashes 41→24 · per-pkg CLAUDE.md · PROCESS.md moved |
| 6 | (this pack) | +600 (this pack) | 128/128 | Construct pack distillation |

**Net code delta:** −1236 LOC.
**Cycle target was:** −300 LOC (achieved 4×).

## Lessons learned

### What worked

1. **Wrap-not-rewrite for Sprint 3**. The imperative `weather.live.ts` is a
   verbatim move of the original `lib/weather/live.ts` — same state machine,
   same fetch chain, same swallow-to-null error handling. Effect surfaces
   appear only at the boundary (`current`, `stream`). Zero behavior change.
   128/128 tests held through every commit.
2. **Sprint 1 first** is the right order. Hoisting `ELEMENT_KANJI` and
   purging `asset-test/` paid for the whole cycle's LOC target before the
   architectural sprint started. Confidence + momentum.
3. **Pair-points at sprint boundaries**, not at phase boundaries. The
   simstim default (pair after PRD/SDD/Sprint planning) doesn't fit a
   delete-heavy refactor where planning is the build doc itself.
4. **Per-package `CLAUDE.md`** is enormous ROI for ~150 LOC. Boundary +
   ports + forbidden context, declared once, queryable by every future
   agent or contributor.

### What didn't

1. **Sprint 4 (CSS theme collapse) didn't ship**. The architect's
   `try/catch silent-swallow` comment in `ThemeBoot.tsx` makes the @media
   block an intentional failsafe. The build doc's deletion target assumed
   the block was duplication; it isn't. Deferred — cycle's other gates
   already over-achieved.
2. **Build-doc deviation on typed errors**. Spec called for `Effect.tryPromise`
   with `GeolocationError | NetworkError | ParseError` types. Wrap-not-rewrite
   path kept the original swallow-to-null helpers intact. Honest disclosure
   in the Sprint 3 commit message. Translating to typed errors is a behavior
   surface change worth its own cycle.
3. **Visual baselines deferred at Sprint 0**. Operator chose revert spot-check
   instead of Playwright authoring. Worked out because Sprint 4 (highest
   visual risk) was skipped — but if Sprint 4 had landed, the deferral would
   have made verification harder.

### Doctrine confidence

After this cycle, the pack moves from `candidate (0 validations)` to
`candidate (1 validation)`. Promotion to `active` requires two more
adoptions, ideally one in a non-Next.js codebase to test that the four-
folder pattern composes outside the React-runtime context.

## Operator footnotes

- The `ECS ≡ Effect ≡ Hexagonal` mapping was operator-flagged during
  the Sprint 6 pair-point, citing Jani's Hexagonal Architecture model.
  That note ratified the three-vocabulary framing in [SKILL.md](../SKILL.md)
  and [ecs-effect-isomorphism.md](../patterns/ecs-effect-isomorphism.md).
- The cycle ran in `/simstim` posture with sprint-boundary HITL — a
  non-default workflow shape worth captures elsewhere.
