"use client";

/**
 * ElementQuiz — 5-question element-affinity flow. FR-2.
 *
 * Per Q-SDD-5: questions ported VERBATIM from world-purupuru. Each answer
 * scores one element; final tally determines player's home element.
 *
 * Persisted via lib/honeycomb/storage.ts (S3 T3.3 integration).
 */

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ELEMENT_META, ELEMENT_ORDER, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";
import { updateMatchStorage } from "@/lib/honeycomb/storage";

interface QuizQuestion {
  readonly prompt: string;
  /** Each answer maps to one element. */
  readonly answers: readonly { readonly text: string; readonly element: Element }[];
}

/**
 * 5 atmospheric questions · ported from world-purupuru's ElementQuiz.svelte.
 * Each answer scores +1 to its element; highest tally wins.
 */
const QUESTIONS: readonly QuizQuestion[] = [
  {
    prompt: "The kettle is on. What do you reach for?",
    answers: [
      { text: "Loose-leaf · I'm patient", element: "wood" },
      { text: "Hot strong · let's go", element: "fire" },
      { text: "Mug I always use", element: "earth" },
      { text: "Whatever's clean", element: "metal" },
      { text: "Cold brew · I'm flowing", element: "water" },
    ],
  },
  {
    prompt: "A friend asks for advice. You…",
    answers: [
      { text: "Plant the seed · let them figure it out", element: "wood" },
      { text: "Say the bold thing", element: "fire" },
      { text: "Just sit with them", element: "earth" },
      { text: "Lay out the options", element: "metal" },
      { text: "Reflect it back · listen first", element: "water" },
    ],
  },
  {
    prompt: "Late night. The room is quiet. You're…",
    answers: [
      { text: "Reading · curious", element: "wood" },
      { text: "Still up · still going", element: "fire" },
      { text: "Wrapping up · feeling settled", element: "earth" },
      { text: "Tidying · making it clean", element: "metal" },
      { text: "Looking out the window", element: "water" },
    ],
  },
  {
    prompt: "Pick a room.",
    answers: [
      { text: "Garden room · plants everywhere", element: "wood" },
      { text: "Kitchen · always hot", element: "fire" },
      { text: "Library · quiet shelves", element: "earth" },
      { text: "Workshop · tools in rows", element: "metal" },
      { text: "Bath · steam and warmth", element: "water" },
    ],
  },
  {
    prompt: "Your first move in a new place.",
    answers: [
      { text: "Plant something", element: "wood" },
      { text: "Light a candle", element: "fire" },
      { text: "Unpack the kitchen first", element: "earth" },
      { text: "Hang the tools on the wall", element: "metal" },
      { text: "Run the bath", element: "water" },
    ],
  },
];

export function ElementQuiz() {
  const [step, setStep] = useState(0);
  const [tally, setTally] = useState<Record<Element, number>>({
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  });
  const [revealed, setRevealed] = useState<Element | null>(null);

  const question = QUESTIONS[step];

  const choose = (el: Element) => {
    const next = { ...tally, [el]: tally[el] + 1 };
    setTally(next);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // Final tally → highest-scored element. Ties broken by ELEMENT_ORDER index.
      const winner = ELEMENT_ORDER.reduce(
        (best, el) => (next[el] > next[best] ? el : best),
        ELEMENT_ORDER[0],
      );
      setRevealed(winner);
      updateMatchStorage("playerElement", winner);
      // After 1.5s reveal pause, advance the Match.
      setTimeout(() => matchCommand.chooseElement(winner), 1500);
    }
  };

  if (revealed) {
    return (
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="grid place-items-center min-h-[60dvh] text-center"
      >
        <div className="flex flex-col items-center gap-4 max-w-md">
          <p className="font-puru-body text-puru-ink-soft text-sm">Your home is</p>
          <h2 className="font-puru-display text-5xl text-puru-ink-rich">
            {ELEMENT_META[revealed].kanji}
          </h2>
          <p className="font-puru-display text-2xl text-puru-ink-rich">
            {ELEMENT_META[revealed].name} · {ELEMENT_META[revealed].virtue}
          </p>
          <p className="font-puru-body text-puru-ink-dim text-xs italic">
            {ELEMENT_META[revealed].caretaker} waits for you.
          </p>
        </div>
      </motion.section>
    );
  }

  if (!question) return null;

  return (
    <section className="grid place-items-center min-h-[60dvh]">
      <div className="flex flex-col items-center gap-5 max-w-lg w-full px-6">
        <div className="flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= step ? "bg-puru-honey-base" : "bg-puru-cloud-deep/40"
              }`}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.36, ease: [0.32, 0.72, 0.32, 1] }}
            className="flex flex-col gap-3 w-full"
          >
            <h2 className="font-puru-display text-2xl text-puru-ink-rich text-center mb-3">
              {question.prompt}
            </h2>
            <div className="flex flex-col gap-2">
              {question.answers.map((a) => (
                <button
                  key={a.element}
                  type="button"
                  onClick={() => choose(a.element)}
                  className="px-5 py-3 rounded-2xl bg-puru-cloud-bright shadow-puru-tile text-left text-sm font-puru-body text-puru-ink-base hover:shadow-puru-tile-hover hover:translate-x-1 transition-all"
                >
                  {a.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
