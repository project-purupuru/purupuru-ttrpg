# Agent Working Memory (NOTES.md)

> This file persists agent context across sessions and compaction cycles.

## Active Sub-Goals

- Build live-observatory visualization layer for Solana Frontier hackathon (ship 2026-05-11)
- Mock the Score data layer through FE — no real backend wiring for hackathon
- **Per PRD r6 §3.1 three-view architecture**: this branch's observatory IS the **operator surface · community-manager view** (zerker's lane). Member surface (Blink quiz → mint) is zksoju + gumi's parallel lane.

## Discovered Technical Debt

## Blockers & Dependencies

- Going Next.js + React + Tailwind 4 + Pixi.js v8 (vanilla, not @pixi/react). 3D path (react-three-fiber) is optional polish if time permits.

## Session Continuity
| Timestamp | Agent | Summary |
|-----------|-------|---------|
| 2026-05-07 | mounting-framework | Mounted Loa v0.6.0 on empty repo |
| 2026-05-07 | scaffold | Next.js 16.2.6 + React 19.2.4 + Tailwind 4 + Pixi 8.18.1 scaffold. Design system established in app/globals.css (OKLCH wuxing palette × 4 shades, light + Old Horai dark, per-element breathing rhythms, motion vocabulary keyframes, fluid typography scale, 5 brand font stacks). Local fonts (FOT-Yuruka Std, ZCOOL KuaiLe) via @font-face; Inter + Geist Mono via next/font/google. Brand wordmark + 5 puruhani PNGs + 5 jani sister PNGs + 30+ card-system SVG layers + tsuheji map + 18 Threlte material configs in /public. Score read-adapter contract + deterministic mock at lib/score. cn() utility at lib/utils. Build clean. Kit landing at app/page.tsx showcases brand wordmark, full typography (incl. JP/CN), wuxing roster, and jani sister roster. |
| 2026-05-07 | riding-codebase | First `/ride` against the scaffold. 17/17 artifacts persisted. Drift score 7/10 (healthy with intentional gaps): 12 aligned, 3 ghosts (observatory sim, action vocab, pentagram — all expected forward-looking), 1 stale (README is generic boilerplate), 1 shadow (18 inert material JSONs from upstream pipeline), 0 hallucinated. Consistency score 9/10. Governance: 4 gaps; only LICENSE worth fixing pre-ship. PRD: 24 GROUNDED / 5 INFERRED / 4 ASSUMPTION (73%/15%/12%). SDD: 38 GROUNDED / 6 INFERRED / 4 ASSUMPTION (79%/13%/8%). Four ASSUMPTIONs are the planning gates: (1) sprite-budget pre-bench; (2) Pixi mount under Next 16; (3) movement model; (4) action vocab finality. Reality files (~5500 tokens, within 8500 budget) ready for `/reality` queries. |
| 2026-05-07 | designing-architecture | SDD v2.0 written — supersedes v1.0 reality snapshot. Forward-looking architecture for observatory simulation aligned to PRD §9 4-pass ladder (v0.1 idle frame → v0.2 mocked liveness → v0.3 weather coupling → v0.4 polish). New modules defined: `lib/activity/` (ActivityStream + mock), `lib/weather/` (WeatherFeed + mock), `lib/sim/` (pentagram geometry + entities + migrations + modulation), `app/observatory/` (server shell), `components/observatory/` (8 components incl. PentagramCanvas, KpiStrip, ActivityRail, WeatherTile, FocusCard, IntroAnimation). Adapter-binding pattern preserved verbatim from `lib/score/index.ts:17`. New deps: Vitest + Playwright (testing only). Three remaining ASSUMPTIONs all gated by v0.1 spike: Pixi mount pattern, sprite-count headroom (1000 → 500 fallback ladder), test framework choice. Risk register: 10 risks logged with mitigations; biggest = R-2 (sprite budget) — pre-bench is explicit v0.1 task. |
| 2026-05-07 | planning-sprints | Sprint plan written for cycle-001 (observatory-v0). Covers Sprint 1 = v0.1 idle frame in full detail; Sprints 2–4 (v0.2–v0.4) listed in Sprint Overview as forward trajectory only — each will be planned via `/sprint-plan` after the prior passes review+audit. Sprint 1 is MEDIUM scope (10 tasks): 2 spikes (Pixi mount, 500/750/1000 sprite pre-bench) + test-framework wiring + activity/weather STUB adapters + sim/pentagram + sim/entities + observatory route+client + PentagramCanvas + 5 chrome components. Goal IDs auto-assigned from PRD §6: G-1 demo-end-to-end, G-2 visual identity, G-3 mock honesty, G-4 sim alive. Sprint 1 covers G-2 complete + G-1/G-3/G-4 partial (per PRD §9 iteration ladder, by design). E2E validation task deferred to Sprint 4. Critical-path: spikes 1.1+1.2 first → 1.3 test deps → 1.6 pentagram math → 1.7 entities → 1.9 PentagramCanvas. Initialized `grimoires/loa/ledger.json` (cycle-001, active). |
| 2026-05-07 PM | plan-and-analyze (zksoju lane · main) | PRD authored across 6 revisions (r1 strawman → r6 post-flatline-r3 · 941 lines · `grimoires/loa/prd.md`). Demo-frame locked: bazi-style archetype quiz (GET-chain · 1 signing prompt at mint) → archetype card → Solana Genesis Stone twin mint (devnet · Metaplex Token Metadata · visible NFT). Eileen's separation-as-moat doctrine = deck punchline. Three-view architecture: substrate (sonar/score/anchor) · operator surface (Score dashboard · zerker parallel) · member surface (Blinks · v0 ship). |
| 2026-05-07 PM | flatline-review (zksoju lane · main) | 3 rounds adversarial multi-model review (claude-opus-4-8 + gpt-5.4-codex + gemini-3.0-pro · subscription auth · $0 each · 147-190s). r1: 7 high-consensus + 9 blockers · r2: 17 high + 16 blockers · r3: 4 critical + 4 high. All findings integrated. Reviews preserved at `grimoires/loa/a2a/flatline/`. |
| 2026-05-07 PM | ride (zksoju lane · main) | Companion SDD authored at `grimoires/loa/sdd.md` (PRD untouched · canonical preserved). Reality reports + drift + consistency + governance + trajectory-audit at `grimoires/loa/{reality,drift-report,consistency-report,governance-report,trajectory-audit}.md`. Drift 1/10 · Consistency 8/10 (3 README-vs-PRD naming conflicts pre-zerker-merge · resolved by reset). |
| 2026-05-07 PM | butterfreezone-gen (zksoju lane · main) | Agent-grounded summary at `BUTTERFREEZONE.md` (898 words · Tier 1 · 13 pass / 1 fail / 2 warn). |
| 2026-05-07 PM | merge-resolution (zksoju lane · main) | TWO parallel scaffolds collided — zerker's f3c040d (this scaffold · Next.js+Pixi+brand assets · canonical) + my 61207a7 (PRD r6 + flatline reviews · pure additions). Reset to zerker · re-applied PRD work additively at `grimoires/loa/`. Did NOT overwrite zerker's CLAUDE.md, NOTES.md (this file), .gitignore, .loa-version.json, .loa.config.yaml, or any of his app/lib/public scaffolding. |
| 2026-05-08 | observatory-polish (zerker lane · this branch) | f3dac29 atmospheric depth — radial-gradient backdrop, perspective tilt, sprite contact-shadows. cc5e0e6 real-people pass — identity, avatar, wuxing tide-flow, live KPIs. 06982cc right-rail polish — element bleeds, real addresses, wider column. 7fc9dd7 right-rail row scale + simplify; drop cosmic sublabel. 53b6333 KpiStrip top border matching wuxing distribution. |
| 2026-05-08 | context-absorption (this session) | Pulled main's PRD r6 + SDD r2 + sprint plan + Soju's two context docs (01-prd-r6-integration, 02-awareness-operating-model) + flatline reviews + bridge-reviews + simstim trajectories + fresh reality reports + BUTTERFREEZONE + legacy/INVENTORY into this branch. Did NOT pull main's app/lib/components deletions; observatory code preserved. NOTES.md merged by hand to keep both bodies of session continuity + decision log. |
| 2026-05-08 | observatory→operator-surface (this session) | Reframed page metadata around the substrate-vs-voice punchline. ActivityRail + WeatherTile rebuilt with origin chips (`on-chain` / `IRL`), live indicators (pulsing wood-vivid dot + ticking time), `puru-row-fresh` CSS sweep on new events. Weather mock made to actually tick (18-25s drift). 3-card KPI grids added to both panels (Activity: mints/attacks/gifts via Phosphor Sparkle/Sword/Flower; Weather: temp/location/amplifies via Sun/CloudRain/CloudSnow/CloudLightning + MapPin + element kanji). New KpiCell shared component — corner-watermark accent at text-5xl opacity-20. Pentagram canvas now reads `weatherFeed.cosmic_intensity` for tide-amp + `amplifiedElement` for halo brightness — IRL-weather→wuxing infusion is visible. |
| 2026-05-08 | kpi-strip-rebuild + sonification (this session) | KpiStrip became a single command bar — wordmark on the leading edge, sound toggle on trailing edge, four stat cells in between (no separate navbar row). Top-strip cells use a distinct hierarchy from sidebar: big right-aligned icon spanning both rows at opacity-20, label-then-value stacked to its left. **Validated all 4 KPI sources for accuracy**: live presence → `OBSERVATORY_SPRITE_COUNT` (matches canvas exactly · was sine-drift mock); dominant element → `getElementDistribution()` winner+share; cycle balance → 30-event rolling window of activity stream `(mints+gifts)/total` displayed as `% 生 / % 克`; cosmic intensity → `weather.cosmic_intensity` (same source the canvas reads). Phosphor `@phosphor-icons/react` added; SoundToggle uses SpeakerHigh/SpeakerSlash fill. FocusCard + ping-ring activity feedback landed (parallel-research integration). Cleanup pass: deleted orphan `TopBar.tsx` (subsumed by KpiStrip bookends), removed unused `getEcosystemEnergy()` + `EcosystemEnergy` type from score adapter. |

