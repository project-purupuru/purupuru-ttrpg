# Agent Working Memory (NOTES.md)

> This file persists agent context across sessions and compaction cycles.

## Active Sub-Goals

- Build live-observatory visualization layer for Solana Frontier hackathon (ship 2026-05-11)
- Mock the Score data layer through FE — no real backend wiring for hackathon

## Discovered Technical Debt

## Blockers & Dependencies

- Going Next.js + React + Tailwind 4 + Pixi.js v8 (vanilla, not @pixi/react). 3D path (react-three-fiber) is optional polish if time permits.

## Session Continuity
| Timestamp | Agent | Summary |
|-----------|-------|---------|
| 2026-05-07 | mounting-framework | Mounted Loa v0.6.0 on empty repo |
| 2026-05-07 | scaffold | Next.js 16.2.6 + React 19.2.4 + Tailwind 4 + Pixi 8.18.1 scaffold. Design system established in app/globals.css (OKLCH wuxing palette × 4 shades, light + Old Horai dark, per-element breathing rhythms, motion vocabulary keyframes, fluid typography scale, 5 brand font stacks). Local fonts (FOT-Yuruka Std, ZCOOL KuaiLe) via @font-face; Inter + Geist Mono via next/font/google. Brand wordmark + 5 puruhani PNGs + 5 jani sister PNGs + 30+ card-system SVG layers + tsuheji map + 18 Threlte material configs in /public. Score read-adapter contract + deterministic mock at lib/score. cn() utility at lib/utils. Build clean. Kit landing at app/page.tsx showcases brand wordmark, full typography (incl. JP/CN), wuxing roster, and jani sister roster. |

## Decision Log
| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| 2026-05-07 | 2D Pixi.js for main sim | 4-day clock; thousands of entities; 3D as optional polish | zerker |
| 2026-05-07 | Use Loa framework (trimmed path) | Discipline + scope control on tight clock | zerker |
| 2026-05-07 | Defer PRD to next session | Scope this session to scaffold only; user will run /plan separately for the actual implementation | zerker |
| 2026-05-07 | Skip shadcn init | Tailwind 4 setup differs; use cn() helper + copy individual primitives later as needed | claude (acked) |
| 2026-05-07 | Hackathon interview mode (minimal+batch) | Saves ~12 conversational rounds across /plan, /architect, /sprint-plan — wired in .loa.config.yaml | claude (acked) |

## Open at Handoff (for next session)

When zerker returns to do the implementation PRD, see `grimoires/loa/context/00-hackathon-brief.md` "Open gaps" section — 8 unanswered questions that block architecture (movement model, action vocabulary, weather source, demo entry, success criterion, etc.).

## What Already Lives in the Kit

- `public/art/puruhani/puruhani-{wood,fire,earth,water,metal}.png` — 5 base puruhani sprites
- `public/art/jani/jani-{wood,fire,earth,water,metal}.png` — 5 jani sister-character sprites
- `public/art/element-effects/{element}_glow.svg` + `harmony_glow.svg` — 6 glow overlays
- `public/art/cards/` — frames × 4 rarities, 6 elemental backgrounds + frames_pot, 14 behavioral states, 4 rarity treatments
- `public/art/patterns/grain-warm.webp` + `public/art/tsuheji-map.png`
- `public/brand/purupuru-wordmark.svg` + `purupuru-wordmark-white.svg`
- `public/fonts/` — FOT-Yuruka Std (woff2 + ttf), ZCOOL KuaiLe (woff2)
- `public/data/materials/` — 18 Threlte 3D material configs (caretaker × 2 × 5 elements + jani × 5 + 3 transcendence)
- `app/globals.css` — full OKLCH wuxing palette × 4 shades, light + Old Horai dark, motion vocab keyframes (purupuru-place, breathe-fire, breathe-water, breathe-metal, tide-flow, honey-burst, shimmer), per-element breathing rhythms, easing curves, 5 brand font stacks, fluid typography scale
- `lib/score/{types,mock,index}.ts` — read-adapter contract + deterministic mock (seeded from wallet address)
- `lib/utils.ts` — cn() helper (clsx + tailwind-merge)
- Tailwind utilities: `bg-puru-{element}-{tint|pastel|dim|vivid}`, `text-puru-ink-{rich|base|soft|dim|ghost}`, `bg-puru-cloud-{bright|base|dim|deep|shadow}`, `font-puru-{body|display|card|cn|mono}`, `text-{2xs|caption|xs..3xl}`, `leading-puru-{tight|normal|relaxed|loose}`

## Stack Notes Worth Remembering

- **Next.js 16.2.6** (Turbopack default) — AGENTS.md warns: "this is NOT the Next.js you know" — breaking changes vs prior versions, consult `node_modules/next/dist/docs/` before assuming APIs
- **React 19.2.4**
- **Tailwind 4** via `@tailwindcss/postcss` (no JS config; use `@theme` in CSS)
- **Pixi.js v8** vanilla (no @pixi/react) — instantiate inside useEffect with cleanup
- pnpm 10.x
