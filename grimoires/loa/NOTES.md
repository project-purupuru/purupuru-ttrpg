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
| 2026-05-07 PM | plan-and-analyze | PRD authored across 6 revisions (r1 strawman → r6 post-flatline-r3 · 941 lines · `grimoires/loa/prd.md`). Demo-frame locked: bazi-style archetype quiz (GET-chain · 1 signing prompt at mint) → archetype card → Solana Genesis Stone twin mint (devnet · Metaplex Token Metadata · visible NFT). Eileen's separation-as-moat doctrine = deck punchline. Three-view architecture: substrate (sonar/score/anchor) · operator surface (Score dashboard · zerker parallel) · member surface (Blinks · v0 ship). |
| 2026-05-07 PM | flatline-review (r1+r2+r3) | 3 rounds adversarial multi-model review (claude-opus-4-8 + gpt-5.4-codex + gemini-3.0-pro · subscription auth · $0 each · 147-190s). r1: 7 high-consensus + 9 blockers · r2: 17 high + 16 blockers · r3: 4 critical + 4 high. All findings integrated. Reviews preserved at `grimoires/loa/a2a/flatline/`. |
| 2026-05-07 PM | ride | Companion SDD authored at `grimoires/loa/sdd.md` (PRD untouched · canonical preserved). Reality reports + drift + consistency + governance + trajectory-audit at `grimoires/loa/{reality,drift-report,consistency-report,governance-report,trajectory-audit}.md`. Drift 1/10 · Consistency 8/10 (3 README-vs-PRD naming conflicts pre-zerker-merge · resolved by reset). |
| 2026-05-07 PM | butterfreezone-gen | Agent-grounded summary at `BUTTERFREEZONE.md` (898 words · Tier 1 · 13 pass / 1 fail / 2 warn). |
| 2026-05-07 PM | merge-resolution | TWO parallel scaffolds collided — zerker's f3c040d (this scaffold · Next.js+Pixi+brand assets · canonical) + my 61207a7 (PRD r6 + flatline reviews · pure additions). Reset to zerker · re-applied PRD work additively at `grimoires/loa/`. Did NOT overwrite zerker's CLAUDE.md, NOTES.md (this file), .gitignore, .loa-version.json, .loa.config.yaml, or any of his app/lib/public scaffolding. |

## Decision Log
| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| 2026-05-07 | 2D Pixi.js for main sim | 4-day clock; thousands of entities; 3D as optional polish | zerker |
| 2026-05-07 | Use Loa framework (trimmed path) | Discipline + scope control on tight clock | zerker |
| 2026-05-07 | Defer PRD to next session | Scope this session to scaffold only; user will run /plan separately for the actual implementation | zerker |
| 2026-05-07 | Skip shadcn init | Tailwind 4 setup differs; use cn() helper + copy individual primitives later as needed | claude (acked) |
| 2026-05-07 | Hackathon interview mode (minimal+batch) | Saves ~12 conversational rounds across /plan, /architect, /sprint-plan — wired in .loa.config.yaml | claude (acked) |
| 2026-05-07 PM | T1 NFT shape: Metaplex Token Metadata (visible) | Stone is on-chain artifact users SEE in Phantom collectibles; PDA-only loses "visible NFT" demo claim; cNFT adds Bubblegum complexity on 4d clock | operator |
| 2026-05-07 PM | T2 MVD spine-first model | flatline r1+r2+r3 critical finding (900-930 across rounds): trigger-tree fired too late; spine-first gates stretch goals on day-1 spine running end-to-end | operator + flatline |
| 2026-05-07 PM | T3 quiz chain via GET (not POST) | Solana Actions spec: POSTs require wallet signing; GETs don't. 5-step quiz via GET-chain = 1 signing prompt total (at final mint) instead of 6 | spec-resolved |
| 2026-05-07 PM | D-3 anchor program devnet locked v0 | Mainnet-beta unaudited on 4d clock = unacceptable risk per flatline r1 SKP-003 (820); deferred post-audit | operator + eileen + flatline |
| 2026-05-07 PM | D-12 anchor upgrade authority frozen post-deploy | flatline r2 SKP-005 (720): mutable upgrade auth during public hackathon = griefing/credential-theft risk; freeze (`set_authority(None)`) post-deploy | operator + flatline |
| 2026-05-07 PM | Sponsored payer pattern (gasless witness) | Eileen §6.1 honored; backend keypair pays PDA rent; users see zero cost | operator (eileen ratified) |
| 2026-05-07 PM | ed25519 verification via Solana instructions sysvar pattern | flatline r3 SKP-002 (890): in-program signature verification not supported on Solana; must use Ed25519Program prior instruction + sysvar read | spec-correct fix |
| 2026-05-07 PM | Drop wallet-age sybil check | flatline r3 SKP-001 (850): `getSignaturesForAddress` too slow for Action timeout; rely on IP rate limit + getBalance ≥0.01 SOL | flatline-fix |
| 2026-05-07 PM | Quiz state HMAC-SHA256 (proper construction) | flatline r3 SKP-001 (900): raw `sha256(secret \|\| ...)` is length-extension vulnerable; replaced with `HMAC-SHA256(secret, canonicalEncode(...))` | flatline-fix |
| 2026-05-07 PM | Tiered sponsored-payer alerts (5/2/1 SOL) | flatline r3 SKP-005 (720): single threshold = 0-warning outage; tiered (warn/page/halt) + day-of-demo top-up + halt-disable env flag | flatline-fix |
| 2026-05-07 PM | Score dashboard moves to zerker's parallel lane | We provide event schema · zerker ships dashboard via Score API/CLI/MCP. Tightens our scope; preserves Score sovereignty. Indexer integration post-anchor-deploy | operator |
| 2026-05-07 PM | Gumi authors quiz (parallel, non-blocking) | 5 resonant questions + 4 answers + 5 archetype reveals. Placeholders ready if she's blocked. Not birthday/gender — must feel familiar | operator (gumi ratified) |
| 2026-05-07 PM | Monetization = sponsored awareness slots | Frontier required artifact; brands/community-ops pay for surface layer; we are infrastructure FOR them; platform/medium agnostic | operator |
| 2026-05-07 PM | Deck punchline = separation-as-moat | Eileen's design: substrate (truth) ≠ presentation (voice); agents present, never mutate state; hallucinations become cosmetic, not financial | operator (eileen ratified) |

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
