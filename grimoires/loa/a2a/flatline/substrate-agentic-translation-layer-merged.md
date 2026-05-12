# Substrate ↔ Agentic Translation Layer · 5-File Design Surface

> Merged doc for adversarial multi-model review · 2026-05-11
> Source: Gemini synthesis (operator-prompted) of substrate doctrine + agentic ecosystem
> Files: 07-11 in grimoires/loa/context/
> Status: candidate · pre-ratification


---

# §07 · From 07-substrate-architecture-and-layering

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

---

# §08 · From 08-event-envelope-and-cross-messaging

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

---

# §09 · From 09-daemon-nft-as-composed-runtime

---
title: daemon nft as composed runtime
status: candidate
composes_with: [architecture-and-layering, dAMP-96]
created: 2026-05-11
source: gemini · substrate↔agentic translation layer · file 3 of 5
---

# Daemon NFT as Composed Runtime

a daemon is not a static picture. applying eileen's verbs-not-nouns framing, daemons are state machines. the most meaningful companion is the one that evolves. the architectural anchor is the ERC-6551 token-bound account · puruhani as the spine. the TBA is the body. the continuous metadata is the current state. the event emission is its voice.

we evaluate the daemon across a multi-axis architecture. five orthogonal axes compose the runtime. stack · the infrastructure layer defining the TBA and schemas. civic · the alignment, whether governor or speaker. exodia · the physical composition of constructs as body parts. time · the state-receipts functioning as episodic memory. community · the coexistence and interaction with other daemons.

the translation to the substrate is direct. a daemon NFT and an `Effect.Service` share the same shape. the stack axis is defined in `daemon.schema.ts`. the civic alignment is enforced by `governance.port.ts`. the exodia composition is assembled in `exodia.live.ts`. time is recorded via the event envelope in `memory.system.ts`. community interactions are routed through the pubsub channels.

the fundamental division of labor applies here. the substrate verifies, the construct judges. on-chain truth · ownership, elements, receipts · is deterministic and absolute. the mibera-as-NPC doctrine dictates that the LLM-bound finn construct handles the subjective layer. the finn construct evaluates the voice, the per-grail behavior, and the emotional response. this split is enforced at the `construct-boundary.port.ts` interface. we never route on-chain value through LLM verdicts.

for the subjective voice, dAMP-96 serves as the default substrate. 96 dials across six categories · cognitive, communicative, emotional, knowledge, decision, creative · deterministically generate the `BEAUVOIR.md` voice from on-chain attributes. archetype, era, element, and astrology map directly to dial settings. this provides distinct personality at the long-tail tier without manual authoring. curator-authored personas remain the oracle exception for high-canon tiers.

the canonical lifecycle operates as a state machine.

```typescript
Effect.gen(function* () {
  const tba = yield* mintTBA(identity); // dormant: on-chain body created
  const metadata = yield* initializeState(tba); // stirring: initial metadata mutation
  const stream = yield* connectEventStream(metadata); // breathing: emitting heartbeats
  const persona = yield* resolveVoice(dAMP96(metadata)); // soul: finn construct engages
  return Daemon.Live(persona, stream);
})
```

every phase change is a metadata mutation, not a contract upgrade.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)

---

# §10 · From 10-puppet-theater-and-ecs-visualizer

---
title: puppet theater and ecs visualizer
status: candidate
composes_with: [architecture-and-layering, daemon-nft-as-composed-runtime]
created: 2026-05-11
source: gemini · substrate↔agentic translation layer · file 4 of 5
---

# Puppet Theater and ECS Visualizer

the operator requires a visualizer · a puppet theater for the daemons. the three.js scene acts as the world. each daemon NFT is a puppet, comprising a mesh and an animator. the strings driving the puppets are the events emitted by the substrate. the ECS ≡ Effect ≡ Hexagonal isomorphism guarantees this composes cleanly. ECS provides the system/component/entity grammar native to game engines, and the daemon NFT is already modeled as an entity.

