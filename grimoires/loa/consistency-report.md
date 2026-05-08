# Consistency Report

> Generated 2026-05-07 by `/ride`. Naming and pattern analysis across the scaffold.

## Consistency Score: **9 / 10** (Excellent)

The scaffold is small enough that a single hand wrote it; naming is uniform and intentional.

## Naming Conventions

### Element vocabulary (5/5 — perfect alignment)

The string union `"wood" | "fire" | "earth" | "water" | "metal"` is used identically across:

| Layer | Reference |
|-------|-----------|
| Type system | `lib/score/types.ts:7–8` (`Element`, `ELEMENTS`) |
| UI labels | `app/page.tsx:4–10` (`ELEMENT_LABEL`) |
| CSS tokens | `app/globals.css:66–99` (`--puru-{wood,fire,earth,water,metal}-{tint,pastel,dim,vivid}`) |
| Tailwind utilities | `app/globals.css:384–409` (`--color-puru-{element}-{shade}`) |
| Public assets | `public/art/puruhani/puruhani-{wood,fire,earth,water,metal}.png`, same for jani, glows, frames_pot, behavioral.harmonized_*, behavioral.resonant_* |
| Material configs | `public/data/materials/{caretaker-a,caretaker-b,jani}-{wood,fire,earth,water,metal}.json` |

**Score**: 10/10. The kanji-bilingual labels in `ELEMENT_LABEL` (jp:"木"/en:"Wood") match the SKILL.md world canon at `public/art/skills/purupuru/SKILL.md:28`.

### Design-token namespacing (10/10)

All visual tokens are prefixed `--puru-*`:
- Cloud surfaces: `--puru-cloud-{bright,base,dim,deep,shadow}`
- Ink: `--puru-ink-{rich,base,soft,dim,ghost}`
- Element shades: `--puru-{element}-{tint,pastel,dim,vivid}`
- Accents: `--puru-{honey,terra,sakura}-{bright,base,dim,tint}`
- Card backs, ghost cards, surfaces: all `--puru-*`
- Easing: `--ease-puru-{in,out,bounce,settle,breathe,flow,emit,crack}`
- Durations: `--duration-{instant,fast,normal,slow,ritual,breathe,workshop,press,tap}` + `--puru-dur-*` for pack ceremony

Tailwind 4 `@theme` block re-exports as `--color-puru-*`, `--radius-puru-*`, `--font-puru-*`. Utility classes are predictable: `bg-puru-fire-vivid`, `font-puru-display`, `rounded-puru-md`.

**Score**: 10/10. Single namespace, single source of truth.

### Asset paths (9/10)

| Pattern | Example | Consistent? |
|---------|---------|-------------|
| `/art/<entity>/<entity>-<element>.png` | `/art/puruhani/puruhani-fire.png` | Yes |
| `/art/element-effects/<element>_glow.svg` | `/art/element-effects/fire_glow.svg` | Yes — but uses underscore separator vs hyphen elsewhere |
| `/art/cards/frames_pot/<element>.svg` | `/art/cards/frames_pot/fire.svg` | Yes — underscore in dir name |
| `/art/cards/behavioral/<state>_<element>.svg` | `/art/cards/behavioral/harmonized_fire.svg` | Yes — underscore separator |
| `/data/materials/<entity>-<element>.json` | `/data/materials/jani-fire.json` | Yes — hyphen separator |

**Minor inconsistency**: SVG filenames inside `art/cards/behavioral/` and `art/element-effects/` use **underscore** separators (`harmonized_fire.svg`), while everything else uses **hyphen** (`puruhani-fire.png`, `jani-water.json`). Score: 9/10. Not enough to remediate; documented for future awareness.

### TypeScript style

- **Type imports**: `import type { ... }` used consistently (`lib/score/index.ts:1–10`, `lib/score/mock.ts:1–10`).
- **`as const` for readonly enums**: `lib/score/types.ts:8`.
- **Doc comments**: Score domain has a JSDoc preamble at `lib/score/types.ts:1–5`. No other source files have file-level doc comments — minor, acceptable at scaffold size.
- **Function naming**: camelCase (`getWalletProfile`, `mockScoreAdapter`, `affinity`, `pick`, `hash`).
- **Type naming**: PascalCase (`Element`, `WalletProfile`, `ScoreReadAdapter`).

### React component naming

Single component (`Home` in `app/page.tsx:12`) — no inconsistencies possible.

## Pattern Analysis

| Pattern | Status | Notes |
|---------|--------|-------|
| **Single source of truth for visual tokens** | Strong | All themes flow through `:root` + `[data-theme="old-horai"]` + `prefers-color-scheme` block in `app/globals.css`. |
| **Adapter / contract separation** | Strong | `lib/score/types.ts` (contract) + `lib/score/mock.ts` (impl) + `lib/score/index.ts` (binding). Real adapter slots in by editing one line. |
| **Server / client boundary** | Implicit | No "use client" directives anywhere; the only page is a server component. Pixi mount will introduce the first client boundary. |
| **next/font integration** | Modern | `app/layout.tsx:5–13` declares Inter and Geist Mono; `app/globals.css:441–445` falls back via `var(--font-inter, 'Inter')`. |

## Conflicts

**None observed.** The codebase is too small and too recently authored to have accumulated conflicts.

## Improvement Opportunities

| # | Opportunity | Cost | Recommendation |
|---|-------------|------|----------------|
| 1 | Normalize SVG filename separators (`harmonized_fire.svg` → `harmonized-fire.svg`) | Low | **Defer** — would touch 14 behavioral SVGs + import sites, no functional benefit, risks breakage |
| 2 | Add JSDoc preambles to `lib/utils.ts` and `lib/score/{mock,index}.ts` | Trivial | **Optional** — `mock.ts` already gestures at it via the doc comment at `types.ts:1–5` |
| 3 | Add a barrel `lib/index.ts` re-exporting the score adapter and `cn` | Trivial | **Defer** — only 2 modules, premature |

## Breaking Changes Identified

**None.** No breaking changes are required by consistency analysis. The codebase is small enough that any rename can wait for /implement-time touch points.
