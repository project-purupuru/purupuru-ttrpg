"use client";

/**
 * BattleField — the spatial arena where lineups face off. FR-3.
 *
 * Renders the 5 element territories (Wuxing pentagram-ish layout per
 * lib/honeycomb/battlefield-geometry.ts), the player + opponent rows,
 * and the inline CombosPanel (FR-23 · per game-design canon "you feel
 * who's winning by the animated flow of element energy").
 *
 * Reads from useMatch() · subscribes to phase changes for visual states.
 */

import { motion } from "motion/react";
import {
  BATTLEFIELD_EDGES,
  lineupSlotCenter,
  TERRITORY_CENTERS,
} from "@/lib/honeycomb/battlefield-geometry";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import type { MatchSnapshot } from "@/lib/honeycomb/match.port";
import { useMatch } from "@/lib/runtime/match.client";
import { BattleHand } from "./BattleHand";
import { CombosPanel } from "./CombosPanel";
import { OpponentZone } from "./OpponentZone";
import { ELEMENT_TINT_BG, ELEMENT_TINT_FROM } from "./_element-classes";

const ELEMENTS: readonly Element[] = ["wood", "fire", "earth", "metal", "water"];

export function BattleField() {
  const snap = useMatch();
  if (!snap) return <BattleFieldShell />;

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl bg-puru-cloud-bright/40 shadow-puru-tile"
      style={{ aspectRatio: "16/10", minHeight: "60dvh" }}
      data-phase={snap.phase}
    >
      {/* Territory backdrops — one element zone each */}
      {ELEMENTS.map((el) => (
        <TerritoryZone key={el} element={el} active={snap.weather === el} />
      ))}

      {/* Opponent (face-down until clash) */}
      <div className="absolute top-[4%] left-1/2 -translate-x-1/2 w-[85%]">
        <OpponentZone lineup={snap.p2Lineup} phase={snap.phase} />
      </div>

      {/* Combo overlay — inline per FR-23 */}
      <div className="absolute right-[4%] top-[4%] w-[24%]">
        <CombosPanel combos={snap.p1Combos} summary={comboSummary(snap)} />
      </div>

      {/* Player hand (BattleHand · FR-4) */}
      <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[92%]">
        <BattleHand lineup={snap.p1Lineup} phase={snap.phase} weather={snap.weather} />
      </div>

      {/* Edge VFX layer — clash phase only */}
      {snap.phase === "clashing" && <EdgeFlash weather={snap.weather} />}
    </section>
  );
}

function BattleFieldShell() {
  return (
    <section
      className="relative w-full rounded-3xl bg-puru-cloud-bright/40 shadow-puru-tile grid place-items-center"
      style={{ minHeight: "60dvh" }}
    >
      <p className="text-puru-ink-soft text-sm font-puru-body">arena warming…</p>
    </section>
  );
}

function TerritoryZone({
  element,
  active,
}: {
  readonly element: Element;
  readonly active: boolean;
}) {
  const center = TERRITORY_CENTERS[element];
  return (
    <motion.div
      aria-hidden
      className={`absolute rounded-full pointer-events-none ${ELEMENT_TINT_BG[element]}`}
      style={{
        left: `${center.x - 14}%`,
        top: `${center.y - 14}%`,
        width: "28%",
        height: "28%",
        opacity: active ? 0.55 : 0.25,
      }}
      animate={{ scale: active ? [1, 1.04, 1] : 1 }}
      transition={{ duration: 6, repeat: active ? Infinity : 0, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-2xl font-puru-display text-puru-ink-rich/40">
          {ELEMENT_META[element].kanji}
        </span>
      </div>
    </motion.div>
  );
}

function EdgeFlash({ weather }: { readonly weather: Element }) {
  return (
    <div
      aria-hidden
      className={`absolute inset-0 pointer-events-none bg-gradient-to-tr ${ELEMENT_TINT_FROM[weather]} to-transparent`}
      style={{ opacity: 0.4 }}
    />
  );
}

function comboSummary(snap: MatchSnapshot): { count: number; totalBonus: number } {
  const totalBonus = snap.p1Combos.reduce((s, c) => s + c.bonus * c.affected.length, 0);
  return { count: snap.p1Combos.length, totalBonus };
}

// Type-only re-export to silence "unused import" warnings if the snapshot
// type narrows in the future.
export type _BattleFieldSnapshot = MatchSnapshot;

// Edges (BATTLEFIELD_EDGES) reserved for future VFX boundary work
void BATTLEFIELD_EDGES;
void lineupSlotCenter;
