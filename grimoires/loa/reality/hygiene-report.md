# Code Hygiene Report

> Generated 2026-05-07 by `/ride`. Items flagged for HUMAN DECISION — the Loa never deletes.

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 2 |

## Findings

### MED-1 — Inert material configs (18 files)

**Location**: `public/data/materials/*.json`

**Observation**: 18 JSON files describe "ecsPipeline", "nodeGraph v0.4", "Godot-composition", "DOTS", "cycle-089 cards-as-particles SoA migration target", `adaptive_disclosure_hooks.cycle_activates: "087"`. These references are not from this project's vocabulary — they appear to be artifacts from an upstream art/material pipeline (purupuru.world or a sister project).

**Code that reads them**: None. `grep -rn "data/materials" app lib` returns zero matches.

**Decision required from zerker**:
- (a) **Keep as-is** — they're inert and will be wired in a future sprint when the card-system surfaces
- (b) **Move to a `_archive/` subdirectory** to make their dormant state explicit
- (c) **Delete** — too small to matter (a few KB), but trims confusion for future agents

**Recommendation**: (a) for hackathon (no time to relocate), but flag in the next post-hackathon hygiene pass.

### LOW-1 — Generic Next.js README

**Location**: `README.md` (37 lines)

**Observation**: The current README is verbatim `create-next-app` boilerplate. It does not mention purupuru, the observatory, the wuxing palette, or anything project-specific. A judge or future contributor cloning this repo gets no signal about what they're looking at.

**Decision required from zerker**:
- (a) **Replace** with a concise project README pointing at `CLAUDE.md` and the hackathon brief
- (b) **Defer** until post-hackathon

**Recommendation**: (a) — a one-paragraph rewrite costs <5 minutes and improves the first impression.

### LOW-2 — Duplicate font format (FOT-Yuruka Std)

**Location**: `public/fonts/fot-yuruka-std.woff2` AND `public/fonts/fot-yuruka-std.ttf`

**Observation**: `app/globals.css:9–14` declares both formats in the @font-face `src` list. Modern browsers will prefer the woff2; the ttf is a fallback for very old environments.

**Decision required from zerker**:
- (a) **Keep both** — defensive; ttf is small enough to not matter
- (b) **Drop the ttf** — modern hackathon judges browse on modern Chrome/Safari/Firefox, all of which support woff2

**Recommendation**: (a) — the file size cost is negligible and the redundancy is harmless.

## Items NOT flagged

- `app/page.tsx` rendering a design-system showcase rather than the observatory: **expected** — that's the next sprint's work.
- Empty `next.config.ts`: **fine** — Next 16 needs no tuning yet.
- No `.env*` files: **expected** — no real backends wired.
- No tests: **expected** — hackathon scaffold pre-implementation.

## Dead code candidates

None. The scaffold is small and every file is referenced by something live.

## Dependency conflicts

None. `pnpm-lock.yaml` resolves cleanly. React 19 + Next 16 + Tailwind 4 + Pixi 8 are mutually compatible.
