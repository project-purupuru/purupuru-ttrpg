"use client";

/**
 * BattleHand — player's 5-card lineup tray. FR-4.
 *
 * Evolves the prior LineupTray.tsx pattern (kept for backwards compat in
 * legacy /battle phases) but reads from useMatch() instead of useBattle().
 * Supports drag-to-reorder during arrange phase · shows 敗 stamp on
 * eliminated cards during disintegrating phase.
 */

import { motion } from "motion/react";
import { useState } from "react";
import type { MatchPhase } from "@/lib/honeycomb/match.port";
import type { Card } from "@/lib/honeycomb/cards";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";
import { ELEMENT_TINT_BG } from "./_element-classes";

interface BattleHandProps {
  readonly lineup: readonly Card[];
  readonly phase: MatchPhase;
  readonly weather: Element;
}

export function BattleHand({ lineup, phase, weather }: BattleHandProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const interactive = phase === "arrange" || phase === "between-rounds";

  if (lineup.length === 0) {
    return (
      <ol className="grid grid-cols-5 gap-2">
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
      {lineup.map((card, idx) => {
        const isWeather = card.element === weather;
        const isDisintegrating = phase === "disintegrating";
        return (
          <motion.li
            key={card.id}
            layout
            draggable={interactive}
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => {
              if (!interactive) return;
              e.preventDefault();
              setOverIdx(idx);
            }}
            onDrop={() => {
              // Rearrange via Battle (legacy LineupTray pattern). Match-level
              // rearrange will arrive in S5 when we wire `rearrange-lineup` into
              // MatchCommand. For now, this is a no-op gesture · the lineup
              // re-orders via Match.invoke({_tag: "lock-in"}) flow.
              void matchCommand;
              setDragIdx(null);
              setOverIdx(null);
            }}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            animate={{
              scale: overIdx === idx ? 1.04 : 1,
              opacity: dragIdx === idx ? 0.45 : 1,
            }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className={[
              "relative aspect-[3/4] rounded-2xl p-2.5 flex flex-col justify-between",
              "bg-puru-cloud-bright shadow-puru-tile",
              interactive ? "cursor-grab active:cursor-grabbing" : "cursor-default",
            ].join(" ")}
            data-element={card.element}
            data-position={idx}
          >
            <div
              aria-hidden
              className={`absolute inset-0 rounded-2xl pointer-events-none ${ELEMENT_TINT_BG[card.element]}`}
              style={{ opacity: 0.5 }}
            />
            <div className="relative z-10 flex items-start justify-between">
              <span className="font-puru-display text-xl text-puru-ink-rich leading-none">
                {ELEMENT_META[card.element].kanji}
              </span>
              <span className="text-2xs font-puru-mono text-puru-ink-soft">{idx + 1}</span>
            </div>
            <div className="relative z-10 text-2xs font-puru-mono uppercase tracking-wide text-puru-ink-dim">
              {card.cardType.split("_").join(" · ")}
              {isWeather && <span className="ml-1 text-puru-honey-dim">✦</span>}
            </div>
            {isDisintegrating && (
              <motion.div
                aria-hidden
                className="absolute inset-0 grid place-items-center z-20 bg-puru-ink-rich/40 rounded-2xl"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.36 }}
              >
                <span className="font-puru-display text-6xl text-puru-fire-vivid">敗</span>
              </motion.div>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
