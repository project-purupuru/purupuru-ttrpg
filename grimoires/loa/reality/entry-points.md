# Entry Points

> Generated 2026-05-07.

## Main files

| File | Role |
|------|------|
| `app/layout.tsx:20` | `RootLayout` — root HTML shell, font wiring |
| `app/page.tsx:12` | `Home` — `/` route, design-system showcase |
| `app/globals.css` | Design tokens loaded into `RootLayout` via `import "./globals.css"` |

## CLI commands (`package.json:5–10`)

| Command | Action |
|---------|--------|
| `pnpm dev` | `next dev` — Turbopack dev server |
| `pnpm build` | `next build` |
| `pnpm start` | `next start` |
| `pnpm lint` | `eslint` |

## Environment requirements

**None.** No env vars referenced anywhere in app code. No `.env*` files in repo.

## Runtime

- Node: implied by `@types/node: ^20`
- Browser: modern (Tailwind 4 + OKLCH require recent engines)
- Reduced-motion + dark-mode respected via media queries (`app/globals.css:301, 548`)

## First page-load asset path

1. `RootLayout` loads `inter` + `geistMono` via `next/font/google` (`app/layout.tsx:5–13`)
2. `RootLayout` imports `./globals.css` which pulls FOT-Yuruka Std + ZCOOL KuaiLe from `/public/fonts/`
3. `Home` renders, importing puruhani + jani PNGs from `/public/art/`
4. Brand wordmark loads from `/public/brand/purupuru-wordmark.svg`