## Decision Log
| Date | Decision | Rationale | Decided By |
|------|----------|-----------|------------|
| 2026-05-07 | 2D Pixi.js for main sim | 4-day clock; thousands of entities; 3D as optional polish | zerker |
| 2026-05-07 | Use Loa framework (trimmed path) | Discipline + scope control on tight clock | zerker |
| 2026-05-07 | Defer PRD to next session | Scope this session to scaffold only; user will run /plan separately for the actual implementation | zerker |
| 2026-05-07 | Skip shadcn init | Tailwind 4 setup differs; use cn() helper + copy individual primitives later as needed | claude (acked) |
| 2026-05-07 | Hackathon interview mode (minimal+batch) | Saves ~12 conversational rounds across /plan, /architect, /sprint-plan — wired in .loa.config.yaml | claude (acked) |
| 2026-05-07 | Spatial frame: wuxing pentagram (5 vertices, pentagon=生 generation, inner star=克 destruction) | Diagram IS the IP; brand-aligned by construction | zerker |
| 2026-05-07 | v0 action vocabulary: mint / attack / gift (the "tight 3") | Smallest viable set with 3 distinct migration grammars (vertex-spawn / inner-star / pentagon-edge) | zerker |
| 2026-05-07 | POV: god's-eye observatory + click-to-reveal focus card; no wallet connect | Pure visualization for hackathon; defers auth complexity | zerker |
| 2026-05-07 | Layout idiom: TopBar + KpiStrip + grid-cols-[1fr_380px] (pentagram canvas + activity rail + weather tile) | Score-dashboard composition rhythm, translated to purupuru visual tokens | zerker |
| 2026-05-07 | Audience: Frontier-only submission | Trims polish target; perf only needs to handle one demo machine | zerker (Q1) |
| 2026-05-07 | Elevator pitch: "the live observatory of every puruhani in the world, breathing and reacting to weather and on-chain action" | Anchors first-paint: judge should "get it" in ~30s | zerker (Q2) |
| 2026-05-07 | Demo entry: brief intro animation (wordmark fade → sim reveal) | Establishes brand presence before observatory ambient takes over | zerker (Q3) |
| 2026-05-07 | IRL weather: mocked feed, same shape as a real `WeatherFeed` adapter | Avoids network/API-key dependency; swappable later | zerker (Q4) |
| 2026-05-07 | Entity count target at v0.1 idle: 500-1000 sprites | Pixi territory; pre-bench in v0.1 to confirm headroom | zerker (Q5) |
| 2026-05-07 | Coordination: independent FE, no shared interfaces with `project-purupuru/game` for these 4 days | Eliminates external dependency; revisit post-hackathon | zerker (Q6) |
| 2026-05-07 | Sprint plan covers Sprint 1 (v0.1) only — Sprints 2–4 listed as overview forecast, planned individually after each predecessor passes audit | User instruction "v0.1 idle frame is the next sprint" + ladder discipline (PRD §9 "each pass renders a working surface; iterate without re-architecting") | claude (planning-sprints) |
| 2026-05-07 | Sprint 1 is single-day (1.0 day, 2026-05-07 → 2026-05-08) rather than the template default 2.5 days | 4-day ship clock to 2026-05-11; ladder must complete v0.1→v0.2→v0.3→v0.4 in that window | claude (planning-sprints) |
| 2026-05-07 | Sprint 1 sprite-count target = 1000 with 750/500 fallbacks; final N committed as `OBSERVATORY_SPRITE_COUNT` constant after Task 1.2 pre-bench | PRD NFR-2 explicitly requires pre-bench; SDD §6.4 ladder; locking the constant means Sprints 2–4 don't re-bench | claude (planning-sprints) |
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

