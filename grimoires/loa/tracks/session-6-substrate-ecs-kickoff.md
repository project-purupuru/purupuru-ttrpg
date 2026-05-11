---
session: 6
date: 2026-05-11
type: kickoff
status: planned
run_id: 20260511-3f171e
mode: simstim
---

# Session 6 · Substrate ECS Cycle (kickoff)

## Scope

- Adopt Effect.ts as the substrate vocabulary (domain · ports · live · mock · runtime — single `Effect.provide` site)
- Hoist `lib/sim` into a barrel + `*.system.ts` suffix convention so external readers + AI agents can grep-enumerate behavior
- Consolidate 190 LOC of duplicate theme tokens in `globals.css`
- Hoist element registry (kanji + breath durations + hue) into single source `lib/domain/element.ts`
- Hoist localStorage try/catch into `lib/storage-safe.ts` (3 consumers)
- Migrate `weatherFeed` + `sonifier` to Effect Layers (typed errors + lifecycle management)
- Delete dead code: `.next.OLD-*` (4.2 GB) · `app/asset-test/` · `lib/blink/mock-memo-tx.ts` (if confirmed unused)
- Slim README from 41 → ≤25 em-dashes · move `PROCESS.md` to `grimoires/loa/ops/`
- Ship `public/llms.txt` + per-package `CLAUDE.md` for agent navigation
- Distill the doctrine into `loa-constructs/packs/effect-substrate/` as `status: candidate`

## Artifacts

- Architecture: `grimoires/loa/specs/arch-substrate-ecs-2026-05-11.md` (3 personas: OSTROM + ALEXANDER + FAGAN)
- Build doc: `grimoires/loa/specs/enhance-substrate-ecs-2026-05-11.md` (6 sprints, dependency-ordered, BARTH-disciplined)
- Substrate run trail: `.run/compose/20260511-3f171e/orchestrator.jsonl` (5 phase events)
- Final handoff packet: `.run/compose/20260511-3f171e/envelopes/final.kickoff.handoff.json`

## Prior session

Session N-1 (closed `41a4aaa`) shipped the Stone Recognition Ceremony (3 iterations: initial KANSEI spec → grounded copy via KEEPER+VOCAB-BANK → Hades-pattern via ALEXANDER). 8 commits to main · all visual surfaces verified · demo-day greenlight.

## Decisions made

- **D1 (vocabulary):** Effect as primary code vocabulary, ECS as the doctrine/teaching layer. Suffix-naming makes behavior grep-enumerable.
- **D2 (entity registry):** `lib/sim/` keeps its location, gets a barrel `index.ts` and `population.system.ts` rename. No move to packages.
- **D3 (package promotion):** None this cycle. Internal hoist only.
- **D4 (Effect scope):** 2 of 5 candidates this cycle (weatherFeed + sonifier). The other 3 (activityStream + nonce-store + route handlers) defer to V2.
- **D5 (theme consolidation):** Restructure `globals.css` to single token block + dark-only override. Visual diff verified.
- **D6 (README slim):** Em-dash density target ≤25 (from 41). PROCESS.md → grimoires/loa/ops/.
- **D7 (dead code):** Confirmed safe to delete `.next.OLD-*`, `app/asset-test/`, `lib/blink/mock-memo-tx.ts` (if unused).
- **D8 (upstream):** Doctrine distills to `loa-constructs/packs/effect-substrate/` as `candidate` until 2 more projects validate.

## FAGAN gates (per arch doc)

- `/gpt-review` runs after Sprint 3 (Effect migration · highest risk surface)
- Visual diff after Sprint 4 (theme consolidation · highest cosmetic risk)
- 128/128 tests at every commit (bisectable)
- Net LOC must be negative (target -300)
- Single `Effect.provide` site enforced (grep-rule)

## SimStim pair-points

- After Sprint 0 — operator confirms baseline screenshots
- After Sprint 3 — FAGAN review of Effect migration before merge
- After Sprint 4 — visual diff review (theme refactor)
- After Sprint 6 — construct pack ratification before publishing as candidate
