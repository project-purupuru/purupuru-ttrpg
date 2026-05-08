# Reality Index — purupuru-ttrpg

> Token-optimized hub for `/reality` queries. Routes to spoke files. Generated 2026-05-07.

## What this codebase is

A **Day 0 Solana Frontier hackathon scaffold** for a god's-eye observatory visualization of the purupuru world. Stack: Next.js 16.2.6 (App Router) + React 19.2.4 + TypeScript 5 + Tailwind 4 + Pixi.js 8 (vanilla). Today's surface is a single `/` route showing the design-system kit. The observatory simulation is the next sprint.

## Quick stats

| Metric | Value |
|--------|-------|
| Source files (TS/TSX/CSS) | 8 |
| Source lines | 906 |
| Routes | 1 (`/`) |
| API endpoints | 0 |
| Tests | 0 |
| Env vars | 0 |
| Tech-debt markers | 0 |

## Spokes

| File | What's inside |
|------|---------------|
| `api-surface.md` | Public functions, exports, route enumeration |
| `types.md` | Score domain types, element vocabulary |
| `interfaces.md` | External integration shapes (mocked Score, future weather) |
| `structure.md` | Directory tree + module responsibilities |
| `entry-points.md` | Build commands, dev server, env requirements |
| `architecture-overview.md` | Component diagram, data flow, design system architecture |

## Key files

| Path | Why |
|------|-----|
| `app/page.tsx` | The single route — design-system showcase |
| `app/globals.css` | OKLCH tokens, themes, motion vocab — single source of truth |
| `app/layout.tsx` | Root shell + next/font wiring |
| `lib/score/types.ts` | Score read-adapter contract |
| `lib/score/mock.ts` | Deterministic mock keyed off wallet hash |
| `lib/score/index.ts` | One-line binding to swap mock for real |
| `lib/utils.ts` | `cn()` for Tailwind class composition |
| `CLAUDE.md` | Project instructions for AI agents |
| `AGENTS.md` | "This is NOT the Next.js you know" warning |