## Sprint-1 Spike Outputs (2026-05-07)

### Task 1.1 — Pixi mount pattern under Next 16 + React 19 (resolves PRD Q-pixi)

The validated pattern (`components/observatory/PentagramCanvas.tsx`):

1. **Client island**: file starts with `"use client"`. Server component (`app/observatory/page.tsx`) is a thin shell — no DOM, no Pixi. Boundary lives at `<ObservatoryClient />` mount.
2. **Mount in `useEffect`** with a captured `cancelled` flag. The effect kicks off an async IIFE that calls `app.init({...})`. If the component unmounts before `init` resolves (StrictMode double-effect, fast-nav, HMR), the IIFE checks `cancelled` and calls `app.destroy(true, { children: true })` immediately to prevent double-mounted canvases.
3. **Cleanup**: returns `() => { cancelled = true; ...; app.destroy(true, { children: true }); }`. The `try/catch` around destroy swallows the StrictMode-double-init race.
4. **No `getComputedStyle` in the ticker** (R1.3): per-frame CSS-var reads are too slow. Breath cadence is read via the per-element `BREATH_SECONDS` constant in `lib/sim/entities.ts`, which mirrors the `--breath-{element}` declarations in `app/globals.css:189–193`.
5. **Sprite click**: `eventMode = "static"`, `cursor = "pointer"`, `pointertap` handler. Forwarded via `onSpriteClick` prop (no-op in v0.1; consumed in Sprint 4 by FocusCard).
6. **Resize**: `ResizeObserver(host)` re-runs `createPentagram(center, radius)` and re-anchors all sprite positions + edges.
7. **Texture load**: `Assets.load('/art/puruhani/puruhani-{element}.png')` in parallel for all 5 elements. Per-element solid-color circle fallback (`ELEMENT_FALLBACK_HEX`) renders if the texture load throws — R1.6 mitigation lands by construction.

