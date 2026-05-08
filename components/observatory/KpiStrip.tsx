"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ELEMENTS, type Element } from "@/lib/score";
import { Users, Lightning, Scales } from "@phosphor-icons/react";
import { SoundToggle } from "./SoundToggle";

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

export function KpiStrip({
  totalActive,
  distribution,
  cosmicIntensity,
  cycleBalance,
  soundEnabled,
  onToggleSound,
}: {
  totalActive: number;
  distribution: Record<Element, number>;
  cosmicIntensity: number;
  cycleBalance: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  // Dominant element + its share of the population. Computed each render
  // so it tracks the score adapter's drift in lockstep with the canvas.
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

  // Cycle balance from activity stream — 0..1 where ≥0.5 reads as
  // sheng-leaning (constructive: mints + gifts), <0.5 as ke-leaning
  // (destructive: attacks). Display the dominant side's share so the
  // value is always positive and meaningful.
  const cycleDirection: "sheng" | "ke" = cycleBalance >= 0.5 ? "sheng" : "ke";
  const cyclePct = Math.round(
    cycleBalance >= 0.5 ? cycleBalance * 100 : (1 - cycleBalance) * 100,
  );
  const cycleKanji = cycleDirection === "sheng" ? "生" : "克";

  return (
    <section className="flex shrink-0 divide-x divide-puru-surface-border border-b border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <div className="flex shrink-0 items-center bg-puru-cloud-bright px-5">
        <span className="puru-wordmark-drift inline-flex">
          <Image
            src="/brand/purupuru-wordmark.svg"
            alt="purupuru"
            width={88}
            height={28}
            priority
            className="dark:hidden"
          />
          <Image
            src="/brand/purupuru-wordmark-white.svg"
            alt="purupuru"
            width={88}
            height={28}
            priority
            className="hidden dark:block"
          />
        </span>
      </div>
      <Stat
        label="live presence"
        value={totalActive}
        icon={<Users weight="fill" />}
      />
      <Stat
        label="dominant element"
        value={`${dominantElement} ${dominantPct}%`}
        icon={ELEMENT_KANJI[dominantElement]}
        iconStyle={{ color: `var(--puru-${dominantElement}-vivid)` }}
      />
      <Stat
        label="cycle balance"
        value={`${cyclePct}% ${cycleKanji}`}
        icon={<Scales weight="fill" />}
      />
      <Stat
        label="cosmic intensity"
        value={cosmicIntensity.toFixed(2)}
        icon={<Lightning weight="fill" />}
      />
      <div className="flex shrink-0 items-center bg-puru-cloud-bright px-3">
        <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} />
      </div>
    </section>
  );
}

/**
 * Top-strip world-stat tile.
 *
 * Distinct hierarchy from the sidebar's KpiCell:
 *   - sidebar  → small corner watermark, decorative
 *   - top strip → big leading icon on the left, spans both rows, with
 *                 label-then-value stacked to its right
 *
 * Combined strip: shared `bg-puru-cloud-bright`, divided only by the
 * parent's `divide-x` lines. Depth carried by the section's outer
 * `shadow-puru-tile` + top/bottom borders. The icon is large enough
 * (text-4xl) to anchor the cell visually but still inline / structural,
 * not a corner watermark — that's the sidebar's job.
 */
function Stat({
  label,
  value,
  icon,
  iconStyle,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  iconStyle?: CSSProperties;
}) {
  return (
    <div className="flex flex-1 items-center gap-4 bg-puru-cloud-bright px-5 py-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
          {label}
        </span>
        <span className="truncate font-puru-mono text-2xl leading-none tabular-nums text-puru-ink-rich">
          {value}
        </span>
      </div>
      <span
        aria-hidden
        className="shrink-0 font-puru-display text-4xl leading-none text-puru-ink-base opacity-20"
        style={iconStyle}
      >
        {icon}
      </span>
    </div>
  );
}
