@.claude/loa/CLAUDE.loa.md

# purupuru-ttrpg — Project Instructions

> Project-specific overrides take precedence over framework instructions imported above.

## Project

Live awareness layer for the purupuru world — a god's-eye observatory visualization that fuses on-chain + IRL + cosmic-weather signals into one ambient surface. Built for Solana Frontier hackathon (ship 2026-05-11).

## Stack

- **Next.js 16.2.6** — App Router. ⚠️ Breaking changes vs prior versions; consult `node_modules/next/dist/docs/` before assuming APIs.
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind 4** (via `@tailwindcss/postcss`) — token-driven, OKLCH palette
- **pnpm 10.x**
- **Pixi.js v8** (vanilla, no `@pixi/react`) — main 2D simulation canvas
- **motion** — UI animation (not canvas)
- **lucide-react** — icons (sparingly per design system)

## Design System

Token-driven via `app/globals.css`:

- 5-element wuxing OKLCH palettes (wood, fire, earth, water, metal) × 4 shades each (tint/pastel/dim/vivid)
- Light + dark (Old Horai) themes
- Per-element breathing rhythms (`--breath-fire: 4s`, etc.)
- Motion vocabulary keyframes (`purupuru-place`, `breathe-fire`, `tide-flow`, ...)
- Easing curves (`puru-flow`, `puru-emit`, `puru-crack`)
- 5 brand font stacks: `font-puru-{body,display,card,cn,mono}`
- Fluid typography scale: `text-2xs` through `text-3xl` with clamp()

Use Tailwind utilities backed by these CSS variables (e.g., `bg-puru-fire-vivid`, `font-puru-display`). Avoid hand-writing hex colors.

## What's Mocked vs Real (Hackathon Scope)

| Layer | Real | Mocked |
|-------|------|--------|
| Score backend | ❌ | ✅ — see `lib/score/` types |
| Wallet/auth | ❌ | ✅ — pure visualization |
| On-chain actions | ❌ | ✅ — synthetic event stream |
| IRL weather | TBD | TBD |
| Visual primitives | ✅ | — |

## Loa Workflow

Mounted v0.6.0. Use:

- `/plan` — when ready to write the actual implementation PRD (deferred during scaffold session)
- `/build` — sprint execution (NEVER write app code outside `/implement`)
- `/review` + `/audit` — quality gates per sprint

See `grimoires/loa/NOTES.md` for active sub-goals and decision log.
