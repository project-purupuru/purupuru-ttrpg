/**
 * Score domain types — read-side contract for the behavioral intelligence layer.
 * Bronze → Silver → Gold pipeline. The hackathon build mocks this read-side;
 * see ./mock.ts for the deterministic stub.
 */

export type Element = "wood" | "fire" | "earth" | "water" | "metal";
export const ELEMENTS: readonly Element[] = ["wood", "fire", "earth", "water", "metal"] as const;

export type Wallet = string;

export interface WalletProfile {
  trader: Wallet;
  primaryElement: Element;
  elementAffinity: Record<Element, number>;
  trustScore: number;
  joinedAt: string;
  lastActiveAt: string;
}

export interface WalletBadge {
  trader: Wallet;
  badgeId: string;
  earnedAt: string;
  tier?: "bronze" | "silver" | "gold";
}

export interface WalletSignals {
  trader: Wallet;
  velocity: number;
  diversity: number;
  resonance: number;
  sampledAt: string;
}

export type ElementDistribution = Record<Element, number>;

export type EcosystemEnergy = Record<string, number>;

export interface ScoreReadAdapter {
  getWalletProfile(address: Wallet): Promise<WalletProfile | null>;
  getWalletBadges(address: Wallet): Promise<WalletBadge[]>;
  getWalletSignals(address: Wallet): Promise<WalletSignals | null>;
  getElementDistribution(): Promise<ElementDistribution>;
  getEcosystemEnergy(): Promise<EcosystemEnergy>;
}
