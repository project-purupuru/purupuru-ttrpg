"use client";

/**
 * ElementQuiz — one screen, five scenes. Choose your element.
 *
 * Ported from world-purupuru/sites/world/src/lib/battle/ElementQuiz.svelte.
 * NOT a question-by-question quiz · a single scene-picker. Selected element
 * persists to storage and dispatches choose-element to Match.
 */

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";
import { updateMatchStorage } from "@/lib/honeycomb/storage";

interface Scene {
  readonly element: Element;
  readonly scene: string;
  readonly sceneArt: string;
  readonly puruhaniArt: string;
  readonly caretakerArt: string;
}

const SCENES: readonly Scene[] = [
  {
    element: "wood",
    scene: "A garden at dawn",
    sceneArt: "/thumbs/scenes/caretaker-kaori-gardening-with-puruhani.webp",
    puruhaniArt: "/thumbs/puruhani/hopeful-puruhani.png",
    caretakerArt: "/thumbs/caretakers/caretaker-kaori-pose.webp",
  },
  {
    element: "fire",
    scene: "A rooftop at noon",
    sceneArt: "/thumbs/scenes/caretaker-akane-with-puruhani-at-bus-stop.webp",
    puruhaniArt: "/thumbs/puruhani/nefarious-puruhani.png",
    caretakerArt: "/thumbs/caretakers/caretaker-akane-puruhani-chibi.webp",
  },
  {
    element: "earth",
    scene: "A kitchen in amber light",
    sceneArt: "/thumbs/scenes/caretaker-nemu-puruhani-spring.webp",
    puruhaniArt: "/thumbs/puruhani/exhausted-puruhani.png",
    caretakerArt: "/thumbs/caretakers/caretaker-nemu-earth.webp",
  },
  {
    element: "metal",
    scene: "An observatory at dusk",
    sceneArt: "/thumbs/scenes/caretaker-ren-puruhani-night-scene.webp",
    puruhaniArt: "/thumbs/puruhani/loving-puruhani.png",
    caretakerArt: "/thumbs/caretakers/caretaker-ren-with-puruhani.webp",
  },
  {
    element: "water",
    scene: "A tide pool at night",
    sceneArt: "/thumbs/scenes/caretaker-ruan-with-puruhani-in-rain.webp",
    puruhaniArt: "/thumbs/puruhani/overwhelmed-puruhani.png",
    caretakerArt: "/thumbs/caretakers/caretaker-ruan-cute-pose.webp",
  },
];

const ELEMENT_TINT_CLASS: Record<Element, string> = {
  wood: "bg-puru-wood-tint",
  fire: "bg-puru-fire-tint",
  earth: "bg-puru-earth-tint",
  metal: "bg-puru-metal-tint",
  water: "bg-puru-water-tint",
};

export function ElementQuiz() {
  const [selected, setSelected] = useState<Element | null>(null);

  useEffect(() => {
    if (!selected) return;
    updateMatchStorage("playerElement", selected);
    const t = setTimeout(() => matchCommand.chooseElement(selected), 600);
    return () => clearTimeout(t);
  }, [selected]);

  return (
    <section
      className="relative inset-0 flex flex-col items-center justify-center min-h-[70dvh]"
      data-element={selected ?? undefined}
    >
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0.32, 1] }}
        className="font-puru-display text-2xl md:text-3xl text-puru-ink-rich lowercase tracking-wide mb-8"
      >
        choose your element.
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 w-full max-w-5xl px-6">
        {SCENES.map((s, i) => {
          const meta = ELEMENT_META[s.element];
          const isChosen = selected === s.element;
          const isFaded = selected !== null && selected !== s.element;
          return (
            <motion.div
              key={s.element}
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: isFaded ? 0.25 : 1,
                y: 0,
                scale: isChosen ? 1.03 : 1,
              }}
              transition={{
                duration: 0.42,
                delay: i * 0.07,
                ease: [0.32, 0.72, 0.32, 1],
              }}
              className="relative flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setSelected(s.element)}
                disabled={selected !== null}
                className={[
                  "relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-puru-tile",
                  "transition-shadow hover:shadow-puru-tile-hover",
                  isChosen ? "ring-2 ring-puru-honey-base" : "",
                ].join(" ")}
                data-element={s.element}
                aria-label={`${meta.name} · ${s.scene}`}
              >
                <img
                  src={s.sceneArt}
                  alt={s.scene}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  aria-hidden
                  className={`absolute inset-0 ${ELEMENT_TINT_CLASS[s.element]} mix-blend-multiply`}
                  style={{ opacity: 0.4 }}
                />
                <span
                  aria-hidden
                  className="absolute top-3 left-3 font-puru-display text-3xl text-puru-ink-rich/80"
                >
                  {meta.kanji}
                </span>
                <span className="absolute bottom-3 left-3 right-3 text-2xs font-puru-body text-puru-ink-rich/90 text-center italic">
                  {s.scene.toLowerCase()}
                </span>
              </button>

              <div className="mt-3 flex flex-col items-center gap-0.5">
                <img
                  src={s.puruhaniArt}
                  alt={`${meta.caretaker}'s puruhani`}
                  loading="lazy"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xs font-puru-display text-puru-ink-rich">
                  {meta.caretaker}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-8 text-2xs font-puru-body text-puru-ink-soft italic px-6 text-center max-w-md">
        pick the place that feels like home. you can change later.
      </p>
    </section>
  );
}
