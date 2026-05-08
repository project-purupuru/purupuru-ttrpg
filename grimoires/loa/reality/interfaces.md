# External Interfaces

> Generated 2026-05-07. Lists every shape that crosses a "system boundary" (real or future).

## Active interfaces

### Score read-adapter — MOCKED today

Status: bound to `mockScoreAdapter` at `lib/score/index.ts:17`.

The contract (`lib/score/types.ts:40–46`) is the boundary. Today the only implementation is the deterministic mock in `lib/score/mock.ts`. When a real Score endpoint becomes available, swap by editing one line.

Methods (all read-only, all return Promises):
- `getWalletProfile(address)` → `WalletProfile | null`
- `getWalletBadges(address)` → `WalletBadge[]`
- `getWalletSignals(address)` → `WalletSignals | null`
- `getElementDistribution()` → `ElementDistribution`
- `getEcosystemEnergy()` → `EcosystemEnergy`

### `next/font/google` — Inter + Geist Mono

`app/layout.tsx:5–13` requests Inter and Geist Mono at build time. Next.js fetches font files and self-hosts them. No env config required.

### Local `@font-face` — FOT-Yuruka Std + ZCOOL KuaiLe

`app/globals.css:8–23` declares two local font families served from `/public/fonts/`:
- `FOT-Yuruka Std` (woff2 + ttf fallback) — display brand
- `ZCOOL KuaiLe` (woff2) — CN display

## Future interfaces (not yet implemented)

### Synthetic on-chain action stream

[ASSUMPTION] Per `CLAUDE.md:42`, on-chain actions surface via a synthetic event stream. The likely shape:

```ts
interface ActionEvent {
  kind: "mint" | "attack" | "gift";   // the "tight 3"
  actor: Wallet;
  target?: Wallet;
  element?: Element;
  at: string;                          // ISO 8601
}

interface ActionStream {
  subscribe(cb: (e: ActionEvent) => void): () => void;
}
```

Source for action vocabulary: `NOTES.md` decision log 2026-05-07.

### Weather feed

[ASSUMPTION] Per `NOTES.md` decision log Q4, a mocked feed shaped like a real `WeatherFeed` adapter:

```ts
interface WeatherFeed {
  subscribe(cb: (s: WeatherState) => void): () => void;
}

interface WeatherState {
  temperature_c: number;
  precipitation: "clear" | "rain" | "snow" | "storm";
  cosmic_intensity: number;             // 0..1
  observed_at: string;
}
```

Mapping `WeatherState` → element-modulation (e.g., rain slows fire) is unresolved. See PRD F4.7 (movement model open question).

### Pixi mount surface

[ASSUMPTION] The first client island in the App Router. The boundary is the `<canvas>` mount inside a `"use client"` component, with cleanup in `useEffect`'s teardown. AGENTS.md cautions: verify against `node_modules/next/dist/docs/` before locking the pattern under Next 16.

## Network / outbound

| Outbound | When | Where |
|----------|------|-------|
| Google Fonts CDN | Build time | `app/layout.tsx:5–13` (next/font self-hosts after fetch) |

No runtime outbound calls today. The mock adapter resolves locally.

## Inbound

None. No API routes, no webhooks, no upload endpoints.
