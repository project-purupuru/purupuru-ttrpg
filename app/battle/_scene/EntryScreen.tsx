"use client";

/**
 * EntryScreen — atmospheric splash gate. FR-1.
 *
 * "Enter the Tide" CTA · Tsuheji map background · single button into match.
 * Routes to ElementQuiz if first-time, else direct to select phase.
 */

import { motion } from "motion/react";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";
import { ELEMENT_TINT_FROM } from "./_element-classes";

interface EntryScreenProps {
  readonly opponentElement: Element;
  readonly weather: Element;
  readonly playerElement: Element | null;
  readonly seed: string;
}

export function EntryScreen({ opponentElement, weather, playerElement, seed }: EntryScreenProps) {
  const firstTime = playerElement === null;
  const cta = firstTime ? "Enter the Tide · choose your home" : "Enter the Tide";

  const onEnter = () => {
    // If first-time, choose-element is required before lock-in.
    // BattleScene routes to QuizScreen when phase==quiz.
    if (firstTime) {
      // Match service transitions to "entry" on begin-match; we need to
      // explicitly enter the quiz phase. For now, dispatch begin → quiz path
      // by chaining commands. Match service handles the entry→quiz transition.
      matchCommand.beginMatch();
      return;
    }
    matchCommand.beginMatch();
  };

  return (
    <section className="relative grid place-items-center min-h-[70dvh] overflow-hidden rounded-3xl">
      {/* Map background — Tsuheji continent shape */}
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-br ${ELEMENT_TINT_FROM[weather]} via-puru-cloud-bright to-puru-cloud-base`}
        style={{ opacity: 0.7 }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/art/tsuheji-map.png')] bg-cover bg-center opacity-30 mix-blend-multiply"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0.32, 1] }}
        className="relative z-10 flex flex-col items-center gap-5 text-center max-w-md px-6"
      >
        <h1 className="font-puru-display text-4xl text-puru-ink-rich leading-puru-tight">
          Purupuru · the game
        </h1>
        <div className="flex items-center gap-3 text-puru-ink-soft text-sm font-puru-body">
          <span>The tide favors</span>
          <span className="font-puru-display text-puru-ink-rich">
            {ELEMENT_META[weather].kanji} {ELEMENT_META[weather].name.toLowerCase()}
          </span>
          <span>today.</span>
        </div>
        <p className="font-puru-body text-puru-ink-soft text-sm leading-puru-relaxed">
          {ELEMENT_META[opponentElement].caretaker} brings the imbalance. Five cards. Five clashes.
          Order matters.
        </p>
        <motion.button
          type="button"
          onClick={onEnter}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="mt-2 px-7 py-3.5 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-lg shadow-puru-tile hover:shadow-puru-tile-hover transition-shadow"
        >
          {cta}
        </motion.button>
        <p className="text-2xs font-puru-mono text-puru-ink-ghost mt-3">
          seed · <span className="text-puru-ink-dim">{seed.slice(0, 24)}</span>
        </p>
      </motion.div>
    </section>
  );
}
