# External Integrations

> Generated 2026-05-07. **Currently: none integrated.** All integrations are planned for sprint-1+.

## Upstream Sources (read-side)

| Source | Repo / Surface | What this repo will read | Integration shape |
|--------|----------------|--------------------------|-------------------|
| `score-puru` API | `project-purupuru/score` (live) | Element affinity, wallet signals | HTTP REST · planned `ScoreAdapter` |
| `sonar` GraphQL | `project-purupuru/sonar` (live) | Raw on-chain mint / transfer events | Hasura subscription · planned `SonarAdapter` |
| `puruhpuruweather` | live X bot | Daily cosmic weather oracle | feed/parse · adapter TBD |
| `project-purupuru/game` | codex+gumi parallel pair | Game-state events (battle, burn, transcendence) | future · post-hackathon |

## Downstream Mediums (write-side / fan-out)

| Medium | Registry | Status |
|--------|----------|--------|
| `BLINK_DESCRIPTOR` (Solana Actions) | `0xHoneyJar/freeside-mediums/protocol` | **PR planned** — 5th MediumCapability variant alongside DISCORD_WEBHOOK / DISCORD_INTERACTION / CLI / TELEGRAM_STUB. `medium-registry@0.2.0` already shipped (cycle-R, 2026-05-04). |
| Twitter card composer | future | post-hackathon |
| Discord webhook | future | post-hackathon |
| Telegram inline | future | post-hackathon |

## On-Chain Surface

- Solana **devnet** v0. The on-chain witness program (`programs/event-witness/`) will be deployed to devnet only.
- Sponsored-payer model: backend keypair pays gas; user wallet signs as authority for the witness record.
- Mainnet path deferred per PRD D-3.

## Webhooks

None yet. Sponsorship for ingest webhooks (e.g. mint listeners) likely emerges in sprint-1.

## Auth

- No app-side auth today.
- The Solana Action endpoints are wallet-gated *implicitly* — the user must sign the returned tx with their wallet. There is no separate session.
- `[[mibera-as-npc]] §6.1` prohibits session-key delegation.
