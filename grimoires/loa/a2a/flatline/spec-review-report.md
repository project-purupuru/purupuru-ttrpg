# Spec Review · Substrate↔Agentic Translation Layer (5-file set)

> 3-agent adversarial review · 2026-05-12 01:50Z · flatline-orchestrator degraded (PROVIDER_DISCONNECT #774) · substituted with skeptic + improver-steel-man + consensus-judge agents
>
> **Verdict: DO NOT INTEGRATE AS-IS** · 5 blockers · 6 high-consensus fixes · 2 disputed · 7 naming drifts · 7 steel-man items to preserve

## Per-file scores (0-4000)

| File | Groundedness | Coherence | Actionability | Risk-inverse | Total | Label |
|---|---|---|---|---|---|---|
| §07 architecture-and-layering | 620 | 780 | 480 | 550 | **2430** | partial · table is load-bearing but missing rows/columns |
| §08 event-envelope | 380 | 720 | 420 | 380 | **1900** | envelope shape is fabricated · actual schema differs |
| §09 daemon-nft-as-composed-runtime | 320 | 680 | 350 | 280 | **1630** | **MOST DANGEROUS** · locative claims about non-existent files |
| §10 puppet-theater | 410 | 740 | 520 | 450 | **2120** | vapor but coherent vision · disputed |
| §11 translation-layer-canon | 480 | 760 | 540 | 600 | **2380** | aspirational gates · needs measurable instrumentation |

## BLOCKERS (5 · scored 720-950)

| ID | Score | File | The killer |
|---|---|---|---|
| **B1** | 950 | §08 | Compass did NOT ship Effect Stream-Hub-PubSub. `subscribe(cb)` with hand-rolled `Set<callback>` is the actual current state. The substrate pack itself flags this as the next adoption target. |
| **B2** | 850 | §07/§08 | Solana column is fabricated for compass's stack · loa stack has no Solana layer · §08 conflicts with §09's ERC-6551 EVM column. Pick one chain or name the bridge. |
| **B3** | 800 | §09 | ERC-6551 has zero implementation in flight in loa-*/freeside-*/compass · puruhani is a CDN asset not an on-chain entity · vault doctrine says "mint-on-demand never mint-at-onboarding" |
| **B4** | 750 | §08 | "Substrate-truth pointer" is undefined for off-chain envelopes · in-memory subscribe(cb) events have no chain anchor or signature · the rule is unimplementable as written |
| **B5** | 720 | §09 | `construct-boundary.port.ts` is a phantom file · invented in passive voice ("is enforced at") · a claim of enforcement requires a typed interface, none shipped |

## HIGH_CONSENSUS (6 · paste-ready integrations)

| ID | Score | What |
|---|---|---|
| **HC-1** | 880 | Ship the actual Effect Schema for `EventEnvelope` (replaces §08's prose) — `S.Struct({ id, trace, scope, provenance, payload, signature })` with discriminated union for `signature: ed25519 \| substrate-pointer` |
| **HC-2** | 870 | Ship `lib/ports/construct-boundary.port.ts` as a real typed interface — `verify(e): Effect<VerifiedEvent, SubstrateRejection, never>` and `judge(e: VerifiedEvent): Effect<JudgmentEvent, JudgmentError, FinnRuntime>` · compile-time fence on the verify⊥judge boundary |
| **HC-3** | 830 | Mark §09's locative claims (`daemon.schema.ts`, `governance.port.ts`, `exodia.live.ts`, `memory.system.ts`) as PROPOSED · add a §Files-to-build section so Sprint 1 can execute them |
| **HC-4** | 830 | Add typed error channel to §09's mintTBA `Effect.gen` · `Effect.Effect<Daemon, MintFailure \| SchemaDrift \| StreamUnavailable \| VoiceResolutionError, TBAClient \| MetadataStore \| EventBus \| FinnRuntime>` · annotate each `yield*` |
| **HC-5** | 800 | §07 table — add Test substrate row + Identity/owner column · 4 rows × 5 columns · `*.mock.ts` symmetry surfaces the FAGAN-safe shape |
| **HC-6** | 750 | §11 promotion gate — replace "≥3 projects" with measurable: ≥1 envelope round-trip <200ms p95 in non-Next.js project · counter-example tests for malformed sig/replay/scope-mismatch · ≥1 Solana adoption project |

## DISPUTED (2)

| ID | What | Resolution |
|---|---|---|
| **D-1** | Puppet theater (§10) — vapor or productive thesis? | Adopt the Mermaid diagram NOW (concrete) · downgrade prose to "proposed thesis · MVP file list to ship in cycle N+2" |
| **D-2** | Are finn / hounfour "constructs" or "layers"? | Per `loa/docs/ecosystem-architecture.md:55-59` they are LAYERS (L2 protocol, L3 runtime). Constructs are the cross-cutting distribution plane. Rewrite §07/§08/§09 accordingly. |

## NAMING DRIFT (7)

| Term | Where | Fix |
|---|---|---|
| `construct-boundary.port.ts` | §09 | ship via HC-2 |
| `loa-daemon-relay.ts` | §08 | qualify as "loa-hounfour `programs/daemon-relay/` Anchor program + loa-finn `src/relay/relay.port.ts` TS port" |
| `puppet.component.ts` | §10 | rename to `puppet.entity.ts` OR extend pack's suffix discipline |
| `finn construct` | §09 | "finn (the runtime)" |
| `hounfour construct` | §07 | "hounfour (the protocol/schema layer)" |
| `BEAUVOIR.md voice` | §09 | qualify as distinct from the Loa bridgebuilder template |
| `compass hades-pattern` | §10 | delete OR cite commit `41a4aaa style(ceremony): Hades pattern` |

## STEEL-MAN (7 · preserve through any rewrite)

| ID | Score | What survives |
|---|---|---|
| **SM-1** | 920 | ECS≡Effect≡Hexagonal isomorphism as canonical mental model |
| **SM-2** | 950 | The 4-column translation table (§07) — THE artifact · canon-grade |
| **SM-3** | 940 | Substrate verifies, construct judges · "never route on-chain value through LLM verdicts" |
| **SM-4** | 890 | Daemon NFT ≡ `Effect.Service` shape (§09) |
| **SM-5** | 870 | Event envelope carries provenance + scope + idempotency + signature/pointer (the SHAPE survives even though §08's spec is wrong) |
| **SM-6** | 860 | Three-altitude simultaneous event visibility (§10) |
| **SM-7** | 900 | Metadata document as sync forcing function (§11 emergence check) |

## Recommendation

**DO NOT INTEGRATE the 5 files as-is.** They contain too many fabricated locative claims and one structural chain confusion (Solana vs ERC-6551).

**Three paths forward** for the operator:

1. **Patch in place** · address all 5 BLOCKERS + 6 HIGH_CONSENSUS items + the 7 naming drifts in the existing §07-§11 files. Preserve the 7 steel-man items verbatim. Re-review individually after.
2. **Feed back to Gemini** · synthesize this report into a v2 prompt that names the failure modes (envelope fabrication · phantom files · chain confusion · finn-as-construct conflation) and asks for a corrected v2.
3. **Hand-write the corrected canon** · the operator (or a focused agent) writes 5 corrected files using the 6 HC paste-ready blocks + the 7 SM items as the spine. Use this report as the spec.

Path 2 is cheapest; path 3 is highest-quality. Path 1 is a middle-ground if the operator wants to keep Gemini's prose voice but fix the substance.
