# API Surface

> Generated 2026-05-07. **Currently: none.** No application code exists.

## Public APIs (planned, not built)

Per `grimoires/loa/prd.md` (canonical), the planned API surface is:

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| GET | `/api/actions/blink` | Solana Action descriptor (wallet-agnostic, stateless per Solana Actions spec) | planned · FR-8 |
| POST | `/api/actions/blink` | Returns unsigned transaction; backend co-signs as sponsored fee_payer; user wallet signs as authority | planned · FR-4 |

These will live under `apps/blink-emitter/` (next.js 15, vercel) once sprint-1 builds them.

## Public Exports (planned)

Per PRD, `@purupuru/peripheral-events` (TS workspace package) will export:

- `WorldEvent` — Effect.Schema discriminated union (3 v0 variants: `mint`, `weather_shift`, `element_surge`)
- `eventId(event)` — canonical hash derivation, `sha256(canonical_encoded + version + source)`
- Ports: `EventSourcePort`, `EventResolverPort`, `WitnessAttestationPort`, `MediumRenderPort`, `NotifyPort`
- Adapters: `ScoreAdapter`, `SonarAdapter`, `SolanaWitnessAdapter`, `BlinkRenderAdapter`

None are exported today — the package does not exist on disk.

## Public Programs (planned)

`programs/event-witness/` will expose an Anchor program with one instruction:

- `witness_event(event_id, event_kind)` — writes an idempotent `WitnessRecord` PDA `[b"witness", event_id, witness_wallet]`. Sponsored fee_payer; zero state mutation beyond the PDA write.

Devnet-locked v0.

## What's Stable Today

Nothing. Re-run `/ride` after sprint-1 for grounded surface listing.
