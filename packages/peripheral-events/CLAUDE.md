# @purupuru/peripheral-events · L2 sealed substrate

## Boundary

The substrate truth layer. Owns:
- Effect Schema for the four sealed `WorldEvent` variants (Mint · Weather · ElementShift · QuizCompleted)
- HMAC-validated `BaziQuizState` URL state machine
- Canonical `ClaimMessage` encoding (98-byte signed payload, ed25519-via-sysvar pattern)
- Canonical `eventId` derivation (stable across re-encodes per AC-1.1)
- `StoneClaimedSchema` for indexer consumption (zerker · `project-purupuru/radar`)
- BaZi tie-break resolver (wuxing canonical order)

## Ports exposed

This package exports types and pure helpers — no runtime services. Consumers
(the app + indexer) treat these as the canonical shape of substrate truth.

| Export | Use |
|---|---|
| `WorldEvent`, `MintEvent`, `WeatherEvent`, `ElementShiftEvent`, `QuizCompletedEvent` | Substrate event schemas |
| `ClaimMessage`, `SignedClaimMessage`, `CLAIM_MESSAGE_SIGNED_BYTES` | Mint payload contract |
| `StoneClaimed`, `StoneClaimedSchema` | Indexer consumption contract |
| `BaziQuizState`, `CompletedQuizState`, `QuizStep`, `Answer` | HMAC quiz state machine |
| `Element`, `ElementByte`, `OracleSource`, `SolanaPubkey`, `ClaimNonce`, `QuizStateHash` | Branded substrate primitives |
| `resolveArchetype` | BaZi tie-break (wuxing canonical) |
| `canonicalEventId` | Stable hash for event deduplication |
| `CURRENT_SCHEMA_VERSION`, `PACKAGE_VERSION` | Version pins |

## Layers provided

None — this package is L2 SCHEMA, not L3 effects. Wrap consumers downstream.
The app's `lib/live/*` Layers may reference these schemas but never the reverse.

## Forbidden context

- ❌ React, Next.js, browser APIs (no `window`, `document`, `localStorage`)
- ❌ `@solana/web3.js` runtime (only types from `@solana/web3.js` for branding)
- ❌ HTTP clients (`fetch`, axios) — this is schema, not transport
- ❌ Anything from `lib/runtime/` (substrate must not depend on runtime)
- ❌ `@/lib/*` imports (substrate is upstream of app code)

## Tests

`tests/{world-event,claim-message,quiz-state,event-id,bazi-resolver}.test.ts` ·
80 tests · Effect Schema decode/encode roundtrip per substrate boundary.
