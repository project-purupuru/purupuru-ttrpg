"use client";

/**
 * BattleScene — 1:1 fidelity port of world-purupuru's lib/scenes/BattleScene.svelte.
 *
 * Routes on MatchPhase to render screens with matching DOM/classes/data-attrs
 * from world-purupuru's battle/ Svelte components. All CSS lives in
 * app/battle/_styles/battle.css and applies via class names directly.
 *
 * Dev tooling (KaironicPanel · DevConsole) lives in app/battle/_inspect/.
 */

import { matchCommand, useMatch } from "@/lib/runtime/match.client";
import type { Element } from "@/lib/honeycomb/wuxing";
import { ArenaSpeakers } from "./ArenaSpeakers";
import { BattleField } from "./BattleField";
import { BattleHand } from "./BattleHand";
import { ElementQuiz } from "./ElementQuiz";
import { EntryScreen } from "./EntryScreen";
import { Guide } from "./Guide";
import { OpponentZone } from "./OpponentZone";
import { ResultScreen } from "./ResultScreen";
import { TurnClock } from "./TurnClock";

import "../_styles/battle.css";

export function BattleScene() {
  const snap = useMatch();

  if (!snap) {
    return (
      <div className="battle-scene" data-scene="battle">
        <p className="loading-pill">honeycomb warming…</p>
      </div>
    );
  }

  // Map MatchPhase → world-purupuru's BattleScene visibility logic.
  const showQuiz = snap.phase === "entry" && snap.playerElement === null;
  const showEntry = snap.phase === "idle" || (snap.phase === "entry" && snap.playerElement !== null);
  const inArena = ["select", "arrange", "committed", "clashing", "disintegrating", "between-rounds"].includes(
    snap.phase,
  );
  const showResult = snap.phase === "result";

  // Derive world-purupuru-style props from Match snapshot.
  // energies: per-element 0..1 derived from collection composition + lineup.
  const energies = deriveEnergies(snap);
  const turnElement = snap.weather;
  // tide drifts toward the side that's winning clashes
  const tideDelta = snap.playerClashWins - snap.opponentClashWins;
  const tide = Math.max(0, Math.min(100, 50 + tideDelta * 12));
  const arenaPhase =
    snap.phase === "arrange" || snap.phase === "between-rounds"
      ? "rearrange"
      : snap.phase === "clashing" || snap.phase === "disintegrating"
        ? "clashing"
        : snap.phase === "result"
          ? "result"
          : "locked";

  // Build per-position clash-winner map for OpponentZone (uses visibleClashIdx range).
  const clashWinners = new Map<number, "player" | "opponent">();
  for (let i = 0; i <= snap.visibleClashIdx; i++) {
    const c = snap.clashSequence[i];
    if (!c) continue;
    if (c.loser === "p2") clashWinners.set(c.p2Card.position, "player");
    else if (c.loser === "p1") clashWinners.set(c.p1Card.position, "opponent");
  }

  const canLockIn = snap.phase === "arrange" || snap.phase === "between-rounds";

  return (
    <div className="battle-scene" data-scene="battle" aria-label="The Tide">
      {showQuiz && (
        <div className="quiz-wrapper">
          <ElementQuiz />
        </div>
      )}

      {showEntry && (
        <div className="entry-wrapper">
          <EntryScreen
            weather={snap.weather}
            quizElement={snap.playerElement}
            seed={snap.seed}
          />
        </div>
      )}

      {inArena && (
        <div className="battle-wrapper mounted">
          <BattleField
            energies={energies}
            turnElement={turnElement}
            tide={tide}
            animState={snap.animState}
            phase={mapToFieldPhase(snap.phase)}
            weather={snap.weather}
            backdrop
            arenaPhase={arenaPhase}
            lastPlayed={snap.lastPlayed}
            lastGenerated={snap.lastGenerated}
            lastOvercome={snap.lastOvercome}
          />

          <OpponentZone
            lineup={snap.p2Lineup}
            arenaPhase={arenaPhase}
            opponentElement={snap.opponentElement}
            visibleClashIdx={snap.visibleClashIdx}
            activeClashPhase={snap.activeClashPhase}
            clashWinners={clashWinners}
            stamps={new Set(snap.stamps)}
            dying={new Set(snap.dyingP2)}
          />

          <ArenaSpeakers
            playerElement={snap.playerElement ?? snap.weather}
            opponentElement={snap.opponentElement}
            phase={snap.phase}
            whisper={snap.lastWhisper}
            playerWins={snap.playerClashWins}
            opponentWins={snap.opponentClashWins}
            activeClashPhase={snap.activeClashPhase}
          />

          <BattleHand
            cards={snap.p1Lineup}
            phase={snap.phase}
            turnElement={turnElement}
            selectedIndex={snap.selectedIndex}
            stamps={new Set(snap.stamps)}
            dying={new Set(snap.dyingP1)}
            onTap={matchCommand.tapPosition}
            onSwap={matchCommand.swapPositions}
          />

          {canLockIn && (
            <button
              type="button"
              className="battle-lock-btn"
              onClick={() => matchCommand.lockIn()}
            >
              Lock in
            </button>
          )}
        </div>
      )}

      {showResult && (
        <div className="result-wrapper">
          <ResultScreen
            winner={snap.winner}
            weather={snap.weather}
            opponentElement={snap.opponentElement}
            playerElement={snap.playerElement}
            rounds={snap.rounds}
          />
        </div>
      )}

      {/* TurnClock floats above the arena */}
      {inArena && <TurnClock turnElement={turnElement} weather={snap.weather} />}

      {/* Guide overlay (tutorial / hints) */}
      <Guide />
    </div>
  );
}

/** Derive per-element energy 0..1 from p1Lineup composition. Stand-in until
 * Match service exposes actual energies tied to card-play history. */
function deriveEnergies(snap: import("@/lib/honeycomb/match.port").MatchSnapshot): Record<Element, number> {
  const base: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const c of snap.p1Lineup) base[c.element] += 0.2;
  // Combo-active elements get a boost
  for (const combo of snap.p1Combos) {
    for (const pos of combo.positions) {
      const card = snap.p1Lineup[pos];
      if (card) base[card.element] = Math.min(1, base[card.element] + 0.1);
    }
  }
  return base;
}

function mapToFieldPhase(
  phase: import("@/lib/honeycomb/match.port").MatchPhase,
): "selection" | "playing" | "result" {
  if (phase === "result") return "result";
  if (phase === "select" || phase === "arrange" || phase === "between-rounds") return "selection";
  return "playing";
}
