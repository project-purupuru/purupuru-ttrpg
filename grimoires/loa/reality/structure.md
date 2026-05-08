# Repository Structure

> Generated 2026-05-07 by `/ride`. Truth lives in code; this is a snapshot.

## Tree (depth 4, source code only)

```
purupuru-ttrpg/
├── app/                          [Next.js App Router]
│   ├── globals.css               (555 lines — design tokens + motion vocabulary)
│   ├── layout.tsx                (35 lines — root layout, next/font wiring)
│   └── page.tsx                  (158 lines — observatory landing kit showcase)
├── lib/
│   ├── utils.ts                  (cn() helper — clsx + tailwind-merge)
│   └── score/                    [Score read-adapter contract + mock]
│       ├── index.ts              (re-exports + scoreAdapter binding)
│       ├── mock.ts               (deterministic stub keyed off wallet hash)
│       └── types.ts              (Element, Wallet, ScoreReadAdapter, etc.)
├── public/
│   ├── art/
│   │   ├── puruhani/             (5 PNGs — element guardian sprites)
│   │   ├── jani/                 (5 PNGs — sister-character sprites)
│   │   ├── cards/
│   │   │   ├── backgrounds/      (6 SVG — element + harmony)
│   │   │   ├── behavioral/       (14 SVG — awakening, dormant, harmonized × N, resonant × N)
│   │   │   ├── frames/           (4 SVG — common, mid, rare, rarest)
│   │   │   ├── frames_pot/       (6 SVG — element + harmony framed pots)
│   │   │   └── rarity-treatments/ (4 SVG)
│   │   ├── element-effects/      (6 SVG — element glows + harmony glow)
│   │   ├── patterns/             (1 webp — grain-warm)
│   │   ├── skills/purupuru/      (SKILL.md — Tsuheji world voice/lore guide)
│   │   └── tsuheji-map.png
│   ├── brand/                    (2 SVG — wordmark color + white)
│   ├── data/materials/           (18 JSON — caretaker/jani/transcendence configs)
│   └── fonts/                    (FOT-Yuruka Std woff2+ttf, ZCOOL KuaiLe woff2)
├── grimoires/loa/                [Loa state zone]
├── .beads/, .claude/, .run/      [Loa system & state]
├── AGENTS.md                     (5 lines — "this is NOT the Next.js you know")
├── CLAUDE.md                     (54 lines — project instructions)
├── README.md                     (36 lines — generic Next.js boilerplate)
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts                (empty config — defaults)
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
└── tsconfig.json
```

## Source-code totals

| Category | Files | Lines |
|----------|-------|-------|
| TypeScript / TSX | 7 | 350 |
| CSS | 1 | 555 |
| Config (json/mjs/ts) | 5 | 79 |
| Markdown | 4 | 95 |
| **Total source** | **17** | **1,079** |
| Public assets | 70+ | — |

## Module responsibilities

| Path | Role |
|------|------|
| `app/layout.tsx` | Root HTML shell. Wires Inter + Geist Mono via `next/font/google`. Body uses `font-puru-body` and `text-puru-ink-base`. |
| `app/page.tsx` | Single route at `/` — design-system showcase: wordmark, wuxing roster (5 puruhani), typography scale, jani sister roster, kit contents. **Not yet** the observatory simulation. |
| `app/globals.css` | OKLCH design tokens, light + Old Horai dark themes, motion keyframes, `@theme` Tailwind 4 utility wiring. Single source of truth for visual identity. |
| `lib/utils.ts` | `cn()` — clsx + tailwind-merge for conditional class composition. |
| `lib/score/types.ts` | Read-side contract: `Element`, `Wallet`, `WalletProfile`, `WalletBadge`, `WalletSignals`, `ElementDistribution`, `EcosystemEnergy`, `ScoreReadAdapter`. |
| `lib/score/mock.ts` | Deterministic mock — every method seeds from `hash(address)` so the same wallet returns identical readings across calls. |
| `lib/score/index.ts` | Barrel export. Binds `scoreAdapter: ScoreReadAdapter = mockScoreAdapter` so callers swap implementations by editing one line. |
