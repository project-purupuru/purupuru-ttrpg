"use client";

import { useEffect, useState } from "react";
import type { WeatherState } from "@/lib/weather";
import type { Element } from "@/lib/score";

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

const PRECIP_GLYPH = {
  clear: "☀",
  rain: "☂",
  snow: "❄",
  storm: "⚡",
} as const;

const SECOND = 1000;
const MINUTE = 60 * SECOND;

function syncedAgo(iso: string, now: number): string {
  const diff = now - new Date(iso).getTime();
  if (diff < 5 * SECOND) return "just now";
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  return `${Math.floor(diff / MINUTE)}m ago`;
}

export function WeatherTile({ state }: { state: WeatherState }) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <section className="border-t border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <header className="relative bg-puru-cloud-bright px-6 py-4 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <span className="font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
              irl
            </span>
            <h3 className="mt-1 font-puru-display text-xl text-puru-ink-rich">
              Weather
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
            <span
              className="puru-live-dot inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "var(--puru-wood-vivid)" }}
              aria-hidden
            />
            <span className="inline-block min-w-[5.25em] text-right tabular-nums">
              {syncedAgo(state.observed_at, now)}
            </span>
          </span>
        </div>
      </header>
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{
          backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${state.amplifiedElement}-vivid) 12%, transparent) 0%, transparent 55%)`,
        }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-puru-card text-lg text-puru-cloud-bright"
          style={{ backgroundColor: `var(--puru-${state.amplifiedElement}-vivid)` }}
          aria-label={`amplifies ${state.amplifiedElement}`}
        >
          {ELEMENT_KANJI[state.amplifiedElement]}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate font-puru-mono text-sm">
            <span className="tabular-nums text-puru-ink-rich">
              {state.temperature_c}°
            </span>
            <span className="ml-2 text-puru-ink-soft">{state.precipitation}</span>
          </p>
          <p className="mt-0.5 flex min-w-0 items-baseline gap-3 font-puru-mono text-xs text-puru-ink-soft">
            <span className="truncate text-puru-ink-base">{state.location}</span>
            <span className="truncate">
              amplifies <span className="text-puru-ink-base">{state.amplifiedElement}</span>
            </span>
          </p>
        </div>
        <span
          className="font-puru-display text-2xl leading-none text-puru-ink-rich"
          aria-hidden
        >
          {PRECIP_GLYPH[state.precipitation]}
        </span>
      </div>
    </section>
  );
}
