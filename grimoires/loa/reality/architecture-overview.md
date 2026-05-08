# Architecture Overview

> Generated 2026-05-07. System component map, data flow, and tech stack.

## Topology (today)

```
                    Browser
                       │
                       ▼
         ┌─────────────────────────┐
         │  Next.js 16 App Router  │
         │  (server components)    │
         └─────────┬───────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
  app/layout.tsx          app/page.tsx
  (RootLayout)            (Home — / route)
       │                       │
       │  imports              │  imports
       ▼                       ▼
  app/globals.css         lib/score (barrel)
  (OKLCH tokens,                │
   themes, motion          ┌────┴─────┐
   vocabulary)             ▼          ▼
                       types.ts    mock.ts
                       (contract)  (deterministic mock)
                                       │
                                       │ seeded by
                                       ▼
                                   hash(address)
```

## Topology (forward-looking, post-sim sprint)

```
                    Browser
                       │
                       ▼
         ┌─────────────────────────────────┐
         │  Next.js 16 App Router          │
         │  server shell + client islands  │
         └─────────┬───────────────────────┘
                   │
                   ▼
            <ObservatoryPage>
                   │
       ┌───────────┼─────────────────┐
       ▼           ▼                 ▼
   <TopBar>   <PentagramCanvas>   <aside>
              (client island,         │
               Pixi.js v8         ┌───┴────┐
               vanilla)           ▼        ▼
                   │         <ActivityRail> <WeatherTile>
                   ▼              │            │
            sim entities          ▼            ▼
            (500–1000             ActionStream WeatherFeed
             puruhanis)           (mocked)     (mocked, shaped
                   │                            like real)
                   ▼
              scoreAdapter
              (mocked,
               swappable at
               lib/score/index.ts:17)
```

## Data flow (today)

1. `Home` server component renders at request time
2. `ELEMENTS` array (`lib/score/types.ts:8`) drives the wuxing roster grid via `.map()`
3. Each element pulls `--puru-{element}-{tint,vivid}` from the CSS custom-property cascade
4. Theme is determined by `prefers-color-scheme` OR `[data-theme="old-horai"]` attribute
5. Fonts resolve via `next/font` (Inter, Geist Mono) + `@font-face` (Yuruka, ZCOOL)

## Data flow (forward-looking — observatory sim)

1. Server shell renders TopBar, KpiStrip, ActivityRail skeleton, WeatherTile skeleton
2. `<PentagramCanvas>` ("use client") mounts Pixi.Application in `useEffect`
3. On mount, the canvas:
   - Reads `scoreAdapter.getElementDistribution()` to seed entity counts per element
   - Reads `scoreAdapter.getEcosystemEnergy()` for ambient UI state
   - Subscribes to `actionStream` (mocked) — events drive sprite migrations on the pentagram
   - Subscribes to `weatherFeed` (mocked) — state drives entity behavior modulation
4. `<ActivityRail>` consumes the same `actionStream` for the chronological list
5. `<WeatherTile>` consumes `weatherFeed` for the right-rail tile
6. Click on a sprite → focus card overlay reads `scoreAdapter.getWalletProfile()`/`getWalletBadges()`/`getWalletSignals()`

## Tech stack summary

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 16 App Router | Stack consensus; AGENTS.md warns of breaking changes |
| UI runtime | React 19 | Native server components; no extra patches needed |
| Styling | Tailwind 4 (`@tailwindcss/postcss`) | OKLCH-first; `@theme` block re-exports custom properties as utilities |
| 2D engine | Pixi.js 8 vanilla | Built for thousands of moving entities; no `@pixi/react` per CLAUDE.md L18 |
| UI animation | motion (^12) | Component-level; canvas animation runs through Pixi instead |
| Icons | lucide-react | Sparingly — design system prefers brand glyphs |
| Class composition | clsx + tailwind-merge via `cn()` | Standard Next.js pattern |
| TypeScript | Strict, ES2017, bundler resolution | `tsconfig.json` |
| Package manager | pnpm 10 | `pnpm-lock.yaml`, `pnpm-workspace.yaml` present |

## Design system architecture

**Single source of truth**: `app/globals.css`.

The cascade:
```
:root  →  [data-theme="old-horai"]  →  @media (prefers-color-scheme: dark)
   │              │                              │
   │              └──── explicit override ───────┘
   │
   └──→  @theme { --color-puru-* }  →  Tailwind utilities (bg-puru-fire-vivid, etc.)
```

The `@theme` block (`app/globals.css:382–463`) is the bridge from raw OKLCH tokens to the Tailwind utility namespace. Changing `:root --puru-fire-vivid: oklch(...)` propagates to every `bg-puru-fire-vivid` class without rebuilding any utility config.

## Mock-vs-real boundary

| Layer | Real | Mocked | Where to swap |
|-------|------|--------|---------------|
| Score backend | ❌ | ✅ | `lib/score/index.ts:17` |
| Wallet/auth | ❌ | ✅ | N/A — pure visualization |
| On-chain actions | ❌ | ✅ (synthetic) | TBD: `lib/actions/` |
| IRL weather | ❌ | ✅ (mocked feed shape) | TBD: `lib/weather/` |
| Visual primitives | ✅ | — | App is the demo |

Source: `CLAUDE.md:38–44`.

## Critical conventions

1. **Never hand-write hex colors** — use OKLCH-backed Tailwind utilities (`CLAUDE.md:34`)
2. **Solid colors only on persistent UI** — opacity is for transient effects (`app/globals.css:27`)
3. **Mirror Old Horai + prefers-color-scheme blocks** — keep in sync (`app/globals.css:225`)
4. **Pixi mount with cleanup** — instantiate in `useEffect`, destroy in teardown (`NOTES.md` L67)
5. **Read `node_modules/next/dist/docs/` before assuming Next.js APIs** — Next 16 has breaking changes (`AGENTS.md:2–4`)
