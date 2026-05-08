/**
 * Puruhani entity registry — seed an idle population in 5 element zones.
 *
 * Position model: each sprite sits in a "zone" around its primaryElement
 * vertex with jitter, plus a small pull toward its secondary element.
 * This produces 5 distinct visible clusters (the wuxing diagram reading)
 * rather than a center-of-mass collapse from pure affinityBlend.
 */

import type { Element, ScoreReadAdapter, Wallet } from "@/lib/score";
import { ELEMENTS } from "@/lib/score";
import type { PentagramGeometry, Puruhani, Vec2 } from "./types";

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

export function syntheticAddress(seed: number): Wallet {
  // Spread the seed across 40 hex chars via 5 independent multiplicative
  // hashes (Knuth-style large-prime mixers). Deterministic so the
  // activity stream's actor IDs round-trip to the same entity sprites,
  // but visually each address looks like a real Ethereum-style wallet
  // (no leading-zero pile-up at the start).
  const mix = (n: number, prime: number) =>
    ((Math.abs(n) * prime) >>> 0).toString(16).padStart(8, "0");
  return (
    "0x" +
    mix(seed, 2654435761) +
    mix(seed, 1597334677) +
    mix(seed, 3266489917) +
    mix(seed, 374761393) +
    mix(seed, 668265263)
  );
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

function topSecondary(
  affinity: Record<Element, number>,
  primary: Element,
): { element: Element; weight: number } {
  let best: Element = primary;
  let bestVal = -1;
  for (const el of ELEMENTS) {
    if (el === primary) continue;
    if (affinity[el] > bestVal) {
      bestVal = affinity[el];
      best = el;
    }
  }
  const total = ELEMENTS.reduce((s, el) => s + affinity[el], 0);
  return { element: best, weight: total > 0 ? bestVal / total : 0 };
}

function zoneOffset(rngFn: () => number, zoneRadius: number): Vec2 {
  // Uniform random point in a disk: r = R*sqrt(u), θ = 2π*v
  const r = zoneRadius * Math.sqrt(rngFn());
  const t = 2 * Math.PI * rngFn();
  return { x: r * Math.cos(t), y: r * Math.sin(t) };
}

export function restingPositionFor(
  primary: Element,
  affinity: Record<Element, number>,
  geometry: PentagramGeometry,
  rngFn: () => number,
): Vec2 {
  const primaryV = geometry.vertex(primary);
  const zone = geometry.radius * 0.2;
  const jitter = zoneOffset(rngFn, zone);
  const sec = topSecondary(affinity, primary);
  const secV = geometry.vertex(sec.element);
  // Pull toward secondary, capped — typical secondary weight is 0.15-0.25,
  // so multiplier 0.6 gives a 9-15% pull which reads as drift without
  // breaking the cluster identity.
  const pull = Math.min(sec.weight, 0.4) * 0.6;
  return {
    x: primaryV.x + jitter.x + pull * (secV.x - primaryV.x),
    y: primaryV.y + jitter.y + pull * (secV.y - primaryV.y),
  };
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
    const positionRng = rng(i + 1009);
    const resting = restingPositionFor(primaryElement, affinity, geometry, positionRng);
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
