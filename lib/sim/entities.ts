/**
 * Puruhani entity registry — seed an idle population at affinity-weighted positions.
 * v0.1: deterministic, breath-driven, no migration. Sprint 2 wires action grammars.
 */

import type { Element, ScoreReadAdapter, Wallet } from "@/lib/score";
import { ELEMENTS } from "@/lib/score";
import type { PentagramGeometry, Puruhani } from "./types";

export const OBSERVATORY_SPRITE_COUNT = 1000;

const BREATH_SECONDS: Record<Element, number> = {
  wood: 6,
  fire: 4,
  earth: 7,
  water: 5,
  metal: 8,
};

export function breathPeriodMs(element: Element): number {
  return BREATH_SECONDS[element] * 1000;
}

function syntheticAddress(seed: number): Wallet {
  const hex = Math.abs(seed).toString(16).padStart(8, "0");
  return `0x${hex}${hex}${hex}${hex}${hex}`;
}

function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function ulid(prefix: string, i: number): string {
  return `${prefix}-${i.toString(36).padStart(6, "0")}`;
}

export async function seedPopulation(
  n: number,
  scoreAdapter: ScoreReadAdapter,
  geometry: PentagramGeometry,
): Promise<Puruhani[]> {
  const distribution = await scoreAdapter.getElementDistribution();
  const total = ELEMENTS.reduce((sum, el) => sum + distribution[el], 0);

  const elementBuckets: Element[] = [];
  for (const el of ELEMENTS) {
    const count = Math.max(1, Math.round((distribution[el] / total) * n));
    for (let i = 0; i < count; i++) elementBuckets.push(el);
  }
  while (elementBuckets.length < n) elementBuckets.push("fire");
  elementBuckets.length = n;

  const entities: Puruhani[] = [];
  for (let i = 0; i < n; i++) {
    const trader = syntheticAddress(i + 1);
    const profile = await scoreAdapter.getWalletProfile(trader);
    const primaryElement = elementBuckets[i];
    const affinity = profile?.elementAffinity ?? {
      wood: 20, fire: 20, earth: 20, water: 20, metal: 20,
    };
    const resting = geometry.affinityBlend(affinity);
    const phaseRng = rng(i + 13);
    entities.push({
      id: ulid("p", i),
      trader,
      primaryElement,
      affinity,
      position: { ...resting },
      velocity: { x: 0, y: 0 },
      state: "idle",
      breath_phase: phaseRng(),
      resting_position: { ...resting },
    });
  }
  return entities;
}

export function advanceBreath(entity: Puruhani, dtMs: number): void {
  const period = breathPeriodMs(entity.primaryElement);
  entity.breath_phase = (entity.breath_phase + dtMs / period) % 1;
}