three.js is uniquely suited for this translation. instanced meshes allow rendering thousands of daemons with a single shader call. the declarative scene graph maps directly to our React tree and metadata structures. GPU-driven particle systems visualize the event emissions natively. post-processing provides the ambient sky aesthetic inherited from the compass hades-pattern.

the ECS-to-three.js bridge connects the axes of the daemon architecture to rendering subsystems. the stack axis maps to the mesh hierarchy. the civic axis determines the camera focus and audience layout. the exodia axis composes the material slots and shaders. the time axis drives the animation timeline, with state-receipts acting as keyframes. the community axis manages the spatial partitioning of the shared scene.

a minimum viable puppet theater requires strict adherence to the substrate doctrine. the MVP consists of specific files using the suffix convention:

* `world.system.ts` · the central ECS loop.
* `puppet.component.ts` · the visual state data.
* `event-stream.port.ts` · the interface for incoming on-chain and finn events.
* `puppet-renderer.live.ts` · the three.js instanced mesh implementation.
* `axis-time.system.ts` · the timeline interpolator.

in this theater, the three-way translation becomes visceral. when a daemon emits an event · a state transition · the operator sees the same event at three altitudes simultaneously. it appears as a glowing particle emitted by the mesh in the scene. it logs as a formatted row in the freeside activity stream UI. it registers as a pending transaction in the Solana log panel.

the puppet theater is not a demo. it is an experimentation thesis. it is a substrate for play. operators use the theater to test compositions and axis interactions before shipping to mainnet. constructs validate behavioral outputs visually before claiming a daemon stage. the theater mirrors the production substrate exactly.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)

---

# §11 · From 11-translation-layer-canon

---
title: translation layer canon
status: candidate
composes_with: [construct-effect-substrate]
created: 2026-05-11
source: gemini · substrate↔agentic translation layer · file 5 of 5
---

# Translation Layer Canon

the ecosystem functions only if every construct and agent speaks a shared structural vocabulary. this is the core claim. the vocabulary is the four-folder pattern, the strict event envelope, and the uncompromising division where the substrate verifies while the construct judges. when this holds true, the ecosystem possesses a cohesive translation layer, and new constructs slot in seamlessly. without it, fragmentation accelerates through bespoke integrations.

currently, adoption is partial. compass successfully implemented the substrate doctrine. the `construct-effect-substrate` pack remains a candidate. the loa ecosystem documentation identifies the constructs network as a cross-cutting plane, but the envelope schema, while implicit in hounfour, lacks formalization as a standalone translation artifact.

the proposed path is to create a distinct `construct-translation-layer` pack. the substrate pack provides the baseline for isolated code architecture. the translation layer provides the baseline for cross-construct semantics and inter-agent communication. they serve different altitudes and should promote independently. merging them risks diluting the tight focus of the code-level substrate doctrine.

promotion from candidate to active requires specific validation. the translation layer must be adopted by at least three distinct projects within the ecosystem. it must successfully route events between at least two completely different constructs (e.g., finn and an external oracle). we must deliberately test counter-examples · attempting to route malformed envelopes or bypass the verify/judge boundary · and confirm the layer rejects them gracefully.

when implemented, the translation layer compounds value in three specific ways. first, the combination of the substrate doctrine and the event envelope enables zero-config observability · any freeside interface can render any daemon's state without custom UI code. second, daemon-NFT-as-runtime combined with the verify/judge split allows daemons to change their LLM brains without risking their on-chain assets. third, routing the event envelope into the puppet theater provides immediate, visceral debugging of complex multi-agent economic interactions.

distillation packet:
the translation layer guarantees structural isomorphism across code, runtime, and ledger. it enforces the `[id·trace·scope·payload·sig]` envelope for all events. it mandates the four-folder pattern for boundary definition. it physically separates deterministic on-chain verification from subjective LLM judgment.

*emergence check*: across all altitudes, interfaces, and state machines, the unstated but persistent reality is that the metadata document is the single, mutable source of truth that forces the code, the ledger, and the visualizer into synchronization.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)
