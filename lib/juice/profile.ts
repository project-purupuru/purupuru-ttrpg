/**
 * Juice Profile — typed knob for the game's feel.
 *
 * Substrate ships timing/intensity constants here so we can dial the
 * whole game's "feel" without chasing CSS. Same pattern as the VFX
 * vocabulary: a typed registry, dumb consumers.
 *
 * Modes:
 *   "default"  — the baseline. Tuned for first-time-player legibility.
 *   "quiet"    — Neko Atsume mode. Reduced motion, softer impacts,
 *                ambient-first. For tired or repeat play.
 *   "loud"     — Balatro mode. Big bounces, longer hitstop, more
 *                particles. For demos and "feel the win" moments.
 *
 * Caller pattern:
 *
 *   import { juiceProfile } from "@/lib/juice/profile";
 *   const ms = juiceProfile.cardDealDelayMs(index);
 *
 * Today: a single immutable default. Future: read from localStorage,
 * driven by a settings UI ("Reduce motion" / "Cinematic mode").
 */

export type JuiceMode = "quiet" | "default" | "loud";

export interface JuiceProfile {
  readonly mode: JuiceMode;
  // ── Card-deal cascade (5 cards fly in when you pick an element) ──
  readonly cardDealMs: number;
  readonly cardDealStaggerMs: number;
  readonly cardDealOvershoot: number; // springy bounce strength
  // ── Hover lift on player cards ──
  readonly hoverLiftPx: number;
  // ── Selected ring (mid-swap) ──
  readonly selectedLiftPx: number;
  // ── Lock-in commitment ritual ──
  readonly lockInPressMs: number;
  readonly lockInFanCompactMs: number;
  readonly lockInOpponentFlipStaggerMs: number;
  // ── Clash impact ──
  readonly hitstopMs: number;
  readonly orbMaxScale: number;
  readonly orbSettleScale: number;
  readonly chromaticAberrationPx: number; // 0 = off
  // ── Disintegrate ──
  readonly disintegrateMs: number;
  // ── Combo discovery ceremony ──
  readonly discoveryHoldMs: number;
}

const DEFAULT_PROFILE: JuiceProfile = {
  mode: "default",
  cardDealMs: 560,
  cardDealStaggerMs: 90,
  cardDealOvershoot: 1.04,
  hoverLiftPx: 14,
  selectedLiftPx: 16,
  lockInPressMs: 200,
  lockInFanCompactMs: 320,
  lockInOpponentFlipStaggerMs: 80,
  hitstopMs: 166,
  orbMaxScale: 1.15,
  orbSettleScale: 1.0,
  chromaticAberrationPx: 1.5,
  disintegrateMs: 700,
  discoveryHoldMs: 600,
};

const QUIET_PROFILE: JuiceProfile = {
  ...DEFAULT_PROFILE,
  mode: "quiet",
  cardDealMs: 360,
  cardDealStaggerMs: 40,
  cardDealOvershoot: 1.0,
  hoverLiftPx: 8,
  selectedLiftPx: 10,
  lockInPressMs: 120,
  lockInFanCompactMs: 200,
  lockInOpponentFlipStaggerMs: 30,
  hitstopMs: 0, // no hitstop in quiet mode
  orbMaxScale: 1.0,
  chromaticAberrationPx: 0,
  discoveryHoldMs: 360,
};

const LOUD_PROFILE: JuiceProfile = {
  ...DEFAULT_PROFILE,
  mode: "loud",
  cardDealMs: 700,
  cardDealStaggerMs: 120,
  cardDealOvershoot: 1.1,
  hoverLiftPx: 20,
  selectedLiftPx: 24,
  lockInPressMs: 280,
  lockInFanCompactMs: 420,
  lockInOpponentFlipStaggerMs: 120,
  hitstopMs: 240,
  orbMaxScale: 1.3,
  chromaticAberrationPx: 3,
  discoveryHoldMs: 900,
};

const PROFILES: Record<JuiceMode, JuiceProfile> = {
  default: DEFAULT_PROFILE,
  quiet: QUIET_PROFILE,
  loud: LOUD_PROFILE,
};

export function getJuiceProfile(mode: JuiceMode = "default"): JuiceProfile {
  return PROFILES[mode];
}

// Ergonomic helpers used at call-sites.
export const juiceProfile = {
  current: DEFAULT_PROFILE,
  cardDealDelayMs(index: number, total: number): number {
    // Edges arrive last, center first — feels like "the dealer flicks the
    // middle to you first, then sweeps outward."
    const center = (total - 1) / 2;
    const distance = Math.abs(index - center);
    return Math.round(distance * this.current.cardDealStaggerMs);
  },
  setMode(mode: JuiceMode): void {
    this.current = PROFILES[mode];
  },
};
