---
title: translation layer canon
status: candidate
composes_with: [architecture-and-layering, event-envelope-and-cross-messaging, daemon-nft-as-composed-runtime, puppet-theater-and-ecs-visualizer, construct-effect-substrate]
created: 2026-05-11
updated: 2026-05-12
revision: post-flatline · HC-6 measurable promotion gates + IMP-12 four invariants
source: gemini synthesis (file 5 of 5) · patched after 3-agent adversarial review
---

# Translation Layer Canon

the ecosystem functions only if every construct and agent speaks a shared structural vocabulary. this is the core claim. the vocabulary is **four invariants**: the four-folder pattern (domain/ports/live/mock), the strict event envelope, the suffix discipline, and the verify⊥judge boundary fence. when these four hold, the ecosystem possesses a cohesive translation layer and new constructs slot in seamlessly. without them, fragmentation accelerates through bespoke integrations.

## the four invariants (paste-ready for SKILL.md)

1. **Isomorphism invariant** · code, runtime, ledger share the ECS≡Effect≡Hexagonal shape · same four folders · same boundary semantics · vocabulary is preference, structure is the substrate
2. **Envelope invariant** · every cross-boundary signal carries `{id, trace, scope, provenance, payload, signature}` · signature is discriminated `{kind: "ed25519", sig}` OR `{kind: "substrate-pointer", txSig, slot}` (§08 schema)
3. **Folder invariant** · every bounded context exposes `domain/`, `ports/`, `live/`, `mock/` · behavior surface enumerable in one `find -name '*.port.ts'` command
4. **Verify⊥judge invariant** · `verify` is pure and substrate-anchored · `judge` is LLM-bound and revocable · the boundary is a compile-time type fence (§09 `ConstructBoundary`)

invariants are **testable**; prose is not. each invariant has a verification path:

| invariant | verification |
|---|---|
| isomorphism | grep enumeration · `find lib -type d -name 'domain' -o -name 'ports' -o -name 'live' -o -name 'mock'` returns 4 folders per bounded context |
| envelope | parse a sample event with the `EventEnvelope` Schema · failure mode is `SchemaDrift` |
| folder | every package containing a `*.live.ts` must also contain at least one `*.port.ts` and one `*.mock.ts` · CI rule |
| verify⊥judge | `judge(envelope)` (un-narrowed) MUST fail typecheck · `judge(verifiedEvent)` MUST pass |

## current adoption state

partial · honestly named.

- **compass**: adopted the four-folder pattern at the code level (2 ports, 2 live, suffix discipline in `lib/sim/`). status: candidate · validated 1 project (`construct-effect-substrate` README)
- **construct-effect-substrate**: ships the doctrine pack with the four patterns (domain-ports-live · suffix-as-type · ecs-effect-isomorphism · delete-heavy-cycle). status: candidate · needs ≥3 adoptions to promote to active
- **the envelope schema**: NOT yet shipped as a canonical artifact · §08 of this set provides the Effect Schema paste-ready · cycle 1 work
- **the verify⊥judge fence**: NOT yet shipped · §09 of this set provides the `ConstructBoundary` interface paste-ready · cycle 1 work
- **the loa ecosystem doc**: identifies constructs as a cross-cutting plane but does not yet formalize the envelope as a translation-layer artifact

## proposed path · separate construct pack

the recommendation is to create a distinct `construct-translation-layer` pack rather than fold into `construct-effect-substrate`. reasoning:

- `construct-effect-substrate` serves the **code substrate baseline** · the four-folder discipline at a single project scale
- `construct-translation-layer` serves the **cross-construct semantics baseline** · how envelopes flow between projects · how verify⊥judge holds across language boundaries · how the metadata document syncs three altitudes

they are different altitudes of the same doctrine and should promote independently. merging them risks diluting the tight focus of the code-level substrate pack. composition stays explicit · the translation layer pack `composes_with: [construct-effect-substrate]` in its manifest.

## promotion criteria · measurable gates

candidate → active requires **all** of the following:

1. **≥3 distinct projects** adopt the translation layer · at least one MUST be non-Next.js · at least one MUST be a non-EVM/non-solana stack (cardano · ICP · or off-chain only) to prove framework-independence
2. **≥1 envelope round-trip** measured · substrate → runtime → distribution → back · p95 under 200ms in a non-Next.js project
3. **counter-example tests pass** in adopting projects:
   - malformed signature (both kinds) is rejected at envelope decode with `SchemaDrift`
   - replay (same `id` twice within a window) is rejected at the substrate altitude
   - scope-mismatch routing (envelope claims `daemon.lifecycle.*` but is delivered to a `governance.*` consumer) is rejected at port type
4. **≥1 promotion project is Solana-anchored** so the §07 column proves out · until this lands the solana column is aspirational
5. **the four invariants** each have a verification path implemented in at least 2 of the 3 adoption projects · grep + Schema decode + CI rule + compile-time fence

these gates are measurable. "adopted by 3 projects" alone is too weak · `construct-effect-substrate` is on that gate today and remains candidate · so this pack needs sharper instrumentation to avoid the same fate.

## three ways the translation layer compounds

1. **substrate + envelope → zero-config observability** · any freeside interface can render any daemon's state without custom UI code · because the envelope shape is the same everywhere
2. **daemon-NFT-as-runtime + verify⊥judge → safe LLM-brain swaps** · daemons can change their LLM brains (model · voice · persona) without risking their on-chain assets · because `judge` cannot touch what `verify` controls
3. **envelope + puppet theater → visceral debugging** · multi-agent economic interactions become readable at 3 altitudes simultaneously · operators can fork a daemon · run it in the theater · diff its trajectory against the live ledger

## distillation packet (for `composes_with:` blocks in adopting projects)

```yaml
# paste-ready · adopting projects add this to their construct manifest
composes_with:
  - construct-translation-layer  # this pack
guarantees:
  - isomorphism: "domain/ports/live/mock present in every bounded context"
  - envelope:    "EventEnvelope schema enforces id/trace/scope/provenance/payload/signature"
  - folder:      "behavior surface enumerable via *.port.ts grep"
  - verify_judge: "ConstructBoundary.judge requires VerifiedEvent · compile-time fence"
```

## emergence

across all altitudes, interfaces, and state machines, the unstated but persistent reality is that **the metadata document is the single, mutable source of truth that forces the code, the ledger, and the visualizer into synchronization**. the construct-effect-substrate doctrine names the code-altitude version of this (Schema is the source of truth). continuous-metadata-as-daemon-substrate names the on-chain version. the translation layer makes the synchronization itself a first-class artifact rather than a side-effect of each integration.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)
* `vault/wiki/concepts/continuous-metadata-as-daemon-substrate.md` (on-chain altitude of the same forcing function)
* `vault/wiki/concepts/metadata-as-integration-contract.md` (the stable-shape principle)
* §07-§10 of this 5-doc set (the substrate ↔ agentic translation layer)
