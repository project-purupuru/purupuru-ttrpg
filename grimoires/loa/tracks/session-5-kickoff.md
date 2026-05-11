# Session 5 Kickoff · Demo Polish + Storyline Bridge · Ship 2026-05-11

> Session 4 landed the X-faithful `/demo` recording surface, unified OG metadata, KAORI-voice ambient agent post, and a working dynamic OG card. Session 5 polishes the underlying experience, ties it to the judges' narrative + Eileen's framing, and bridges the demo arc through to the observatory.

## Read first

- @grimoires/loa/specs/enhance-demo-polish-2026-05-11.md ← session 3 build doc · operator runway · 3-min recording skeleton
- @labs/purupuru/UTC-pre-demo-walkthrough-2026-05-11.md ← UTC walkthrough · §1–3 closed · §4 live walkthrough open · §5 freeze gated
- @grimoires/loa/context/06-user-journey-map.md ← 9-zone spatial map
- @grimoires/loa/tracks/session-4-demo-polish-kickoff.md (and session-3 if exists) ← prior session continuity
- @grimoires/loa/distillations/session-4-upstream-learnings-2026-05-11.md ← what session 4 learned · upstream candidates

## Session 4 shipped (commits)

| Commit | What |
|---|---|
| `d27dfb3` | Fixed dev server 500 (Tailwind v4 symlink traversal) + OG image render (Satori oklch incompatibility) |
| `a3d844b` | Dynamic OG card via `app/opengraph-image.tsx` · KAORI-voice ambient post (HERALD audit) |
| `62f2138` | OG image inheritance fix · @tsuhejiwinds agent post seam |
| `61e8b8a` | Full SEO/OG metadata strategy (BEACON+ALEXANDER) · `/quiz` + `/today` landing pages · sitemap + robots + llms.txt |
| `f15931c` | Drop em-dash from focal post |
| `bc551a0` | R5 3-construct audit (KEEPER+ALEXANDER+ROSENZU) closed final seams |
| `c39e4ed` | `/demo` X-faithful recording surface · fixture URI fixes |

Current state: dev server running cleanly on `localhost:3000` · all 5 public routes return 200 · `/opengraph-image` generates the 1200×630 card live · Vercel auto-deploys main to `purupuru.world`.

## Persona for this session

SHIP mode + storytelling lens. Operator drives final polish; constructs available for spot fixes and rigorous gap review.

## Workstreams for the session (prioritized)

### 🔥 P0 · Demo polish · before-the-Blink + bridge-to-observatory

