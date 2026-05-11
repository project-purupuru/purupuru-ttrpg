---
type: framing-storyline
audience: solana-frontier-judges
operator: zerker (zksoju)
date: 2026-05-11
session: 5
composes_with:
  - grimoires/loa/specs/enhance-demo-polish-2026-05-11.md   # 3-min recording skeleton (beat-by-beat)
  - grimoires/loa/context/06-user-journey-map.md            # 9-zone spatial map
  - README.md                                                # mocked-vs-real table + arch diagrams
status: draft · operator can edit live
---

# Judges' Framing Storyline · 2026-05-11

> One artifact, two uses: (1) the **pitch shape** to lean on when introducing the demo + during Q&A, and (2) the **voiceover script** that rides over the 3-min recording. Both grounded in the same handful of operator-affirmed claims · no invented surface area.

## I · The opening (≤60 sec · pitch + recording cold-open)

> **Most on-chain games die when the player closes the app.** The community lives where it always lived — Twitter, Telegram, group chats — but the activity lives elsewhere, fragmented, invisible. Purupuru is **Strava for on-chain communities**: it makes the world visible *in the feeds your community already uses*. The game begins before the player ever enters an app.
>
> What you're about to see is **one demonstrable starter loop** — quiz → stone → observatory — on Solana. The architecture is built to wrap any community-activity layer, and to render anywhere the Solana Actions spec is honored (Twitter today · Telegram + base app structurally compatible).

**Why this opening lands**: it names the pain (closed-app death), the pivot (in-feed presence), and the modesty (hackathon-honest: this is *one component* of the vision, not the whole vision). No invented surface area; nothing here that we can't immediately show on screen.

## II · The 4 proofs (the demo arc)

| # | Proof | What the screen shows | The line we want to leave them with |
|---|---|---|---|
| 1 | **Discovery happens outside the app** | Twitter feed view · ambient `@tsuhejiwinds` post + the quiz unfurl card · cream/honey palette pops out of X's white | *"The game starts in the feed."* |
| 2 | **The quiz creates identity** | 8 questions answered in montage · 45-second linger on `You are Wood.` + 2-beat reveal copy + the stone PNG | *"Recognition. Not fortune-telling. The quiz reads you back."* |
| 3 | **Wallet signature is a trust crossing** | Phantom popup · sign · confirm · stone appears in Collectibles tab | *"Visitor becomes resident. The signature is the threshold."* |
| 4 | **The observatory proves other people are there** | One-tap bridge → lobby loads → your stone joins the rail at 5s · activity ticks · sprites drift in their elements · weather + music breathing | *"I am not alone. The room was already populated before I arrived."* |

The arc compresses to a single sentence the operator can fall back on if the demo stutters: **"Discovery in the feed → quiz that recognizes you → wallet signature as the threshold → arrival in a populated lobby."**

## III · The moat (separation-as-architecture)

The deck punchline is also the architecture:

> **Substrate truth ≠ presentation.** Agents present the world. They never write it. Hallucinations become cosmetic, not financial.

Three modular layers:

| Layer | What it is in v0 | What it can become |
|---|---|---|
| **Chain** | Solana devnet · Anchor program (`claim_genesis_stone`) · Metaplex NFT · `StoneClaimed` events | Chain-agnostic at the schema layer · the substrate is the receipt format, not the chain |
| **Service** | HMAC-sealed quiz state · sponsored-payer · KV nonce store · indexer schema (`@purupuru/peripheral-events`) | Platform-portable primitives · the same service layer wraps any underlying community-activity feed |
| **Presentation** | Twitter Blink + Web observatory (this hackathon submission) | Telegram + base app + Discord — same `/api/actions/*` endpoints unfurl everywhere the Solana Actions spec is honored |

**Why this matters for judges**: this is not "an app that lives on Solana." This is **a community awareness layer that happens to ride Solana for v0**. The architecture — chain agnostic at the schema layer; presentation modular by Action endpoint — is the durable moat. Solana wins by being honored first.

The README has the full substrate / presentation breakdown at `README.md` §Architecture.

