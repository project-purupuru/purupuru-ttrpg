"use client";

import { ELEMENTS, type Element } from "@/lib/score";

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

export function KpiStrip({
  distribution,
  cosmicIntensity,
  cycleBalance,
}: {
  distribution: Record<Element, number>;
  cosmicIntensity: number;
  cycleBalance: number;
}) {
  const total = ELEMENTS.reduce((sum, el) => sum + distribution[el], 0);
  return (
    <section className="flex shrink-0 items-stretch gap-4 border-b border-puru-cloud-dim bg-puru-cloud-bright px-6 py-4">
      <Tile label="wuxing distribution">
        <div className="flex h-7 w-full overflow-hidden rounded-puru-sm">
          {ELEMENTS.map((el) => {
            const w = total > 0 ? (distribution[el] / total) * 100 : 0;
            return (
              <span
                key={el}
                aria-label={`${el} ${Math.round(w)}%`}
                className="flex items-center justify-center font-puru-card text-sm text-puru-cloud-bright"
                style={{
                  width: `${w}%`,
                  backgroundColor: `var(--puru-${el}-vivid)`,
                }}
              >
                {w >= 8 ? ELEMENT_KANJI[el] : ""}
              </span>
            );
          })}
        </div>
      </Tile>
      <Tile label="cycle balance">
        <div className="flex h-7 w-full overflow-hidden rounded-puru-sm bg-puru-cloud-dim">
          <span
            className="bg-puru-wood-vivid"
            style={{ width: `${Math.round(cycleBalance * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
          <span>生 sheng</span>
          <span>克 ke</span>
        </div>
      </Tile>
      <Tile label="cosmic intensity" align="right">
        <span className="font-puru-mono text-2xl tabular-nums text-puru-ink-rich">
          {cosmicIntensity.toFixed(2)}
        </span>
      </Tile>
    </section>
  );
}

function Tile({
  label,
  children,
  align,
}: {
  label: string;
  children: React.ReactNode;
  align?: "right";
}) {
  return (
    <div className={`flex flex-1 flex-col gap-1 ${align === "right" ? "items-end" : ""}`}>
      <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-soft">
        {label}
      </span>
      {children}
    </div>
  );
}