The demo arc has 4 proofs (Eileen's framing). Session 4 mostly polished proof #1 (`/demo` X-faithful surface). Session 5 should:

1. **Polish proof #2 (the reveal moment)** — the 45s linger on "You are Wood." is the demo's emotional payoff. Audit:
   - Stone PNG quality at recording resolution
   - 2-beat reveal copy density (ALEXANDER ship-recommended any tightening?)
   - Step-indicator atmospheric clauses (build doc § Yellow · pending)
2. **Polish proof #3 (the trust crossing)** — Phantom chrome unfixable; ROSENZU R5 said "verify Blink card stays mounted under Phantom popup." Pre-record this. If it unmounts, switch to mobile Phantom capture path.
3. **Polish proof #4 (the observatory arrival)** — verify:
   - Post-mint `links.next` bridge resolves to `purupuru.world/?welcome=<element>` (the URL is correct; verify visually at the seam)
   - Welcome fixture fires at 5s mark with the just-minted element on the activity rail
   - Activity rail stays MOVING during 30s linger (ROSENZU + KEEPER both flagged motion as load-bearing)
4. **Polish the seams between proofs**:
   - Quiz → Reveal: any latency to mask?
   - Reveal → Phantom: voiceover beat ready
   - Confirm → Observatory: ROSENZU's "past tense low volume" voiceover note (`"and the world was already there"`)

### 🔥 P0 · Judges' framing + storyline

Tie the demo arc directly to what the Solana Frontier judges will hear:

1. **Lead with the moat** (KEEPER R3 frame): "Most on-chain games die when the player closes the app. Purupuru makes the world visible in the feeds where players already live. The game begins before the player enters the app."
2. **Frame the recognition pivot** (operator-affirmed): NOT fortune-telling · IS recognition + reflection. The quiz reads the user back. The stone marks the moment. The observatory proves they aren't alone.
3. **Show the modular architecture** (operator vision · session 3): three platform-portable layers — chain (Solana v0 · agnostic), service (substrate primitives), presentation (Twitter Blink · Telegram · base app · etc.). The hackathon submission is one demonstrable component of a larger vision.
4. **Identify the v0 → v1 gaps honestly** (build doc § Explicitly Don't Do): the Z5 confirmation surface and Z8 profile claim are post-hackathon work. Don't hide it — frame it.

### 🟡 P1 · README + docs sweep

Update root `README.md` to match what session 4 actually shipped:
- Add `/demo` to the public-surface table
- Note the OG metadata setup
- Note the dynamic OG image route
- Add the SEO surfaces (`/quiz` `/today` `/sitemap.xml`)
- Refresh the architecture diagram (if any) to reflect the brand surface consolidation (`purupuru.world` apex · old `purupuru-blink.vercel.app` and `purupuru-quiz.vercel.app` deprecated)

Also: `grimoires/vocabulary/lexicon.yaml` may need a refresh — references to old hosts, registers, etc.

### 🟡 P1 · QA checklist remaining items

Run through `labs/purupuru/UTC-pre-demo-walkthrough-2026-05-11.md` and close anything still open:
- §1.4: post-recording sweep PR (lexicon + README · queued · do now if it's quick)
- §4: live walkthrough (operator + Phantom on devnet)
- §5: irreversible upgrade-authority freeze (`solana program set-upgrade-authority --final`) · ONLY after §4 passes
- §6: Dialect registry submission (parallel · 1–5 day review · operator-side · do today regardless)
- §7: post-walk synthesis (fill the OBSERVED slots as you go)

### 🟢 P2 · Bridgebuilder review of session 4 changes

Operator requested `/bridgebuilder-review` on session 4 changes. Inputs:
- All commits between `142b6fd` and `d27dfb3` (the session-4 range)
- Self-review captured in `grimoires/loa/reviews/bridgebuilder-self-review-session-4-2026-05-11.md`
- Distillations in `grimoires/loa/distillations/session-4-upstream-learnings-2026-05-11.md`

### 🟢 P2 · Question the question

Operator latitude: any framing in the build doc or this kickoff that feels off, push back. Specific things worth questioning:

1. Is `/demo` actually the right proof-#1 surface, or is the Dialect-registered native unfurl path more honest? (Answer probably depends on whether Dialect approves in time.)
2. Is the `@tsuhejiwinds` agent post a feature we're committing to ship, or is it demo-only content?
3. Should the metal-hour / dusk-pivot / element-distribution KAORI alternates be wired into actual post rotation (post-hackathon) or stay as demo copy?

### ⚪ Latitude · operator-granted

Operator said: *"you can work on whatever you want in addition to the requests · you can work on a % of stuff you don't even have to report about"*

Use that budget for:
- Anything in the build doc § "If Time Before Recording" not yet shipped (step-indicator atmospheric clauses · first-button visual hierarchy)
- Voice corpus extension (the 3 KAORI alternates → actual rotation if agent ships post-hack)
- Cosmetic improvements you notice mid-flow

## Construct composition for this session

| Workstream | Primary | Secondary | Lens |
|---|---|---|---|
| Demo polish · pre-Blink seams | construct-artisan (ALEXANDER) | construct-rosenzu (spatial) · construct-observer (KEEPER) | craft + spatial + truth |
| Judges' framing + storyline | construct-gtm-collective (LILY) | construct-herald · construct-showcase | GTM + voice |
| README + docs | construct-herald · construct-beacon | construct-artisan (copy) | provenance + craft |
| QA closure | construct-crucible | construct-observer (KEEPER) | journey validation |
| Bridgebuilder review | (built-in skill) | — | review |
| Distillation upstream | (already done · session-4 distillations doc) | — | — |

## Recording prep · operator-side · ready when you are

| Item | State | Source |
|---|---|---|
| 1440×900 viewport · 100% zoom · DPR 2 · Chrome | not yet done | ROSENZU R5 |
| Burner X account ready | done (session 4) | UTC §4 |
| Phantom on devnet · fresh test wallet | done | UTC §4 |
| Sponsored payer ≥1 SOL devnet | done (1 SOL · airdrop rate-limited but sufficient) | UTC §3 |
| Pre-record Blink-mounted-under-Phantom test | pending | ROSENZU SHIP-BLOCKING |
| Voiceover lines drafted (proof #3 "cross the bridge" · proof #4 "and the world was already there") | drafted in spec | KEEPER + ROSENZU R5 |
| §5 upgrade-authority freeze | pending · IRREVERSIBLE | UTC §5 · post-walkthrough only |

## Composes with

- @grimoires/loa/specs/enhance-demo-polish-2026-05-11.md
- @grimoires/loa/context/05-pre-demo-checklist.md
- @grimoires/loa/context/06-user-journey-map.md
- @labs/purupuru/UTC-pre-demo-walkthrough-2026-05-11.md
- @grimoires/loa/distillations/session-4-upstream-learnings-2026-05-11.md ← upstream contributions
- @grimoires/loa/reviews/bridgebuilder-self-review-session-4-2026-05-11.md ← what session 4 shipped, critically reviewed
