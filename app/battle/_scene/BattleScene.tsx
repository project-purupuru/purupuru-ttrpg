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

import { useMatch } from "@/lib/runtime/match.client";
import type { Element } from "@/lib/honeycomb/wuxing";
import { whisper as deriveWhisper, type WhisperMood } from "@/lib/honeycomb/whispers";
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
  const tide = 50; // neutral · TODO derive from clash deltas when wired
  const animState: "idle" | "golden-hold" | "hitstop" =
    snap.phase === "clashing" ? "hitstop" : snap.phase === "disintegrating" ? "golden-hold" : "idle";
  const arenaPhase =
    snap.phase === "arrange" || snap.phase === "between-rounds"
      ? "rearrange"
      : snap.phase === "clashing" || snap.phase === "disintegrating"
        ? "clashing"
        : snap.phase === "result"
          ? "result"
          : "locked";

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
            animState={animState}
            phase={mapToFieldPhase(snap.phase)}
            weather={snap.weather}
            backdrop
            arenaPhase={arenaPhase}
          />

          <OpponentZone
            lineup={snap.p2Lineup}
            arenaPhase={arenaPhase}
            opponentElement={snap.opponentElement}
          />

          <ArenaSpeakers
            playerElement={snap.playerElement ?? snap.weather}
            opponentElement={snap.opponentElement}
            phase={snap.phase}
            whisper={currentWhisper(snap)}
          />

          <BattleHand
            cards={snap.p1Lineup}
            phase={snap.phase}
            turnElement={turnElement}
          />
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

function currentWhisper(snap: import("@/lib/honeycomb/match.port").MatchSnapshot): string | null {
  const last = snap.rounds.at(-1);
  if (!last) return null;
  const lastClash = last.clashes.at(-1);
  if (!lastClash) return null;
  const playerEl = snap.playerElement ?? snap.weather;
  const mood: WhisperMood =
    lastClash.loser === "draw" ? "draw" : lastClash.loser === "p2" ? "win" : "lose";
  return deriveWhisper(playerEl, mood, last.round);
}

function mapToFieldPhase(
  phase: import("@/lib/honeycomb/match.port").MatchPhase,
): "selection" | "playing" | "result" {
  if (phase === "result") return "result";
  if (phase === "select" || phase === "arrange" || phase === "between-rounds") return "selection";
  return "playing";
}
