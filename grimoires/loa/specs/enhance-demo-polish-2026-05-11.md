# Session 3 — Demo Polish · Eileen's 4 Proofs · Ship 2026-05-11

> *"We built the first playable entry ritual for a social on-chain TTRPG world. Most on-chain games die when the player closes the app. Purupuru makes the world visible in the feeds where players already live. The game begins before the player enters the app."* — Eileen

## Context

T-2 days to Solana Frontier ship. Demo arc is locked: **Feed tile → 8-Q quiz → "You are Wood." → wallet sig → Observatory lobby.** Four constructs (KEEPER · ALEXANDER · WEAVER · ROSENZU) ran a parallel audit against Eileen's 4 demo proofs. This document is the synthesis + the runway for the polish + recording session.

## The 4 Proofs (Eileen's verbatim)

1. **Discovery can happen outside the app** — Blink card = "enter from the street"
2. **The quiz creates identity** — character birth · "You are Wood." needs *art + short interpretation + sense the result matters*
3. **Wallet signature is a trust crossing** — "Cross the bridge. Claim your stone." · visitor → resident
4. **The observatory proves other people are there** — "I am not alone."

## Audit Findings (compressed)

| Construct | Headline finding |
|---|---|
| **KEEPER** | Proof 2 (identity) carries the most demo weight — if reveal doesn't land, nothing downstream matters. Proof 3 (trust crossing) is structurally weakest and least fixable (Phantom owns the chrome) — only mitigation is voiceover. |
| **ALEXANDER** | Cream + honey theme survives Dialect's container with dignity intact — craft compounds from the world landing. Reveal copy at 8 words after 8 questions is the only place where craft writing lags craft surface. |
| **WEAVER** | Mint→lobby is the only broken seam. Three smallest-sharpest fixes close the loop without new screens: `links.next` bridge · welcome-fixture seed · drop secondary CTA. |
| **ROSENZU** | dial.to is a developer tool dressed as a demo. Record from real Twitter or composite frame. The camera doesn't move when the room doesn't change. |

## What Shipped This Session (already committed)

| # | Change | File | Source |
|---|---|---|---|
| 1 | Reveal copy expanded to 2-beat (trait + consequence) per element | `packages/medium-blink/src/voice-corpus.ts` ARCHETYPE_REVEALS | ALEXANDER · 🔥 must-craft |
| 2 | Dropped "See Today's World" secondary CTA at reveal | `packages/medium-blink/src/quiz-renderer.ts` renderQuizResult | WEAVER + ROSENZU concur · proof #3 trust crossing |
| 3 | Post-mint `links.next` bridge to Observatory | `app/api/actions/mint/genesis-stone/route.ts` POST response | WEAVER · loop-closure |
| 4 | Welcome-param fixture seed in Observatory | `lib/activity/{mock,index}.ts` + `components/observatory/ObservatoryClient.tsx` | WEAVER + ROSENZU concur · proof #4 visible arrival |
| 5 | Test assertions updated for single-CTA reveal | `packages/medium-blink/tests/quiz-renderer.test.ts` | regression |

Build clean · 24 medium-blink + 80 peripheral-events + 24 lib/blink + 7 world-sources = 135 tests pass.

## Operator Runway · Pre-Record Punch List

### 🌐 DNS · purupuru.world setup (operator-side · pre-record polish)

| Apex/sub | Target | Vercel project | Records |
|---|---|---|---|
| `purupuru.world` | Observatory (main app · replaces unfinished `world-purupuru`) | `purupuru-blink` | `A → 76.76.21.21` (Vercel apex) · add `purupuru.world` as custom domain in Vercel UI |
| `blink.purupuru.world` | Quiz Blink (the on-ramp) | `purupuru-quiz` | `CNAME blink → cname.vercel-dns.com.` · add `blink.purupuru.world` as custom domain in Vercel UI |
| (current `world-purupuru`) | Parked — find meaning + weight before subdomain claim | n/a | leave repo standing · revisit post-hackathon |

