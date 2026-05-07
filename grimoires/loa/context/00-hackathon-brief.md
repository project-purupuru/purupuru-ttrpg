# Hackathon Brief — purupuru-ttrpg awareness layer

> Forward-looking context for the next planning session. Captures decisions
> already made and the open questions that block architecture.

## What we're building

A **live observatory visualization layer** — a "god's-eye view" of the puruhani world where every user is a visible entity reacting in real time to:

- On-chain actions (post-quiz, post-NFT-mint, future actions)
- IRL weather mapped through wuxing (5-element) state
- Cosmic weather (the awareness layer's ambient signal)

The visualization fuses on-chain + off-chain, online + offline activity into a single ambient surface. Per zerker: *"basically a live simulation of ppl doing both onchain and offchain offline and online stuff fused together."*

## Hackathon clock

- **Target**: Solana Frontier
- **Ship date**: 2026-05-11
- **Submission**: standalone repo `project-purupuru/purupuru-ttrpg`

## Scope

zerker is on the Score/data lane officially, but for this 4-day window will be building the FE visualization that *simulates* the Score data layer through visuals. No real backend wiring. The viz IS the demo of what Score+substrate would surface.

## Decisions already made

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-07 | **Stack**: Next.js 16 + React 19 + TS + Tailwind 4 + pnpm | zerker's comfort zone; matches CLAUDE.md preferences |
| 2026-05-07 | **Sim engine**: 2D Pixi.js v8 (vanilla, no @pixi/react) | Built for thousands of moving entities; ships in 4 days |
| 2026-05-07 | **3D**: optional polish only if time permits — possibly a hero/intro scene via react-three-fiber | "lets start with 2d and maybe we can extend to 3d if we have time and want to improve the overall experience and depth" |
| 2026-05-07 | **No real wallet auth / no real Score backend** for hackathon | Mock everything FE-side; the visual/experience IS the demo |
| 2026-05-07 | **Use Loa framework (trimmed path)** | Discipline + scope control on tight clock; mount → plan → architect → sprint-plan → build → review |

## Visual identity

Token-driven design system established in `app/globals.css`:

- OKLCH wuxing palette × 4 shades (tint/pastel/dim/vivid) per element
- Light + dark (Old Horai) themes
- Per-element breathing rhythms (`--breath-fire: 4s`, `--breath-water: 5s`, etc.)
- Motion vocabulary keyframes (purupuru-place, breathe-fire, tide-flow, etc.)
- 5 font stacks (body / display / card / cn / mono)
- Brand wordmark + puruhani + jani sister-character sprites + card-system art

The kit landing at `/` showcases all of this and serves as the proof the design system is wired correctly.

## Open gaps (questions for the user)

These are NOT yet decided and need answers before architecture:

1. **Audience/distribution** — Submitted as Solana Frontier hackathon entry only, or also published publicly to web for the wider purupuru community? Affects polish level + perf targets.
2. **Wallet/auth scope** — Does the demo support Phantom connect to surface "your" puruhani in the swarm, or pure simulation only?
3. **Activity vocabulary** — When a user "does something on-chain", what kinds of actions surface? (mint, attack, gift, transfer, vote?) Need a finite set.
4. **IRL weather source** — Real API (Open-Meteo? NOAA?) by location, or mocked? Whose location?
5. **Movement model** — Are puruhanis wandering, schooling, drifting, teleporting? Reactive to weather (e.g., fire flees water rain)? This is the heart of the "alive" feel.
6. **Demo entry point** — When the demo runs at Frontier, what's the first frame? Landing page → sim, or sim immediately? Intro animation?
7. **Success criterion** — In what N seconds must a judge "get it" and what's the elevator pitch through the visual?
8. **Coordination** — Any shared interfaces with parallel hackathon work (substrate / contracts / voice register)? Or fully independent demo?
