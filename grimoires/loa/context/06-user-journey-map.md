# Whole User Journey Map · Purupuru Awareness Layer

> **Audience**: Eileen (asked for "the whole user journey so I know which parts to emphasize") · operator + Gumi (demo recording planning) · zerker (observatory boundary handoff)
>
> **Authored by**: rosenzu (LYNCH lens) round-2 audit · synthesized with KEEPER (user truth) · WEAVER (composition) · ARTISAN (typography) · VOCAB-BANK (cold-audience lexicon) all running in parallel 2026-05-10
>
> **Frame**: the journey is currently **two parallel buildings with no connecting hallway**. Twitter scroll has a real archway into the Quiz Lobby; the Observatory webpage is a separate tower that opens onto the same plaza but its front door is glass and unmarked. Below is the floor plan + what to emphasize for the demo recording.

---

## Zone Map · 9 zones · depth 0F → 4F

```
                              ┌──────────────────────────┐
                              │     Z0 · THE STREET      │  0F · outdoors
                              │   (Twitter / Telegram)   │
                              └────────────┬─────────────┘
                                           │
                          ┌────────────────┴────────────────┐
                          │                                 │
                          ▼                                 ▼
              ┌─────────────────────┐             ┌─────────────────────┐
              │  Z1a · AMBIENT      │  0.5F       │  Z1b · QUIZ         │  1F
              │  WINDOW (today)     │ ──────────► │  THRESHOLD (start)  │
              │  weather-vane       │             │  one prompt         │
              └──────────┬──────────┘             └──────────┬──────────┘
                         │  (CTA: what's my element?)        │
                         └────────────────┬──────────────────┘
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Z2 · QUIZ HALLWAY · Q1→Q8           │  1F · long corridor
                       │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  8 doors deep
                       │  drop-off danger: Q3-Q5              │  ⚠ longer than PRD
                       └──────────────────┬───────────────────┘
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Z3 · REVEAL CHAMBER (result)        │  2F · private alcove
                       │  "You are Wood." · stone PNG         │  ★ highest atmos. quality
                       │  aggregate · share-feel              │
                       └──────────────────┬───────────────────┘
                                          │  ⚠ TRUST CROSSING (wallet sig)
                                          │  ⚠ ATMOSPHERIC WHIPLASH (warm → Phantom chrome)
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Z4 · TREASURY (mint)                │  3F · vault
                       │  Phantom popup · sponsored-payer     │  Phantom owns the room
                       │  dead-ends: reject · halt · drained  │
                       └──────────────────┬───────────────────┘
                                          ▼
                       ┌──────────────────────────────────────┐
                       │  Z5 · CONFIRMATION                   │  3F · ⚠ UNDEFINED
                       │  (state currently a vacuum)          │
                       └──────────────────┬───────────────────┘
                                          │
                                          ╳  NO HALLWAY ─ user closes Twitter
                                          ╳  cognitive break: must remember URL
                                          │
                                          ▼  (only via direct URL)
        ┌─────────────────────────────────────────────────────────┐
        │  Z6 · OBSERVATORY PLAZA (purupuru-blink.vercel.app/)    │  1F · public square
        │  pentagram canvas · activity rail · weather · music     │  inside the building
        │   ↓ click sprite                                         │
        │  ┌───────────────────────────────────────────────────┐  │
        │  │  Z7 · FOCUS CARD (well-formed peek room)         │  │
        │  └───────────────────────────────────────────────────┘  │
        └────────────────────────┬────────────────────────────────┘
                                 │
                                 ╳  NO HALLWAY  (auth + wallet-link not built)
                                 ▼
                       ┌──────────────────────────────────────┐
                       │  Z8 · PROFILE CLAIM ⚠ NOT BUILT      │  4F · private chamber
                       │  "this is YOUR element"              │
                       │  the room that closes the loop       │
                       └──────────────────────────────────────┘
```

---

## Zone-by-zone

