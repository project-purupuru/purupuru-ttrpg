---
title: daemon nft as composed runtime
status: candidate
composes_with: [architecture-and-layering, event-envelope-and-cross-messaging, multi-axis-daemon-architecture, continuous-metadata-as-daemon-substrate, puruhani-as-spine, mibera-as-npc, damp-as-default-voice-substrate]
created: 2026-05-11
updated: 2026-05-12
revision: post-flatline · BLOCKER fixes B3 + B5 + HC-2 + HC-3 + HC-4 + naming-drift D-2 + BEAUVOIR
source: gemini synthesis (file 3 of 5) · patched after 3-agent adversarial review (this file scored 1630/4000 pre-patch · MOST DANGEROUS)
---

# Daemon NFT as Composed Runtime

a daemon is not a static picture. applying eileen's verbs-not-nouns framing (`vault/wiki/entities/eileen-dnft-conversation.md`), daemons are state machines · the most meaningful companion is the one that evolves. the canonical EVM materialization pattern is the ERC-6551 token-bound account (per `vault/wiki/entities/puruhani-as-spine.md` · **mint-on-demand · never mint-at-onboarding**) · today compass anchors at solana via metaplex genesis stones. the TBA OR the metaplex NFT is the body. the continuous metadata is the current state. the event emission is the voice.

## the five-axis composition (status check)

per `vault/wiki/concepts/multi-axis-daemon-architecture.md`, a daemon composes across five orthogonal axes. axis-1 (stack) and axis-2 (civic) are **load-bearing** in the current canon · axis-3/4/5 are **candidate** synthesis. this doc names them all but does not lock the 3-5 mapping prematurely.

| axis | what it describes | proposed file mapping |
|---|---|---|
| 🦴 stack | per-daemon lifecycle infrastructure | `daemon.schema.ts` (PROPOSED · domain/) |
| ⚖️ civic | governors vs speakers | `governance.port.ts` (PROPOSED · ports/) |
| 🎴 exodia | constructs as body parts | `exodia.live.ts` (PROPOSED · live/) |
| ⏰ time | state-receipts as memory | `memory.system.ts` (PROPOSED · system/) |
| 🏛️ community | multi-daemon coexistence | event-envelope pubsub (per §08) |

**all 4 named files are PROPOSED · not shipped today.** the §Files-to-build section below names what cycle 1 must produce.

a daemon NFT and an `Effect.Service` share the same shape · this is the operationalization of the §07 isomorphism at the daemon scale.

## substrate verifies · construct judges

this is the canonical safety invariant (`vault/wiki/concepts/mibera-as-npc.md` two-tier doctrine). on-chain truth · ownership · elements · receipts · is **deterministic and absolute**. the LLM-bound construct (which runs INSIDE finn · the runtime · not as a sibling) evaluates subjective things · voice · per-grail behavior · emotional response. **on-chain value never routes through LLM verdicts.**

the boundary is **enforced at the type level** via the proposed `ConstructBoundary` interface:

```typescript
// PROPOSED · lib/ports/construct-boundary.port.ts
import { Context, Effect } from "effect"
import type { EventEnvelope } from "@/lib/domain/event-envelope.schema"

// VerifiedEvent is an EventEnvelope that has passed substrate verification.
// Distinct nominal type prevents un-verified events from reaching judge().
export interface VerifiedEvent {
  readonly _tag: "VerifiedEvent"
  readonly envelope: EventEnvelope
}

export interface JudgmentEvent {
  readonly _tag: "JudgmentEvent"
  readonly source: VerifiedEvent
  readonly judgment: string // narrowed at usage
}

export class SubstrateRejection extends Error {
  readonly _tag = "SubstrateRejection" as const
}

export class JudgmentError extends Error {
  readonly _tag = "JudgmentError" as const
}

export interface FinnRuntime {
  readonly _tag: "FinnRuntime"
  // narrow at integration · this is the LLM-bound capability
}
export const FinnRuntime = Context.GenericTag<FinnRuntime>("FinnRuntime")

export class ConstructBoundary extends Context.Tag("ConstructBoundary")<
  ConstructBoundary,
  {
    // pure · deterministic · runs at substrate altitude
    readonly verify: (
      e: EventEnvelope,
    ) => Effect.Effect<VerifiedEvent, SubstrateRejection, never>

    // LLM-bound · revocable · runs at runtime altitude
    // INVARIANT: signature requires VerifiedEvent · compile-time fence
    readonly judge: (
      e: VerifiedEvent,
    ) => Effect.Effect<JudgmentEvent, JudgmentError, FinnRuntime>
  }
>() {}
```

the compile-time fence is the load-bearing detail · `judge` accepts ONLY `VerifiedEvent` · a raw `EventEnvelope` won't typecheck. the verify⊥judge separation is now a type error if violated, not a code-review hope.

## dAMP-96 as default-voice substrate

