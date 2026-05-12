---
title: architecture and layering
status: candidate
composes_with: [construct-effect-substrate, ecosystem-architecture]
created: 2026-05-11
source: gemini · substrate↔agentic translation layer · file 1 of 5
---

# Architecture and Layering

the ecosystem operates across three distinct altitudes · code, agent runtime, and on-chain state · yet the underlying structure remains isomorphic. the recent compass refactor proved this out. by adopting the four-folder pattern, we established a code substrate doctrine that mirrors the agentic ecosystem direction. the ECS ≡ Effect ≡ Hexagonal isomorphism is not just theoretical · it is the structural reality that allows a single mental model to span all domains.

when we map the architecture, the translation layer becomes explicit:

| Layer | Code substrate (compass) | Ecosystem stack (loa) | Agentic surface (Daemon NFT) | Solana parallel |
| --- | --- | --- | --- | --- |
| Substrate (state · types · invariants) | Domain (Effect Schema) + Ports + Live/Mock Layers | hounfour (schemas · contracts · economic invariants) | NFT contract + token-bound account (ERC-6551) | Account + program-derived address + Anchor IDL |
| Runtime (state machines · transitions) | `*.system.ts` Effect.gen pipelines | finn (agent execution · model routing · sandbox) | Daemon's lifecycle stages + memory architecture | Program instructions + state transitions |
| Distribution (event envelope · cross-messaging) | `pubsub` channels + typed-error adapters | freeside (Discord · API · token-gated access · billing) | Event emission · transfer-as-entrusting · share-cards | StoneClaimed events + transaction logs + program logs |

across these three columns, the constant is the shape of the boundary. state is sovereign and verified deterministically. transitions are explicit. communication happens via enveloped events. this is the construct pipe doctrine applied at the macro scale.

the operator writes code in the substrate layer. this is where the `domain/` schemas and `*.live.ts` implementations live. the network glue · the routing and orchestration · lives in the finn and freeside layers of the runtime. the user surface is the distribution layer, where the daemon interacts with the world via freeside interfaces or on-chain events.

ownership of this discipline falls to the hounfour construct. hounfour holds the schemas and the invariants. it ensures that a state transition requested by finn is valid according to the substrate's rules.

ultimately, this entire translation stack is an implementation of domain-driven design. the four-folder pattern is DDD with explicit boundary types. the `domain/` folder is the bounded context, pure and isolated. the `ports/` are the published-language interfaces that define how the outside world interacts with the core. the `live/` implementations are the anti-corruption layers that translate messy external reality into the clean types of the domain. when the code reflects the domain, the code reflects the daemon.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)
