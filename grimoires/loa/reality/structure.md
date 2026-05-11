# Structure (Annotated)

> Generated 2026-05-10 · target: `compass` (symlink → `purupuru-ttrpg`) · 110 commits since 2026-05-07 ride
> Supersedes 2026-05-07 genesis snapshot.

```
compass/                                       # purupuru-ttrpg root
├── app/                                       # Next.js 16 App Router
│   ├── api/
│   │   ├── actions/                           # Solana Actions endpoints (Blinks)
│   │   │   ├── today/route.ts                 # ambient card
│   │   │   ├── quiz/{start,step,result}/      # 8-step quiz chain
│   │   │   └── mint/genesis-stone/route.ts    # POST mint · sponsored-payer · KV nonce
│   │   └── og/                                # OG card image route
│   ├── preview/                               # local Blink preview
│   ├── demo/                                  # X-faithful 3-column recording surface
│   ├── today/page.tsx                         # ambient landing
│   ├── quiz/page.tsx                          # quiz landing (direct-URL)
│   ├── kit/                                   # design kit / token playground
│   ├── asset-test/                            # asset URL probes
│   ├── opengraph-image.tsx                    # dynamic OG (1200×630)
│   ├── sitemap.ts                             # SEO sitemap
│   ├── page.tsx                               # observatory landing (zerker on main)
│   ├── layout.tsx                             # root layout · theme + fonts
│   └── globals.css                            # token-driven OKLCH palette
│
├── components/                                # React UI components
│   ├── blink/                                 # Blink-rendered surfaces
│   ├── observatory/                           # observatory dashboard tiles
│   ├── theme/                                 # theme switcher · day/night
│   ├── wallet/                                # Phantom wallet integration
│   └── world-purupuru/                        # Pixi.js world canvas wrappers
│
├── lib/                                       # Application libraries
│   ├── blink/
│   │   ├── anchor/                            # vendored IDL + typed Program client
│   │   ├── env-check.ts                       # mint-route env preflight
│   │   ├── nonce-store.ts                     # Vercel KV NX EX 300
│   │   ├── sponsored-payer.ts                 # backend keypair · partial-sign
│   │   └── __tests__/                         # blink unit tests
│   ├── activity/                              # activity rail data shaping
│   ├── audio/                                 # ambient audio · element underscores
│   ├── celestial/                             # sun/moon math · day/night
│   ├── ceremony/                              # stone migration animation logic
│   ├── score/                                 # Score read-adapter (mock + iface)
│   ├── seo/                                   # metadata helpers
│   ├── sim/                                   # observatory pixi sim primitives
│   ├── theme/                                 # token resolver · pre-paint
│   ├── time/                                  # time-ago · clock helpers
│   └── weather/                               # IRL weather → element mapping
│
├── packages/                                  # pnpm workspace packages
│   ├── peripheral-events/                     # @purupuru/peripheral-events — substrate
│   │   ├── src/                               # Effect Schema · HMAC · ClaimMessage
│   │   └── tests/                             # 50+ substrate tests
│   ├── medium-blink/                          # @purupuru/medium-blink — Blink renderer
│   │   ├── src/                               # quiz-renderer · voice-corpus · descriptor
│   │   └── tests/
│   └── world-sources/                         # @purupuru/world-sources — Score adapter
│       ├── src/                               # mock + interface
│       └── tests/
│
├── programs/
│   └── purupuru-anchor/                       # Rust + Anchor 0.31.1
│       ├── programs/purupuru-anchor/src/
│       │   └── lib.rs                         # claim_genesis_stone instruction
│       ├── tests/sp2-claim.ts                 # 6 invariant tests
│       └── target/                            # Cargo build artifacts (gitignored)
│
├── scripts/                                   # Bootstrap + smoke tests
│   ├── sp3-mint-route-smoke.ts                # local + production smoke
│   └── ...                                    # collection NFT bootstrap, spike scripts
│
├── public/                                    # Static assets
│   ├── art/quiz/q1..q8.png                    # 7 atmospheric scenes (q8=q1)
│   ├── art/stones/{element}.png               # 5 stone NFTs (Gumi-delivered)
│   ├── llms.txt                               # AI-readability surface
│   └── ...
│
├── docs/                                      # Vocs documentation site
├── evals/                                     # Eval suites (eval harness)
│   ├── tasks/  · suites/  · tests/  · graders/  · fixtures/
├── tests/                                     # Top-level test suites
│   ├── unit/  · integration/  · e2e/  · property/  · security/  · perf/
├── labs/                                      # Spike playground
├── tools/                                     # Repo tooling
├── fixtures/                                  # Shared fixtures
├── grimoires/                                 # Loa planning + audit + memory
│   ├── loa/                                   # PRD · SDD · drift · governance · NOTES
│   ├── pub/                                   # public-facing artifacts
│   ├── vocabulary/                            # lexicon.yaml
│   └── the-speakers/                          # voice corpus
├── .claude/                                   # Loa System Zone (NEVER edit)
├── .beads/                                    # Beads task tracking
├── .run/                                      # Run-mode + bridge state
├── .vercel/                                   # Vercel deploy artifacts
├── package.json                               # root workspace
├── pnpm-workspace.yaml                        # pnpm workspaces
├── pnpm-lock.yaml
├── next.config.ts                             # Next.js config (Turbopack)
├── playwright.config.ts                       # E2E config
├── eslint.config.mjs
├── postcss.config.mjs                         # Tailwind 4 · @tailwindcss/postcss
├── CLAUDE.md                                  # project AI guidance
├── README.md                                  # public README
├── INSTALLATION.md
├── CONTRIBUTING.md
├── LICENSE.md
├── BUTTERFREEZONE.md                          # token-efficient summary
├── PROCESS.md
├── AGENTS.md
├── CHANGELOG.md
└── .loa-version.json                          # framework version pin (v1.116.1)
```

## Module Responsibilities

| Module | Owner | Purpose |
|--------|-------|---------|
| `app/api/actions/` | substrate (zksoju) | Solana Actions endpoints — Blink protocol |
| `packages/peripheral-events/` | substrate | Effect Schema validation · HMAC · canonical encoding |
| `packages/medium-blink/` | substrate | Pure-functional Blink renderer · voice corpus |
| `packages/world-sources/` | substrate | Score read-adapter (currently mock) |
| `programs/purupuru-anchor/` | substrate | Rust Anchor program · claim_genesis_stone |
| `lib/blink/` | substrate | Server-side mint flow · sponsored-payer · nonce |
| `app/page.tsx` + `components/observatory/` | zerker (main branch) | Web observatory dashboard · Pixi.js canvas |
| `lib/{score,activity,weather,celestial}/` | shared | Observatory data sources |
| `app/demo/` | substrate (R5 ALEXANDER+ROSENZU) | X-faithful recording surface |
| `programs/purupuru-anchor/tests/` | substrate | 6 invariant tests · `anchor test` |
| `evals/` | shared | Eval harness for daemon/voice |