| ID | Zone | Depth | Status | Atmosphere | Door in | Door out | Owner |
|---|---|---|---|---|---|---|---|
| Z0 | The Street (Twitter / Telegram) | 0F outdoors | LIVE (audience platform) | Chaotic public square · low commitment · scrolling | Algorithm or follow | Tap on Blink unfurl | n/a |
| Z1a | Ambient Window (`/api/actions/today`) | 0.5F arcade | LIVE | Weather-vane · pulses with substrate truth · single-glance | Blink unfurl in feed | "What's My Element?" CTA → Z2 | us (feat) |
| Z1b | Quiz Threshold (`/api/actions/quiz/start`) | 1F lobby door | LIVE | Warm prompt · curiosity is the only ticket | Tap on quiz Blink, OR cross-link from Z1a | Button-tap (POST chain) into Q2 | us (feat) |
| Z2 | Quiz Hallway (Q1 → Q8) | 1F · 8-door corridor | LIVE | Meditative procession · per-step illustrations shift weather/time | Q1 button | Q8 → result POST | us (feat) |
| Z3 | Reveal Chamber (`/api/actions/quiz/result`) | 2F · private alcove | LIVE | **★ highest atmos quality** · "You are Wood." · stone PNG · fortune-telling vibe | Q8 answer POST | "Claim Your Stone" → Z4 | us (feat) |
| Z4 | Treasury (`/api/actions/mint/genesis-stone` · Phantom signing) | 3F · vault | LIVE | Ritual · trust crossing · **Phantom owns the room** | Tap "Claim Your Stone" | Signed tx → confirmation | us (feat) |
| Z5 | Confirmation (post-mint) | 3F · ⚠ UNDEFINED | NOT BUILT | **Currently a vacuum** · biggest hole in journey | Tx confirmation | ??? — should bridge to Z6 | tbd |
| Z6 | Observatory Plaza (`purupuru-blink.vercel.app/`) | 1F · public square | LIVE | Living world · pentagram canvas · activity rail · weather tile · music · day/night theme · **most finished zone** | Direct URL only | Click sprite → Z7 | zerker (main) |
| Z7 | Focus Card (sprite click) | 1.5F · peek-room | LIVE | Inspect-an-individual · outside-click closes (well-designed escape) | Pentagram canvas sprite tap | Outside click | zerker (main) |
| Z8 | Profile Claim | 4F · private chamber | ⚠ **NOT BUILT** | Should be: "this is YOUR element. These are YOUR stones." | nonexistent | nonexistent | tbd |

---

## The hallways · transitions

| Hallway | Latency | Cognitive cost | Atmospheric break | Trust crossing |
|---|---|---|---|---|
| **Street → Ambient** (Z0→Z1a) | sub-second | none | none — feels like reading a tweet | none |
| **Street → Quiz** (Z0→Z1b) | sub-second | "do I have time for this?" | mild — modal feel | none |
| **Ambient → Quiz** (Z1a→Z1b) | one POST | none — same surface | none — both are Blinks | none |
| **Q_n → Q_n+1** (Z2 internal · ×7) | 300-600ms each | low per-step but **accumulates** | none — earned consistency | none — but soft commitment per door |
| **Q8 → Reveal** (Z2→Z3) | one POST | "what does this mean about me?" | **earned break** — corridor opens into chamber · journey's strongest moment | trust grows: user lets system tell them who they are |
| **Reveal → Treasury** (Z3→Z4) | wallet popup | **HUGE jump** — fortune-telling → approve-transaction | **unearned break** — atmospheric whiplash · Phantom chrome hostile to warm reveal | **THE trust crossing** · 60-80% of curious-but-not-committed users bounce here |
| **Treasury → Confirmation** (Z4→Z5) | 5-30s devnet | "did it work?" | **vacuum** — no atmospheric thread back from Phantom | commitment locked |
| **Confirmation → Observatory** (Z5→Z6) | ⚠ **NO HALLWAY** | total cognitive break · user has to remember a URL | full atmospheric reset | new trust ask · web auth |
| **Observatory → Profile** (Z6→Z8) | ⚠ **NO HALLWAY** | login · wallet-link · account decision | unbuilt | second wallet sig potentially |

---

## What to emphasize for demo recording (3-min target)

> **Eileen's question**: "I want the whole user journey so I know which parts to emphasize."

| Action | Zone | Duration | Why |
|---|---|---|---|
| **LINGER** | Z3 Reveal Chamber | 45s | This is the journey's emotional payoff · stone PNG · "You are Wood" · aggregate · the room where fortune-telling vibe lands or doesn't |
| **LINGER** | Z6 Observatory Plaza | 30s | Pan the pentagram canvas · show activity rail ticking · click sprite to surface Z7 · use the music · sells "Strava for on-chain" · most finished zone |
| **LINGER** | Z1a Ambient Window | 20s | The moat made visible · "Wood leads today · 47 have read themselves in." · this is the shot that distinguishes us from "just another quiz app" |
| **MONTAGE** | Z2 Quiz Hallway | 30s | Accelerate · Q1 · Q3 · Q6 · Q8 · don't show all 8 doors · show the *texture* of the corridor (illustration shifts) without the latency |
| **CRITICAL BUT QUICK** | Z4 Treasury | 15s | Phantom popup · signature · confirmation toast · don't dwell — Phantom's chrome breaks atmospheric register |
| **SKIP** | Z5 / Z8 | 0s | Z5 is a vacuum · Z8 doesn't exist |
| **NARRATION + CREDITS** | overlay | 40s | Voiceover threading the punchline (separation-as-moat · awareness layer · meeting people where they are) |

**Suggested order**: Z1a (15s ambient) → Z1b (5s tap) → Z2 (montage 30s) → Z3 (45s linger · payoff) → Z4 (15s ritual) → Z6 (30s plaza · proof of world) → Z7 (10s focus) → close on ambient (10s) — *"and the world keeps speaking."*

---

## Spatial problems · what's broken in the topology

### 1. Z5 → Z6 is the worst transition (per ROSENZU)

