"use client";

/**
 * OpponentZone — opponent's lineup, face-down until clash. FR-6.
 *
 * Reveals during clashing/disintegrating phases. Subtle AI personality cue
 * via opponent-element-tinted backing.
 */

import { motion } from "motion/react";
import type { Card } from "@/lib/honeycomb/cards";
import type { MatchPhase } from "@/lib/honeycomb/match.port";
import { ELEMENT_META } from "@/lib/honeycomb/wuxing";
import { ELEMENT_TINT_BG } from "./_element-classes";

interface OpponentZoneProps {
  readonly lineup: readonly Card[];
  readonly phase: MatchPhase;
}

export function OpponentZone({ lineup, phase }: OpponentZoneProps) {
  const revealed = phase === "clashing" || phase === "disintegrating" || phase === "result";

  if (lineup.length === 0) {
    return (
      <ol className="grid grid-cols-5 gap-2 opacity-30">
        {Array.from({ length: 5 }).map((_, i) => (
          <li
            key={i}
            className="aspect-[3/4] rounded-2xl bg-puru-cloud-dim/40 border border-puru-cloud-deep/40 border-dashed"
          />
        ))}
      </ol>
    );
  }

  return (
    <ol className="grid grid-cols-5 gap-2">
      {lineup.map((card, idx) => (
        <motion.li
          key={card.id}
          layout
          initial={false}
          animate={{ rotateY: revealed ? 0 : 180 }}
          transition={{ duration: 0.42, ease: [0.32, 0.72, 0.32, 1] }}
          className="relative aspect-[3/4] rounded-2xl bg-puru-cloud-bright shadow-puru-tile [transform-style:preserve-3d]"
          data-element={card.element}
          data-position={idx}
        >
          {/* Front face (revealed) */}
          <div
            className={`absolute inset-0 rounded-2xl p-2 flex flex-col justify-between [backface-visibility:hidden] ${ELEMENT_TINT_BG[card.element]}`}
          >
            <span className="font-puru-display text-xl text-puru-ink-rich leading-none">
              {ELEMENT_META[card.element].kanji}
            </span>
            <span className="text-2xs font-puru-mono uppercase tracking-wide text-puru-ink-dim">
              {card.cardType.split("_").join(" · ")}
            </span>
          </div>
          {/* Back face (hidden) */}
          <div className="absolute inset-0 rounded-2xl bg-puru-cloud-deep [backface-visibility:hidden] [transform:rotateY(180deg)] grid place-items-center">
            <span className="text-puru-ink-ghost font-puru-display text-3xl">·</span>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
