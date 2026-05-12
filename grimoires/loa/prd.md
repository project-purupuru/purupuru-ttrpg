---
status: flatline-integrated-r1
type: prd
cycle: card-game-in-compass-2026-05-12
mode: migrate + arch
branch: feat/honeycomb-battle
predecessor_cycle: substrate-agentic-translation-adoption-2026-05-12 (shipped 2026-05-12 · archived to grimoires/loa/archive/)
input_brief: grimoires/loa/context/14-card-game-in-compass-brief.md
flatline_review: grimoires/loa/a2a/flatline/card-game-prd-opus-manual-2026-05-12.json (Opus review + skeptic · scoring-engine bypass per #759 + 1.157.0 regression)
created: 2026-05-12
revision: r1 · post-flatline · 2 CRITICAL + 5 HIGH findings integrated · MEDIUM/LOW deferred to SDD
operator: zksoju
authored_by: /plan-and-analyze (Opus 4.7 1M)
---

# PRD · Card Game in Compass · Honeycomb Surface Migration

> **r1 · post-flatline integration** (2026-05-12). 2 CRITICAL + 5 HIGH findings from Opus review + skeptic folded in: D9 (S0 calibration spike), D10 (asset extraction deferred to S6), D11 (AI = parameterized policy not LLM), AC-4 strengthened to ALL invariants, AC-5 reformulated as falsifiable behavioral fingerprint, AC-14 LOC recalibrated to +7,500, new AC-15/16/17 for perf/a11y/playability, R11/R12 added, sprint graph reordered with de-scope ladder. Flatline scoring engine had to be bypassed manually due to 1.157.0 regression (#759 + cost-map gap) — both reported via /feedback.

## 0 · TL;DR

Migrate the full card-game experience from `world-purupuru/sites/world/src/routes/(immersive)/battle/` (SvelteKit) into `compass/app/battle/` (Next.js · React). Ship a visible, playable, solo-vs-AI Wuxing card game with the world-purupuru visual vocabulary and the Honeycomb substrate (already in compass) underneath. Surface eleven components, wire the end-to-end flow (Enter The Tide → ElementQuiz → BattleField + Hand + Opponent + TurnClock + ArenaSpeakers → Result), grow Honeycomb to host clash resolution and the per-element AI opponent, relocate the kaironic tuning surface behind a backtick (`` ` ``) hotkey toggle, and extract the asset library to a new dedicated repo (`project-purupuru/purupuru-assets`) that both compass and world-purupuru pull from.

**Done bar** (operator-ratified): full audit-passing slice. `/implement → /review-sprint → /audit-sprint` green on every sprint. End-to-end playable solo battle in compass.

**Out of scope this cycle**: Three.js viewport (R3F · queued for next cycle), friend-duel networking, real Five Oracles (TREMOR/CORONA/BREATH), daemon NFT (Puruhani TBA) mint integration, on-chain combat moves.

## 0.5 · Pre-decided architecture choices (operator-ratified during discovery)

These are PRD-level commitments. SDD elaborates HOW; SDD does not re-open WHAT.

| ID | Decision | Source | Rationale |
|---|---|---|---|
| **D1** · Honeycomb growth | Clash resolution + AI opponent become new ports/services under `lib/honeycomb/` (e.g., `clash.{port,live}.ts`, `opponent.{port,live}.ts`). Same single Effect.provide site at `lib/runtime/runtime.ts`. | discovery Q4 answer · operator chose "Grow Honeycomb (Recommended)" | Coherent story; the Honeycomb substrate doctrine the operator ratified yesterday ("Honeycomb substrate · effect-substrate") absorbs the new systems. Memory entry: [[honeycomb-substrate]]. |
| **D2** · Asset library extraction | Extract world-purupuru's `public/art/`, `public/brand/`, `public/fonts/`, `public/data/materials/` (and related visual assets) into a new repo `project-purupuru/purupuru-assets`. Both compass and world-purupuru sync via a per-version tarball release + `scripts/sync-assets.sh`. NOT a git submodule. | discovery Q1 answer · operator: "I don't really want to do a git submodule, but just maybe a repo to point towards for assets would make sense" · "we have a separate CLI that actually is able to reach into the asset library" | "no or very little duplication of efforts especially around assets/state logic." Future-extends to a CLI (sky-eyes-style "world viewer") that lets agents peek into the library. |
| **D3** · Dev panel hotkey | The kaironic tuning surface (and future tweakpane / DialKit / shader inspectors) is hidden by default and toggled with backtick (`` ` ``). Quake-console mental model — closer to game-dev tuning than web-app DevTools. | discovery Q2 answer · operator: "Hotkey toggle (Recommended)" · confirmation: "backtick is okay" | Operator memory [[dev-tuning-separation]] · kaironic panel must NOT sit in the game flow. |
| **D4** · Entry screen shape | "Enter The Tide" splash gate on `/battle` — atmospheric, lore-grounded, Tsuheji-map background, single CTA button into the match. NOT wallet auth. Wallet stays mocked per prior cycle's PRD §0 stance. | discovery Q3 answer + confirmation: "There was some sort of 'enter the tide' type of screen that was the button that was on the battle page, and it had a map in the background and it said 'A pro pro the game'" (= "Purupuru: the game") | One-screen onboarding · matches world-purupuru's existing `EntryScreen.svelte` shape |
| **D5** · Three.js deferred | This cycle ships visual parity with world-purupuru in **2D** (asset migration + motion vocab from `puru-curves` + tilt + frame art). R3F / shaders go in a follow-up cycle (`card-game-3d-202X`). | discovery Q5 confirmation: operator wants to "progress towards Next.js" but accepted Three.js out of THIS cycle | Cycle budget · 11-component port + clash + AI + asset extraction is already substantial. R3F mid-stream would compound rework risk. |
| **D6** · AI opponent personality | AI elemental personality maps 1:1 to element archetype: Fire = aggressive, Water = adaptive, Metal = analytic/optimizing, Wood = patient, Earth = entrenched. Hand selection + arrangement honors the personality. | discovery [ASSUMPTION] confirmed during gate · referenced from purupuru-game `progression.ts` + world-purupuru `state.svelte.ts` (Session 75 Gumi alignment, per `14-card-game-in-compass-brief.md:30`) | Matches existing canon · agents-as-players doctrine ("A Fire Puruhani plays recklessly. An Earth Puruhani hoards.") |
| **D7** · Cycle shape | Single multi-sprint cycle (5–8 sprints) on `feat/honeycomb-battle` branch. Full Loa workflow gates: PRD → SDD → sprint-plan → per-sprint `/implement → /review-sprint → /audit-sprint`. Do not merge to `main` until cycle COMPLETED marker on all sprints. | discovery Q3 (cycle size) answer · operator: "Single multi-sprint cycle (Recommended)" | Predecessor cycle is shipped; this branch isolates the migration from hackathon-live main · operator confirmed working on a branch is correct |
| **D8** · Cycle scope · Surface + clash + AI | Includes all 11 world-purupuru `(immersive)/battle/` components, the full game flow, and a working solo-vs-AI battle to completion. Excludes Three.js viewport (D5), friend duels, on-chain. | discovery Q1 (scope breadth) answer · operator chose "Surface + clash + AI opponent" | "We can play solo and then we can fold in the actual user part of it, inviting your friends after." Friend duels become a successor cycle. |
| **D9** · S0 calibration spike (flatline-r1) | Before committing to the 8-sprint plan, spike ONE complex component — BattleField with drag-reorder OR BattleHand — in S0. Outcome calibrates: (a) Svelte→React translation cost per component, (b) realistic LOC budget. If spike exceeds 2 working days OR LOC projection >7,500 in compass, recalibrate plan before S1 starts. | flatline SKP-001 (850) + SKP-005 (700) | "Svelte 5 runes ($state, $derived, $effect) have fine-grained reactivity with implicit dependency tracking. React 19 requires explicit useMemo/useEffect... some Svelte idioms (two-way binding, store auto-subscribe, $effect cleanup semantics) have NO clean React equivalent." LOC budget for substrate cycle was wrong; this cycle is 5× larger. |
| **D10** · Asset extraction deferred to S6 (flatline-r1) | Asset repo extraction moves from S1 → S6 (visual binding sprint). S1-S5 work against existing compass `public/art/` duplication. Cross-repo world-purupuru sync (originally AC-9) demoted from blocking to stretch goal. At S6, extract repo + wire compass sync + verify integrity; world-purupuru migration becomes a follow-up cycle. | flatline SKP-002 (820) + IMP-003 + SKP-007 (650) | Asset repo as S1-blocking creates hard cross-repo dependency during hackathon-live. SvelteKit/Next-shared assets are a real coordination cost. Defer until after component shells prove the surface works against local copies. Reduces blast radius of asset-pipeline failure. |
| **D11** · AI opponent algorithm = parameterized policy (flatline-r1) | Resolves Q-SDD-1 at PRD altitude. AI implementation: hand-coded per-element decision policies with element-specific coefficients (NOT decision tree per-se · NOT LLM-backed). Preserves seed determinism per §6.4. Replayable offline. No network dependency. AC-5 replaced with falsifiable behavioral fingerprint per element. | flatline IMP-001 (HIGH 0.9 conf) + SKP-003 (750) | "LLM-backed AI breaks seed determinism (FR-24, AC-12)" · "AC-5... is trivially gameable (add random noise) without delivering the actual goal: distinguishable, fun, element-true play." Behavioral fingerprint is operator-acceptance-friendly. |

## 1 · Problem

### 1.1 · Surface symptom

The substrate-agentic cycle shipped yesterday (2026-05-12) successfully — Honeycomb (effect-substrate) doctrine is adopted in compass, four-folder discipline is in place, the runtime has a single Effect.provide site. Mid-session, the operator surfaced a scope expansion: the v1 `/battle` surface I scaffolded was just a phase machine (idle → select → arrange → preview → committed) with a kaironic side-panel **interfering with the game flow**, *not* the actual card game.

Per operator (this session):

> "I see it pulled, but I think the actual game itself was on the battle route of the other app. I feel like we should port that over, and the Kaironic time sliders should not be interfering with the actual game."

The shipped scaffold proves the substrate; it does not provide the *game experience* that already exists in `world-purupuru`. The operator wants a playable, visible Wuxing card game in compass — and a clean component boundary between the game surface and operator-tuning tools.

### 1.2 · Root problem

Compass and world-purupuru are split repos. The card-game experience is in world-purupuru (SvelteKit). Compass shipped substrate but not surface. The bridge requires:

1. **Surface migration** — 11 SvelteKit components translated to React (NOT linked; SvelteKit ≠ Next.js).
2. **Substrate expansion** — Honeycomb grows to host clash resolution + AI opponent (currently substrate covers only the phase machine).
3. **Asset deduplication** — both repos currently carry separate copies of card art, fonts, materials. The operator wants this consolidated into a third party (a new `purupuru-assets` repo) that both pull from. Operator decree:

> "There should be NO or very little duplication of efforts especially around assets/state logic."

4. **Surface/tooling separation** — the kaironic dev panel was placed in the game flow in the v1 scaffold; it needs to live behind a hotkey, invisible during play.

### 1.3 · Strategic context

The operator's mental model (saved to memory as [[purupuru-world-org-shape]]): world-purupuru is the **Rosenzu meta-world**; compass, purupuru-game, purupuru are **zone-experiences within that world**. The card game is one such experience. The Honeycomb substrate is the connective tissue across zones. The asset library extraction is a step toward the operator's longer arc: *"world repo should have been a monorepo that contains all of our apps. For the sake of the hackathon, we wanted it separate, so let's work with me on this."* Extracting assets to a shared repo is the cheapest near-term move toward that monorepo end-state.

## 2 · Goals

### 2.1 · Primary goals

- **G1 · Visible playable solo** — operator (or any user) can open `/battle` in compass, see the Enter-The-Tide screen, walk through ElementQuiz (first-time-only flow), play a full Wuxing match against a per-element AI opponent, see the ResultScreen, and start over. End-to-end loop closes. *(traces to discovery Q2 done-bar + Q1 scope)*
- **G2 · Surface parity with world-purupuru** — all 11 components from `world-purupuru/sites/world/src/lib/battle/` and `(immersive)/battle/+page.svelte` are present in compass as React components: EntryScreen, ElementQuiz, BattleField, BattleHand, CardPetal, OpponentZone, TurnClock, ArenaSpeakers, HelpCarousel, Tutorial, ResultScreen. Visual parity ships in 2D (D5). *(traces to user message + brief §1.7-11)*
- **G3 · Honeycomb grown** — clash resolution + AI opponent live under `lib/honeycomb/` as new typed services (`clash.port.ts/live.ts`, `opponent.port.ts/live.ts`). All wired through the existing single `lib/runtime/runtime.ts` provide site. The substrate doctrine the operator named "Honeycomb" yesterday remains the single architectural pattern. *(D1)*
- **G4 · Asset library extracted** — a new repo `project-purupuru/purupuru-assets` is created, populated with the visual asset set from world-purupuru, and both compass and world-purupuru pull via a per-version sync (NOT submodule, NOT runtime CDN). *(D2)*
- **G5 · Dev/game separation** — kaironic + future tweakpane / DialKit / shader-inspector surfaces are reachable via backtick (`` ` ``) hotkey, NOT visible during default play. Dev components live under `app/battle/_inspect/`, game components under `app/battle/_scene/`. *(D3 · [[dev-tuning-separation]])*
- **G6 · Full audit-passing slice** — every sprint clears `/implement → /review-sprint → /audit-sprint`. The cycle COMPLETED marker requires green on all gates. *(discovery Q2 done-bar · operator: "Full audit-passing slice (Loa quality bar)")*

### 2.2 · Secondary goals

- **G7 · Whisper determinism** — the Persona/Futaba caretaker whisper picks become seed-deterministic (currently they use `Math.random` for index selection — flagged in `14-card-game-in-compass-brief.md` §7 hand-off note).
- **G8 · Test parity** — purupuru-game's 204 tests inform a comparable suite in compass. Not 1:1 fixture-shared (the data shapes differ), but every invariant in `purupuru-game/prototype/INVARIANTS.md` has a corresponding compass test.
- **G9 · Documentation trail** — a UI/UX migration note at `grimoires/loa/notes/world-purupuru-component-map.md` listing each ported component with `(svelte source path → react destination path · semantic deltas)` so anyone reading next cycle understands what was translated.
- **G10 · Asset CLI groundwork** — design (do not implement) the surface for a future asset-library CLI that lets agents query/extract assets by tag. Operator-flagged as nice-to-have but documents the long arc.

### 2.3 · Non-goals (explicit cuts)

- ❌ **NO** Three.js / R3F viewport this cycle (D5 · next cycle)
- ❌ **NO** friend-duel / asynchronous PvP networking (queued for after solo lands)
- ❌ **NO** real Five Oracles (TREMOR · CORONA · BREATH). The daily-element function stays mocked.
- ❌ **NO** daemon NFT / Puruhani TBA mint integration. Wallet stays mocked.
- ❌ **NO** on-chain combat moves. Battle state is in-memory only.
- ❌ **NO** mobile-first polish pass. Compass is desktop-first; mobile is a successor cycle.
- ❌ **NO** asset CLI implementation (only design surface · G10)
- ❌ **NO** soul-stage agent autonomy ("your Puruhani plays while you sleep")
- ❌ **NO** re-doing the substrate. Honeycomb stays as the architectural pattern — this cycle EXTENDS it, doesn't reinvent.
- ❌ **NO** changes to the Solana anchor program, the quiz Blink, or the observatory route. Those stay as shipped by predecessor cycles.

## 3 · Acceptance metrics

Every metric is independently verifiable. SDD will name the test fixture and review-sprint check for each.

| ID | Metric | Verification |
|---|---|---|
| AC-1 | `/battle` renders the Enter-The-Tide screen by default (no wallet required) | `curl -sf http://localhost:3000/battle` returns HTML containing the EntryScreen-specific copy; manual visual check |
| AC-2 | First-time visit triggers ElementQuiz; subsequent visits skip directly to EntryScreen | E2E test via Playwright + localStorage state inspection |
| AC-3 | Operator can complete a full solo match: Enter → arrange 5 → lock-in → watch clashes → see ResultScreen → restart | E2E test asserting all five phase transitions fire BattleEvent emissions in order |
| AC-4 *(r1 strengthened)* | ALL clash resolution invariants from `~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md` are present as tests and pass: lineup rules (count=5, max-1-transcendence) · pack rules (no transcendence from packs) · burn rules (complete-set-required, removed-on-burn, resonance-level-up) · battle rules (clashes=min, someone-dies, numbers-tiebreaker, R3-immune-to-tiebreaker, Metal-precise-doubles-largest, all-conditions-operative, Forge-auto-counter, Void-mirror, Garden-grace) · difficulty rules (clamps, daily-reset) · type-power hierarchy (transcendence>jani>caretaker_b>caretaker_a) | Per-invariant test enumerated in SDD §test-plan |
| AC-5 *(r1 reformulated · behavioral fingerprint)* | AI opponent personality is element-distinct AND falsifiable per element. Fire AI: ≥70% of openings include front-row aggression (pos-1 jani OR pos-1 same-element setup-strike). Earth AI: average lineup variance below population mean (entrenched, repeating shapes). Wood AI: ≥60% of arrangements use caretaker→jani late-row sequences (patient build). Metal AI: optimizes single-largest-clash position (Precise condition synergy) in ≥80% of arrangements. Water AI: re-arranges between rounds at ≥2× the frequency of any other element AI. | Test fixture: 50 matches per element-AI vs deterministic player lineup + seed sweep; per-element fingerprint metrics extracted and asserted |
| AC-6 | Kaironic dev panel is invisible on default render; backtick toggles visible state | E2E test: load page, screenshot, assert no panel pixels; press backtick, screenshot, assert panel pixels present |
| AC-7 | Asset library at `project-purupuru/purupuru-assets` is populated with full art set | Repo exists, `package.json` (or asset manifest) lists ≥18 cards × 4 rarity tiers + 5 element-effects + frame art + 5 puruhani sprites + 5 jani sprites |
| AC-8 | Compass `public/art/` is synced from the asset repo, with `scripts/sync-assets.sh` recreating the current state from the asset repo's current release tag | Run sync against a clean `public/art/`; diff matches what was committed |
| AC-9 | World-purupuru is also updated to pull from the asset repo (cross-repo coordination) | Operator-confirmed via world-purupuru git log; no asset-file duplication between the two repos for the migrated set |
| AC-10 | `lib/honeycomb/clash.{port,live,mock}.ts` and `lib/honeycomb/opponent.{port,live,mock}.ts` exist · wired into AppLayer at `lib/runtime/runtime.ts` · 0 type errors · test files green | `pnpm tsc --noEmit` + `pnpm vitest run lib/honeycomb` |
| AC-11 | Per-sprint COMPLETED markers exist | `grimoires/loa/cycles/card-game-in-compass-2026-05-12/sprint-*-COMPLETED.md` per sprint |
| AC-12 | Whisper index selection is seed-deterministic | Replay test: same seed + same phase transition → same whisper line (no `Math.random` calls in whisper pick path) |
| AC-13 | Component map note exists at `grimoires/loa/notes/world-purupuru-component-map.md` | File exists with 11 component entries; each entry has source path, dest path, semantic-delta one-liner |
| AC-14 *(r1 recalibrated post-flatline)* | Net LOC budget (excluding asset migration counted separately): ≤ **+7,500** in compass repo (was +3,500 · raised per SKP-005 + S0-spike calibration in D9) · ≤ +400 in world-purupuru repo (deferred to follow-up cycle per D10) · new asset repo: separate accounting · per-sprint sub-budgets named in SDD | Manual LOC tally at each sprint close · cycle-total at S6 close |
| AC-15 *(r1 new · perf via Lighthouse)* | Lighthouse run on /battle route in CI returns Performance ≥80, LCP <2.5s, INP <200ms, CLS <0.1 | CI step or Playwright + Lighthouse, asserted at /audit-sprint |
| AC-16 *(r1 new · a11y via axe-core)* | Playwright + axe-core run on /battle returns 0 WCAG 2.1 AA violations across all phases (Entry, Quiz, BattleField, Result) | CI step, asserted at /audit-sprint |
| AC-17 *(r1 new · playability checklist)* | Test plan `grimoires/loa/tests/playability-checklist.md` enumerates ≥12 play-loop checks and all pass: no console errors during full match · animations complete without jank · error boundary catches catastrophic state · mid-match refresh handled (resume or restart) · all 5 element-AIs played to completion at least once · rapid-input doesn't desync state · ResultScreen renders for win/lose/draw · ElementQuiz persists in localStorage · Tutorial fires for first-time + re-triggerable from settings · HelpCarousel dismissible + persists dismissed state · screen-reader announces phase transitions · keyboard-only completion of full match flow | Manual + automated Playwright run · gated at /audit-sprint of final sprint |

## 4 · Users & stakeholders

**Primary user (this cycle)**: the operator (zksoju). Cycle-bounded; player audience expands post-cycle.

**Secondary stakeholders**:
- **Gumi** — lore + art authority. Caretaker whispers (already ported), card visual fidelity (this cycle), asset library tagging conventions (G10 design surface). Should be informed at S1 (asset repo setup) and S5 (tutorial component) — non-blocking, async per `world-purupuru/CLAUDE.md` collaboration protocol.
- **Zerker** — Score API + Compass observatory parallel lane (per substrate-cycle PRD §0.7). No direct dependency in this cycle; their observatory route stays untouched.
- **Lily** — APAC GTM. Pre-launch awareness; no scope intersection this cycle.
- **Eileen** — daemon-NFT-as-spine doctrine author. Not in scope this cycle (D8 excludes daemon integration); reference only.
- **Future players** — surfaces designed to be onboarding-friendly (ElementQuiz, Tutorial, HelpCarousel) even though this cycle's user is the operator. Tutorial polish is in AC; ElementQuiz / HelpCarousel correctness is in AC.

## 5 · Functional requirements

### 5.1 · Component migration (11 surfaces · 1:1 source mapping)

For each component, the SDD will spec the React translation. PRD records FR per surface. Source path is from `world-purupuru/sites/world/src/lib/battle/` (or `(immersive)/battle/` for the page-level routing).

| FR ID | Component | Source (world-purupuru) | Compass destination | Required behavior (PRD altitude) |
|---|---|---|---|---|
| FR-1 | **EntryScreen** | `lib/battle/EntryScreen.svelte` | `app/battle/_scene/EntryScreen.tsx` | Atmospheric splash · Tsuheji map background · "Enter the Tide" CTA button · routes to ElementQuiz (first time) OR direct match (returning) (D4) |
| FR-2 | **ElementQuiz** | `lib/battle/ElementQuiz.svelte` | `app/battle/_scene/ElementQuiz.tsx` | First-time-only flow · 5 atmospheric questions to determine player's home element · result persists in `localStorage.compass.element` · flows into match |
| FR-3 | **BattleField** | `lib/battle/BattleField.svelte` | `app/battle/_scene/BattleField.tsx` | The arena · territory centers per element (from existing `wuxing.ts` TERRITORY_CENTERS or new constants) · visual zone where clashes resolve · 2D for this cycle (D5) |
| FR-4 | **BattleHand** | `lib/battle/BattleHand.svelte` | `app/battle/_scene/BattleHand.tsx` | Player's 5-card lineup tray · drag-to-reorder · already partially shipped as `LineupTray.tsx`; this FR is the port-and-evolve to BattleHand semantics |
| FR-5 | **CardPetal** | `lib/battle/CardPetal.svelte` | `app/battle/_scene/CardPetal.tsx` | Individual card view · holographic-tilt on hover · element-driven art layers · uses asset library (D2) for art |
| FR-6 | **OpponentZone** | `lib/battle/OpponentZone.svelte` | `app/battle/_scene/OpponentZone.tsx` | Opponent's lineup (face-down until clash) · element indicator · AI personality cue (subtle) |
| FR-7 | **TurnClock** | `lib/battle/TurnClock.svelte` | `app/battle/_scene/TurnClock.tsx` | Visual indicator of clash beat · driven by Honeycomb timing-budget weighted by kaironic weights (already in `lib/honeycomb/curves.ts`) |
| FR-8 | **ArenaSpeakers** | `lib/battle/ArenaSpeakers.svelte` | `app/battle/_scene/ArenaSpeakers.tsx` | Caretaker voice surface · already partially shipped as `WhisperBubble.tsx`; this FR is the port-and-evolve to the world-purupuru spatial-speakers shape |
| FR-9 | **HelpCarousel** | `lib/battle/HelpCarousel.svelte` | `app/battle/_scene/HelpCarousel.tsx` | Onboarding help · swipeable hint panels for first-time visitors · skippable |
| FR-10 | **Tutorial** | `lib/battle/Tutorial.svelte` | `app/battle/_scene/Tutorial.tsx` | Tactical tutorial overlay · teaches Shēng chain + Setup Strike + clash resolution through showing, not telling · plays once, skippable, replayable from settings |
| FR-11 | **ResultScreen** | `lib/battle/ResultScreen.svelte` | `app/battle/_scene/ResultScreen.tsx` | End-of-match · "The tide favored X" copy (NOT "Victory"/"Defeat" per game-design canon) · breakdown of winning clashes · CTA to restart |

### 5.2 · Honeycomb substrate growth (3 new ports)

| FR ID | Service | Files | Required behavior |
|---|---|---|---|
| FR-12 | **Clash** | `lib/honeycomb/clash.{port,live,mock}.ts` + `__tests__/clash.test.ts` | Pure clash resolution per `purupuru-game/prototype/src/lib/game/battle.ts` semantics. Round-based attrition · clashes simultaneous · 敗 stamp · numbers-advantage tiebreaker · conditions applied (Wood Growing · Fire Volatile · Earth Steady · Metal Precise · Water Tidal). Replayable from seed. |
| FR-13 | **Opponent** | `lib/honeycomb/opponent.{port,live,mock}.ts` + `__tests__/opponent.test.ts` | Per-element AI: hand-selection algorithm + arrangement algorithm bound by element archetype (D6). Reads from Battle service's collection state; emits `OpponentCommand` events. |
| FR-14 | **Match** | `lib/honeycomb/match.{port,live,mock}.ts` + extension of `battle.live.ts` | Orchestrator above Battle phase machine — drives match lifecycle (Entry → Quiz check → Match → Result). Tracks per-match state (rounds played, eliminations, winner). New phases added to `BattlePhase`: `clashing` · `disintegrating` · `result`. |

### 5.3 · Asset library extraction (new repo · deferred to S6 per D10)

| FR ID | Requirement | Verification |
|---|---|---|
| FR-15 | New repo `project-purupuru/purupuru-assets` created with: `public/art/cards/*` · `public/art/element-effects/*` · `public/art/puruhani/*` · `public/art/jani/*` · `public/art/bears/*` · `public/art/patterns/*` · `public/data/materials/*` · `public/fonts/*` · `public/brand/*` · **created at S6, not S1** | Repo exists; AC-7 manifest check |
| FR-16 | `scripts/sync-assets.sh` in compass pulls tagged asset release (per-tag tarball with sha256 manifest) into `public/art/`, `public/data/materials/`, `public/fonts/`, `public/brand/`. Compass declares pinned version in `.assets-version` file at repo root. Sync verifies sha256 before extraction. | AC-8 sync recreates committed state |
| FR-17 *(r1 demoted · stretch goal)* | World-purupuru sync wiring is a **stretch goal** this cycle (was AC-9 blocking · demoted per D10 + SKP-007). If S6 completes early, attempt; otherwise schedule as follow-up cycle. | Stretch: operator-confirmed in world-purupuru git log; non-blocking |
| FR-18 | `purupuru-assets/README.md` documents the version-tag-and-release flow and the long-arc design for the future asset CLI (G10 · agent-friendly query surface) | README exists; covers tagging convention and CLI design surface |
| FR-19 | Asset naming/labeling improvement is **out of scope this cycle** (operator flagged as low-priority future work) | Operator decree: "Not super high priority, though." |
| FR-19.5 *(r1 new · sync rollback contract)* | If `scripts/sync-assets.sh` fails or produces a corrupt download (sha256 mismatch), the script preserves the existing committed local copy of `public/art/`, `public/data/materials/`, `public/fonts/`, `public/brand/`. CI verifies that running sync against a clean checkout produces a directory diff of zero against the committed state. | CI step + manual test |
| FR-19.6 *(r1 new · asset-update protocol with Gumi)* | Before S6, operator captures asset-update protocol with Gumi in `purupuru-assets/CONTRIBUTING.md`: who proposes, who reviews, version-bump cadence, release-tag flow. Non-blocking documentation. | File exists with protocol described |

### 5.4 · Dev panel relocation (operator-stated rework)

| FR ID | Requirement | Verification |
|---|---|---|
| FR-20 | The existing `KaironicPanel.tsx` moves from `app/battle/_scene/` to `app/battle/_inspect/KaironicPanel.tsx` | AC-6 hidden-by-default check |
| FR-21 | A new `app/battle/_inspect/DevConsole.tsx` orchestrates the toggle: backtick (`` ` ``) keypress toggles visibility · floating overlay (not in document flow) · contains KaironicPanel + future tweakpane / DialKit mounts | AC-6 toggle check |
| FR-22 | The `BattleScene.tsx` no longer references KaironicPanel directly · DevConsole mounts itself globally on the page · removable from production builds via env flag | Grep `BattleScene.tsx` for KaironicPanel imports — must be zero |
| FR-22.5 *(r1 new · `?dev=1` fallback FR)* | DevConsole supports `?dev=1` URL query param as a fallback toggle (in addition to backtick hotkey). Page-level docs name both invocation paths. Accessible when backtick conflicts (AZERTY keyboards, browser extensions, VS Code devtools captures). | URL with `?dev=1` shows DevConsole on initial render; without the param requires hotkey |
| FR-23 | The CombosPanel survives (it's a game-surface element, not a dev tool) but relocates from the side panel to inline with the BattleField (per game-design canon: "you feel who's winning by the animated flow of element energy") | Component placed within BattleField sub-tree, not a side column |

### 5.5 · Whisper determinism

| FR ID | Requirement |
|---|---|
| FR-24 | `whispers.ts` `whisper()` function index selection MUST be deterministic from the input `seed` argument. The current implementation hashes `seed % bank.length`, but `battle.live.ts` calls it with `Math.floor(Math.random() * 1_000_000)` as seed — that bypasses determinism. Fix: pass a deterministic counter derived from the phase-transition number + current battle seed (AC-12). |

## 6 · Technical & non-functional

### 6.1 · Stack (no new dependencies expected · D5 defers Three.js)

Inherited from compass (unchanged this cycle):
- Next.js 16.2.6 (App Router · Turbopack)
- React 19.2.4
- TypeScript 5
- Tailwind 4 (via `@tailwindcss/postcss` · OKLCH token system in `app/globals.css`)
- Effect 3.10.0 (Honeycomb substrate)
- motion 12.38.0 (framer-motion renamed)
- lucide-react (icon set)
- pnpm 10.x

**No new dependencies** are added this cycle. Tweakpane / DialKit are queued for a follow-up cycle (G10 design surface only). Three.js / R3F deferred (D5).

### 6.2 · Substrate constraints (inherited from Honeycomb doctrine)

- Single Effect.provide site stays at `lib/runtime/runtime.ts` (lint check per substrate-cycle PRD §5)
- Four-folder discipline (`domain/ports/live/mock` or per-system `{name}.{port,live,mock}.ts`) honored for new ports (FR-12, FR-13, FR-14)
- All cross-system communication via `Stream` from `PubSub` (the pattern shipped in the predecessor cycle) — no `subscribe(cb)` hand-rolled callbacks

### 6.3 · Performance

- Initial `/battle` route paint < 1.5s on local dev server (Turbopack) · 3s on Vercel preview deploy
- Lineup rearrangement (drag → drop → recomputed combos render) < 100ms on a modern laptop
- Clash sequence animation honors `DEFAULT_TIMING_BUDGETS` from `lib/honeycomb/curves.ts` weighted by kaironic weights · cumulative round time ≤ 6 seconds for 5-card lineups
- No memory leaks from the Effect Stream subscriptions · `Fiber.interrupt` on unmount (pattern already established in `lib/runtime/battle.client.ts`)

### 6.4 · Determinism / replayability

Per Gemini's "Seed is King" framing (already adopted in `lib/honeycomb/seed.ts`):
- Same seed + same player input sequence → same match outcome, frame-for-frame (within animation-timing variance)
- AC-12 (whisper determinism) closes the last `Math.random` leak
- The asset library's content addressing (per-tag tarball) provides supply-side determinism: a specific match seed + specific asset-release tag fully reproduces the visual experience

### 6.5 · Security · accessibility · i18n

- No new auth surface (D4 · wallet stays mocked)
- ARIA labels on all interactive controls (button, drag-handle, card-selection)
- Keyboard navigation: Tab through CollectionGrid, Space to select, Enter to proceed to arrange, Arrow keys to reorder lineup in arrange phase
- High-contrast mode: OKLCH tokens already split between vivid/dim/pastel/tint — verify high-contrast media query routes to vivid+dim
- i18n: copy is English-only this cycle (operator's working language); structure all user-facing strings through a `t()` helper or const map so future i18n is a swap, not a refactor

## 7 · Scope

### 7.1 · In (this cycle)

- 11 React components (FR-1 through FR-11)
- 3 new Honeycomb services (FR-12, FR-13, FR-14)
- Whisper determinism fix (FR-24)
- New asset repo + sync script (FR-15 through FR-18)
- Dev panel relocation (FR-20 through FR-22)
- Combos panel inlining (FR-23)
- Component-map documentation (G9 / AC-13)
- Full audit-passing slice on `feat/honeycomb-battle` branch (G6 / AC-11)

### 7.2 · Out (explicit · also see §2.3 non-goals)

See §2.3 for the full list. Top exclusions:
- Three.js viewport (D5)
- Friend-duel networking
- Real Five Oracles
- Daemon NFT mint
- On-chain combat moves
- Mobile-first polish
- Asset CLI implementation (only design surface)
- Asset naming/labeling improvements (operator-deferred)
- New auth surface

### 7.3 · Cross-cycle interactions

- **Predecessor**: Honeycomb substrate (substrate-agentic-translation-adoption-2026-05-12 · archived). This cycle EXTENDS it; does not modify the substrate's existing surface (weather, sonifier, awareness, observatory, invocation, population, battle phase machine).
- **Successor (proposed)**: `card-game-3d-202X` — R3F viewport + shaders + spatial battlefield. Reads from the same Honeycomb services this cycle ships.
- **Sibling (out of scope but related)**: `friend-duel-async-202X` — turns the AI opponent layer into a friend's Puruhani agent. Requires daemon NFT scope.

## 8 · Risks & dependencies

| ID | Risk | Likelihood | Mitigation |
|---|---|---|---|
| R1 *(r1 strengthened)* | SvelteKit 5 → React translation friction (Svelte runes · `$state`, `$derived`, `$effect` semantics ≠ React `useState`, `useMemo`, `useEffect`) · ~30-50% of components may need behavior re-derivation, not mechanical translation · some Svelte idioms (two-way binding, store auto-subscribe, $effect cleanup semantics) have NO clean React equivalent | High | **D9 · S0 spike** is the calibration vehicle: one complex component spiked first; if LOC or time bust the projection, recalibrate before S1 starts. SDD will catalog Svelte → React translation patterns from the spike. Existing `lib/runtime/battle.client.ts` is the prior-art reference for the Effect-to-React idiom. |
| R2 *(r1 mitigated by D10)* | Asset migration cross-repo coordination · originally rated High, now Medium because D10 defers asset extraction to S6 (component shells work with local copies through S5) | Medium | D10 sequencing change · FR-19.5 rollback contract (sha256 verify + preserve-on-failure) · FR-19.6 Gumi update protocol drafted before S6 · world-purupuru cross-repo sync demoted to stretch (FR-17) |
| R3 | Behavioral parity with world-purupuru `state.svelte.ts` v4 (Setup Strike, Caretaker A Shield, Caretaker B Adapt, AI personality) | Medium | The state-v4 deltas are documented in `14-card-game-in-compass-brief.md` · the Honeycomb clash/opponent ports (FR-12, FR-13) must list each delta in their port.ts comments as PRD-traced invariants |
| R4 | Test coverage gap — purupuru-game has 204 tests; compass's port has 5 | Medium | G8 / AC-4 requires invariant-level parity. SDD names which invariants are load-bearing |
| R5 | "Enter the Tide" copy / map / aesthetic — operator's mental model is fuzzy ("'A pro pro the game'" = "Purupuru: the game"). Risk of building the wrong splash | Medium | EntryScreen sprint (S5 or wherever) pairs with operator at start (5-min UI review of world-purupuru's EntryScreen as reference) |
| R6 | AI opponent realism — bound by element personality but still needs to be "fun to lose to." A patient Wood AI that always wins is no fun | Medium | AI sprint includes a balance pass (operator self-test 3 matches per element) before /audit-sprint |
| R7 | Honeycomb substrate stability — adding 3 new ports could fragment the AppLayer | Low | The pattern is established; the substrate cycle PRD §5 + the construct-effect-substrate doctrine pack scaffold-system.sh both enforce the four-folder discipline |
| R8 | Hackathon-live main branch — if main needs a hotfix during this cycle, the feature branch may need to rebase | Low | Operator already decreed branch-based work (D7) · rebase is the standard recovery |
| R9 | Dev panel toggle conflicts with browser shortcuts (backtick · sometimes used by browser extensions) | Low | Accept lossy on power-user keybinding conflicts · provide a fallback `?dev=1` query param as a discoverable secondary toggle |
| R10 | Asset repo permissions — needs to be created under `project-purupuru` org with both compass and world-purupuru workflows able to fetch releases | Low | Operator owns org; **S6** starts (was S1) with `gh repo create` + permission setup as the first checkpoint |
| R11 *(r1 new · BattlePhase consumers)* | The new phases `clashing`/`disintegrating`/`result` added to BattlePhase enum (FR-14) may silently break existing consumers in predecessor cycle code (sonifier, weather, awareness, observatory) if they have exhaustive switch statements | Low | Audit all `BattlePhase` consumers before S1 (S2 in new order). Add TypeScript `never`-assert exhaustiveness pattern in each consumer so future additions surface compile errors. Verify in /review-sprint of S2. |
| R12 *(r1 new · 24 audit gates timeline)* | 8 sprints × 3 gates (/implement → /review-sprint → /audit-sprint) = 24 gate passes for operator-only execution · hackathon-live main may need hotfixes pulling attention · no fallback if a sprint hard-fails audit | Medium | **D9 S0 spike** validates feasibility before commitment. SDD names per-sprint timebox. **De-scope ladder** named in §9: if S6 (visual binding) is failing, Tutorial (FR-10) and HelpCarousel (FR-9) drop while still hitting G1. Operator may invoke `/run sprint-plan` once shape is locked to reduce per-sprint friction. |

## 9 · Sprint dependency graph (r1 · reordered post-flatline · S0 spike first · assets at S6)

```
S0 · spike + cycle kickoff (operator pair-point · D9)
  │  Spike: BattleField w/ drag-reorder OR BattleHand
  │  Outcome: Svelte→React translation patterns · LOC calibration
  │  GATE: if spike >2 days OR LOC projection >7,500 in compass,
  │        RECALIBRATE before S1 starts (could split into 2 cycles)
  │
  ▼
S1 · Honeycomb growth · clash + opponent + match ports
  │  (was S2 · purupuru-game pure logic ported as Effect-typed services)
  │  Includes BattlePhase consumer audit (R11) + never-assert pattern
  ▼
S2 · BattleField + BattleHand (port + relocate CombosPanel inline)
  │  (was S3)
  ├─────────────────────────┐
  ▼                         ▼
S3 · EntryScreen + Quiz   S4 · OpponentZone + TurnClock + ArenaSpeakers
  │                         │
  └──────────┬──────────────┘
             ▼
S5 · CardPetal + visual parity pass (uses local public/art/ copies)
  │
  ▼
S6 · Asset library extraction (was S1) + ResultScreen + HelpCarousel + Tutorial
  │  - Create purupuru-assets repo + first tag
  │  - Wire compass sync (FR-16) + rollback contract (FR-19.5)
  │  - world-purupuru sync = stretch goal (FR-17 demoted)
  │  - Gumi protocol drafted (FR-19.6)
  ▼
S7 · Dev panel relocation (FR-20–22.5) + whisper determinism (FR-24)
     + Lighthouse + axe + playability checklist + final audit pass
     (de-scope landing: if running over budget, Tutorial + HelpCarousel are first drops)
```

S3-S4 split is parallelizable post-S2. Each sprint independently passes `/implement → /review-sprint → /audit-sprint`.

**De-scope ladder** (R12 mitigation · if cycle running over budget):
1. First to drop · `HelpCarousel` (FR-9) · operator dismisses help is acceptable for solo play
2. Second · `Tutorial` (FR-10) · purupuru-game's tutorial covers the learning path
3. Third · world-purupuru asset sync (FR-17 · already stretch) — keep duplicated
4. Last-resort · `ArenaSpeakers` spatial port (FR-8) — keep existing `WhisperBubble` shape

G1 (visible playable solo) holds even at the bottom of the ladder. AC-1, AC-3, AC-4, AC-5, AC-6, AC-10, AC-11 hold throughout.

## 10 · References

- **Input brief**: `grimoires/loa/context/14-card-game-in-compass-brief.md` (status: candidate → promote to active at SDD start)
- **Predecessor PRD (archived)**: `grimoires/loa/archive/substrate-agentic-translation-adoption-2026-05-12/prd.md`
- **Predecessor SDD (archived)**: `grimoires/loa/archive/substrate-agentic-translation-adoption-2026-05-12/sdd.md`
- **Game-design canonical**: `~/Documents/GitHub/purupuru-game/grimoires/loa/game-design.md` (Gumi's GDD · invariants in `~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md`)
- **State-machine reference (source)**: `~/Documents/GitHub/purupuru-game/prototype/src/lib/game/` (pure TS · 204 tests)
- **UI/UX reference (source)**: `~/Documents/GitHub/world-purupuru/sites/world/src/lib/{battle,game,scenes}/` (SvelteKit 5 · NOT importable from compass)
- **Honeycomb pack**: `~/Documents/GitHub/construct-effect-substrate/` (doctrine + `scripts/scaffold-system.sh`)
- **Flatline review artifact (r1)**: `grimoires/loa/a2a/flatline/card-game-prd-opus-manual-2026-05-12.json` · Opus review + skeptic captured via direct model-adapter calls because flatline-orchestrator scoring engine broke on 1.157.0 (issue #759 + cost-map gap) · framework regressions reported via /feedback this session
- **Memory anchors**:
  - [[honeycomb-substrate]] · operator-coined name for effect-substrate
  - [[purupuru-world-org-shape]] · world-as-Rosenzu-meta · apps-as-zones · shared substrate
  - [[dev-tuning-separation]] · dev panels behind hotkey/query, never in game flow
- **Operator decrees (this discovery session)**:
  - "the actual game itself was on the battle route of the other app" (scope redirect)
  - "the Kaironic time sliders should not be interfering with the actual game" ([[dev-tuning-separation]])
  - "No or very little duplication of efforts especially around assets/state logic" (D2)
  - "I don't really want to do a git submodule, but just maybe a repo to point towards for assets" (D2)
  - "Some sort of 'enter the tide' type of screen" (D4)
  - "Full audit-passing slice (Loa quality bar)" (G6)
  - "Grow Honeycomb" (D1)
  - "Single multi-sprint cycle (Recommended)" (D7)
  - "Surface + clash + AI opponent" (D8)
  - "Backtick is okay" (D3)

## 11 · Open questions for SDD phase

The SDD interview should resolve these. They are PRD-altitude questions where the operator left a deliberate gap.

1. ~~**Q-SDD-1**: AI opponent algorithm shape~~ · **RESOLVED in D11** (flatline-r1) · parameterized policy with element-specific coefficients · LLM-backed REJECTED for determinism preservation.
2. **Q-SDD-2**: BattleField spatial layout · world-purupuru's `TERRITORY_CENTERS` constants suggest a top-down arena view. Compass's `lib/honeycomb/wuxing.ts` doesn't have those yet. SDD: own these constants in `lib/honeycomb/wuxing.ts` (lift) or as a new `lib/honeycomb/battlefield-geometry.ts` (separation)?
3. **Q-SDD-3**: Asset repo naming convention · `purupuru-assets` (org-aligned) or `purupuru-art` (more specific) or `purupuru-public` (matches `public/` source dir)? Operator decision.
4. **Q-SDD-4**: Asset release versioning · semver (v1.0.0 · v1.1.0) or date-based (v2026.05.13)? Lock it before S1 publishes the first release.
5. **Q-SDD-5**: ElementQuiz question content · port verbatim from world-purupuru's component, or have Gumi author fresh? If fresh, who's blocking on whom?
6. ~~**Q-SDD-6**: Test parity standard~~ · **RESOLVED via AC-4 update** (flatline-r1) · ALL specific invariants from `~/Documents/GitHub/purupuru-game/prototype/INVARIANTS.md` enumerated and required (not ≥6 floor). Fresh tests in compass against the same invariants (not fixture-shared since data shapes differ). SDD enumerates test plan per invariant.
7. **Q-SDD-7**: Dev panel content beyond kaironic · what other inspectors mount under `_inspect/`? Substrate state inspector? Combo debug? Seed reset / replay panel? List in SDD §5 so S8 is scoped.
8. **Q-SDD-8**: HelpCarousel + Tutorial overlap · Help is hints (always-available), Tutorial is teach-by-doing (one-time). World-purupuru ships both. Does compass ship both, or merge into one progressive-disclosure surface?

## 12 · Acceptance summary (aligned to §2 goals)

This PRD is accepted when:

- All decisions D1–D8 are preserved load-bearing through SDD
- G1–G6 (primary) each have an SDD section and a sprint-plan task
- G7–G10 (secondary) have at least one sprint task or SDD note
- The 8 Q-SDD-* open questions are resolved during the SDD interview
- Operator confirms cycle scope before sprint-plan begins

---

> **Sources**: `14-card-game-in-compass-brief.md` (full file · operator-authored context) · discovery interview (this session · 2 question batches · 8 answers) · operator messages (3 in-session decrees) · [[honeycomb-substrate]] memory · [[purupuru-world-org-shape]] memory · [[dev-tuning-separation]] memory · code reality at `lib/honeycomb/*` and `app/battle/*` (shipped previous turn · commit `775acd5d`) · world-purupuru code paths verified at `~/Documents/GitHub/world-purupuru/sites/world/src/lib/battle/` · purupuru-game game-design doc at `~/Documents/GitHub/purupuru-game/`