## IV · The honest v0 → v1 gaps (deck-honest)

If a judge asks "what's mocked?" — these are the gaps. Calling them out before they ask is the move.

| Gap | What's missing | How v0 covers it · what v1 ships |
|---|---|---|
| **Z5 · post-mint confirmation surface** | No in-Blink atmospheric thread before the bridge | `links.next` bridge with `?welcome=<element>` carries the user to the observatory · the welcome fixture seeds their arrival at 5s · v1 ships the atmospheric thread |
| **Z8 · profile claim room** | No "this is yours" room with auth + wallet-link | The Collectibles tab in Phantom is the receipt today · v1 ships the profile room as the loop-closer |
| **Indexer wiring** | Activity rail is a curated mock · real `StoneClaimed` events not yet streamed | Schema exported (`StoneClaimedSchema`) · indexer build lives in [`project-purupuru/radar`](https://github.com/project-purupuru/radar) — zerker's lane · post-anchor-deploy |
| **Telegram / base app unfurl** | Untested in those clients | Same Action endpoints are spec-conformant · structurally portable · empirical validation is v1 |

**The deck-honest move**: surface these in the `Mocked vs Real` table (already in README.md §line 220) and walk past them in the voiceover only if asked. The demo lands on what's real; the v1 work is real but separate.

## V · The voiceover script (3-min · beat-by-beat)

> Pairs with the recording skeleton at `enhance-demo-polish-2026-05-11.md` §Recording. Times match the beat table; copy is the *operator-paced* read.

| t | On screen | Voiceover (operator paced · ≤1 sentence per beat) |
|---|---|---|
| **0:00–0:25** | Twitter feed · ambient `@tsuhejiwinds` post + quiz unfurl in operator's feed | *"The community lives here, in the feed. What if the game did too?"* — linger · scroll past once · scroll back |
| **0:25–0:35** | Tap `What's My Element?` → Q1 | *"One tap. No login. No app to download."* |
| **0:35–1:10** | Quiz Q1 → Q8 montage · per-step illustrations shift | *"Eight questions, three answers each. No riddles. Just things the world wants to know about you."* (cross-dissolves over the corridor — not literal POST cycles) |
| **1:10–1:55** | Reveal `You are Wood.` + 2-beat copy + stone PNG · **45s LINGER** | *"This is recognition, not fortune-telling. The quiz read you back. The stone marks the moment."* · pause · let the copy land |
| **1:55–2:15** | `Claim Your Stone` → Phantom popup → sign → confirm | *"Cross the bridge. Claim your stone."* — voice the threshold at the sig moment · Phantom owns the chrome; the line owns the moment |
| **2:15–2:25** | Post-mint `links.next` "See yourself in the world" → observatory loads | *"And the world was already there."* (past tense · low volume) |
| **2:25–2:55** | Observatory lobby · welcome fixture fires at 5s · stone arrives · rail ticks · pan canvas · click sprite · focus card opens | *"Your stone joined the others. The clan you arrived in is already a few souls deep. The weather is real — your sky pours into the room. The music holds. You are not alone."* — **30s LINGER** |
| **2:55–3:00** | Back to ambient tile in the feed | *"The world keeps speaking. The game keeps running. The next person scrolls in."* — close |

**Operator notes on delivery**:
- The "past tense low volume" line at 2:15 is load-bearing (KEEPER + ROSENZU R5). Don't lose it under music.
- Pause at the reveal. The 45s linger is the demo's emotional center; voice silences are stronger than copy here.
- The Phantom moment is unfixable in v0 — the voiceover does the work the UI can't.

## VI · Q&A landmines · the questions judges will ask · how to answer

| Question | Honest answer | What to NOT do |
|---|---|---|
| *"Is this Solana-specific?"* | No — Solana is the chain layer for v0. The schema layer is chain-agnostic. The presentation layer (Action endpoints) is spec-conformant and renders anywhere the Solana Actions spec is honored. Solana wins by being honored first. | Don't pretend we already ship on another chain — we don't · v0 is Solana |
| *"What's mocked?"* | Pull up the `Mocked vs Real` table. Activity rail is a curated mock (the indexer schema is exported and the indexer build is zerker's lane in `project-purupuru/radar`). Score adapter is a deterministic stub behind a real interface. Everything in the mint flow is real on devnet. | Don't hide the mocks · the table is the honest move |
| *"Why a quiz?"* | The quiz is the lure · the observatory is the destination · the stone is the receipt. The quiz reads the user back so the destination feels earned, not assigned. Recognition, not fortune-telling. | Don't over-claim the quiz · it's a 90s personality reflection, not a deep psychometric instrument |
| *"Why on-chain at all?"* | Two reasons: (1) the stone is portable — it lives in your wallet, not in our database, so other surfaces can read it; (2) the substrate is verifiable — agents present the world, the chain enforces it. Substrate truth ≠ presentation. | Don't lean on "decentralization" — lean on portability + verifiability |
| *"How does this scale to other communities?"* | The presentation layer is built to wrap any community-activity feed. v0 is purupuru's own activity (quizzes + stones). v1+ ingests existing community activity from the host platform (Discord posts, X likes, on-chain trades) and surfaces it through the same observatory pattern. The hackathon submission is the starter loop. | Don't promise a multi-tenant SaaS · the architecture supports it, the product isn't there yet |
| *"What's the post-hackathon roadmap?"* | Three rooms: (1) Z5 atmospheric confirmation surface, (2) Z8 profile claim room with auth, (3) indexer wiring to close the mocked seam in the activity rail. Plus Telegram + base app distribution validation. | Don't promise a date · this is a hackathon submission, not a launch |
| *"Why these five elements?"* | Wuxing — the Chinese five-element system. Familiar enough to be readable; specific enough to feel like the world has a real cosmology, not just five empty buckets. Element + Bazi grounding is operator + Gumi's design decision. | Don't get pulled into a philosophy lecture · "Wuxing · five-element cosmology · gives the world a real shape, not just labels" is enough |

## VII · Things to NOT say (deck-honest gates)

These are claims the demo cannot back. Leaving them out of the pitch keeps the demo and the framing aligned.

- ❌ "We unfurl on Telegram and base app today." — Same endpoints work, untested in those clients. Say *"structurally compatible · v1 validation"*.
- ❌ "AI agent posting in real time." — `@tsuhejiwinds` is a demo artifact today. The voice is real (HERALD audit), the posting infrastructure is post-hackathon. Say *"the ambient agent is one of the future surfaces this architecture supports."*
- ❌ "Real-time community feeds across all chains." — v0 is purupuru's own activity on Solana. Other-chain ingestion is the v1 ask.
- ❌ "Profile + auth + wallet-link." — Z8 isn't built. The Phantom Collectibles tab is the receipt today; profile is v1.
- ❌ "We already have N users." — Hackathon submission · no live user numbers · the demo speaks for itself.

## VIII · Composes with

- `enhance-demo-polish-2026-05-11.md` — the recording skeleton (beat-by-beat timing) this voiceover rides over
- `06-user-journey-map.md` — the 9-zone spatial map · justifies the Z5 / Z8 / indexer gaps
- `README.md` §Architecture · §Mocked vs Real · §Post-hackathon v1 work — the source of truth this framing pulls from
- `grimoires/loa/distillations/session-4-upstream-learnings-2026-05-11.md` — operator-override-discipline + R-cycle audit pattern that produced this session's polish

## IX · Pre-recording operator check (use this before you hit record)

- [ ] Can I deliver §I (the opening) in ≤60s without reading?
- [ ] Do I have the §V voiceover lines visible on my phone or a second screen for the 1:55 ("cross the bridge") and 2:15 ("and the world was already there") beats?
- [ ] If a judge asks any §VI question, do I have the honest answer ready?
- [ ] If something stutters mid-demo, can I fall back on the single-sentence arc: *"Discovery in the feed → quiz that recognizes you → wallet signature as the threshold → arrival in a populated lobby"*?

If three of four are yes, record.
