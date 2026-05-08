# Bridgebuilder Design Review · SDD r2

**Target**: `grimoires/loa/sdd.md` (r2 · post-codex-awareness-model · post-flatline-r4-deferred)
**Reviewer**: Bridgebuilder · Connection Mode (per design-review-prompt.md)
**Cycle**: simstim-20260507-658e3680
**Mode**: HITL · simstim Phase 3.5
**Date**: 2026-05-07

---

## Opening Context

There is a particular kind of design document that does not announce itself but reveals itself. The first paragraph signals which kind it is. SDD r2 announces "smaller than the final architecture" before listing a single component — and that announcement is doing real work. It is asking the reader to read the document not as a finished plan but as a hypothesis that earns its complexity slice by slice. That is the right register for a 4-day hackathon clock with three teammates pulling parallel threads.

Most SDDs at this scale fail in one of two ways: they specify everything (yielding documents that read like compliance checklists no one will actually consult) or they specify nothing (yielding documents whose virtue is being short and whose vice is being unfalsifiable). SDD r2 lands between those. It specifies the slice, lists what it deliberately defers, and names its own day-1 spike list as the falsifiability criterion. The shape of the document is itself an argument: *if these spikes pass, this design is correct; if they fail, this design must change in known ways.*

That said, a senior reader has work to do. Codex's awareness model gave the structural skeleton; the SDD has filled in the muscles. A few muscles are well-attached. A few are wrapped around the wrong bones. And in two places, the document carries forward an assumption from the PRD that the design has now made answerable — which means the design should answer it, not merely inherit it.

Six dimensions follow.

---

## 1. Architectural Soundness

### The slice claim earns its keep

The module map is genuinely well-bounded. `peripheral-events` as the sealed L2 substrate, `world-sources` as the adapter layer, `medium-blink` as the renderer, with `apps/web` as the Next.js wiring — this is textbook hexagonal architecture, the kind that makes testing trivial and refactoring safe. When you can describe what each package does in one sentence and the sentences don't overlap, you have a clean separation of concerns.

Stripe's payment infrastructure is built on a similar shape — a domain core that knows about money but not about HTTP, an adapter ring that knows about Visa/MasterCard/ACH but not about money semantics, and a thin API layer that wires them together. That separation is what lets Stripe ship 200+ APIs without internal collisions. Your version of this — at four-day-clock scale — keeps the same property.

### But the separation isn't enforced

Here is where the senior reader pauses. The architectural punchline (§0) declares "substrate (truth) ≠ presentation (voice) · agents present, never mutate state." This is the deck-grade differentiator — eileen's design moat. But the SDD nowhere shows *how* this guarantee is mechanized. Convention is not a guarantee.

In Stripe's case, the separation between domain and adapter is enforced by the Go module graph and an internal linter that fails CI if any `payments-core` package imports `net/http`. In your case, the equivalent guard would be:

1. `eslint` or `dependency-cruiser` config in `packages/peripheral-events/` that fails the build if it ever imports `next`, `react`, `@solana/web3.js`, or any concrete adapter.
2. A type-level constraint that mediums can produce text/icons/buttons but cannot return values that close back over substrate state.

Without these guards, the moat is a convention. In four days under three engineers, conventions break. This is a HIGH finding.

### Effect-TS and ECS are paired without explanation

The PRD r6 told us "ECS paired with Effect-TS for isolation." The SDD has packages that use Effect Schema for boundaries (good) but doesn't show what the ECS *is* in code. Are entities just discriminated unions? Are there systems as Effect functions? Is `BaziResolverSystem` a class, a function, or an Effect Layer?

