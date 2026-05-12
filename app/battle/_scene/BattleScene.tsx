"use client";

/**
 * BattleScene — the v1 surface for the Honeycomb battle substrate.
 *
 * Phase-driven layout:
 *   - idle      → splash with begin button + seed input
 *   - select    → CollectionGrid (pick 5)
 *   - arrange   → LineupTray (drag to reorder) + CombosPanel
 *   - preview   → same as arrange, with lock-in CTA pulsing
 *   - committed → frozen lineup, "the tide favors X" cinematic
 *
 * 2D-first: HTML/CSS + motion. Three.js viewport bolts on in v2 once feel
 * is locked.
 */

import { motion, AnimatePresence } from "motion/react";
import { useBattle, battleCommand } from "@/lib/runtime/battle.client";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { CollectionGrid } from "./CollectionGrid";
import { LineupTray } from "./LineupTray";
import { CombosPanel } from "./CombosPanel";
import { WhisperBubble } from "./WhisperBubble";
import { KaironicPanel } from "./KaironicPanel";
import { PhaseHud } from "./PhaseHud";
import { ELEMENT_TINT_FROM } from "./_element-classes";

export function BattleScene() {
  const snap = useBattle();

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
      {/* ambient weather wash */}
      <WeatherWash element={snap.weather} />

      <div className="relative mx-auto max-w-6xl px-6 py-8 flex flex-col gap-6">
        <PhaseHud
          phase={snap.phase}
          seed={snap.seed}
          weather={snap.weather}
          opponentElement={snap.opponentElement}
          condition={snap.condition}
        />

        <AnimatePresence mode="wait">
          {snap.phase === "idle" && (
            <motion.section
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0.32, 1] }}
              className="grid place-items-center min-h-[60dvh]"
            >
              <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <h1 className="font-puru-display text-3xl text-puru-ink-rich">
                  The tide favors {ELEMENT_META[snap.weather].name.toLowerCase()} today.
                </h1>
                <p className="font-puru-body text-puru-ink-soft text-sm leading-puru-relaxed">
                  {ELEMENT_META[snap.opponentElement].caretaker} brings the imbalance. Five cards.
                  Five clashes. Order matters.
                </p>
                <button
                  type="button"
                  onClick={() => battleCommand.beginMatch()}
                  className="mt-2 px-6 py-3 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-base shadow-puru-tile hover:shadow-puru-tile-hover active:translate-y-[1px] transition-all duration-200"
                >
                  Step into the arena
                </button>
                <SeedRow seed={snap.seed} />
              </div>
            </motion.section>
          )}

          {snap.phase === "select" && (
            <motion.section
              key="select"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0.32, 1] }}
              className="flex flex-col gap-4"
            >
              <CollectionGrid
                collection={snap.collection}
                selectedIndices={snap.selectedIndices}
                weather={snap.weather}
              />
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-puru-ink-soft font-puru-body">
                  {snap.selectedIndices.length}/5 picked.
                </p>
                <button
                  type="button"
                  onClick={() => battleCommand.proceedToArrange()}
                  disabled={snap.selectedIndices.length !== 5}
                  className="px-5 py-2 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-sm shadow-puru-tile disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-puru-tile-hover transition-all"
                >
                  Arrange the line
                </button>
              </div>
            </motion.section>
          )}

          {(snap.phase === "arrange" || snap.phase === "preview" || snap.phase === "committed") && (
            <motion.section
              key="arrange"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0.32, 1] }}
              className="grid gap-6 lg:grid-cols-[1fr_320px]"
            >
              <div className="flex flex-col gap-4">
                <LineupTray lineup={snap.lineup} phase={snap.phase} weather={snap.weather} />
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => battleCommand.resetMatch()}
                    className="text-sm text-puru-ink-dim hover:text-puru-ink-base transition-colors"
                  >
                    Reset
                  </button>
                  {snap.phase === "arrange" && (
                    <button
                      type="button"
                      onClick={() => battleCommand.lockIn()}
                      className="px-5 py-2 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-sm shadow-puru-tile hover:shadow-puru-tile-hover transition-all"
                    >
                      Lock in
                    </button>
                  )}
                  {snap.phase === "committed" && (
                    <p className="text-sm font-puru-display text-puru-ink-rich">The line is set.</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <CombosPanel combos={snap.combos} summary={snap.comboSummary} />
                <KaironicPanel weights={snap.kaironic} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <WhisperBubble line={snap.lastWhisper} element={snap.weather} />
      </div>
    </main>
  );
}

function WeatherWash({ element }: { element: Element }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 bg-gradient-to-b ${ELEMENT_TINT_FROM[element]} to-puru-cloud-base opacity-60`}
    />
  );
}

function SeedRow({ seed }: { seed: string }) {
  return (
    <p className="text-2xs font-puru-mono text-puru-ink-ghost mt-3">
      seed · <span className="text-puru-ink-dim">{seed}</span>
    </p>
  );
}
