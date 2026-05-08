# Type Definitions

> Generated 2026-05-07 from `lib/score/types.ts` and `app/page.tsx`.

## Score Domain (the contract)

Source: `lib/score/types.ts:7–46`

```ts
type Element = "wood" | "fire" | "earth" | "water" | "metal";
const ELEMENTS: readonly Element[] = ["wood", "fire", "earth", "water", "metal"] as const;

type Wallet = string;

interface WalletProfile {
  trader: Wallet;
  primaryElement: Element;
  elementAffinity: Record<Element, number>;  // mock: sums to ~100
  trustScore: number;                        // mock: 50–99
  joinedAt: string;                          // ISO 8601
  lastActiveAt: string;                      // ISO 8601
}

interface WalletBadge {
  trader: Wallet;
  badgeId: string;                           // mock: "badge-0" .. "badge-9"
  earnedAt: string;
  tier?: "bronze" | "silver" | "gold";
}

interface WalletSignals {
  trader: Wallet;
  velocity: number;                          // mock: 0..1
  diversity: number;                         // mock: 0..1
  resonance: number;                         // mock: 0..1
  sampledAt: string;
}

type ElementDistribution = Record<Element, number>;  // mock: 50..100 per element
type EcosystemEnergy = Record<string, number>;       // mock keys: total_active, cosmic_intensity, cycle_balance

interface ScoreReadAdapter {
  getWalletProfile(address: Wallet): Promise<WalletProfile | null>;
  getWalletBadges(address: Wallet): Promise<WalletBadge[]>;
  getWalletSignals(address: Wallet): Promise<WalletSignals | null>;
  getElementDistribution(): Promise<ElementDistribution>;
  getEcosystemEnergy(): Promise<EcosystemEnergy>;
}
```

## UI Domain (`app/page.tsx`)

```ts
const ELEMENT_LABEL: Record<Element, { jp: string; en: string }> = {
  wood:  { jp: "木", en: "Wood" },
  fire:  { jp: "火", en: "Fire" },
  earth: { jp: "土", en: "Earth" },
  water: { jp: "水", en: "Water" },
  metal: { jp: "金", en: "Metal" },
};
```
Source: `app/page.tsx:4–10`. Bilingual element labels.

## CSS Token Schema (`app/globals.css`)

Tokens are CSS custom properties under three theme contexts:

| Group | Pattern | Example |
|-------|---------|---------|
| Element shades | `--puru-{element}-{tint|pastel|dim|vivid}` | `--puru-fire-vivid: oklch(0.64 0.181 28.4)` |
| Cloud surfaces | `--puru-cloud-{bright|base|dim|deep|shadow}` | — |
| Ink | `--puru-ink-{rich|base|soft|dim|ghost}` | — |
| Honey accent | `--puru-honey-{bright|base|dim|tint}` | — |
| Terra accent | `--puru-terra-{bright|base|dim|tint}` | — |
| Sakura accent | `--puru-sakura-{bright|base|dim|tint}` | — |
| Card backs | `--puru-back-{deep|base|bright}` | — |
| Surfaces | `--puru-surface-{border|highlight|track|...}` | — |
| Ghost cards | `--puru-ghost-{border|bg|shadow|hint}` | — |
| Disabled | `--puru-disabled-{fg|bg}` | — |
| Easing | `--ease-puru-{in|out|bounce|settle|breathe|flow|emit|crack}` | — |
| Durations | `--duration-{press|tap|instant|fast|normal|slow|ritual|breathe|workshop}` | — |
| Pack ceremony | `--puru-dur-{snap|crack|can-reveal|pulse|emit|settle|pack-breathe}` | — |
| Breathing | `--breath-{wood|fire|earth|metal|water}` | `--breath-fire: 4s` |
| Fonts | `--font-puru-{body|display|card|cn|mono}` | — |
| Typography | `--text-{2xs|caption|xs|sm|base|lg|xl|2xl|3xl}` | All clamp()-based fluid scale |
| Line heights | `--leading-puru-{tight|normal|relaxed|loose}` | — |
| Radii | `--radius-{sm|md|lg|full}` (also `--radius-puru-*` aliases) | — |

Source: `app/globals.css:31–463`.

## TypeScript Configuration

Source: `tsconfig.json`
- `strict: true`
- `target: ES2017`
- `moduleResolution: bundler`
- `jsx: react-jsx`
- Path alias: `@/* → ./*`

## Public Material JSON Shape

Source: `public/data/materials/jani-fire.json` (representative; 18 files share this shape — currently inert in the build).

```jsonc
{
  "cardId": "string",
  "thicknessMap": "string",
  "normalMap": "string",
  "lod_levels": [],
  "foundry_approved": true,
  "cssBridgeTokens": [],
  "ecsPipeline": { "mode": "reserved", "note": "string" },
  "nodeGraph": { "version": "0.4", "labelDictionary": {}, "subgraphs": [], "nodes": [], "edges": [] },
  "adaptive_disclosure_hooks": { "placeholder": true, "cycle_activates": "string" }
}
```
