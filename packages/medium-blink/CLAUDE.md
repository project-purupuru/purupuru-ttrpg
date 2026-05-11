# @purupuru/medium-blink · Blink medium renderer

## Boundary

The Solana Actions presentation layer. Owns:
- Pure renderer functions producing `ActionGetResponse` per Solana Actions v2.4 spec
- Voice corpus · 8 questions × 3 answers · 5 archetype reveals (Gumi-curated)
- Quiz configuration · per-question mode + curated element-answer mapping
- Solana Actions type contracts (`ActionGetResponse`, `ActionPostResponse`, etc.)

## Ports exposed

Pure functions only — no IO, no state. The app/api/actions/* routes call these
and serialize the result to HTTP.

| Export | Use |
|---|---|
| `renderAmbient` | `/api/actions/today` GET response |
| `renderQuizStart`, `renderQuizStep`, `renderQuizResult` | `/api/actions/quiz/*` chain |
| `renderClaimGenesisStone` | `/api/actions/mint/genesis-stone` GET response |
| `voiceCorpus` | 8 questions + reveals (Gumi register, do not edit without conversation) |
| `quizConfig` | Per-Q answer/element mapping + mode (`first-n` only today; `rotate-n` and `tension-pick` are sprint-3 TODO) |
| `ActionGetResponse`, `ActionPostResponse`, etc. | Solana Actions v2.4 types |

## Layers provided

None — pure functions. The route handlers in `app/api/actions/*` orchestrate
substrate validation + this renderer + HTTP response.

## Forbidden context

- ❌ Browser APIs — this is server-side rendering
- ❌ Network calls — pure data → data transformation
- ❌ `@/lib/*` imports (the app depends on this package, not the reverse)
- ❌ React (renderers produce `ActionGetResponse` JSON, not JSX)

## Tests

`tests/quiz-renderer.test.ts` · 24 tests · renderer output shape verification
per Solana Actions spec.

## Voice register

`src/voice-corpus.ts` is the canonical Gumi-curated voice surface. Per operator
decree 2026-05-09: lowercase · second-person · present tense · periods only.
"plain personality-test language · grounded · no metaphor." Changes require a
conversation with Gumi, not a unilateral edit.
