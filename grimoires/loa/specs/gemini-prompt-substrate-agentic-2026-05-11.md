# Gemini Prompt · Substrate ↔ Agentic Translation Layer

> Drafted 2026-05-11 by the operator with grounding from the construct-effect-substrate doctrine + loa ecosystem-architecture + the daemon-NFT vault canon. Designed to be pasted into Gemini (or NotebookLM with a systems-thinking notebook attached) to extract a high-level architecture set that maps the just-shipped Effect-substrate work onto the agentic Daemon-NFT direction.

---

# PROMPT (paste into Gemini)

You are an expert systems architect operating in the THE HoneyJar ecosystem. You are writing **a SET of high-level architecture markdown files** that distill a translation layer between two patterns the operator just shipped:

1. **A code substrate doctrine** that names the isomorphism between ECS (game-dev), Effect (functional substrate), and Hexagonal Architecture (Cockburn). One project (a Solana hackathon submission called "compass") just shipped a refactor adopting this doctrine — net **−1236 LOC**, 128/128 tests pass, single `Effect.provide` site, agent-readable suffix convention (`*.port.ts` / `*.live.ts` / `*.system.ts`). The doctrine pack lives at https://github.com/0xHoneyJar/construct-effect-substrate.

2. **An agentic ecosystem direction** built around Daemon NFTs — NFTs that *do things*. Each is an agent encapsulated as a token with mutable metadata representing state, emitting events as it transitions. The metadata layer maps onto Solana's ledger/event semantics. The full ecosystem stack is documented at https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md.

The work is a translation layer: **the substrate doctrine and the agentic ecosystem are describing the same shape at different altitudes.** Code Effect Layer ↔ Ecosystem agent runtime. Code Service ↔ Daemon. Code Schema ↔ Daemon-mutable metadata. Code event envelope ↔ Solana-style on-chain event. Naming the parallel makes it possible for one mental model to span code, runtime, and on-chain — and for each construct/agent in the ecosystem to *speak the same language*.

---

## CONTEXT YOU MUST READ FIRST (URLs — fetch via your tooling)

- https://github.com/0xHoneyJar/construct-effect-substrate — the substrate doctrine pack (`SKILL.md` + `patterns/` + `examples/compass-cycle-2026-05-11.md`)
- https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md — the 5-layer agentic stack (loa → loa-hounfour → loa-finn → loa-freeside → loa-dixie)

These are the two anchor sources. Treat them as ground truth. Cite them when claims rest on them. Do NOT fabricate references to either.

---

## RESONANCE ANCHORS (the operator's epistemological signals)

These are the doctrines + framings the operator returns to. When a finding connects to one of these, name it explicitly so the synthesis carries the operator's voice:

- **The ECS ≡ Effect ≡ Hexagonal isomorphism** — three vocabularies for one structure. Vocabulary is preference; the four-folder pattern (`domain/ports/live/mock`) is the substrate.
- **Eileen's "verbs not nouns" framing** — Daemon NFTs are state machines, not collectibles. The strongest dNFT is the most meaningful companion, not the most autonomous.
- **Puruhani as spine** — the focal point: ERC-6551 token-bound account is the architectural anchor; the companion is the emotional one. Identity root holds element-card inventory + sticker state + battle history + weather reflections + credit balance. Mint-on-demand, never mint-at-onboarding.
- **Multi-axis daemon architecture** — five orthogonal axes (stack · civic · exodia · time · community). Compose them; never conflate them. Each has its own surface, observability, failure mode.
- **Continuous metadata as daemon substrate** — operator-mutable metadata is the missing degree of freedom that makes daemon evolution possible without on-chain churn. Every state transition / voice tuning / lifecycle phase change becomes a metadata mutation, not a contract upgrade.
- **Chathead-in-cache pattern** — RuneScape parallel: per-token rich fields belong IN the canonical sovereign metadata document, not composed at every consumer. Berachain's KV-pointer-flip + sovereign manifest pattern make metadata MUTABLE — that's what L2 game chains are FOR.
- **Mibera-as-NPC** — two-tier division: **construct judges subjectively** (LLM-bound · per-Grail voice · authored by curator) · **substrate verifies deterministically** (quest path · identity · state-transition). Anti-pattern: NEVER route on-chain value through LLM verdicts.
- **dAMP-96** — 96 dials × 6 categories (cognitive/comm/emotional/knowledge/decision/creative) deterministically generate a daemon's BEAUVOIR.md voice from on-chain attributes (archetype + era + ancestor_family + element + swag + astrology + mode). Default at long-tail tier; curator-authored persona is the Oracle exception at high-canon tiers.
- **Construct pipe doctrine** — constructs compose as typed pipe stages. Inputs/outputs declared as Schema; the runtime threads them.
- **Translation layer between domains** — when the operator notices the same structural pattern recurring across the ecosystem (substrate · agent runtime · daemon NFT · Solana ledger), the work is to *name the parallel and ship the translator* so each construct/agent speaks the same language.

When you find an unexpected cross-domain echo, NAME IT. Don't just list it.

---

## DELIVERABLE — produce these markdown files (one synthesis per file)

