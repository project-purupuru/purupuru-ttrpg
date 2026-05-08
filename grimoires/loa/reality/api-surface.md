# API Surface

> Public functions, exports, and routes. Generated 2026-05-07 from code.

## Page Routes

| Route | File:Line | Component |
|-------|-----------|-----------|
| `/` | `app/page.tsx:12` | `Home` (default export, server component) |

No `app/api/`, no route handlers, no middleware, no server actions.

## Library Exports

### `lib/score/index.ts`

```ts
export type {
  Element, ElementDistribution, EcosystemEnergy, ScoreReadAdapter,
  Wallet, WalletBadge, WalletProfile, WalletSignals
} from "./types";
export { ELEMENTS } from "./types";
export { mockScoreAdapter } from "./mock";
export const scoreAdapter: ScoreReadAdapter = mockScoreAdapter;
```
Source: `lib/score/index.ts:1–17`. **The binding line at L17 is the swap point** — replace `mockScoreAdapter` to wire a real backend.

### `lib/score/mock.ts`

```ts
export const mockScoreAdapter: ScoreReadAdapter = {
  async getWalletProfile(address: Wallet): Promise<WalletProfile | null>;
  async getWalletBadges(address: Wallet): Promise<WalletBadge[]>;
  async getWalletSignals(address: Wallet): Promise<WalletSignals | null>;
  async getElementDistribution(): Promise<ElementDistribution>;
  async getEcosystemEnergy(): Promise<EcosystemEnergy>;
}
```
Source: `lib/score/mock.ts:33–82`. Deterministic — every method seeds from `hash(address)` so identical inputs return identical outputs.

Internal helpers (not exported):
- `pick<T>(arr: readonly T[], seed: number): T` — `lib/score/mock.ts:13–15`
- `hash(s: string): number` — `lib/score/mock.ts:17–21`
- `affinity(seed: number): Record<Element, number>` — `lib/score/mock.ts:23–31`

### `lib/utils.ts`

```ts
export function cn(...inputs: ClassValue[]): string;
```
Source: `lib/utils.ts:1–6`. Returns `twMerge(clsx(inputs))`.

## React Components

### `Home` (default export)
File: `app/page.tsx:12`
Server component. Renders the kit landing page: wordmark, wuxing roster (5 puruhani sprites), typography scale, jani sister roster, kit-contents list.

### `RootLayout` (default export)
File: `app/layout.tsx:20`
Server component. Wires Inter + Geist Mono via `next/font/google`. Sets `html.lang="en"`, `body.font-puru-body`.

### `metadata` (named export)
File: `app/layout.tsx:15–18`
```ts
export const metadata: Metadata = {
  title: "purupuru observatory",
  description: "live awareness layer — on-chain + IRL fused through wuxing",
};
```

## Constants

| Constant | Value | File |
|----------|-------|------|
| `ELEMENTS` | `["wood", "fire", "earth", "water", "metal"] as const` | `lib/score/types.ts:8` |
| `ELEMENT_LABEL` | `Record<Element, { jp: string; en: string }>` | `app/page.tsx:4–10` |
