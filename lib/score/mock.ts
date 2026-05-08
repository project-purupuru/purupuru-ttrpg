import type {
  Element,
  ElementDistribution,
  EcosystemEnergy,
  ScoreReadAdapter,
  Wallet,
  WalletBadge,
  WalletProfile,
  WalletSignals,
} from "./types";
import { ELEMENTS } from "./types";

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function affinity(seed: number): Record<Element, number> {
  const total = 100;
  const raw = ELEMENTS.map((_, i) => Math.abs(Math.sin(seed + i * 1.7)));
  const sum = raw.reduce((a, b) => a + b, 0);
  return ELEMENTS.reduce((acc, el, i) => {
    acc[el] = Math.round((raw[i] / sum) * total);
    return acc;
  }, {} as Record<Element, number>);
}

export const mockScoreAdapter: ScoreReadAdapter = {
  async getWalletProfile(address: Wallet): Promise<WalletProfile | null> {
    const seed = hash(address);
    return {
      trader: address.toLowerCase(),
      primaryElement: pick(ELEMENTS, seed),
      elementAffinity: affinity(seed),
      trustScore: 50 + (seed % 50),
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
  },

  async getWalletBadges(address: Wallet): Promise<WalletBadge[]> {
    const seed = hash(address);
    const count = 1 + (seed % 4);
    return Array.from({ length: count }, (_, i) => ({
      trader: address.toLowerCase(),
      badgeId: `badge-${(seed + i) % 10}`,
      earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i + 1)).toISOString(),
      tier: pick(["bronze", "silver", "gold"] as const, seed + i),
    }));
  },

  async getWalletSignals(address: Wallet): Promise<WalletSignals | null> {
    const seed = hash(address);
    return {
      trader: address.toLowerCase(),
      velocity: ((seed >> 1) % 100) / 100,
      diversity: ((seed >> 2) % 100) / 100,
      resonance: ((seed >> 3) % 100) / 100,
      sampledAt: new Date().toISOString(),
    };
  },

  async getElementDistribution(): Promise<ElementDistribution> {
    // Polyrhythmic sine drift — distribution shifts slowly so the
    // wuxing bar in the KPI strip feels alive across the demo.
    const t = Date.now() / 1000;
    return ELEMENTS.reduce((acc, el, i) => {
      acc[el] = 50 + Math.round(35 * Math.abs(Math.sin(i * 1.3 + t / 19)));
      return acc;
    }, {} as ElementDistribution);
  },

  async getEcosystemEnergy(): Promise<EcosystemEnergy> {
    // Polyrhythmic sines — periods chosen to avoid an obvious repeat
    // and to stay within plausible-looking value ranges.
    const t = Date.now() / 1000;
    return {
      total_active: Math.round(247 + 22 * Math.sin(t / 13) + 8 * Math.sin(t / 4.7)),
      cosmic_intensity: 0.62 + 0.09 * Math.sin(t / 23) + 0.04 * Math.sin(t / 7.3),
      cycle_balance:  0.78 + 0.07 * Math.sin(t / 31) + 0.03 * Math.sin(t / 11.1),
    };
  },
};
