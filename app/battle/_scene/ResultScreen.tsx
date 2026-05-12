"use client";

/**
 * ResultScreen — end-of-match surface. FR-11.
 *
 * "The tide favored X" copy (NOT "Victory/Defeat" per game-design canon).
 * Shows top 3 most-impactful clashes from rounds[] log. CTA to restart.
 */

import { motion } from "motion/react";
import type { RoundResult } from "@/lib/honeycomb/clash.port";
import type { MatchSnapshot } from "@/lib/honeycomb/match.port";
import { ELEMENT_META, type Element } from "@/lib/honeycomb/wuxing";
import { matchCommand } from "@/lib/runtime/match.client";
import { ELEMENT_TINT_BG } from "./_element-classes";

interface ResultScreenProps {
  readonly winner: "p1" | "p2" | "draw" | null;
  readonly weather: Element;
  readonly opponentElement: Element;
  readonly rounds: readonly RoundResult[];
}

export function ResultScreen({ winner, weather, opponentElement, rounds }: ResultScreenProps) {
  // Compute top 3 impactful clashes by shift magnitude
  const topClashes = rounds
    .flatMap((r) => r.clashes)
    .sort((a, b) => b.shift - a.shift)
    .slice(0, 3);

  const message =
    winner === "p1"
      ? `The tide favored ${ELEMENT_META[weather].name.toLowerCase()}.`
      : winner === "p2"
        ? `${ELEMENT_META[opponentElement].caretaker}'s tide carried the day.`
        : "Even tides.";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="grid place-items-center min-h-[70dvh]"
    >
      <div className="flex flex-col items-center gap-6 max-w-2xl w-full px-6 text-center">
        <h1 className="font-puru-display text-4xl text-puru-ink-rich">{message}</h1>

        {topClashes.length > 0 && (
          <div className="w-full">
            <h2 className="font-puru-display text-sm text-puru-ink-soft mb-3 uppercase tracking-wide">
              Most impactful clashes
            </h2>
            <ul className="flex flex-col gap-2">
              {topClashes.map((c, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-2xl px-4 py-2.5 bg-puru-cloud-bright shadow-puru-tile"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-2xs font-puru-mono ${ELEMENT_TINT_BG[c.p1Card.card.element]} text-puru-ink-rich`}
                    >
                      {ELEMENT_META[c.p1Card.card.element].kanji}
                    </span>
                    <span className="text-puru-ink-dim text-xs">vs</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-2xs font-puru-mono ${ELEMENT_TINT_BG[c.p2Card.card.element]} text-puru-ink-rich`}
                    >
                      {ELEMENT_META[c.p2Card.card.element].kanji}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-puru-body">
                    <span className="text-puru-ink-dim italic">{c.interaction.type}</span>
                    <span className="font-puru-mono text-puru-honey-base">
                      Δ{(c.shift * 100).toFixed(0)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() => matchCommand.beginMatch()}
          className="mt-2 px-7 py-3 rounded-full bg-puru-honey-base text-puru-ink-rich font-puru-display text-base shadow-puru-tile hover:shadow-puru-tile-hover transition-all"
        >
          Again
        </button>
      </div>
    </motion.section>
  );
}

export type _ResultSnapshot = MatchSnapshot;
