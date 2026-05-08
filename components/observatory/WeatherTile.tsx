"use client";

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

export function WeatherTile({ state }: { state: WeatherState }) {
  return (
    <section className="border-t border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <header className="relative bg-puru-cloud-bright px-6 py-5 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
        <h3 className="font-puru-display text-xl text-puru-ink-rich">
          Weather
        </h3>
      </header>
      <div className="px-6 py-5">
        <div className="flex items-end justify-between gap-3">
          <span
            className="font-puru-display text-4xl text-puru-ink-rich"
            aria-label={state.precipitation}
          >
            {PRECIP_GLYPH[state.precipitation]}
          </span>
          <span className="font-puru-mono text-2xl tabular-nums text-puru-ink-rich">
            {state.temperature_c}°
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full font-puru-card text-base text-puru-cloud-bright"
            style={{ backgroundColor: `var(--puru-${state.amplifiedElement}-vivid)` }}
          >
            {ELEMENT_KANJI[state.amplifiedElement]}
          </span>
          <span className="font-puru-mono text-2xs uppercase tracking-[0.18em] text-puru-ink-soft">
            amplifies {state.amplifiedElement}
          </span>
        </div>
      </div>
    </section>
  );
}