This is fine for a slice — the ECS may not have any actual runtime in v0 (Codex's §12 explicitly defers a literal ECS engine). But if the SDD is going to invoke ECS as the conceptual model, it should show *one* concrete example so the reader knows whether ECS here means "we use entity/component/system vocabulary" or "we have a sparse set archetype iterator." These are very different commitments.

---

## 2. Requirement Coverage

The PRD r6 had 12 functional requirements (FR-1 through FR-11 plus FR-12 for Score dashboard). I traced each one to an SDD section:

| PRD FR | SDD coverage | Status |
|---|---|---|
| FR-1 substrate package | §1 modules + §3.1-3.3 data models + §3.4 PDAs | ✅ |
| FR-2 BLINK_DESCRIPTOR upstream | §1 modules + §10 stretch order 6 | 🟡 partial — descriptor not specified in §3 (data models) |
| FR-3 anchor program · 2 instructions | §5 (full spec) + §3.4 (PDA shapes) | ✅ |
| FR-4 blink-emitter routes | §4 (API contracts) + §1 file paths | ✅ |
| FR-5 score adapter | §1 + §7.1 (brownfield bridge) | ✅ |
| FR-6 TTL cache | §6 (security) — but cache TTLs not stated | 🟡 partial — FR-6 specs caching at FR-level but SDD doesn't restate TTL targets |
| FR-7 voice authority (gumi) | §1 placeholder strings + §10 stretch order 4 | ✅ |
| FR-8 cmp-boundary enforcement | §6.4 + §8.1 (lint + golden tests) | ✅ |
| FR-9 observability | §8.2 | ✅ |
| FR-10 cmp-boundary lint | §6.4 + §8.1 | ✅ |
| FR-11 demo simulator | §10 stretch order 9 | ✅ deferred |
| FR-12 Score dashboard (zerker) | §1 + §7.3 World Lab | 🟡 conflated — see HIGH-3 below |

Two coverage gaps and one conflation. None are CRITICAL, but FR-12 is worth surfacing because zerker's lane is real and the World Lab section conflates concerns.

---

## 3. Scale Alignment

For a hackathon ship serving demo + judging, the scale targets are modest: ~10s of judges interacting via Phantom + Dialect inspector, and a small number of community testers if shared. The design comfortably handles this.

But there are two scale-shaped invariants worth stress-testing:

**The sponsored-payer balance drains linearly with engagement.** §6.2 specifies tiered alerts (5/2/1 SOL). If the demo gets unexpected viral traction during judging window, the floor blows through these tiers fast. The day-of-demo runbook says "top up to >10 SOL" and "DISABLE_PAYER_HALT=true" — but disabling the halt removes the only guard against overdraft. If the keypair's balance drops to 0, every subsequent mint reverts. This is a specific kind of conservation invariant: `committed_mints + reserved_mints ≤ payer_balance / per_mint_cost`. The SDD should state how this invariant is monitored under the disabled-halt window. (HIGH)

**The nonce store must be durable enough to survive vercel cold starts.** §3.3 specifies "nonce stored server-side with 5min TTL." If the nonce store is in-memory (a Set in a Vercel function), the function is stateless across cold starts — meaning a nonce issued in one function instance won't be recognized when validated by another. The 5min TTL becomes meaningless. This needs Redis or Vercel KV or some shared state. (HIGH)

---

## 4. Risk Identification

### The brownfield bridge has a chain-mismatch hidden in it

§7.1 says "v0: uses lib/score deterministic mock (operator-confirmed)." But PRD r6 §FR-5 says "consume score's existing surfaces (read-only): score-puru API + Sonar/Hasura GraphQL." These two statements describe different production realities.

If the v0 ship uses `lib/score` mock, then the deck claim "we read from real on-chain state" is partially false. If the v0 ship uses real `score-puru` API, then we have a runtime dependency on Railway, an API key, and a service we don't operate (zerker's). Both paths have legitimate justifications, but the SDD should pick one for the spine. This is the sort of small ambiguity that resolves itself the wrong way under Day 3 pressure. (HIGH)

### The Metaplex Phantom spike risk is binary but the deck isn't

§5.3 specifies that if Spike 1 (Metaplex Phantom devnet visibility) fails, the fallback is to revert to PDA-only and rename "mint" to "claim record." This is a clean technical fallback. But the deck story is "tap a tweet, mint your archetype, share the world" — the word "mint" appears in the elevator pitch.

If Spike 1 fails on Day 1 morning, the team has 3.5 days to ship code AND rebuild the deck narrative around "claim record" semantics. The deck is allocated half a day. There is no buffer. (MEDIUM — flagging because the SDD section is technically complete but the dependency on the deck narrative is implicit.)