The user does the hardest thing in the journey (sign a tx, commit lamports of attention) at 3F · vault · maximum-intimacy. Then they are dropped, with no bridge, into either:

- Phantom's collectibles tab (a different app entirely), OR
- nothing — they close Twitter and the moment evaporates

The Observatory at Z6 is *gorgeous* and is the operator's "Strava for on-chain." But it is a **separate building with no front-door signage from Z5**. A user who just minted a Wood stone has no callback in Z6 that says "you arrived · the world saw you · here is your element-tribe."

### 2. Z8 (Profile) is the missing room that breaks the loop

Operator's user-journey description says: *"first thing on webpage: log in · claim profile · recognize element · see other people spawning."* WEAVER's audit confirms: there is no `/login` · no `/profile` · no `/me` route on `origin/main`. The plaza shows OTHER puruhani's activity but not the just-minted user's belonging.

This is the topology mismatch with the user-journey promise. Without Z8 the loop is open.

### 3. Quiz Hallway is 8 doors deep

Each door is a network round-trip and a chance to lose the user before Z3 reveal. PRD originally specified 5 questions; Gumi feedback expanded to 8. By Q5-Q6 cold users are wondering "is this the last one?"

### 4. Z1a and Z1b are sibling-strangers

The Ambient Window and Quiz Threshold are the same building presented as two unrelated unfurls on the street. A user who sees one might never realize the other exists.

---

## What's made of substrate truth vs presentation theater

KEEPER's audit + WEAVER's seam analysis identified that the Strava-style loop is **not yet wired**:

| Thing | What's real | What's theater |
|---|---|---|
| Quiz answers | Real · HMAC-validated end-to-end | — |
| Element computation | Real · server recomputes from validated answers · `archetypeFromAnswers` | — |
| Stone mint | Real · Anchor program on devnet · Metaplex CPI · NFT in Phantom collectibles | — |
| `StoneClaimed` event | Emitted on-chain | **Not yet consumed** by observatory rail (planned: zerker's radar repo · post-hackathon wiring) |
| Observatory mint counter | — | Synthetic feed (`activityStream` is `lib/activity` on main · NOT fed by chain events) |
| "Element leads today" | Computed from distribution | Distribution is currently mock data via Score adapter · stretch goal: real Score API |

This is the cmp-boundary doctrine working too literally: "presentation never mutates substrate" became "presentation never reads substrate either." For demo recording, the **mitigation** is honest narration ("substrate emits the event · indexer wiring is zerker's parallel lane") and pre-staging a fixture row at the demo wallet's mint moment so the loop closes visibly without faking the indexer.

---

## Reframings worth surfacing to operator

### "Strava for on-chain communities" · KEEPER's challenge

Strava works because *the activity is the product*. Users run, then look at the map. Here, the proposed loop is: take a quiz (off-chain) → mint (on-chain) → see others on the dashboard. **The user did not do an on-chain activity to be surfaced.** They did a personality quiz. The "on-chain action" is a single mint they were prompted into, not an organic behavior worth surfacing.

The honest framing might be: **"Buzzfeed-quiz-as-onboarding-to-an-on-chain-community-dashboard."** The quiz is the lure; the observatory is the destination; the stone is the receipt of having entered. "Strava" implies recurring activity worth tracking. "Sorting hat + bulletin board" might be closer.

Operator's call before the deck hardens.

### "Fortune-telling vibe" · KEEPER's challenge

Fortune-telling reflects details back at you. The current 1-line reveal ("You start things. You grow into what's next.") is element-keyed but answer-blind. The user doesn't see her cancelled-plans answer feed into anything. **The fortune-telling premise needs the reveal to mention something specific she said yes to.**

Alternative framing: **personality recognition** rather than fortune-telling. The Mom Test would catch this — nobody opens Twitter saying "I want my fortune told." They DO say "I want to find out about myself." Recognition > prediction.

For demo: lean into recognition · the questions ARE good · the reveal needs to feel like *you, specifically, were seen* not *you got assigned a category*.

### Quiz length · 8 vs 5 (ROSENZU + KEEPER)

Twitter quiz attention budget is 3-5 questions. By Q6 cold users are wondering when it ends. 8 was a Gumi-feedback choice. Trade-off: 8 gives richer signal but adds 3 doors of drop-off risk. Worth re-considering for v1 if conversion data shows mid-quiz bail-out.

---

## What carries forward post-hackathon

- **Z5 confirmation surface**: bridge mint success → observatory entry · "your stone is in the world now" with a deep-link
- **Z8 profile claim**: the missing room · auth flow · element-recognition · "this is yours" callback
- **Indexer wiring** (zerker's `project-purupuru/radar`): close seam E so Z6 reflects real on-chain activity not synthetic feed
- **Skybridge between Z5 and Z6**: post-mint "see yourself in the world" CTA
- **Telegram Blink unfurl test**: structurally compatible (same Action endpoints) · not yet validated in-platform
