# Architecture Overview

> Generated 2026-05-07. Token-optimized for `/reality` agent consumption.
> One-page system topology. Built from PRD + ride evidence.

## One-Sentence Description

A medium-agnostic awareness layer that lifts purupuru's on-chain activity into ambient social feeds, starting with Solana Blinks, with a sealed Effect Schema substrate and a devnet-only Anchor witness program.

## L1 / L2 / L3 / L4 Layering

```
L1 sources (existing, external)
  - score-puru API (zerker · live)
  - sonar Hasura GraphQL (live)
  - puruhpuruweather X bot (live broadcast)
  - project-purupuru/game (future · codex+gumi pair)

L2 substrate (NEW · this repo · packages/peripheral-events)
  - Effect Schema discriminated union: WorldEvent
  - canonical eventId = sha256(canonical_encoded + version + source)
  - ports + adapters (hexagonal at the substrate boundary)
  - ECS off-chain shape (entities + components + systems)

L3 medium-registry (existing + extension)
  - @0xhoneyjar/medium-registry@0.2.0 (shipped cycle-R)
  - existing variants: DISCORD_WEBHOOK / DISCORD_INTERACTION / CLI / TELEGRAM_STUB
  - NEW · BLINK_DESCRIPTOR (5th variant · PR target freeside-mediums/protocol)

L4 plural renderings
  - apps/blink-emitter (next.js 15 · vercel · solana actions · devnet locked v0)
  - future: twitter card composer, discord webhook, telegram inline
```

## Two-Frame Projection (PRD §3.5)

The architecture explicitly separates two frames:

- **Off-chain (ECS)**: pure-data Effect Schema components, pure-effect systems, full event shape lives here.
- **On-chain (PDA)**: minimal anchor witness program, only writes `WitnessRecord` PDAs, no state mutation beyond that. Sponsored payer for gasless UX.

The `WitnessAttestationSystem` builds a tx, the backend co-signs as `fee_payer`, the user signs as `authority`, the indexer confirms PDA creation and feeds back into ECS.

## Tech Stack (planned)

| Concern | Choice | Note |
|---------|--------|------|
| Substrate language | TypeScript + Effect-TS + Effect Schema | sealed schemas, ports + adapters |
| Emitter framework | Next.js 15 | Solana Actions endpoints + OG render |
| Hosting | Vercel | standard Solana Actions hosting target |
| On-chain | Anchor (Solana) | devnet only v0; sponsored payer |
| Tests | per FR-10 | cmp-boundary lint, golden tests, eventId stability tests |
| Workspace | bun or pnpm monorepo | TBD; not yet scaffolded |

## Doctrines That Constrain the Design

- `[[chathead-in-cache-pattern]]` — per-token `world_event_pointer`
- `[[chat-medium-presentation-boundary]]` — substrate truth ≠ presentation (cmp-boundary lint enforces)
- `[[environment-surfaces]]` — L2 singular, L4 plural
- `[[puruhani-as-spine]]` — every event references a puruhani protagonist
- `[[mibera-as-npc]] §6.1` — no payment via LLM verdicts, no session-key delegation
- `[[metadata-as-integration-contract]]`, `[[wuxing]]`, `[[daily-ritual-loop]]`, `[[storytelling-game-social-convergence]]`, `[[freeside-modules-as-installables]]` (referenced in README)

## Current Reality

```
purupuru-ttrpg/
  ├── .gitignore           [584 B]
  ├── .loa-version.json    [Loa v1.130.0 strict]
  ├── .loa.config.yaml     [persistence: standard, drift: code]
  ├── CLAUDE.md            [repo-level agent guidance]
  ├── README.md            [public description]
  └── grimoires/loa/       [PRD + this ride's reality]
```

Zero git commits. Zero application code. Sprint-1 not started. 4 days to Colosseum Frontier (2026-05-11).

## Where to Read Next

- Requirements & vision → `grimoires/loa/prd.md`
- Architecture detail → `grimoires/loa/sdd.md`
- Drift & consistency → `grimoires/loa/drift-report.md`, `grimoires/loa/consistency-report.md`
- Governance gaps → `grimoires/loa/governance-report.md`
