# FAGAN review · Sprint 3 (Effect substrate)

> Inspector: Codex (GPT-5.3-codex) via codex-rescue agent · 2026-05-11
> Author: Claude Opus 4.7 (1M context)
> Target: commit `6af15a7` · `feat(substrate): Effect-layered weather + sonifier · ONE provide site`

## Verdict

**FIX-THEN-SHIP**

## Gate results

| Gate | Status | Evidence |
|---|---|---|
| GATE-1 · ONE `ManagedRuntime.make` site | PASS | `lib/runtime/runtime.ts:10` — exactly 1 match |
| GATE-2 · `Effect.tryPromise` with typed `catch` | PARTIAL | 0 matches in diff — mechanism absent |
| GATE-3 · Schema drift between `lib/domain` and `lib/live` | PARTIAL | No re-declarations, but `WeatherState` is `interface`, not Schema-validated |
| GATE-4 · Behavior change masquerading as refactor | FAIL | `INITIAL_WEATHER_STATE.observed_at` epoch regression |
| GATE-5 · Suffix convention coverage | FAIL | 2 ports shipped vs ≥5 required by arch doc |

## Findings

### HIGH-1 · `INITIAL_WEATHER_STATE.observed_at` regression

**Location**: `lib/domain/weather.ts:34`

**Defect**: Sprint 3 introduced `INITIAL_WEATHER_STATE` with
`observed_at: new Date(0).toISOString()` (epoch 1970). The pre-refactor mock
used `Date.now() - 6_000` so the first render read as "synced 6s ago".
`WeatherTile.tsx` displays this via `timeAgo`, which produces visible "55
years ago" until the live feed lands.

**Class**: Behavior change masquerading as refactor (FAGAN gate 4).

**Status**: **FIXED** in follow-up commit. `INITIAL_WEATHER_STATE` is now
derived from `initialWeatherState()` factory that returns `Date.now() - 6_000`
at import time. Preserves the pre-refactor cold-start UX.

### HIGH-2 · Error type invisibility at the Weather port

**Location**: `lib/ports/weather.port.ts:7`

**Defect**: `current` and `stream` expose only success values. All three
failure paths inside `weather.live.ts` (geolocation, IP fallback,
Open-Meteo fetch) swallow to `null`. Consumers cannot distinguish
`GeolocationError` vs `NetworkError` vs `ParseError`.

**Class**: Build-doc deviation — spec called for `Effect.tryPromise` with
typed errors `GeolocationError | NetworkError | ParseError`.

**FAGAN's judgment**: NOT-DEFENSIBLE. "The wrap-not-rewrite argument holds
for behavior preservation, but this commit removes the spec's typed-error
*intent*, not just its mechanism. A phased approach would be defensible
only if the port preserved a typed-error path for a follow-up sprint."

**Status**: **DEFERRED to follow-up cycle**, documented explicitly:
- Sprint 3 commit message includes the deviation as honest disclosure.
- Reason for deferral: translating the existing `swallow-to-null` chain to
  typed errors is a behavior-surface change (changes what consumers can
  observe). Acceptable in a fresh cycle with its own FAGAN gate review, not
  folded into a refactor that pledged behavior preservation.
- Follow-up cycle should: (a) widen the Service signature to
  `current: Effect.Effect<WeatherState, WeatherError>`, (b) introduce typed
  error union in `lib/domain/weather.ts`, (c) translate the imperative
  helpers via `Effect.tryPromise({ try, catch })`, (d) update consumers to
  handle the error channel (initial behavior: log + keep last good state).

### MEDIUM findings

1. **`WeatherState` is `interface`, not Schema** — no decode/encode validation
   at the domain boundary. Mitigation: the live Layer never re-validates
   payload shape, so this is latent risk, not active. Future cycle should
   convert to `Schema.Struct` and decode at adapter boundary.

2. **`SonifierLive` uses `Layer.succeed`, not `Effect.acquireRelease`** for
   AudioContext lifecycle. Currently fine because the singleton's lifecycle
   matches the page lifetime, but a long-running runtime context could leak.
   Track for V2 cycle.

3. **Only 2 ports shipped vs ≥5 required by arch doc** — score, population,
   storage ports deferred. Arch doc V1 list specifies 5 ports for "services
   that survive"; build doc Sprint 3 only enumerates weather and sonifier.
   Documented in cycle examples; deferral is acceptable for the V1 ship but
   should be revisited if downstream consumers need port-level swappability
   for score / population.

## Praise

- `lib/runtime/runtime.ts:10` — `Layer.mergeAll(WeatherLive, SonifierLive)`
  is clean; GATE-1 (one provide site) is a hard pass and the grep gate is
  enforceable in CI.

## Reviewer summary

Inspection complete; ship after HIGH-1 fix. HIGH-2 (typed errors) deserves
its own cycle — folding it into this refactor would have widened the
behavior surface beyond the cycle's pledge.