### Recent blockhash + ed25519 instruction ordering is fragile

§4.2 specifies "fetch recent_blockhash (commitment: confirmed)" then "construct legacy Solana transaction with [Ed25519Program(...), claim_genesis_stone]." This ordering is correct but the recent_blockhash is fetched *server-side* before the wallet signs. Solana transactions expire after ~150 slots (~60-90 seconds). If the wallet takes longer than that to sign and submit, the transaction fails with `BlockhashNotFound`.

For Phantom users, signing usually takes 5-15 seconds. For Dialect inspector or other surfaces, it could be longer. The SDD should specify a max stale-blockhash window and either retry-fetch on the wallet side or use durable nonces. (MEDIUM)

---

## 5. Frame Questioning (REFRAME)

This is where I want to spend most of my time. The Connection Mode review prompt explicitly asks me to prioritize REFRAME — and there are two genuine frame questions worth raising.

### REFRAME-1: Has the project drifted from awareness-layer to quiz-and-mint?

The PRD r6 elevator pitch is *"Communities can't see what's actually happening on-chain. We make it visible — in the social feeds they already use."* The SDD's center of gravity is the GET-chain quiz endpoints and the Solana mint flow. These are demo features, not awareness-layer features.

A pure awareness layer would surface:
- Mint events from existing on-chain activity (anyone's, not just yours)
- Burn ceremonies as they happen
- Cosmic weather shifts
- Element affinity drift across the population

The current SDD specifies one of these (`MintEvent`, `WeatherEvent`, `ElementShiftEvent`, `QuizCompletedEvent` in §3.1), but the apps/web routes are all about the quiz interaction. There is no `/api/actions/today` ambient surface, no "what's happening in the world right now" Blink. The architectural moat (separation of substrate and voice) is real, but the *demonstrated* moat is one quiz flow.

Is the demo *teaching* judges that this is awareness infrastructure? Or is it teaching them this is a fortune-telling app? I think reasonable people would conclude the latter from the SDD as written.

This is a REFRAME finding because the design might serve a different problem better. Either:
- (a) embrace the demo-first frame and update PRD/deck to lead with "we built an interactive on-chain bazi reading," or
- (b) reframe the slice to demonstrate the awareness layer first (an ambient feed Blink that shows aggregate world activity) with the quiz as a secondary entry point.

There is no wrong answer, but the current SDD is straddling. (REFRAME)

### REFRAME-2: Why is `apps/web` the wiring layer for everything?

Codex's awareness model declared `apps/* may import packages/*` and `packages/* should not depend on Next.js`. The SDD honors this. But every user-facing surface lives inside `apps/web`. Score dashboard (zerker's lane), World Lab (Codex's §9), all the Action endpoints, the kit landing page.

This makes `apps/web` the universal consumer. If a future medium (Discord webhook bot) needs to consume the same substrate, it would need to either live inside `apps/web` (wrong — it's not a web app) or duplicate the `apps/web` adapter wiring (wrong — drift risk).

The cleanest solution would be a CLI consumer or fixture-only test runner that proves the substrate is consumable *without* Next.js. This isn't a v0 requirement, but it's the kind of structural decision that locks in either flexibility or fragility. (REFRAME · or possibly SPECULATION — depending on whether the team wants to address it now or note it for v1.)

---

## 6. Pattern Recognition

Without lore files (`patterns.yaml`, `visions.yaml`) the pattern recognition dimension is operating from general industry knowledge rather than ecosystem-specific corpus.

A few resonances:

- The **wrap-first-move-later** brownfield rule (Codex §8 · SDD §7) is the same shape as Stripe's "boring technology" club — they explicitly defer migrations until the new system has earned the right to displace the old. zerker's `lib/score` deterministic mock plays this role. Worth celebrating. (PRAISE)

- The **3 day-1 spikes** pattern (§5.3 + §9) is the same shape as Spotify's "release roulette" — high-risk technical questions get answered before product work commits to them. This prevents the day-3 panic that flatline r3 surfaced as a CRITICAL. (PRAISE)

- The **deferred decision register** (§11) is functionally the same shape as architectural decision records (ADRs) used at Amazon, except dated and gated to specific milestones. Worth keeping as a long-term practice. (PRAISE — light)

A specific divergence:

- The **upgrade authority frozen post-deploy** decision (§5.2) diverges from typical Solana program patterns where teams keep upgrade authority on a multisig for 6-12 months as a safety net. The SDD's reason for freezing immediately is correct for hackathon (judges can't redeploy mid-evaluation), but post-hackathon this becomes a real constraint. The SDD should note that mainnet deploy will require a fresh program (different program ID), losing all devnet PDAs. The migration story is non-trivial. (HIGH-adjacent · noted in §5.2 but consequences not stated.)

---

## SPECULATION · architectural alternatives worth exploring

### SPECULATION-1: A `medium-registry` instead of `medium-blink`

The SDD has `packages/medium-blink` as the single-medium renderer. But Codex's awareness model anticipates discord/telegram/twitter mediums, and freeside-mediums already exists upstream as a sealed Effect Schema registry for `MediumCapability`.

If the v0 substrate is going to claim "fans out to other mediums tomorrow," there's a case for shipping `packages/medium-registry` as the abstraction (importing `freeside-mediums/protocol`) and `packages/medium-blink` as one concrete adapter. This is more like the structure freeside-mediums already established. The cost is one extra layer of indirection in v0; the benefit is a clean expansion path.

This is SPECULATION not HIGH because it's a v1+ structural choice, not a v0 correctness issue. But it's worth considering before sprint-1 scaffolds the package.

### SPECULATION-2: Cross-chain identity unification via metadata reference

D-11 in the deferred register is "cross-chain identity unification (Base ↔ Solana)." Currently the Solana Genesis Stone is a TWIN of the Base PurupuruGenesis — separate stones. Long-term this creates fragmentation: one wallet has two stones, neither knowing about the other.

A reasonable post-hackathon approach is to embed a `companion_token_uri` field in the Solana Metaplex metadata that references the Base PurupuruGenesis token (via chain://network/contract/token URI scheme). This makes the Solana stone a *referenced extension* of the Base stone, not a parallel mint. ERC-6551 token-bound accounts on Base could similarly read Solana stone state through their account abstraction.

Worth noting now because the v0 metadata schema decision (which fields exist) locks in what v1 can do without migration.

### SPECULATION-3: Post-rejection paths for the GET chain

The GET-chain quiz currently has 4 buttons per step, each leading to the next step's Action. If a user closes the Blink mid-quiz and returns later, they restart. There's no resumption.

For 5 questions this is fine — the friction is acceptable. But the substrate could trivially support a "resume from step 3" link if quiz state is HMAC-signed and URL-encoded (which it already is). This would let users come back to a partially-completed quiz tomorrow and finish. It's a small UX improvement that the architecture already permits.

Worth considering if the demo scenario includes "judge tries the quiz, gets distracted, comes back later."

---

## PRAISE · genuinely good design decisions

### PRAISE-1: The day-1 spine + 3 spikes pattern

This is the single best thing in the SDD. Forcing three high-risk technical questions to be answered on Day 1 before any feature work commits — this is exactly the pattern that prevents the "we built the wrong foundation" disaster that flatline r3 flagged as CRITICAL. Spotify and Riot Games both use variations of this pattern; it's well-tested.

### PRAISE-2: The brownfield bridge for `lib/score`

Codex's wrap-first-move-later doctrine is honored cleanly. zerker's existing deterministic mock at `lib/score/` becomes the v0 implementation of the `world-sources` adapter contract. The real-API switch is one line of code at the adapter level. No consumer changes. This is hexagonal architecture working as intended.

### PRAISE-3: ed25519 via Solana instructions sysvar (not in-program verification)

This is a non-obvious correctness fix that flatline r3 caught. SDD r2 specifies the right pattern: transaction includes an Ed25519Program instruction *before* `claim_genesis_stone`, and the Anchor program reads the instructions sysvar to verify the prior instruction. This is the Solana-correct way; in-program signature verification is not supported. Many teams get this wrong. The SDD spells it out explicitly with sufficient detail that an engineer unfamiliar with Solana sysvars can implement it correctly. That's good docs.

---

## Closing Reflection

A 4-day clock, three engineers, and an architectural ambition that is genuinely novel (substrate/presentation separation for AI agents in social surfaces). The SDD has done the hard work of grounding the ambition in a slice that can ship. What remains is making sure the slice teaches the right lesson.

The structural soundness is high. The day-1 spike pattern is excellent. The brownfield bridges honor Codex's doctrine. The cmp-boundary lint and three-keypair model show mature thinking about security.

The two REFRAME findings are the ones I'd dwell on. The drift from awareness-layer to quiz-and-mint is the kind of frame-shift that happens in every project that survives long enough to ship — the moment when the demo of the platform becomes mistaken for the platform itself. If the team wants the deck to teach "awareness infrastructure," at least one ambient surface needs to ship in v0 — even if it's just a `/api/actions/today` Blink that shows aggregate world activity with no user interaction.

The HIGH findings on cross-cluster nonce durability and sponsored-payer overdraft window are real but addressable. The PRAISE findings name decisions worth keeping as the project grows.

Bridgebuilder finding count: 2 REFRAME · 3 SPECULATION · 4 HIGH · 2 MEDIUM · 3 PRAISE.

The slice can ship.

---

<!-- bridge-findings-start -->
```json
{
  "schema_version": 1,
  "findings": [
    {
      "id": "reframe-1",
      "title": "Design has drifted from awareness-layer thesis to quiz-and-mint demo",
      "severity": "REFRAME",
      "category": "framing",
      "file": "grimoires/loa/sdd.md:Section 0 + Section 1 + Section 4",
      "description": "PRD r6 elevator pitch claims 'awareness layer' but every apps/web route is about the quiz interaction. There is no ambient `/api/actions/today` surface that shows aggregate world activity. Judges will conclude this is a fortune-telling app, not awareness infrastructure.",
      "suggestion": "Either (a) embrace demo-first frame and update PRD/deck to lead with 'interactive on-chain bazi reading' or (b) add an ambient feed Blink to v0 spine that shows aggregate world activity with no user interaction, demonstrating the substrate-vs-presentation moat directly.",
      "reframe": true,
      "teachable_moment": "The platform demo and the platform itself are different products. Decide which you're shipping; don't straddle.",
      "faang_parallel": "Stripe's homepage doesn't show a payment form — it shows charge-per-second metrics. The product is the infrastructure, demonstrated by ambient evidence."
    },
    {
      "id": "reframe-2",
      "title": "apps/web is universal consumer; substrate consumability outside Next.js unproven",
      "severity": "REFRAME",
      "category": "extensibility",
      "file": "grimoires/loa/sdd.md:Section 1 + Section 2",
      "description": "Codex's awareness model declares packages should not depend on Next.js, and the SDD honors that. But every consumer surface lives in apps/web. A future Discord bot or CLI consumer would either need to live inside apps/web (wrong) or duplicate adapter wiring (drift risk).",
      "suggestion": "Add a fixture-only test runner or thin CLI in tools/ that proves the substrate works without Next.js. This is the falsifiability test for the modularity claim.",
      "reframe": true,
      "teachable_moment": "If your packages claim independence, prove it with a non-Next.js consumer."
    },
    {
      "id": "speculation-1",
      "title": "medium-registry abstraction over medium-blink",
      "severity": "SPECULATION",
      "category": "architecture",
      "file": "grimoires/loa/sdd.md:Section 1",
      "description": "freeside-mediums already exists upstream as a sealed Effect Schema registry for MediumCapability variants. Shipping packages/medium-registry as the abstraction (importing freeside-mediums/protocol) and packages/medium-blink as one concrete adapter would mirror the existing freeside pattern.",
      "suggestion": "Consider splitting into medium-registry (abstraction) + medium-blink (adapter) before sprint-1 scaffolds the single-medium package.",
      "speculation": true
    },
    {
      "id": "speculation-2",
      "title": "Cross-chain identity unification via Metaplex companion_token_uri",
      "severity": "SPECULATION",
      "category": "long-term-architecture",
      "file": "grimoires/loa/sdd.md:Section 11 (D-11)",
      "description": "Solana Genesis Stone is currently a TWIN of Base PurupuruGenesis — separate stones, no relationship. Long-term this fragments identity. A `companion_token_uri` field in Solana Metaplex metadata referencing the Base token via chain:// URI scheme would make Solana stone a referenced extension, not a parallel mint.",
      "suggestion": "Lock the Metaplex metadata schema in v0 to include companion_token_uri as a reserved field, even if unused. Avoids migration cost when D-11 is addressed.",
      "speculation": true
    },
    {
      "id": "speculation-3",
      "title": "Resume-from-step-N for partial quiz completions",
      "severity": "SPECULATION",
      "category": "ux",
      "file": "grimoires/loa/sdd.md:Section 4.1",
      "description": "Quiz state is already HMAC-signed and URL-encoded. The architecture trivially supports resuming from step 3 if the user closes the Blink mid-quiz. Currently they restart. For demo scenarios where judges get distracted and return, this is a real UX win for ~0 architectural cost.",
      "suggestion": "Document this as a v0+ enhancement; no code change needed in spine.",
      "speculation": true
    },
    {
      "id": "high-1",
      "title": "Substrate-vs-presentation separation enforced by convention, not type/lint",
      "severity": "HIGH",
      "category": "architecture",
      "file": "grimoires/loa/sdd.md:Section 0 + Section 6",
      "description": "The architectural punchline (separation-as-moat) is the deck's headline. But the SDD does not specify HOW packages/peripheral-events is prevented from being mutated by medium renderers. There is no eslint rule, no dependency-cruiser config, no type-level constraint. Convention breaks under 4-day pressure with three engineers.",
      "suggestion": "Add a CI guard (eslint-plugin-import or dependency-cruiser) that fails the build if packages/peripheral-events imports next, react, or any concrete adapter. This is what makes the moat real.",
      "faang_parallel": "Google's monorepo enforces hexagonal boundaries via BUILD file deps, not convention.",
      "metaphor": "A castle wall you've drawn on a map is not a castle wall."
    },
    {
      "id": "high-2",
      "title": "Nonce store durability across vercel cold starts unspecified",
      "severity": "HIGH",
      "category": "correctness",
      "file": "grimoires/loa/sdd.md:Section 3.3 + Section 4.2",
      "description": "ClaimMessage nonce 'stored server-side with 5min TTL' is a security-critical replay-protection mechanism. If implemented as in-memory Set in a Vercel function, cold-start across functions invalidates the TTL — nonce issued in one instance won't be recognized when validated by another.",
      "suggestion": "Specify Redis, Vercel KV, or Supabase as the nonce store. Test cold-start nonce invalidation on day-1 spike.",
      "metaphor": "An in-memory mutex across stateless workers is a coin flip dressed as a lock."
    },
    {
      "id": "high-3",
      "title": "Score adapter v0 path conflicts between PRD r6 (real API) and SDD r2 (mock)",
      "severity": "HIGH",
      "category": "ambiguity",
      "file": "grimoires/loa/sdd.md:Section 7.1",
      "description": "PRD r6 FR-5: 'consume score's existing surfaces (read-only): score-puru API + Sonar/Hasura GraphQL.' SDD r2 §7.1: 'v0: uses lib/score deterministic mock (operator-confirmed).' These specify different production realities. The deck's 'we read on-chain state' claim depends on which is true.",
      "suggestion": "Pick one for the spine. Document the choice. If mock for v0, deck must reflect 'simulated activity feed.' If real API, the runtime dependency on Railway is a non-negotiable risk.",
      "teachable_moment": "Hidden ambiguities resolve themselves the wrong way under deadline pressure."
    },
    {
      "id": "high-4",
      "title": "Sponsored-payer halt-disabled window has no overdraft guard",
      "severity": "HIGH",
      "category": "operational-risk",
      "file": "grimoires/loa/sdd.md:Section 6.2",
      "description": "Day-of-demo runbook: 'top up to >10 SOL' and 'DISABLE_PAYER_HALT=true'. With halt disabled, every mint that hits a depleted balance reverts. The conservation invariant `committed_mints + reserved_mints ≤ payer_balance / per_mint_cost` has no monitoring during the disabled-halt window.",
      "suggestion": "Even with halt disabled, log balance snapshots every 30s during the demo window. Alert on rate-of-drain anomalies. Pre-stage refill keypair as fallback.",
      "metaphor": "Disabling the smoke alarm during the cooking demo because false alarms are bad — but now you don't know if there's a fire."
    },
    {
      "id": "medium-1",
      "title": "Recent blockhash + wallet sign delay = transaction expiry risk",
      "severity": "MEDIUM",
      "category": "correctness",
      "file": "grimoires/loa/sdd.md:Section 4.2",
      "description": "Server-side recent_blockhash fetched before wallet signing. Solana transactions expire after ~150 slots (60-90s). Phantom signing typically takes 5-15s, but Dialect inspector or other surfaces may be slower. Slow signing path returns BlockhashNotFound error.",
      "suggestion": "Document max stale-blockhash window. Either retry-fetch on wallet side (Phantom does this automatically for some flows) or use Solana durable nonces for high-latency surfaces."
    },
    {
      "id": "medium-2",
      "title": "Metaplex Phantom spike fallback technically clean but deck dependency unstated",
      "severity": "MEDIUM",
      "category": "scope-coupling",
      "file": "grimoires/loa/sdd.md:Section 5.3 + Section 9",
      "description": "If Spike 1 fails, fallback is PDA-only with 'mint' renamed to 'claim record.' This is a clean technical fallback, but the deck story (elevator: 'mint your archetype') depends on the term 'mint.' Day 4 has 0.5 day budget for deck. No buffer for deck rebuild on Spike 1 fail.",
      "suggestion": "Pre-stage two deck templates (mint-language and claim-record-language) so the deck swap on Spike 1 fail is a 30-minute task, not a half-day rebuild."
    },
    {
      "id": "praise-1",
      "title": "Day-1 spine + 3 spikes pattern is a textbook de-risking decision",
      "severity": "PRAISE",
      "category": "process",
      "file": "grimoires/loa/sdd.md:Section 5.3 + Section 9",
      "description": "Forcing three high-risk technical questions to be answered Day 1 before feature work commits prevents the 'wrong foundation' disaster. Spike 1 (Metaplex Phantom visibility), Spike 2 (ed25519-via-instructions-sysvar), Spike 3 (partial-sign tx assembly) are exactly the right questions to settle early.",
      "suggestion": "No changes — this is exemplary.",
      "praise": true,
      "teachable_moment": "When the cost of being wrong scales with how late you find out, front-load the discovery.",
      "faang_parallel": "Spotify's 'release roulette' and Riot's 'demo every Friday' both ritualize this pattern."
    },
    {
      "id": "praise-2",
      "title": "Brownfield bridge for lib/score honors wrap-first-move-later doctrine",
      "severity": "PRAISE",
      "category": "architecture",
      "file": "grimoires/loa/sdd.md:Section 7.1",
      "description": "zerker's existing deterministic mock becomes v0 implementation of world-sources adapter contract. Real-API switch is one line at adapter level. No consumer changes. This is hexagonal architecture working as intended — the abstraction earns its keep at swap time.",
      "suggestion": "No changes — this is exemplary.",
      "praise": true,
      "teachable_moment": "The boring technology club: existing things that work earn the right to be displaced, not the duty to be replaced."
    },
    {
      "id": "praise-3",
      "title": "ed25519 via Solana instructions sysvar pattern correctly specified",
      "severity": "PRAISE",
      "category": "correctness",
      "file": "grimoires/loa/sdd.md:Section 5.1",
      "description": "Many teams get this wrong by attempting in-program signature verification (not supported on Solana). SDD r2 spells out the correct pattern: Ed25519Program instruction prior, claim_genesis_stone reads instructions sysvar at index N-1 to verify signer + message bytes. Detail level is sufficient for engineer unfamiliar with Solana sysvars to implement correctly.",
      "suggestion": "No changes — this is exemplary documentation.",
      "praise": true,
      "teachable_moment": "Spec the non-obvious patterns explicitly. Future-you and your teammates will thank you."
    }
  ]
}
```
<!-- bridge-findings-end -->