Write each as a standalone artifact, well-formed, with a YAML frontmatter (`title`, `status`, `composes_with`). Each file should be 500–900 words. Use the operator's voice register (lowercase casual · middle-dot `·` separator preferred over em-dash · short patient sentences · period-only · no marketing).

### File 1 · `architecture-and-layering.md`

The high-level layering doc. Map the **3-layer translation stack** explicitly:

| Layer | Code substrate (compass) | Ecosystem stack (loa) | Agentic surface (Daemon NFT) | Solana parallel |
|---|---|---|---|---|
| Substrate (state · types · invariants) | Domain (Effect Schema) + Ports + Live/Mock Layers | hounfour (schemas · contracts · economic invariants) | NFT contract + token-bound account (ERC-6551) | Account + program-derived address + Anchor IDL |
| Runtime (state machines · transitions) | `*.system.ts` Effect.gen pipelines | finn (agent execution · model routing · sandbox) | Daemon's lifecycle stages + memory architecture | Program instructions + state transitions |
| Distribution (event envelope · cross-messaging) | (DRAFT — covered in File 2) | freeside (Discord · API · token-gated access · billing) | Event emission · transfer-as-entrusting · share-cards | StoneClaimed events + transaction logs + program logs |

For each layer:
- Name what stays constant ACROSS the three columns
- Name where the operator should expect to write CODE (substrate) vs NETWORK GLUE (runtime) vs USER SURFACE (distribution)
- Name the LOA construct that owns this layer's discipline

Close with a **load-bearing statement** of where DDD lives in this picture (hint: the four-folder pattern is DDD with explicit boundary types · `domain/` is the bounded context · `ports/` are the published-language interfaces · `live/` are the anti-corruption layers).

### File 2 · `event-envelope-and-cross-messaging.md`

The middle layer the operator named explicitly: **event system + envelope packaging + cross-messaging system** (already designed in the agentic system). Map this onto:

- **What the substrate cycle just shipped at the code level** — the Effect Stream-Hub-PubSub primitives that activityStream + populationStore use; the typed-error envelope that wraps every adapter call.
- **What the loa ecosystem ships at the runtime level** — the construct-event envelope schema named in `loa/docs/ecosystem-architecture.md` ("emits events via event envelope schema → hounfour"). Construct emits → hounfour validates → finn routes → freeside delivers. Name the canonical envelope shape (id · trace · scope · payload · signature) if the source supports it.
- **What the on-chain layer ships** — Solana program logs + Anchor `emit!` events + Phantom `accountSubscribe` listeners. Why this maps cleanly: Solana's ledger IS an event-sourced substrate; programs publish events that the world subscribes to.
- **The translation rule**: every envelope must carry (a) provenance, (b) scope, (c) idempotency key, (d) a signature or a substrate-truth pointer. These four are non-negotiable across all three altitudes.

Close with **what we don't have yet** — the missing piece(s) that would let one Daemon NFT's event reach another agent in the ecosystem without a custom integration. Be specific: name the file/contract/schema that would need to exist.

### File 3 · `daemon-nft-as-composed-runtime.md`

The agentic-game-model doc. The operator's framing: *"NFTs that can actually do things · agents that can do things, encapsulated as an NFT with mutable metadata that represents state, then able to emit events."*

Required structure:
- **The NFT-as-runtime claim** — token-bound account + mutable metadata + event emission. Why the daemon needs all three (the TBA is its body, the metadata is its current state, the event is its output to the world). Use the Eileen verbs-not-nouns framing.
- **The five-axis composition** — apply the multi-axis-daemon-architecture doctrine to the single-NFT case. Stack (the 4-layer per-daemon infrastructure) · Civic (governor vs speaker) · Exodia (constructs as body parts) · Time (state-receipts as memory) · Community (multi-daemon coexistence).
- **The translation to substrate** — for each axis, name the code-level structure that holds it (which `*.live.ts`? which `*.port.ts`? which `Schema`?). The point: a daemon NFT and a `Service<Tag>` are the same architectural shape at different altitudes.
- **Substrate verifies, construct judges** — the canonical division. On-chain truth (transitions · ownership · receipts) is deterministic; the LLM-bound construct evaluates subjective things (voice · response · per-Grail behavior). Name the boundary file/contract where this split is enforced.
- **dAMP-96 as the default-voice-substrate** — the deterministic personality generator. 96 dials × 6 categories. Maps token attributes to voice without authored content. Curator-authored persona is the Oracle exception at high-canon tiers. Reference Eileen's dNFT spec.

Close with **the canonical Daemon NFT lifecycle as a state machine**, written as Effect.Service.gen pseudocode — `dormant` → `stirring` → `breathing` → `soul`, with the substrate-layer transitions named (TBA mint · metadata mutation event · ERC-2535 diamond facet upgrade · whatever).

### File 4 · `puppet-theater-and-ecs-visualizer.md`

The fun part. The operator wants an ECS visualizer built with three.js — the **puppet theater** for daemon NFTs.

