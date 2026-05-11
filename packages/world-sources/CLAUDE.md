# @purupuru/world-sources · awareness-layer read adapters

## Boundary

The read side of the awareness layer. Owns:
- `ScoreReadAdapter` interface (the Port for behavioral intelligence reads)
- Deterministic mock implementation (hackathon shipping default)
- Element-vocabulary translation (canonical wuxing → score-layer naming)
- Hybrid adapter resolver (mock by default, `SCORE_API_URL` flips to real)

## Ports exposed

| Export | Use |
|---|---|
| `ScoreReadAdapter` | Port interface (consumed by observatory + KPI surfaces) |
| `scoreAdapter` | Module-level resolved adapter (mock or real per env) |
| `resolveScoreAdapter` | Pure resolver — pass env to swap implementations in tests |
| `canonicalToScoreElement` | Maps canonical wuxing token → score-layer element string |

## Layers provided

None — this package exposes a Port interface, not a Layer. The app holds the
imperative singleton today. Future cycle may wrap this in a `*.live.ts` /
`*.mock.ts` pair under `lib/live/` to compose with the Effect runtime.

## Forbidden context

- ❌ Browser APIs — this layer is environment-agnostic
- ❌ React or Next.js
- ❌ `@/lib/*` imports (this package is upstream of app code)
- ❌ Direct DB / HTTP clients in the interface — only behind the adapter façade

## Status

- 🟡 **Mock implementation in place** — deterministic, hackathon-shipping default
- 🔴 **Real Score API integration deferred** — stretch goal · env flag wired
- 🔴 **Effect Layer wrap deferred** — V2 cycle · paired with the population +
  activity-stream migrations
