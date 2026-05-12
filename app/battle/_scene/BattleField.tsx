"use client";

/**
 * BattleField — 1:1 port of world-purupuru BattleField.svelte.
 *
 * Layered map: detailed (entry) or flat (arena backdrop) · 5 territory
 * overlays · color-temperature · tide overlay · arena room (backdrop only) ·
 * ripple + spark VFX + hitstop flash. All styling lives in
 * app/battle/_styles/BattleField.css and applies via class names.
 */

import { TERRITORY_CENTERS } from "@/lib/honeycomb/battlefield-geometry";
import type { Element } from "@/lib/honeycomb/wuxing";

export type BattleFieldAnimState = "idle" | "golden-hold" | "hitstop";
export type BattleFieldPhase = "selection" | "playing" | "result";

interface BattleFieldProps {
  readonly energies: Record<Element, number>;
  readonly turnElement: Element;
  readonly tide: number;
  readonly animState: BattleFieldAnimState;
  readonly phase: BattleFieldPhase;
  readonly weather: Element;
  readonly lastPlayed?: Element | null;
  readonly lastGenerated?: Element | null;
  readonly lastOvercome?: Element | null;
  readonly backdrop?: boolean;
  readonly arenaPhase?: string;
}

const DETAILED_MAP_URL = "/art/tsuheji-map.png";
const FLAT_MAP_URL = "/art/tsuheji-map.png";

export function BattleField({
  energies,
  turnElement,
  tide,
  animState,
  weather,
  backdrop = false,
  arenaPhase = "",
}: BattleFieldProps) {
  const tideNormal = tide / 100;

  const wrapperCls = ["battlefield", backdrop && "backdrop", animState === "hitstop" && "hitstop"]
    .filter(Boolean)
    .join(" ");

  // Sparks/ripple are reserved for golden-hold transitions; the substrate
  // doesn't yet stream lastPlayed/lastGenerated/lastOvercome through Match.
  // The DOM hooks remain so wiring later is a no-op.

  return (
    <div
      className={wrapperCls}
      data-arena-phase={arenaPhase}
      data-weather={weather}
      style={
        {
          "--e-wood": energies.wood,
          "--e-fire": energies.fire,
          "--e-earth": energies.earth,
          "--e-metal": energies.metal,
          "--e-water": energies.water,
          "--tide-n": tideNormal,
        } as React.CSSProperties
      }
    >
      {backdrop ? (
        <img className="map-flat" src={FLAT_MAP_URL} alt="" aria-hidden draggable={false} />
      ) : (
        <img className="map-detailed" src={DETAILED_MAP_URL} alt="Tsuheji continent" draggable={false} />
      )}

      <div className={`territory territory-wood${energies.wood > 0.35 ? " energized" : ""}`} />
      <div className={`territory territory-fire${energies.fire > 0.35 ? " energized" : ""}`} />
      <div className={`territory territory-earth${energies.earth > 0.35 ? " energized" : ""}`} />
      <div className={`territory territory-metal${energies.metal > 0.35 ? " energized" : ""}`} />
      <div className={`territory territory-water${energies.water > 0.35 ? " energized" : ""}`} />

      <div className="temperature" data-element={turnElement} />
      <div className="tide-overlay" />

      {backdrop && (
        <>
          <div className="arena-walls" />
          <div className="arena-canopy" />
        </>
      )}

      {animState === "hitstop" && <div className="hitstop-flash" />}
    </div>
  );
}

// Keep import non-stale; TERRITORY_CENTERS is reserved for future spark wiring.
void TERRITORY_CENTERS;
