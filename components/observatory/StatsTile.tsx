"use client";

import { useMemo } from "react";
import { ELEMENTS, type Element } from "@/lib/score";
import { KpiCell } from "./KpiCell";
import { Users, Sparkle, Compass } from "@phosphor-icons/react";

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

/**
 * Mobile-only stats panel — same four world signals as the desktop
 * KpiStrip, restacked into a 2×2 grid that reads at a glance under the
 * pentagram canvas. The KpiStrip itself stays horizontal on desktop;
 * this component is what the mobile "Stats" tab renders.
 */
export function StatsTile({
  totalActive,
  distribution,
  stones,
  quizzes,
}: {
  totalActive: number;
  distribution: Record<Element, number>;
  stones: number;
  quizzes: number;
}) {
  const dominantElement = useMemo(() => {
    let best: Element = "wood";
    let bestVal = -Infinity;
    for (const el of ELEMENTS) {
      if (distribution[el] > bestVal) {
        bestVal = distribution[el];
        best = el;
      }
    }
    return best;
  }, [distribution]);

  return (
    <section className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden bg-puru-cloud-bright shadow-puru-rim-left">
      <header className="relative shrink-0 bg-puru-cloud-bright px-6 py-4 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <h3 className="font-puru-display text-xl text-puru-ink-rich">
              Stats
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2.5 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
            <span
              className="puru-live-dot inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--puru-wood-vivid)" }}
              aria-hidden
            />
            <span>live</span>
          </span>
        </div>
      </header>
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto bg-puru-cloud-base px-3 py-3">
        <KpiCell
          label="live presence"
          value={totalActive}
          aside={<Users weight="fill" />}
        />
        <KpiCell
          label="stones claimed"
          value={stones}
          aside={<Sparkle weight="fill" />}
        />
        <KpiCell
          label="quizzes taken"
          value={quizzes}
          aside={<Compass weight="fill" />}
        />
        <KpiCell
          label="dominant element"
          value={<span className="capitalize">{dominantElement}</span>}
          aside={ELEMENT_KANJI[dominantElement]}
          asideStyle={{ color: `var(--puru-${dominantElement}-vivid)` }}
        />
      </div>
    </section>
  );
}