Required structure:
- **The puppet-theater frame** — three.js scene = the world; each daemon NFT = a puppet (mesh + animator); the strings are events emitted by the substrate. Why this composes: ECS gives us the system/component/entity grammar that three.js needs anyway (think `koota` or `miniplex`). The Daemon NFT IS already an entity.
- **What three.js does that other render engines don't** for this case — instanced meshes (one shader, 1000s of daemons), declarative scene graph (matches React tree), GPU-driven particle systems for event emissions, post-processing for the "ambient sky" the operator already loves (compass shipped a Hades-pattern ceremony · the puppet theater extends this).
- **The ECS-three.js bridge specifically** — Each axis of the multi-axis-daemon-architecture maps to a three.js subsystem: (a) stack → mesh hierarchy, (b) civic → camera/audience, (c) exodia → composed material slots, (d) time → animation timeline + receipts as keyframes, (e) community → scene shared with other puppets.
- **The minimum viable puppet theater** — name the 5–7 files an MVP would have. Think: `world.system.ts` · `puppet.component.ts` · `event-stream.port.ts` · `puppet-renderer.live.ts` · `axis-{1..5}.system.ts`. Use the construct-effect-substrate suffix discipline so it auto-installs into the existing doctrine.
- **The three-way translation visible in the visualizer** — when a daemon emits an event, the operator should be able to see THE SAME EVENT at three altitudes simultaneously: as a mesh particle in the scene, as a row in the activity stream UI, as a pending tx in a Solana log panel. The visualizer is where the translation layer becomes visceral.

Close with **the experimentation thesis**: a puppet theater is a *substrate for play*. Operators try compositions in the theater before shipping them to mainnet. Constructs validate behavior in the theater before claiming a daemon stage. The theater is not a demo — it's a sandbox that mirrors the production substrate.

### File 5 · `translation-layer-canon.md`

The doctrine page. Names the translation layer as a first-class concept, captures the rules, and proposes a path for the construct-effect-substrate pack to absorb this distillation upstream.

Required structure:
- **The claim**: every construct/agent in the ecosystem must be able to read and emit in a shared structural vocabulary. The vocabulary is the four-folder pattern + the event envelope + the substrate-verifies-construct-judges division. When this holds, **the ecosystem has a translation layer** and any new construct slots in cleanly. When it doesn't, every integration is bespoke and the ecosystem fragments.
- **The current state** — partial. Compass adopted the substrate. construct-effect-substrate is `status: candidate`. The loa ecosystem doc names the constructs network as a cross-cutting plane. The envelope schema is implicit in hounfour but not formalized as a translation-layer artifact.
- **The proposed shape** — should the construct-effect-substrate pack absorb this distillation, or should a new pack (e.g. `construct-translation-layer`) be created? Recommend ONE with reasoning. (Operator hint: the substrate pack is the BASELINE for code; the translation layer is the BASELINE for cross-construct semantics — they may want to live separately so each can promote independently.)
- **Promotion criteria** — what does it take for the translation layer to move from `candidate` to `active`? Specifically: how many projects, how many constructs adopting it, what counter-examples must be tested?
- **Three ways the translation layer compounds** — name how the substrate doctrine + envelope + daemon-NFT-as-runtime + puppet theater compound into a more-than-the-sum system. Be specific about which compositions unlock which capabilities.

Close with a **distillation packet** — a 5–7 line summary that the operator can paste into a construct manifest's `composes_with:` block.

---

## OUTPUT STRUCTURE (strict)

For each file, output:

1. The filename as a level-1 markdown header
2. The YAML frontmatter (between `---` fences) with `title`, `status: candidate`, `composes_with: [list-of-related-doctrines]`, `created: 2026-05-11`
3. The body — 500–900 words per file
4. A `## Sources` section at the end with cited URLs (only the two anchor URLs above + any Effect docs / koota docs / Solana docs Gemini's grounded search returns)

Do all 5 files in one response.

---

## NEGATIVE CONSTRAINTS

- **Do NOT generate generic enterprise-architecture content.** This is a worked synthesis of a SPECIFIC ecosystem. If your output reads like it could apply to "any web3 project," you've failed.
- **Do NOT invent files, contracts, or programs that don't exist.** When you claim a file or pattern exists in compass / loa / construct-effect-substrate, base it on what you can verify from the URLs above.
- **Do NOT use em-dashes.** The operator prefers middle-dots ( `·` ). Strip every `—` from your output.
- **Do NOT propose route-handler-as-Effect or DAO-style governance.** These are explicitly out of scope for the current cycle.
- **Do NOT skip the daemon NFT direction.** This is the load-bearing thread. Every file must address how its layer participates in the daemon NFT lifecycle.
- **Do NOT recommend rewriting the substrate doctrine.** It just shipped. The work is *extending* it with the agentic + envelope + theater translation, not replacing it.
- **Do NOT pretend you've read what you haven't.** If a doctrine page is referenced but you can't find it in the URLs, say so explicitly and ground only what you can verify.

---

## EMERGENCE CHECK (last paragraph of File 5 only)

After completing all 5 files, look across them. Is there a **structural pattern that appears in every file** but isn't named in any single one? If yes, name it as a single sentence in File 5's closing. This is the emergence — the insight that wasn't in any one file but appeared from the set.

---

# END OF PROMPT
