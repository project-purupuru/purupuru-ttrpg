"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ELEMENTS, type Element } from "@/lib/score";
import { Users, Sparkle, Compass } from "@phosphor-icons/react";

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
    <section className="relative z-10 flex shrink-0 divide-x divide-puru-surface-border border-b border-puru-surface-border bg-puru-cloud-bright shadow-puru-rim-bottom">
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
        label="stones claimed"
        value={stones}
        icon={<Sparkle weight="fill" />}
      />
      <Stat
        label="quizzes taken"
        value={quizzes}
        icon={<Compass weight="fill" />}
      />
      <Stat
        label="dominant element"
        value={<span className="capitalize">{dominantElement}</span>}
        icon={ELEMENT_KANJI[dominantElement]}
        iconStyle={{ color: `var(--puru-${dominantElement}-vivid)` }}
      />
    </section>
  );
}

/**
 * Top-strip world-stat tile.
 *
 * Distinct hierarchy from the sidebar's KpiCell:
 *   - sidebar  → corner watermark (bottom-right) at text-5xl
 *   - top strip → large right-edge accent (vertically centered) at
 *                 text-6xl — slightly bleeds past the cell edge so it
 *                 reads as ambient decoration rather than a chart glyph
 *
 * Both at opacity-10 so the eye lands on the value first; icon is
 * felt, not seen.
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
    <div className="relative flex flex-1 flex-col gap-1 overflow-hidden bg-puru-cloud-bright px-5 py-4">
      <span className="relative z-10 truncate font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
        {label}
      </span>
      <span className="relative z-10 truncate font-puru-mono text-2xl leading-none tabular-nums text-puru-ink-rich">
        {value}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none font-puru-display text-[140px] leading-none text-puru-ink-base opacity-[0.09]"
        style={{
          ...iconStyle,
          // Fade the right edge to transparent so the oversized icon
          // visually dissolves off the card rather than hard-clipping
          // at the overflow boundary. Reads as a bleeding gradient.
          maskImage:
            "linear-gradient(to left, transparent 0%, black 45%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(to left, transparent 0%, black 45%, black 100%)",
        }}
      >
        {icon}
      </span>
    </div>
  );
}
