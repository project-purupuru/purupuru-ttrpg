"use client";

import { useMemo } from "react";
import { ELEMENTS, type Element } from "@/lib/score";
import { KpiCell } from "./KpiCell";
import { Users, Lightning, Scales } from "@phosphor-icons/react";

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
  cosmicIntensity,
  cycleBalance,
}: {
  totalActive: number;
  distribution: Record<Element, number>;
  cosmicIntensity: number;
  cycleBalance: number;
}) {
  const { dominantElement, dominantPct } = useMemo(() => {
    const total = ELEMENTS.reduce((sum, el) => sum + distribution[el], 0);
    let best: Element = "wood";
    let bestVal = -Infinity;
    for (const el of ELEMENTS) {
      if (distribution[el] > bestVal) {
        bestVal = distribution[el];
        best = el;
      }
    }
    const pct = total > 0 ? Math.round((bestVal / total) * 100) : 0;
    return { dominantElement: best, dominantPct: pct };
  }, [distribution]);

  const cycleDirection: "sheng" | "ke" = cycleBalance >= 0.5 ? "sheng" : "ke";
  const cyclePct = Math.round(
    cycleBalance >= 0.5 ? cycleBalance * 100 : (1 - cycleBalance) * 100,
  );
  const cycleKanji = cycleDirection === "sheng" ? "生" : "克";

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-puru-cloud-bright shadow-puru-tile">
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
          label="dominant element"
          value={`${dominantElement} ${dominantPct}%`}
          aside={ELEMENT_KANJI[dominantElement]}
          asideStyle={{ color: `var(--puru-${dominantElement}-vivid)` }}
        />
        <KpiCell
          label="cycle balance"
          value={`${cyclePct}% ${cycleKanji}`}
          aside={<Scales weight="fill" />}
        />
        <KpiCell
          label="cosmic intensity"
          value={cosmicIntensity.toFixed(2)}
          aside={<Lightning weight="fill" />}
        />
      </div>
    </section>
  );
}