for the subjective voice, **dAMP-96** serves as the deterministic default (per `vault/wiki/concepts/damp-as-default-voice-substrate.md`). 96 dials across six categories · cognitive · communicative · emotional · knowledge · decision · creative · deterministically generate a daemon's voice file from on-chain attributes (archetype · era · ancestor_family · element · swag · astrology · mode). this voice file is **distinct from the Loa bridgebuilder/soul template** (which is also named `BEAUVOIR.md` but is a different artifact in a different namespace).

curator-authored personas remain the **oracle exception** at high-canon tiers (institutional consciousness · per-grail mascot · munkh-tier). dAMP yields to curator authorship when present.

## canonical lifecycle (illustrative · types narrow at integration)

```typescript
// ILLUSTRATIVE pseudocode · signatures narrow at integration
//
// Goal: every yield* maps to an axis · errors are typed in the
// channel · requirements are explicit in R so the layer wiring is
// auditable.

import { Effect } from "effect"
import type { ConstructBoundary } from "@/lib/ports/construct-boundary.port"

class MintFailure extends Error { readonly _tag = "MintFailure" as const }
class SchemaDrift extends Error { readonly _tag = "SchemaDrift" as const }
class StreamUnavailable extends Error { readonly _tag = "StreamUnavailable" as const }
class VoiceResolutionError extends Error { readonly _tag = "VoiceResolutionError" as const }

// PROPOSED services · narrow signatures when files land in cycle 1
declare const TBAClient: Context.Tag<"TBAClient", {
  readonly mint: (id: Identity) =>
    Effect.Effect<TBAAddress, MintFailure, never>
}>
declare const MetadataStore: Context.Tag<"MetadataStore", {
  readonly initialize: (tba: TBAAddress) =>
    Effect.Effect<DaemonMetadata, SchemaDrift, never>
}>
declare const EventBus: Context.Tag<"EventBus", {
  readonly connect: (m: DaemonMetadata) =>
    Effect.Effect<EventStream, StreamUnavailable, never>
}>

export const spawnDaemon = (identity: Identity) =>
  Effect.gen(function* () {
    // dormant · on-chain body created (or metaplex mint today)
    const tba = yield* TBAClient.mint(identity)

    // stirring · initial metadata mutation (axis-1 stack)
    const metadata = yield* MetadataStore.initialize(tba)

    // breathing · emitting heartbeats (axis-4 time · §08 envelopes)
    const stream = yield* EventBus.connect(metadata)

    // soul · finn-runtime engages (axis-3 exodia composes construct capabilities)
    const persona = yield* dAMP96.resolveVoice(metadata)

    return { tba, metadata, stream, persona }
  })
// inferred:
// Effect.Effect<
//   Daemon,
//   MintFailure | SchemaDrift | StreamUnavailable | VoiceResolutionError,
//   TBAClient | MetadataStore | EventBus | FinnRuntime
// >
```

every phase change is a metadata mutation, **not a contract upgrade** · the continuous-metadata doctrine guarantees this (`vault/wiki/concepts/continuous-metadata-as-daemon-substrate.md`).

## §Files-to-build (cycle 1 of substrate↔agentic)

| file | role | folder | depends on |
|---|---|---|---|
| `lib/domain/event-envelope.schema.ts` | the canonical event shape | domain/ | none (Effect Schema only) |
| `lib/ports/construct-boundary.port.ts` | verify⊥judge fence | ports/ | event-envelope.schema |
| `lib/domain/daemon-state.schema.ts` | axis-1 stack data | domain/ | event-envelope.schema |
| `lib/ports/governance.port.ts` | axis-2 civic governor/speaker boundary | ports/ | daemon-state.schema |
| `lib/live/daemon.live.ts` | the lifecycle Effect.gen above · cycle 1 illustrative version | live/ | all of the above |
| `lib/mock/daemon.mock.ts` | shadow-fork TBA · simulated metadata mutations · for tests | mock/ | daemon-state.schema |
| `lib/system/memory.system.ts` | axis-4 time · state-receipts indexing | system/ | event-envelope.schema |

axis-3 (exodia) and axis-5 (community) are deferred to cycle 2 once the boundary holds at types.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate) (four-folder pattern)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md) (finn-layer hosts the LLM-bound runtime)
* `vault/wiki/entities/eileen-dnft-conversation.md` · verbs-not-nouns · the dNFT spec
* `vault/wiki/entities/puruhani-as-spine.md` · ERC-6551 TBA · mint-on-demand
* `vault/wiki/concepts/multi-axis-daemon-architecture.md` · 5 orthogonal axes
* `vault/wiki/concepts/continuous-metadata-as-daemon-substrate.md` · 4-layer daemon stack
* `vault/wiki/concepts/mibera-as-npc.md` · two-tier construct-judges-substrate-verifies
* `vault/wiki/concepts/damp-as-default-voice-substrate.md` · dAMP-96 personality generator