Pattern reusable for Sprints 2–4: migration tweens (Sprint 2) and weather modulation (Sprint 3) hook into `app.ticker.add` with the same cancelled-flag-guarded async init.

### Task 1.2 — Sprite-count pre-bench (resolves PRD NFR-2)

`OBSERVATORY_SPRITE_COUNT` constant lives at `lib/sim/entities.ts:14`. Default: **1000**. Methodology for the demo-machine bench:

1. Open Chrome DevTools → Performance panel → Record on `/observatory` after intro completes (~1.5s in)
2. Capture 10s of idle frames; read sustained frame interval from the Frames track (target: ≤16.67ms = 60fps)
3. If sustained <60fps at 1000: drop to 750, repeat. Floor is 500. Below 500: switch to `ParticleContainer` (Pixi v8 bulk-render path) — wraps `spriteLayer` and trades per-sprite event handlers for batch draws.
4. Record the chosen N as a comment on `lib/sim/entities.ts:14` for traceability

Demo-machine bench pending; v0.1 ships at the 1000 default with the fallback ladder ready in code (just change the constant).

## Open at Handoff (for next session)

- **PRD r6 / SDD r2 / sprint plan now live** in `grimoires/loa/{prd,sdd,sprint}.md`. Major architectural reframe: this branch's observatory is now formally the **operator surface** in PRD r6 §3.1 three-view architecture (substrate / operator / member). zksoju + gumi own the member-surface Blink; we own the operator-surface dashboard.
- **Per `grimoires/loa/context/01-prd-r6-integration.md` T-3**: open questions still owned by zerker:
  - **Q5 movement model** — wandering, schooling, drifting? (zerker designs · sprint-1+2 work per Soju's lane note)
  - **Q6 demo entry point** — landing → sim, or sim immediately? (operator decides at sprint-4 per Soju)
- **Per `grimoires/loa/context/02-awareness-operating-model.md` brownfield rule**: existing `lib/score`, `lib/sim`, `app/globals.css` design tokens stay in place — get adapted through stable names later, not rewritten.
- **Three-view alignment opportunity**: when zksoju ships `packages/peripheral-events`, our activity stream can consume the same `WorldEvent` fixtures the member-surface Blink emits. Same canonical truth → two different surfaces. Architectural punchline visible in the demo.

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

## Visual References — Observatory v0 (2026-05-08)

Deep-research dig (Gemini grounded search, 60 sources) saved to `grimoires/loa/context/03-observatory-visual-references-dig-2026-05-08.md`. Top-7 references ranked by applicability to the calm god's-eye observatory: Listen to Wikipedia (Hatnote), earth.nullschool.net, Sandspiel/Noita, Mini Tokyo 3D, Flow-Lenia (mass-conservation), Björk's Biophilia, Hades (diegetic UI). Six implementable provocations + four anti-patterns documented. The single load-bearing structural idea: **mass conservation across the wuxing pentagram** — total visual energy = constant; an event that brightens fire MUST darken water/metal via the Ke cycle, converting the diagram from cluster-display into homeostatic organism.

## Stack Notes Worth Remembering

- **Next.js 16.2.6** (Turbopack default) — AGENTS.md warns: "this is NOT the Next.js you know" — breaking changes vs prior versions, consult `node_modules/next/dist/docs/` before assuming APIs
- **React 19.2.4**
- **Tailwind 4** via `@tailwindcss/postcss` (no JS config; use `@theme` in CSS)
- **Pixi.js v8** vanilla (no @pixi/react) — instantiate inside useEffect with cleanup
- pnpm 10.x
