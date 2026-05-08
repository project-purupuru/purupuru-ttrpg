# Entry Points

> Generated 2026-05-07. **Currently: none.** No application code = no entry points.

## Application Entry Points (planned)

After sprint-1 ships:

| Entry | Path (planned) | Purpose |
|-------|----------------|---------|
| Next.js app | `apps/blink-emitter/` | Solana Action GET/POST + OG image |
| TS workspace package | `packages/peripheral-events/` | substrate library, no entry binary |
| Anchor program | `programs/event-witness/` | devnet-deployed, called via the emitter |
| CLI / scripts | TBD | likely dev-only at first |

## Repository Entry Points (current)

| Entry | Path | Purpose |
|-------|------|---------|
| Repo root README | `README.md` | public-facing description, ghibli-warm voice |
| Agent guidance | `CLAUDE.md` | repo-level Claude/agent prompt + status banner |
| Loa framework | `.loa/` (submodule v1.116.1 elsewhere; this repo has v1.130.0 mounted) | Loa system zone |
| Canonical PRD | `grimoires/loa/prd.md` | post-flatline-applied genesis spec (911 LOC) |
| Companion SDD | `grimoires/loa/sdd.md` | this ride's architecture documentation |

## Required Env Vars (planned)

None today. Sprint-1 will introduce (anticipated, not yet committed):

- `SOLANA_RPC_URL` — devnet
- `WITNESS_PROGRAM_ID` — anchor program deployment address
- `BACKEND_FEE_PAYER_KEYPAIR` — sponsored-payer signing keypair
- `SCORE_API_URL` — score-puru integration
- `SONAR_GRAPHQL_URL` — Hasura subscription endpoint
- `WEATHER_BOT_FEED` — puruhpuruweather upstream

## Build / Run

Not yet defined. Sprint-1 will add `package.json`, `bun.lockb` or `pnpm-lock.yaml`, and likely a `turbo.json` or `nx.json` for the monorepo.
