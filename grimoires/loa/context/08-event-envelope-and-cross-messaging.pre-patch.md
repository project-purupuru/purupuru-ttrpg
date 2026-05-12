---
title: event envelope and cross messaging
status: candidate
composes_with: [architecture-and-layering, ecosystem-architecture]
created: 2026-05-11
source: gemini · substrate↔agentic translation layer · file 2 of 5
---

# Event Envelope and Cross Messaging

the system breathes through its events. the translation layer requires a standardized envelope for every signal passing between constructs, daemons, and ledgers. the recent substrate cycle formalized this at the code level.

at the code level, compass shipped the Effect Stream-Hub-PubSub primitives. these are the arteries for `activityStream` and `populationStore`. every adapter call is wrapped in a typed-error envelope. the signature is consistent · success or expected failure, cleanly structured.

at the runtime level, the loa ecosystem relies on the construct-event envelope schema defined in hounfour. a construct emits an event. hounfour validates the envelope against the schema. finn routes the validated event to the appropriate sandbox. freeside delivers it to the external surface. the canonical shape is strict: `[id · trace · scope · payload · signature]`.

at the on-chain layer, this maps directly to Solana program logs, Anchor `emit!` events, and client-side listeners. Solana's ledger functions as a massive, public event-sourced substrate. programs publish state transitions as events, and the ecosystem subscribes.

the translation rule is absolute. whether moving through an Effect stream, a finn router, or a Solana log, every envelope must carry four elements. first · provenance (who emitted it). second · scope (what bounded context it belongs to). third · idempotency key (to prevent replay collisions). fourth · a signature or a substrate-truth pointer (verifying it happened). these four are non-negotiable across all altitudes.

what we lack currently is the native cross-daemon transmission protocol. we have the envelope, but we do not have a decentralized finn router. for one Daemon NFT's event to reach another agent without a centralized freeside integration, we need an on-chain pubsub registry. a specific contract · likely `loa-daemon-relay.ts` · must be written to allow daemons to subscribe to specific event scopes emitted by other TBAs directly on the ledger.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)