Once DNS propagates · update env vars on each Vercel project:
- `purupuru-blink` · set `NEXT_PUBLIC_APP_URL=https://purupuru.world`
- `purupuru-quiz` · set `NEXT_PUBLIC_APP_URL=https://blink.purupuru.world`
- Update lexicon.yaml + README references in the same PR

### 🔥 Operator-Only (must do before recording)

| # | Action | Where | Time | Why |
|---|---|---|---|---|
| 1 | Paste `CLAIM_SIGNER_SECRET_BS58` + `SPONSORED_PAYER_SECRET_BS58` + `KV_REST_API_URL` + `KV_REST_API_TOKEN` on Vercel `purupuru-quiz` project | Vercel UI → Settings → Env Vars | 5min | Mint route 500s without these · friendly error message tells the user but breaks the demo |
| 2 | Top up sponsored-payer to ≥1 SOL devnet | `solana airdrop` × N (rate-limited 1 SOL/req) or transfer from id.json | 5min | Demo wallet's mint + a few extras shouldn't drain it |
| 3 | Test live e2e on `https://purupuru-quiz.vercel.app/preview` | Phantom on devnet · take full quiz · click Claim · confirm sig | 10min | Verify route actually mints + emits StoneClaimed + post-mint links.next bridge fires + observatory ?welcome= shows your stone |
| 4 | Verify observatory activity rail is moving during 30s linger | `https://purupuru-blink.vercel.app/` watch for 30s | 5min | Proof #4 depends on motion · KEEPER + WEAVER both flagged |
| 5 | Run `solana program set-upgrade-authority --final` | terminal · ONLY after #3 passes | 5min | **IRREVERSIBLE** · flatline-r2 SKP-005 · removes attacker's ability to push malicious version |
| 6 | Submit Action to Dialect registry (parallel · doesn't block) | https://docs.dialect.to/blinks-getting-started/registry | 5min · review window 1-5 days | Removes dial.to banner if approved before recording · post-hackathon hygiene either way |

### 🔥 Recording (the 3-min skeleton from KEEPER + WEAVER + ROSENZU)

| t | Beat | Surface | Treatment | Proof |
|---|---|---|---|---|
| 0:00-0:25 | Twitter feed view of ambient tile | post the Action URL to a burner X account · screen-record the unfurl | LINGER · scroll past · scroll back · let live count tick | #1 discovery outside app |
| 0:25-0:35 | Tap "What's My Element?" → Q1 | inline POST chain | quick transition | bridge |
| 0:35-1:10 | Quiz Q1 → Q8 | same card · 4 of 8 visible (Q1/Q3/Q5/Q8) | MONTAGE · per-step illustrations shift · cross-dissolves not real POST cycles | builds to character birth |
| 1:10-1:55 | Reveal "You are Wood." + 2-beat reveal copy | result card · stone PNG centered | **LINGER 45s · journey's emotional payoff** · read description aloud · pause on stone | #2 character birth |
| 1:55-2:15 | "Claim Your Stone" → Phantom sig → confirm | wallet popup | CRITICAL-BUT-QUICK 20s · voiceover names the crossing: *"Cross the bridge. Claim your stone."* | #3 trust crossing |
| 2:15-2:25 | Post-mint `links.next` "See yourself in the world" → observatory loads | one tap · skybridge fires | the bridge IS the punchline | seam #3→#4 |
| 2:25-2:55 | Observatory · welcome fixture fires at 5s · stone arrives · activity rail ticks · pan canvas · click sprite | full lobby | LINGER 30s · let music breathe · "Wood arrives early. Look for the others." | #4 not-alone |
| 2:55-3:00 | Close on ambient tile | back to feed | tag line · "the world keeps speaking" | close |

### 🟡 If Time Before Recording

- **Step indicator atmospheric clauses** · `voice-corpus.ts QUIZ_STEP_TITLES` · replace "Question N of 8" with atmospheric prefix matching the q1.png-q8.png bus-stop scenes. ALEXANDER spec:
  ```ts
  1: "the bench is empty · 1 of 8",
  2: "morning light · 2 of 8",
  3: "the rain begins · 3 of 8",
  4: "midday · 4 of 8",
  5: "the wind shifts · 5 of 8",
  6: "dusk · 6 of 8",
  7: "after dark · 7 of 8",
  8: "the bench is empty · 8 of 8",
  ```
  Makes the corridor stop reading as a test. One file change. 5min.

- **First-button visual hierarchy** · `app/preview/preview-overrides.css` `:first-of-type` override to lift Claim above its row. ALEXANDER says test in Dialect DOM first · skip if it doesn't render.

### ⚪ Explicitly Don't Do

- Don't add a 4th/5th answer button to quiz steps. ALEXANDER's call: 3 reads as "world offering you a shape," 5 reads as "menu."
- Don't add login/profile (Z8) for v0. WEAVER: competes with proof #3 trust crossing.
- Don't try to hide the dial.to banner via CSS. ROSENZU: record from Twitter instead.
- Don't change the reveal title from "You are Wood." — KEEPER: identity-locating phrase earned by step 8.
- Don't expand the quiz from 8 questions to 5 silently — operator-Gumi v0 decision · open question post-hackathon.

## Files Touched This Session

```
M packages/medium-blink/src/voice-corpus.ts        (ARCHETYPE_REVEALS · 2-beat expansion)
M packages/medium-blink/src/quiz-renderer.ts        (renderQuizResult · drop secondary CTA)
M packages/medium-blink/tests/quiz-renderer.test.ts (test single-CTA assertion)
M app/api/actions/mint/genesis-stone/route.ts       (POST response · links.next bridge)
M lib/activity/mock.ts                              (seedActivityEvent export)
M lib/activity/index.ts                             (re-export seedActivityEvent)
M components/observatory/ObservatoryClient.tsx      (welcome-param hook · zerker's file · additive)
+ grimoires/loa/specs/enhance-demo-polish-2026-05-11.md  (this file)
+ grimoires/loa/tracks/session-3-demo-polish-kickoff.md  (session continuity)
```

## Audit Trail · Agent Outputs (preserved · for future reference)

The 4 audit reports are in the conversation transcript above. Key receipts:

- **KEEPER** · 4-proof emotional audit · agent `aea23b8efe18e92fc`
- **ALEXANDER** · craft taste-check · agent `a7fd96634dcb30808`
- **WEAVER** · demo arc composition · agent `a6e2b4f46e9a82584`
- **ROSENZU** · spatial demo recording audit · agent `aec7a72a0e9b12f85`

## Loop Closures · Status

| Proof | Beat | Status post-session-3 |
|---|---|---|
| #1 Discovery outside app | Twitter ambient tile | ✅ Ship-ready · operator-side: record from real Twitter (not dial.to) |
| #2 Character birth | Reveal "You are Wood." | ✅ Ship-ready · 2-beat reveal copy expanded · stone PNG · single-decision CTA |
| #3 Trust crossing | Wallet sig | 🟡 Mitigation only · Phantom chrome unfixable · operator-side: voiceover names the crossing |
| #4 I am not alone | Observatory lobby | ✅ Ship-ready · post-mint `links.next` bridge · welcome-fixture seed · activity rail motion verified pre-record |

## Composes With

- `grimoires/loa/context/05-pre-demo-checklist.md` — operator's full pre-record checklist
- `grimoires/loa/context/06-user-journey-map.md` — full 9-zone spatial map
- `grimoires/loa/prd.md` — §1 framing · §7.5 MVP scope · §FR-12 observatory
- `grimoires/vocabulary/lexicon.yaml` — canonical terms · cold-audience registers
- `README.md` — public-facing architecture + journey diagram
