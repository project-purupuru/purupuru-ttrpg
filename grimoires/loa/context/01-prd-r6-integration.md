# PRD r6 Integration Notes (post-zerker-scaffold)

> Forward-looking integration context. Tracks how zerker's `f3c040d` scaffold composes with the post-flatline-r3 PRD r6 work that landed on top.

## What landed (this integration · 2026-05-07 PM)

- `grimoires/loa/prd.md` — r6 post-flatline-r3 PRD (941 lines · 6-revision supersession chain · ed25519-via-instructions-sysvar · proper HMAC · spine-first MVD)
- `grimoires/loa/sdd.md` — companion SDD authored by `/ride` (PRD untouched · canonical preserved)
- `grimoires/loa/a2a/flatline/*.json` — 3 adversarial review JSONs (rounds 1+2+3 · subscription auth · $0 each)
- `grimoires/loa/reality/*` — `/ride` reality reports (component inventory · architecture · types · interfaces · etc.)
- `grimoires/loa/{drift,consistency,governance,trajectory-audit,legacy/INVENTORY}.md` — `/ride` analytical artifacts
- `grimoires/loa/context/claims-to-verify.md` — `/ride` claim verification list
- `BUTTERFREEZONE.md` — agent-grounded summary (Tier 1 · 898 words)

## What was preserved untouched (zerker's canonical)

