# Legacy Documentation Inventory

> Generated 2026-05-07 by `/ride`. "Legacy" here means "pre-existing relative to grimoire artifacts" — most of these are first-class current and will not be deprecated.

## Files Found

| File | Type | Lines | Status | Key Claims |
|------|------|-------|--------|------------|
| `README.md` | Project README | 37 | **Generic boilerplate** — replace candidate | Generic create-next-app text. No project-specific info. |
| `AGENTS.md` | AI guidance | 5 | Current — keep verbatim | "This is NOT the Next.js you know — read `node_modules/next/dist/docs/` before writing code." |
| `CLAUDE.md` | Project instructions | 54 | Current — first-class | Stack (Next 16.2.6 / React 19.2.4 / TS 5 / Tailwind 4 / pnpm 10), design system summary, mocked-vs-real table, Loa workflow pointers. |
| `grimoires/loa/context/00-hackathon-brief.md` | Hackathon context | 60 | Current — first-class | Project description, ship date 2026-05-11, decisions already made, 8 open gaps. |
| `public/art/skills/purupuru/SKILL.md` | Skill / world lore | 147 | World-canon doc — keep | Wuxing element table (Wood/Fire/Earth/Metal/Water with kanji, character, bear, virtue, color, energy), Sheng/Ke cycles, voice guide, room layout, anti-patterns, MCP tool list. **Read before writing observatory copy.** |

## CLAUDE.md AI Guidance Quality Score

| Criterion | Present | Score |
|-----------|---------|-------|
| Length > 50 lines | Yes (54) | 1 |
| Tech stack mentions | Yes (Next/React/TS/Tailwind/pnpm/Pixi/motion/lucide) | 1 |
| Pattern guidance (token-driven, OKLCH) | Yes | 1 |
| Convention guidance (NEVER write app code outside /implement) | Via Loa import | 1 |
| Warnings (Next 16 breaking changes) | Yes | 1 |
| Mocked-vs-real boundary | Yes | 1 |
| Loa workflow pointers | Yes | 1 |
| **Total** | | **7 / 7** |

`CLAUDE.md` is **above the 5/7 sufficiency threshold**. No remediation needed.

## Deprecation Candidates

| File | Reason | Action |
|------|--------|--------|
| `README.md` | Generic boilerplate — provides no signal | Phase 8: prepend pointer notice → user replaces post-hackathon |

## Files NOT to deprecate

- `AGENTS.md` — load-bearing tribal knowledge, kept verbatim
- `CLAUDE.md` — first-class project instructions
- `grimoires/loa/context/00-hackathon-brief.md` — current hackathon context (kept under State Zone)
- `public/art/skills/purupuru/SKILL.md` — world canon; if anything, the PRD/SDD must defer to it for lore vocabulary
