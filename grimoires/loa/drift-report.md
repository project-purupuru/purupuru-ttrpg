# Three-Way Drift Report

> Generated 2026-05-07 by `/ride`. Compares (1) code reality, (2) legacy docs, (3) user-supplied context.

## Drift Score: **7 / 10** (Healthy with intentional gaps)

The codebase is a **scaffold**: design-system + Score read-adapter mock + asset library are real and aligned with docs; the **observatory simulation itself is a Ghost** — described in the brief and decision log, not yet built. This is expected and correct for the hackathon ship-clock.

## Summary

| Category | Count | Examples |
|----------|-------|----------|
| **Aligned** | 12 | Stack, design tokens, font wiring, Score adapter contract, AGENTS.md warning, mocked-vs-real boundary |
| **Ghost** (documented, not in code) | 3 | Observatory simulation, action vocabulary (mint/attack/gift), pentagram spatial frame |
| **Stale** (docs say X, code shows Y) | 1 | README.md — generic Next.js boilerplate, doesn't describe purupuru |
| **Hallucinated** (claims unsupported by code) | 0 | — |
| **Shadow** (code exists, undocumented) | 1 | `public/data/materials/*.json` — 18 inert configs from upstream pipeline |
| **Missing** (code exists, no docs) | 0 | — |

## Aligned Claims (verified against code)

| # | Claim | Evidence |
|---|-------|----------|
| A1 | Next.js 16.2.6 + React 19.2.4 + TS 5 + pnpm | `package.json:14–17,29` |
| A2 | Pixi.js v8.18.1 vanilla, no `@pixi/react` | `package.json:16` (pixi.js ^8.18.1); no `@pixi/react` in deps |
| A3 | Tailwind 4 via `@tailwindcss/postcss` | `package.json:21,28`, `postcss.config.mjs` |
| A4 | App Router (no `pages/`) | `app/layout.tsx`, `app/page.tsx` exist; no `pages/` dir |
| A5 | OKLCH wuxing palette × 4 shades, light + Old Horai dark | `app/globals.css:67–99` (5 elements × 5 shades each), `app/globals.css:227–299` ([data-theme="old-horai"]) + `app/globals.css:301–375` (prefers-color-scheme: dark mirror) |
| A6 | Per-element breathing rhythms | `app/globals.css:189–193` (`--breath-{wood,fire,earth,metal,water}` 4–6s) |
| A7 | 5 brand font stacks | `app/globals.css:441–445` (`--font-puru-{body,display,card,cn,mono}`) |
| A8 | Fluid typography scale text-2xs..text-3xl with clamp() | `app/globals.css:447–456` (9 size tokens, all clamp-based) |
| A9 | motion + lucide-react + clsx + tailwind-merge installed | `package.json:12–14,19` |
| D1 | Five-element wuxing roster (wood/fire/earth/water/metal) | `lib/score/types.ts:7–8` |
| D2 | Score read contract with deterministic mock | `lib/score/types.ts:40–46`, `lib/score/mock.ts:33–82`, `lib/score/index.ts:17` |
| T7 | No shadcn registry; cn() helper at lib/utils | `lib/utils.ts:1–6`; no shadcn config files in repo |

## Ghost Items (documented, not in code)

| # | Claim | Source | Resolution |
|---|-------|--------|------------|
| G1 | Observatory simulation (god's-eye visualization, 500–1000 sprite target, click-to-reveal focus card) | `00-hackathon-brief.md:8–14`, `NOTES.md` decision log | **Expected Ghost** — first sprint task. PRD/SDD will describe the to-be-built. |
| G2 | Action vocabulary "tight 3" (mint / attack / gift) with 3 distinct migration grammars (vertex-spawn / inner-star / pentagon-edge) | `NOTES.md` decision log 2026-05-07 | **Expected Ghost** — design intent for sim engine. |
| G3 | Pentagram spatial frame (5 vertices, pentagon=生 generation, inner star=克 destruction) | `NOTES.md` decision log 2026-05-07 | **Expected Ghost** — design intent. References to wuxing Sheng/Ke cycles in `public/art/skills/purupuru/SKILL.md:34` validate the lore foundation. |

These three Ghosts are **intentional** — the scaffold session deferred PRD to `/plan`. They are the next sprint's deliverables.

## Stale Items (docs say X, code shows Y)

| # | Item | Doc claim | Code reality | Severity |
|---|------|-----------|--------------|----------|
| S1 | `README.md` says "This is a Next.js project bootstrapped with create-next-app" and instructs "edit `app/page.tsx`" with no project-specific framing | Generic Next.js boilerplate | Project IS Next.js, but is purupuru-ttrpg with a specific design system, mock Score adapter, and hackathon scope | **Low** — flagged in hygiene-report.md (LOW-1) |

## Shadow Items (code exists, undocumented)

| # | Item | Evidence | Resolution |
|---|------|----------|------------|
| SH1 | 18 material configs in `public/data/materials/*.json` referencing "ecsPipeline", "Godot-composition", "DOTS", "cycle-089" | `public/data/materials/jani-fire.json` (representative shape) | Flagged in `hygiene-report.md` (MED-1). Not project-vocabulary; appears to be upstream pipeline artifacts. Inert in current build. |

## Hallucinated Items

**None.** Every doc claim verified against code resolves to either ALIGNED or GHOST (where Ghost = "future work declared in design notes, scaffold not yet built").

## Critical findings: NONE

The drift profile is the expected shape for a Day 0 scaffold:
- Stack and design system are real and aligned.
- Simulation engine is a known Ghost — documented, not built.
- One stale boilerplate file (README) is cosmetic.

## Recommendation

Proceed to `/plan` (PRD) and `/architect` (SDD). The Ghost items (G1–G3) become PRD/SDD source-of-truth. README replacement is a sub-15-minute task that can land alongside the first implementation sprint.
