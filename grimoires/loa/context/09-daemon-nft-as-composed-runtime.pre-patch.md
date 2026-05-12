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
