"use client";

/**
 * BattleScene — Match-orchestrator surface (v2 · S2 rewrite).
 *
 * Routes on MatchPhase to render the appropriate screen:
 *   - idle           → EntryScreen splash
 *   - entry          → EntryScreen with begin CTA
 *   - quiz           → ElementQuiz (first-time only)
 *   - select         → CollectionGrid + BattleHand preview
 *   - arrange        → BattleField + BattleHand drag mode
 *   - committed      → BattleField locked
 *   - clashing       → BattleField with clash VFX
 *   - disintegrating → BattleField with 敗 stamps
 *   - between-rounds → BattleField rearrange mode
 *   - result         → ResultScreen
 *
 * Reads from useMatch() · dispatches via matchCommand · WhisperBubble
 * subscribes to the Match service (legacy WhisperBubble works via Battle;
 * S4 migrates to Match-derived ArenaSpeakers).
 *
 * Dev tooling (KaironicPanel · DevConsole) moved to app/battle/_inspect/
 * per S7 plan + flatline-r1 [[dev-tuning-separation]].
 */

import { motion, AnimatePresence } from "motion/react";
import { useMatch, matchCommand } from "@/lib/runtime/match.client";
import { ELEMENT_META } from "@/lib/honeycomb/wuxing";
import { ArenaSpeakers } from "./ArenaSpeakers";
import { BattleField } from "./BattleField";
import { CollectionGrid } from "./CollectionGrid";
import { ElementQuiz } from "./ElementQuiz";
import { EntryScreen } from "./EntryScreen";
import { PhaseHud } from "./PhaseHud";
import { TurnClock } from "./TurnClock";
import { ELEMENT_TINT_FROM } from "./_element-classes";

const EASE = [0.32, 0.72, 0.32, 1] as const;
const DURATION = 0.42;

export function BattleScene() {
  const snap = useMatch();

  if (!snap) {
    return (
      <main className="min-h-dvh grid place-items-center bg-puru-cloud-base">
        <p className="text-puru-ink-soft font-puru-body text-sm">honeycomb warming…</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh bg-puru-cloud-base text-puru-ink-base relative overflow-hidden"
      data-weather={snap.weather}
      data-opponent={snap.opponentElement}
      data-phase={snap.phase}
    >
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 bg-gradient-to-b ${ELEMENT_TINT_FROM[snap.weather]} to-puru-cloud-base opacity-60`}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-8 flex flex-col gap-6">
        <PhaseHud
          phase={mapMatchPhase(snap.phase)}
          seed={snap.seed}
          weather={snap.weather}
          opponentElement={snap.opponentElement}
          condition={snap.condition}
        />

        <AnimatePresence mode="wait">
          {(snap.phase === "idle" || snap.phase === "entry") && (
            <PhaseShell key="entry">
              <EntryScreen
                opponentElement={snap.opponentElement}
                weather={snap.weather}
                playerElement={snap.playerElement}
                seed={snap.seed}
              />
            </PhaseShell>
          )}

          {snap.phase === "quiz" && (
            <PhaseShell key="quiz">
              <ElementQuiz />
            </PhaseShell>
          )}

          {snap.phase === "select" && (
            <PhaseShell key="select">
              <SelectPhase snap={snap} />
            </PhaseShell>
          )}

          {(snap.phase === "arrange" ||
            snap.phase === "committed" ||
            snap.phase === "clashing" ||
            snap.phase === "disintegrating" ||
            snap.phase === "between-rounds") && (
            <PhaseShell key="arena">
              <ArenaPhase />
            </PhaseShell>
          )}

          {snap.phase === "result" && (
            <PhaseShell key="result">
              <ResultPlaceholder winner={snap.winner} weather={snap.weather} />
            </PhaseShell>
          )}
        </AnimatePresence>

        {/* ArenaSpeakers reads from Match.lastWhisper (currently null until S1a's
            Battle service emits via Match orchestration · S4 wires the bridge). */}
        <ArenaSpeakers line={null} element={snap.playerElement ?? snap.weather} />

        {/* TurnClock surfaces during clashing/disintegrating/between-rounds */}
        {(snap.phase === "clashing" ||
          snap.phase === "disintegrating" ||
          snap.phase === "between-rounds") && (
          <div className="fixed top-20 right-6 z-30">
            <TurnClock phase={snap.phase} round={snap.currentRound} weather={snap.weather} />
          </div>
        )}
      </div>
    </main>
  );
}

function PhaseShell({ children, ...props }: React.PropsWithChildren) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: DURATION, ease: EASE }}
      {...props}
    >
      {children}
    </motion.section>
  );
}

function SelectPhase({
  snap,
}: {
  readonly snap: import("@/lib/honeycomb/match.port").MatchSnapshot;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Use the legacy CollectionGrid component pattern. Selection is currently
          driven by Battle service; lock-in below dispatches Match command. */}
      <CollectionGrid collection={snap.collection} selectedIndices={[]} weather={snap.weather} />
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-puru-ink-soft font-puru-body">
          Select 5 cards · (S3 wires Match selection)
        </p>
        <button
          type="button"
          onClick={() => matchCommand.lockIn()}
          className="px-5 py-2 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-sm shadow-puru-tile hover:shadow-puru-tile-hover transition-all"
        >
          Lock in
        </button>
      </div>
    </div>
  );
}

function ArenaPhase() {
  return (
    <div className="grid gap-4">
      <BattleField />
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => matchCommand.resetMatch()}
          className="text-sm text-puru-ink-dim hover:text-puru-ink-base transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => matchCommand.advanceClash()}
          className="px-5 py-2 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-sm shadow-puru-tile hover:shadow-puru-tile-hover transition-all"
        >
          Advance clash
        </button>
      </div>
    </div>
  );
}

function ResultPlaceholder({
  winner,
  weather,
}: {
  readonly winner: "p1" | "p2" | "draw" | null;
  readonly weather: import("@/lib/honeycomb/wuxing").Element;
}) {
  const message =
    winner === "p1"
      ? `The tide favored ${ELEMENT_META[weather].name.toLowerCase()}.`
      : winner === "p2"
        ? "The opposing tide carried the day."
        : "Even tides.";
  return (
    <div className="grid place-items-center min-h-[60dvh]">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <h1 className="font-puru-display text-3xl text-puru-ink-rich">{message}</h1>
        <p className="font-puru-body text-puru-ink-soft text-sm">
          (S6 deliverable: ResultScreen with clash breakdown. For now, restart below.)
        </p>
        <button
          type="button"
          onClick={() => matchCommand.beginMatch()}
          className="mt-2 px-6 py-3 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-base shadow-puru-tile hover:shadow-puru-tile-hover transition-all"
        >
          Again
        </button>
      </div>
    </div>
  );
}

/** Map MatchPhase → BattlePhase for legacy PhaseHud display. */
function mapMatchPhase(
  phase: import("@/lib/honeycomb/match.port").MatchPhase,
): import("@/lib/honeycomb/battle.port").BattlePhase {
  switch (phase) {
    case "idle":
    case "entry":
    case "quiz":
      return "idle";
    case "select":
      return "select";
    case "arrange":
    case "between-rounds":
      return "arrange";
    case "committed":
    case "clashing":
    case "disintegrating":
      return "committed";
    case "result":
      return "committed";
  }
}
