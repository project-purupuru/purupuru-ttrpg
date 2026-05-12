"use client";

/**
 * EntryScreen — title gate. Weather orb · wordmark · play button.
 *
 * Ported from world-purupuru/sites/world/src/lib/battle/EntryScreen.svelte
 * (Session 78 extraction). NOT a content-heavy splash · just an atmospheric
 * arrival before the battle.
 */

import { motion } from "motion/react";
import Image from "next/image";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";

interface EntryScreenProps {
  readonly opponentElement: Element;
  readonly weather: Element;
  readonly playerElement: Element | null;
  readonly seed: string;
}

const WEATHER_ORB_GLOW: Record<Element, string> = {
  wood: "from-puru-wood-vivid/40 via-puru-wood-tint/20",
  fire: "from-puru-fire-vivid/40 via-puru-fire-tint/20",
  earth: "from-puru-earth-vivid/40 via-puru-earth-tint/20",
  metal: "from-puru-metal-vivid/40 via-puru-metal-tint/20",
  water: "from-puru-water-vivid/40 via-puru-water-tint/20",
};

const ELEMENT_GRADIENT: Record<Element, string> = {
  wood: "radial-gradient(ellipse at 50% 40%, var(--puru-wood-tint) 0%, transparent 65%)",
  fire: "radial-gradient(ellipse at 50% 40%, oklch(0.88 0.08 28) 0%, oklch(0.93 0.04 28 / 0.3) 40%, transparent 70%)",
  earth: "radial-gradient(ellipse at 50% 40%, var(--puru-earth-tint) 0%, transparent 65%)",
  metal: "radial-gradient(ellipse at 50% 40%, var(--puru-metal-tint) 0%, transparent 65%)",
  water: "radial-gradient(ellipse at 50% 40%, var(--puru-water-tint) 0%, transparent 65%)",
};

const ELEMENT_BORDER: Record<Element, string> = {
  wood: "border-puru-wood-pastel",
  fire: "border-puru-fire-pastel",
  earth: "border-puru-earth-pastel",
  metal: "border-puru-metal-pastel",
  water: "border-puru-water-pastel",
};

export function EntryScreen({ weather, playerElement, seed }: EntryScreenProps) {
  const elementForGradient = playerElement ?? weather;

  const onPlay = () => {
    // begin-match transitions idle → entry. From entry, if playerElement
    // exists we dispatch choose-element to advance to select.
    if (playerElement) {
      matchCommand.beginMatch();
      // Match will auto-transition entry → quiz (no player element) or skip via
      // the BattleScene routing which checks playerElement.
    } else {
      matchCommand.beginMatch();
    }
  };

  return (
    <section
      className="relative inset-0 flex flex-col items-center min-h-[80dvh]"
      data-element={playerElement ?? undefined}
    >
      {/* Element-driven radial background */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.32, 0.72, 0.32, 1] }}
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: ELEMENT_GRADIENT[elementForGradient] }}
      />

      {/* Weather orb · top-right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, x: 40 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0.32, 1] }}
        className={`absolute -top-12 -right-8 md:-top-16 md:-right-12 w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-full bg-gradient-radial ${WEATHER_ORB_GLOW[weather]} grid place-items-center pointer-events-none`}
        data-element={weather}
        aria-hidden
      >
        <span
          className="font-puru-display text-7xl md:text-9xl text-puru-ink-rich/60"
          style={{ fontFamily: "var(--font-puru-display)" }}
        >
          {ELEMENT_META[weather].kanji}
        </span>
      </motion.div>

      {/* Wordmark + subtitle · centered, takes most vertical space */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0.32, 1] }}
        className="flex flex-col items-center gap-2 mt-[20dvh]"
      >
        <Image
          src="/brand/purupuru-wordmark.svg"
          alt="Purupuru"
          width={240}
          height={120}
          priority
          className="w-[200px] md:w-[280px] h-auto"
        />
        <span className="text-puru-ink-soft font-puru-body text-sm italic tracking-wide">
          the game
        </span>
      </motion.div>

      <div className="flex-1" />

      {/* Play tile button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.32, 0.72, 0.32, 1] }}
        className="mb-[12dvh] flex flex-col items-center gap-3"
      >
        <motion.button
          type="button"
          onClick={onPlay}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={[
            "px-12 py-4 rounded-full font-puru-body text-lg font-semibold",
            "text-puru-ink-rich",
            playerElement
              ? `bg-puru-cloud-base border-2 ${ELEMENT_BORDER[playerElement]} shadow-puru-tile`
              : "bg-puru-honey-base shadow-puru-tile",
            "hover:shadow-puru-tile-hover transition-shadow",
            "min-w-[200px]",
          ].join(" ")}
          data-element={playerElement ?? undefined}
        >
          play
        </motion.button>
        <p className="text-2xs font-puru-mono text-puru-ink-ghost opacity-60">
          seed · {seed.slice(0, 24)}
        </p>
      </motion.div>
    </section>
  );
}
