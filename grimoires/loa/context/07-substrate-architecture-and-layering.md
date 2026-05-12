---
title: architecture and layering
status: candidate
composes_with: [construct-effect-substrate, ecosystem-architecture, multi-axis-daemon-architecture, freeside-as-layered-station]
created: 2026-05-11
updated: 2026-05-12
revision: post-flatline · BLOCKER fixes B2 + HC-5 + naming-drift D-2
source: gemini synthesis (file 1 of 5) · patched after 3-agent adversarial review
---

# Architecture and Layering

the ecosystem operates across three altitudes · code, agent runtime, and on-chain state · and the underlying structure is isomorphic at each altitude. the recent compass refactor proved this out at the code altitude. by adopting the four-folder pattern (`domain/ports/live/mock`), we established a code substrate doctrine that mirrors the agentic ecosystem direction. **the ECS ≡ Effect ≡ Hexagonal isomorphism is the structural reality that allows a single mental model to span all domains.** vocabulary is preference; the four-folder shape is the substrate.

a clarifying note before the table: in the loa ecosystem (per `loa/docs/ecosystem-architecture.md:55-59`), **hounfour and finn are LAYERS in the 5-layer stack** (L2 protocol-schemas · L3 agent runtime), not constructs. constructs are the cross-cutting distribution plane that plugs into multiple layers — observer · crucible · artisan · beacon · gtm-collective · protocol · construct-effect-substrate · etc. when this doc says "hounfour" it means the protocol/schema repo, not a construct.

a clarifying note on chain identity: today, compass anchors at solana (metaplex genesis stones · `compass/packages/peripheral-events/src/world-event.ts`). the canonical EVM materialization pattern for the daemon body is ERC-6551 (per `vault/wiki/entities/puruhani-as-spine.md`), to be adopted on-demand when on-chain ownership is required. the solana column below describes what is shipped; the ERC-6551 column in §09 describes what is canonical for future EVM adoption. they are not contradictory · they are different anchor surfaces for the same daemon-shape.

when we map the architecture, the translation layer becomes explicit:

| Layer | Code substrate (compass) | Ecosystem stack (loa) | Agentic surface (Daemon NFT) | Solana parallel (today · compass) | Identity / owner |
| --- | --- | --- | --- | --- | --- |
| **Substrate** (state · types · invariants) | Domain (Effect Schema) + Ports + Live/Mock Layers | hounfour · L2 protocol schemas + contracts + invariants | NFT contract + ERC-6551 TBA (per puruhani-as-spine · future EVM) OR Metaplex mint (today · solana) | Account + program-derived address + Anchor IDL | operator + hounfour PR |
| **Runtime** (state machines · transitions) | `*.system.ts` Effect.gen pipelines | finn · L3 agent execution + model routing + sandbox | daemon lifecycle stages + memory architecture | Program instructions + state transitions | finn-layer maintainer + bridgebuilder review |
| **Distribution** (event envelope · cross-messaging) | typed-error adapter Effects + hand-rolled subscribe(cb) today · Effect.PubSub planned (see §08) | freeside · L4 platform (Discord · API · token-gating · billing) | event emission · transfer-as-entrusting · share-cards | Program logs + Anchor `emit!` events + client listeners | freeside ops + dixie L5 product |
| **Test substrate** (mocks · property tests · replay) | `*.mock.ts` Layers + Effect property tests | hounfour invariant suite + finn sandbox replay | shadow-fork TBA + simulated metadata mutations | `solana-test-validator` + Anchor `bankrun` | CI + fagan reviewer |

across these four rows, the constant is the shape of the boundary. state is sovereign and verified deterministically. transitions are explicit. communication happens via enveloped events. this is the construct pipe doctrine applied at the macro scale.

the operator writes code at the substrate altitude. this is where the `domain/*.schema.ts` records and `*.live.ts` implementations live. the network glue · the routing and orchestration · lives at the runtime altitude (finn-layer). the user surface is at the distribution altitude, where the daemon interacts with the world via freeside interfaces or on-chain events.

ownership of the substrate discipline falls to the hounfour-layer maintainer. hounfour holds the schemas and the invariants. it ensures that a state transition requested by finn is valid according to the substrate's rules. the test substrate row makes this symmetric — every bounded context that exposes ports must also expose mocks, so behaviors are testable without provisioning the live infrastructure.

ultimately, this translation stack is an implementation of domain-driven design. the four-folder pattern is DDD with explicit boundary types. the `domain/` folder is the bounded context, pure and isolated. the `ports/` are the published-language interfaces that define how the outside world interacts with the core. the `live/` implementations are the anti-corruption layers that translate messy external reality into the clean types of the domain. when the code reflects the domain, the code reflects the daemon.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md) (L1-L5 stack · constructs as cross-cutting plane)
* `vault/wiki/entities/puruhani-as-spine.md` (ERC-6551 TBA · mint-on-demand never mint-at-onboarding)
* `compass/packages/peripheral-events/src/world-event.ts` (current solana envelope shape)
