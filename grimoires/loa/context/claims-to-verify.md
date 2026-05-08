# Claims to Verify (Phase 1 Output)

> Source: `grimoires/loa/context/00-hackathon-brief.md` + `CLAUDE.md` + `grimoires/loa/NOTES.md`.
> Interview was skipped — context files already capture the relevant decisions.
> Each claim is verified against code in Phase 4 (drift analysis).

## Architecture Claims

| # | Claim | Source | Verification Strategy |
|---|-------|--------|----------------------|
| A1 | Stack: Next.js 16.2.6 + React 19.2.4 + TS 5 + Tailwind 4 + pnpm | CLAUDE.md L13–17, brief L30 | Inspect `package.json` |
| A2 | Pixi.js v8 vanilla (no `@pixi/react`) is the sim engine | CLAUDE.md L18, brief L31 | Check `package.json` for `pixi.js` and absence of `@pixi/react` |
| A3 | Tailwind 4 wired via `@tailwindcss/postcss` | CLAUDE.md L16 | Inspect `package.json` devDeps + `postcss.config.mjs` |
| A4 | App Router (Next 16) | CLAUDE.md L13 | Confirm `app/` directory and absence of `pages/` |
| A5 | OKLCH wuxing palette × 4 shades, light + Old Horai dark | CLAUDE.md L26–27, brief L40 | Inspect `app/globals.css` |
| A6 | Per-element breathing rhythms (`--breath-fire: 4s`, etc.) | CLAUDE.md L28 | Inspect `app/globals.css` |
| A7 | 5 brand font stacks: body/display/card/cn/mono | CLAUDE.md L31, brief L43 | Inspect `app/globals.css` `@theme` block |
| A8 | Fluid typography scale `text-2xs..text-3xl` via clamp() | CLAUDE.md L32 | Inspect `app/globals.css` `@theme` block |
| A9 | motion (UI animation) and lucide-react (icons) installed | CLAUDE.md L19–20 | Check `package.json` |

## Domain Claims

| # | Claim | Source | Verification Strategy |
|---|-------|--------|----------------------|
| D1 | Five elements (wood/fire/earth/water/metal) are the core wuxing roster | CLAUDE.md L26, page.tsx L4–10 | Inspect `lib/score/types.ts` |
| D2 | Score backend is mocked; lib/score/ exposes the read contract | CLAUDE.md L40, brief L24 | Inspect `lib/score/{types,mock,index}.ts` |
| D3 | Wallet/auth is mocked (pure visualization) | CLAUDE.md L41 | Confirm no auth library in deps; no wallet integrations |
| D4 | On-chain actions surfaced via synthetic event stream | CLAUDE.md L42 | Search for any event-stream module (likely absent at scaffold) |
| D5 | IRL weather: TBD per CLAUDE.md table; mocked feed per NOTES.md L39 | CLAUDE.md L43, NOTES.md L39 | Search for weather module (expected absent) |
| D6 | 18 caretaker/jani/transcendence material configs in `/public` | NOTES.md L52 | List `public/data/materials/` |
| D7 | 5 puruhani PNGs + 5 jani PNGs | NOTES.md L48–49 | List `public/art/{puruhani,jani}` |
| D8 | Card-system layers: 4 frames × 4 rarities, 6 backgrounds, 14 behavioral states | brief L43 | List `public/art/cards/**` |

## Tribal Knowledge

| # | Claim | Source | Verification Strategy |
|---|-------|--------|----------------------|
| T1 | "This is NOT the Next.js you know" — Next 16 has breaking changes; consult `node_modules/next/dist/docs/` | AGENTS.md, NOTES.md L63 | Confirm AGENTS.md content; preserve verbatim in SDD warnings |
| T2 | Spatial frame: wuxing pentagram (5 vertices, pentagon=生 generation, inner star=克 destruction) | NOTES.md decision log 2026-05-07 | No code yet — flag as design intent |
| T3 | v0 action vocabulary: mint / attack / gift (the "tight 3") | NOTES.md decision log | No code yet — flag as design intent |
| T4 | POV: god's-eye observatory + click-to-reveal focus card; no wallet connect | NOTES.md decision log | No code yet — flag as design intent |
| T5 | Layout: TopBar + KpiStrip + grid-cols-[1fr_380px] (canvas + activity rail + weather tile) | NOTES.md decision log | No code yet — current page.tsx is design-system showcase, not the observatory |
| T6 | Entity count target at v0.1 idle: 500–1000 sprites | NOTES.md decision log | No code yet — performance budget for first sim sprint |
| T7 | Skipped shadcn init; use cn() helper + copy primitives later | NOTES.md decision log 2026-05-07 | Confirm no shadcn registry config; confirm `lib/utils.ts` cn() exists |

## Work in Progress / Open Gaps

| # | Claim | Source | Verification Strategy |
|---|-------|--------|----------------------|
| W1 | Movement model unanswered (wandering/schooling/drifting/teleporting; weather-reactive?) | brief L57, "Open gaps" #5 | Flag as architecture blocker |
| W2 | IRL weather source: real (Open-Meteo/NOAA) vs mocked still TBD at brief; resolved to mocked in NOTES.md decision log | brief L56 vs NOTES.md L39 | Note the decision-log resolution |
| W3 | Audience scope (Frontier-only vs public web) resolved: Frontier-only | NOTES.md decision log | — |
| W4 | Demo entry: brief intro animation (wordmark fade → sim reveal) — decided | NOTES.md decision log | — |

## Status

Most claims (A1–A9, D1–D8) are **directly verifiable against code**. The decision-log items (T2–T6, W1) are **forward-looking design intent** — code does not yet exist. Phase 4 drift analysis will mark them as Ghost (documented but not yet built) where appropriate.