- `CLAUDE.md` (better than what I authored · keeps zerker's stack notes + design system + mocked-vs-real table + Loa workflow guidance)
- `.gitignore` (zerker's is more comprehensive · keeps Next.js + Loa state + python pycache + stray locks)
- `.loa.config.yaml` (zerker's has hackathon-mode interview tuning)
- `.loa-version.json` (Loa v0.6.0 stamp · zerker's mount is canonical for this repo)
- `.claude/*` (Loa system zone · zerker's mount canonical)
- `app/`, `lib/`, `public/`, `package.json`, `pnpm-lock.yaml`, etc. (zerker's Next.js scaffold + brand assets)
- `AGENTS.md` (zerker's Next.js 16 warning)
- `README.md` (default Next.js — zerker's choice; not my place to edit)

## Tensions worth flagging (operator-paced reconciliation)

### T-1 · real Score API vs mocked Score (the "what's wired" question)

| frame | what it says |
|---|---|
| zerker's NOTES.md sub-goal #2 (`2026-05-07 AM`) | "Mock the Score data layer through FE — no real backend wiring for hackathon" |
| zerker's hackathon-brief decisions table | "No real wallet auth / no real Score backend for hackathon · Mock everything FE-side; the visual/experience IS the demo" |
| PRD r6 FR-5 (`2026-05-07 PM`) | "consume score's existing surfaces (read-only): score-puru API + Sonar/Hasura GraphQL · existing routes are sufficient sources for MintEvent + ElementShiftEvent derivation" |

**resolution candidates** (operator decides):
- 🟢 **mocked-first · wire later** — zerker ships Pixi sim with mocked data; awareness-layer Blink can also mock Score reads for v0 demo; real wiring P2
- 🟡 **real Score in Blink · mocked in Pixi** — Blink emitter (this lane) reads real Score API per FR-5; Pixi sim (zerker's lane) stays mocked for visual control
- 🔵 **real everywhere** — overrides zerker's earlier mocked-first decision; Pixi sim wires to real Score API

PRD r6 leans 🟡 (real Score in Blink · zerker's Pixi independent). Operator confirm at sprint-1 morning.

### T-2 · viz layer vs awareness substrate (which IS the demo?)

| frame | what it pitches |
|---|---|
| zerker's hackathon-brief | "live observatory visualization layer · god's-eye view · thousands of moving entities · the visual IS the demo" |
| PRD r6 deck story | "awareness layer infrastructure with separation-as-moat · bazi quiz Blink + Solana mint + ambient feed" |

**resolution**: these are COMPLEMENTARY per PRD r6 §3.1 three-view architecture:
- 🪨 **substrate** = sonar/score/anchor (truth layer · zerker+zksoju lanes)
- 🌊 **operator surface** = Score dashboard · purupuru-styled · Pixi sim **fits here** as zerker's lane (the god's-eye observatory IS the operator dashboard view)
- 🪞 **member surface** = Blink emitter · twitter-native · zksoju+gumi lanes

deck story leads with separation-as-moat (architectural punchline) · demo SHOWS both surfaces (Blink interaction + Pixi observatory). they prove different things: Blink = "you can interact"; Pixi = "the world has people in it."

### T-3 · zerker's 8 open questions (now partially answered by PRD r6)

zerker's `00-hackathon-brief.md` § "Open gaps" — these blocked architecture in his scaffold session. PRD r6 answers some:

| # | question | PRD r6 answer | still open |
|---|---|---|---|
| 1 | Audience (Frontier-only vs public web)? | submitted to Frontier · public web is bonus | yes |
| 2 | Wallet/auth scope (Phantom connect vs sim only)? | Phantom for Blink mint (FR-3) · sim-only OK for Pixi viz | partially |
| 3 | Activity vocabulary (mint, attack, gift, transfer, vote)? | v0: MintEvent · WeatherEvent · ElementShiftEvent · QuizCompletedEvent (FR-1) | extensible per zerker's needs |
| 4 | IRL weather source? | existing `@puruhpuruweather` bot (already live) | TBD if zerker needs Pixi-side reads |
| 5 | Movement model (wandering, schooling, drifting)? | NOT covered by PRD r6 (zerker's lane) | yes · zerker designs |
| 6 | Demo entry point (landing → sim, or sim immediately)? | NOT covered · operator decides at sprint-4 | yes |
| 7 | Success criterion (N seconds for "get it"; elevator)? | 🟢 elevator pitch + 🟣 narrative locked in PRD r6 §0 + §13 | answered |
| 8 | Coordination with parallel hackathon work? | three-view arch (PRD §3.1) + zerker's Pixi sim = operator dashboard view | yes (this doc) |

questions 5 + 6 stay open · zerker's lane · sprint-1+2 work.

## Lanes after this integration (revised from zerker's solo + my PRD r6)

| handle | lane | from |
|---|---|---|
| 🪨 zksoju | substrate (`@purupuru/peripheral-events`) · BLINK_DESCRIPTOR upstream PR · Anchor program (witness + claim_genesis_stone · ed25519 sig · Metaplex) · blink-emitter (GET-chain quiz + mint POST) · vercel deploy · demo recording · demo simulator | PRD r6 §6 |
| 🌬 eileen | architecture ratification · separation-as-moat doctrine authority · keypair posture | PRD r6 §6 |
| 🌊 zerker | Pixi sim (god's-eye observatory · operator dashboard view) · Solana indexer (downstream of anchor deploy) · Score API/CLI/MCP read-side · this scaffold's brand assets + design tokens | zerker scaffold + PRD r6 §6 |
| 🌸 gumi | quiz design (5 resonant questions + 4 answers each + 5 archetype reveals · NOT birthday/gender · parallel · placeholders ready) · voice register · stone art · Pixi sim aesthetic guidance | PRD r6 §6 |

## What's next (this PRD's intended next moves)

- `/architect` — SDD update from PRD r6 (companion SDD already exists at `grimoires/loa/sdd.md` from `/ride`; `/architect` may refine)
- `/sprint-plan` — 4-day sprint shape with day-1 spine + 3 spikes (Phantom Metaplex visibility · ed25519-sysvar Solana pattern · partial-sign tx assembly)
- direct to building on the spine (skip /architect if velocity favored)

## References

- canonical PRD: `grimoires/loa/prd.md`
- companion SDD: `grimoires/loa/sdd.md`
- adversarial reviews: `grimoires/loa/a2a/flatline/` (3 rounds)
- zerker's hackathon brief: `grimoires/loa/context/00-hackathon-brief.md`
- bonfire mirror of PRD: `~/bonfire/grimoires/bonfire/specs/purupuru-ttrpg-genesis-prd-2026-05-07.md` (committed at `aabb215`)
