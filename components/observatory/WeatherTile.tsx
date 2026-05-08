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
            <span className="text-puru-ink-soft"> {state.precipitation}</span>
            <span className="text-puru-ink-soft"> · amplifies </span>
            <span className="text-puru-ink-base">{state.amplifiedElement}</span>
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
