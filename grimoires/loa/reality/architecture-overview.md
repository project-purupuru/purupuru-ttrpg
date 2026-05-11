# Architecture Overview · 2026-05-11

> One-page system topology for `/reality` agent consumption. Built from code + PRD r6 + SDD r2.

## The Two Layers (substrate vs presentation)

```
PRESENTATION LAYER · agents present, never mutate
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │ Twitter Blink│  │ Telegram (*) │  │ Web Observatory│
  │   /api/      │  │  /api/       │  │  app/page.tsx  │
  │   actions/*  │  │  actions/*   │  │  (zerker/main) │
  └──────┬───────┘  └──────┬───────┘  └──────┬─────────┘
         │   READ-ONLY · agents present, never mutate    │
         ▼                ▼                    ▼
SUBSTRATE TRUTH · single source of authority
  ┌────────────────────────────────────────────────────┐
  │ Solana devnet                                       │
  │   · purupuru_anchor program (claim_genesis_stone)   │
  │   · Metaplex Token Metadata CPI (NFT mint)          │
  │   · StoneClaimed events                             │
  └────────────────────────────────────────────────────┘
  ┌────────────────────────────────────────────────────┐
  │ Off-chain primitives                                │
  │   · @purupuru/peripheral-events (HMAC + Effect Schema)│
  │   · Vercel KV nonce store (NX EX 300)               │
  │   · Sponsored-payer keypair                          │
  └────────────────────────────────────────────────────┘
```

(*) Telegram = untested · structurally compatible · same Action endpoints.

## Tech Stack (verified vs package.json)

- Next.js 16.2.6 (Turbopack · App Router)
- React 19.2.4 · TypeScript 5
- Tailwind 4 (`@tailwindcss/postcss`) · OKLCH palette
- Pixi.js v8 (vanilla · no `@pixi/react`)
- motion (UI animation only · not canvas)
- Effect 3.10.x (`Schema` for substrate validation)
- Anchor 0.31.1 + Rust + Metaplex Token Metadata
- `@solana/web3.js` ^1.95.0 · `@coral-xyz/anchor` ^0.31.1
- `@vercel/kv` ^3.0.0
- `@dialectlabs/blinks` ^0.22.5 (preview only)
- `@solana/wallet-adapter-{phantom,react,react-ui}`
- `bs58`, `tweetnacl`, `node:crypto`
- Vitest 3.x + Playwright 1.59 + Testing Library

## Data Flow per User Action

| User action | Substrate write | Presentation read |
|-------------|-----------------|--------------------|
| Take quiz Q1-Q8 | none — HMAC-sealed URL state only | none |
| Reach reveal | none — server recomputes archetype from validated answers | reveal card · stone PNG · aggregate ("23 others share today") |
| Click "Claim Your Stone" | Anchor `claim_genesis_stone` ix → Metaplex CPI → SPL mint + metadata PDA · `StoneClaimed` event emitted | Phantom shows new NFT in collectibles |
| Indexer consumes event | none | observatory rail row appears · KPI ticks |

## Three-Keypair Model (per SDD r2 §6.1 + lib.rs:25-29)

| Keypair | Purpose | Authority |
|---------|---------|-----------|
| `sponsored-payer` | pays tx fees · separate Solana keypair | NO authority over mint |
| `claim-signer` | ed25519 keypair · signs ClaimMessage · pubkey hardcoded in `lib.rs` | Signs the canonical 98-byte payload |
| user wallet | Phantom · the actual mint authority | Receives the NFT |

## Module Boundaries

| Module | Type | Owner |
|--------|------|-------|
| `packages/peripheral-events/` | substrate (L2 sealed) | zksoju |
| `packages/medium-blink/` | renderer (L3 pure functions) | zksoju + Gumi (voice) |
| `packages/world-sources/` | read-adapter (mock) | zksoju · zerker (real) |
| `programs/purupuru-anchor/` | on-chain | zksoju |
| `app/api/actions/` | HTTP layer | zksoju |
| `lib/blink/` | server-side mint helpers | zksoju |
| `app/page.tsx` + `components/observatory/` | observatory UI | zerker (main branch) |
| `lib/{score,activity,weather,celestial,sim}/` | observatory data sources | shared |

## Validation at Every Boundary

- HTTP → server: Effect Schema decode/encode roundtrip on URL state
- Server → on-chain: ed25519 sig verify via instructions sysvar (verify-via-sysvar pattern)
- KV nonce: NX EX 300 atomic claim (replay-safe)
- On-chain → indexer: `StoneClaimed` event emission with stable schema
- Indexer → observatory: read-only WebSocket / SSE feed

## Architecture Doctrines

- **substrate truth ≠ presentation** — README + separation-of-concerns.md
- **schemas describe shape; contracts include behavior + invariants** — `~/vault/wiki/concepts/schema-is-not-the-contract.md`
- **mibera-as-npc §6.1** — "no payment via LLM verdicts · no session keys"
- **chat-medium-presentation-boundary** — vault doctrine (substrate truth → presentation translation)

## Hackathon-Honest Mocking (per README "What's mocked vs real")

| Layer | Real | Mocked |
|-------|------|--------|
| Anchor program · mint · stone art · quiz illustrations | ✅ | — |
| HMAC quiz state · sponsored-payer · KV nonce | ✅ | — |
| Score adapter · observatory KPI feeds | 🟡 interface | mock |
| `StoneClaimed` indexer (zerker · `project-purupuru/radar`) | 🔴 | — |
| Web auth · profile claim · cross-platform Telegram | 🔴 / 🟡 | — |
| `BLINK_DESCRIPTOR` upstream PR to freeside-mediums | 🔴 | — |

## Sister Repos (referenced)

- `project-purupuru/radar` — Solana indexer + StoneClaimed consumer (zerker)
- `freeside-mediums` — `BLINK_DESCRIPTOR` upstream (deferred PR)
- `project-purupuru/game` — game logic (parallel codex+gumi pair)
