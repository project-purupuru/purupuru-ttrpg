---
title: event envelope and cross messaging
status: candidate
composes_with: [architecture-and-layering, ecosystem-architecture, metadata-as-integration-contract, chathead-in-cache-pattern]
created: 2026-05-11
updated: 2026-05-12
revision: post-flatline · BLOCKER fixes B1 + B4 + HC-1 paste-ready Schema + naming-drift loa-daemon-relay
source: gemini synthesis (file 2 of 5) · patched after 3-agent adversarial review
---

# Event Envelope and Cross Messaging

the system breathes through its events. the translation layer requires a standardized envelope for every signal passing between constructs, daemons, and ledgers. this doc describes the envelope SHAPE that should hold at every altitude · and the current state of adoption at each one.

## current state · honestly

at the code altitude, **compass shipped two Effect Layers (weather + sonifier) plus the four-folder discipline (`domain/ports/live/mock`)**. the activityStream and populationStore still use a hand-rolled `Set<callback>` subscribe pattern (`compass/lib/activity/index.ts:42-48` · `compass/lib/sim/population.system.ts:69`). this is the next adoption target named in `construct-effect-substrate/SKILL.md` ("a `subscribe(cb)` pattern · a singleton with a global state machine" is listed as a SIGNAL TO ADOPT). the migration target is Effect's `PubSub` + `Stream` primitives for both surfaces.

at the runtime altitude, the loa ecosystem references a construct-event envelope schema that flows from a construct's emit, through hounfour validation, into finn routing, and out via freeside delivery (`loa/docs/ecosystem-architecture.md` "Where Constructs Network Fits" + "Construct Lifecycle"). today this is **structurally outlined but not formally specified** as a single canonical schema. this doc proposes the canonical shape below.

at the on-chain altitude, **solana's ledger functions as a public event-sourced substrate** · programs publish state transitions via `emit!` events that anchor program listeners can subscribe to. compass's `StoneClaimed` event (`peripheral-events/src/world-event.ts`) is the shipped example.

## the canonical envelope · Effect Schema (paste-ready)

every cross-boundary signal MUST carry: a stable id (for idempotency), trace context (for cross-altitude correlation), bounded-context scope (for routing), explicit provenance, the payload, and a signature OR a substrate-truth pointer. the schema is:

```typescript
import { Schema as S } from "effect"

export const EventEnvelope = S.Struct({
  // idempotency key · de-dupes replay across altitudes
  id: S.UUID,

  // trace context · enables 3-altitude correlation (substrate ↔ runtime ↔ distribution)
  trace: S.Struct({
    parent: S.NullOr(S.UUID),
    root: S.UUID,
    emittedAt: S.DateFromString,
  }),

  // bounded-context dotted path · e.g. "daemon.lifecycle.stirring"
  scope: S.TemplateLiteral(S.String, S.Literal("."), S.String),

  // who emitted this and at which altitude
  provenance: S.Struct({
    emitter: S.String, // TBA address · construct id · or service identifier
    altitude: S.Literal("substrate", "runtime", "distribution"),
  }),

  // payload narrowed per scope via discriminated union at the consumer side
  payload: S.Unknown,

  // signature OR substrate-truth pointer · discriminated union
  // discriminator makes "non-negotiable across all altitudes" actually
  // satisfiable for in-memory events (use substrate-pointer with txSig)
  signature: S.Union(
    S.Struct({
      kind: S.Literal("ed25519"),
      sig: S.String,
    }),
    S.Struct({
      kind: S.Literal("substrate-pointer"),
      txSig: S.String,
      slot: S.Number,
    }),
  ),
})

export type EventEnvelope = S.Schema.Type<typeof EventEnvelope>
```

the substrate-pointer variant resolves the previous gap where in-memory `subscribe(cb)` events had no chain anchor · point at the substrate row of `peripheral-events` and the signature is satisfied by the anchor txSig.

## the translation rule

four invariants on the envelope, regardless of altitude:

1. **provenance** · who emitted it · `provenance.emitter`
2. **scope** · what bounded context it belongs to · `scope`
3. **idempotency** · replay-safe via `id`
4. **anchoring** · `signature.ed25519` for off-chain emitters · `signature.substrate-pointer` for chain-anchored emitters

these four are non-negotiable. the `EventEnvelope` Schema is the enforcement.

## what we lack today

we have the SHAPE. we lack the native cross-daemon transmission protocol. for one daemon NFT's event to reach another agent without a centralized freeside integration, a routing surface is needed:

- **on-chain anchor** · solana Anchor program at `loa-hounfour/programs/daemon-relay/` that holds subscription state (which TBAs subscribe to which scopes)
- **TypeScript port** · `loa-finn/src/relay/relay.port.ts` exposing the read-side as an Effect service so any construct can subscribe to a scope across daemons

this composes with `chathead-in-cache-pattern` (the manifest IS the subscription target) and `continuous-metadata-as-daemon-substrate` axis-4 (operator-mutable cadence per layer). until the relay ships, cross-daemon messaging routes through freeside as the centralized hub.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)
* `compass/lib/activity/index.ts:42-48` · current hand-rolled pubsub (migration target)
* `compass/lib/sim/population.system.ts:69` · current hand-rolled pubsub (migration target)
* `compass/packages/peripheral-events/src/world-event.ts` · current solana envelope shape (`{_tag, eventId, emittedAt, ...}`)
* `vault/wiki/concepts/metadata-as-integration-contract.md` · the stable-shape principle
* `vault/wiki/concepts/chathead-in-cache-pattern.md` · subscription-target-as-manifest doctrine
