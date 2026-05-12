"use client";

/**
 * TurnClock — clash beat indicator. FR-7.
 *
 * Visual progress dial animated during `clashing` phase. Driven by
 * Honeycomb DEFAULT_TIMING_BUDGETS weighted by current kaironic weights.
 */

import { motion } from "motion/react";
import { DEFAULT_TIMING_BUDGETS, weighted } from "@/lib/honeycomb/curves";
import type { KaironicWeights } from "@/lib/honeycomb/curves";
import type { MatchPhase } from "@/lib/honeycomb/match.port";
import type { Element } from "@/lib/honeycomb/wuxing";
import { ELEMENT_META } from "@/lib/honeycomb/wuxing";

interface TurnClockProps {
  readonly phase: MatchPhase;
  readonly round: number;
  readonly weather: Element;
  readonly kaironic?: KaironicWeights;
}

export function TurnClock({ phase, round, weather, kaironic }: TurnClockProps) {
  const active = phase === "clashing";
  const beatMs = kaironic
    ? weighted(DEFAULT_TIMING_BUDGETS.clashBeat, kaironic, "impact")
    : DEFAULT_TIMING_BUDGETS.clashBeat;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-puru-cloud-bright/80 shadow-puru-tile">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="var(--puru-cloud-deep)"
            strokeWidth="3"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="var(--puru-honey-base)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 14}
            initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
            animate={{
              strokeDashoffset: active ? 0 : 2 * Math.PI * 14,
            }}
            transition={{
              duration: beatMs / 1000,
              ease: [0.32, 0.72, 0.32, 1],
              repeat: active ? Infinity : 0,
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-xs font-puru-mono text-puru-ink-rich">
          {round}
        </div>
      </div>
      <span className="text-2xs font-puru-mono uppercase tracking-wide text-puru-ink-dim">
        {phase} · {ELEMENT_META[weather].kanji}
      </span>
    </div>
  );
}
