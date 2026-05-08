---
status: draft v0 · operator-grade rough
type: pitch-deck
cycle: hackathon-frontier-2026-05
sprint: 1
task: S1-T11
created: 2026-05-08
authority: zksoju (operator) · pending eileen architecture sign-off + gumi voice polish
deadline: 2026-05-11 colosseum frontier submission
---

# Purupuru Awareness Layer · Solana Frontier Deck v0

> **5 slides · operator-grade rough · refines through sprint-2 + sprint-4.**
> S2-T6 gumi swaps voice strings · S4-T4 deck final · S4-T5 colosseum submission filed.

---

## Slide 1 · The Punchline (separation-as-moat)

**HEADLINE**
*Most AI agent products fail because the same model that decides what to **say** also decides what to **do**. We split them.*

**SUB**

| Layer | Owns | Never |
|---|---|---|
| **Substrate** (sonar · score · anchor) | what's true | speaks |
| **Voice** (gumi · medium-blink · personality bots) | how it lands | mutates state |

> Hallucinations become **cosmetic**, not financial.

**VISUAL**
A simple split-arch diagram · substrate truth (left) ↔ presentation voice (right) · one-way flow only.

---

## Slide 2 · The Demo (≤30s flow)

**SCENARIO**
You see a tweet. You tap.

```
🌬 cosmic weather post (already live · @puruhpuruweather)
   ↓ tap
🔮 5-step bazi-style quiz · "today's tide reads you · 1 of 5"
   ↓ button-multichoice · 4 buttons per step · GET-chain · zero signing
🪞 archetype card revealed · "fire · your tide · claim the stone of warmth"
   ↓ tap
🪨 Genesis Stone mints on Solana (devnet · gasless via sponsored-payer)
   ↓ Phantom pops · 1 signing prompt
✅ stone visible in wallet collectibles tab (Metaplex Token Metadata)
```

**Plus the ambient `/api/actions/today` Blink** — *no interaction* — shows world activity in feed:
> *"today in the world · 47 stones · fire rises +12%"*

**Two surfaces · same substrate.** The interactive one teaches. The ambient one demonstrates the moat.

---

## Slide 3 · User Acquisition (twitter native)

**THESIS**
*Communities can't see what's actually happening on-chain. We make it visible — in the social feeds they already use.*

**MOTION**

- Solana Blinks unfurl in tweets (no app install · no signup)
- Tap → quiz → mint → share archetype card
- Same substrate fans out to **Discord webhooks**, **Telegram inline bots**, **Farcaster frames** (sprint-N+1 adapters · all read same `peripheral-events` package)
- The `BLINK_DESCRIPTOR` upstream PR to `freeside-mediums` extends an existing sealed-schema medium registry · cycle-X sibling to cycle-R cmp-boundary architecture

**INSIGHT**
*Meet players where they already are.* The friction of switching apps is what kills game adoption · we ship gameplay-shaped surfaces inside the surfaces they already check 50x/day.

---

## Slide 4 · Monetization (sponsored awareness slots)

**MODEL**

| Buyer | Pays for | Why |
|---|---|---|
| 🏷 brand · community operator | sponsored awareness slots in feed surfaces | *we are infrastructure for them* · they need to surface their on-chain activity to their audience without building a custom bot |
| 🪨 game studio | white-label awareness layer (sprint-N+2) | one substrate · all their mediums · per-month SaaS |
| 🌬 NFT project | sponsored mint/burn announcements | promote on-chain ceremony moments where audiences already are |

**PROOF**
- v0 deploys our own (purupuru) instance
- v1 = second game plugged in (mibera or honey-jar) · *demonstrates universality* · same substrate · 1-day integration
- v2 = SaaS dashboard · operators self-serve

**MARGINAL COST**
near-zero · subscription auth (codex · claude · gemini headless) · vercel edge · solana devnet→mainnet path

---

## Slide 5 · Roadmap (now → next → then)

**NOW (v0 · Frontier ship)**
- Substrate (`@purupuru/peripheral-events`) · sealed Effect Schema · WorldEvent + BaziQuizState + ClaimMessage
- Blinks-first medium adapter (`@purupuru/medium-blink`) · GET-chain quiz + ambient
- Solana mint (`programs/purupuru-anchor` · devnet) · ed25519-via-instructions-sysvar · sponsored-payer
- BLINK_DESCRIPTOR upstream PR to freeside-mediums

**NEXT (sprint-N+1 · post-hackathon)**
- Discord + Telegram + Farcaster medium adapters (consumes same substrate · proves universality)
- Score dashboard (zerker's lane · operator surface · "god's-eye observatory")
- Real cosmic weather oracle wiring (TREMOR · CORONA · BREATH per gumi pitch)
- Mainnet anchor deploy (post-audit)

**THEN (vision)**
- Soul-stage agents (per gumi pitch §"Agents as Players") · Puruhani NFTs as autonomous agents · *they* mint · *they* witness · *they* speak in feeds
- Cross-chain identity unification (Base PurupuruGenesis ↔ Solana stone twin)
- World-lab visualization (Pixi sim · zerker's lane) · god's-eye view of all on-chain activity rendered live

> The strong-version demo (per Eileen's framework · *ownership matters because the agent's history travels with the token*) becomes possible once Soul-stage ships. v0 plants the genesis seed.

---

## Closing Frame

**THE PITCH IN ONE BREATH**

🟢 *Communities can't see what's actually happening on-chain. We make it visible — in the social feeds they already use.*

— or —

🟣 *On-chain games go silent the moment you close the app. We make them speak — in tweets, casts, discord, wherever your community already is.*

---

## Appendix · provenance

- PRD r6 (`grimoires/loa/prd.md`) · 941 lines · post-flatline-r3 + post-eileen-alignment
- SDD r2 (`grimoires/loa/sdd.md`) · post-Codex-awareness-model · post-bridgebuilder · slice-tight per §4
- Bridgebuilder design review (`.run/bridge-reviews/design-review-simstim-20260507-658e3680.md`) · 14 findings · 2 REFRAME (1 integrated as ambient Blink) · 4 HIGH integrated inline
- 6 flatline rounds (PRD r3 · r4 · r5 · SDD r2 · Sprint r1 + smoke-test) · subscription auth · $0 cost · 80-91% model agreement
- Codex's awareness operating model (`grimoires/loa/context/02-awareness-operating-model.md`) · structural backbone · slice-first

## Appendix · team credentials (sprint-4 fills)

- 🪨 zksoju · operator · substrate + medium-blink + anchor + deploy + demo
- 🌬 eileen · architect · separation-as-moat doctrine · keypair posture · ratification gate
- 🌊 zerker · score module + Solana indexer + dashboard (parallel · post-anchor-deploy integration)
- 🌸 gumi · voice register + 5-question archetype quiz + stone art + vocabulary bank

## Appendix · adversarial-review provenance

3-model adversarial reviews via Codex GPT-5.5 + Claude Opus 4.7 + Gemini 3.1 Pro · subscription auth (zero per-token cost) · 6 rounds across PRD/SDD/sprint plan · 80-91% model agreement on findings · all blockers integrated or deliberately deferred (with rationale).

This is not a vibe-deck. The architecture has been adversarially stress-tested.
