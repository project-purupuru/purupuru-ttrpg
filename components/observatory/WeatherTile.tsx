"use client";

import { useEffect, useState } from "react";
import type { WeatherState, Precipitation } from "@/lib/weather";
import type { Element } from "@/lib/score";
import { KpiCell } from "./KpiCell";
import {
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
  Thermometer,
  type Icon,
} from "@phosphor-icons/react";

const ELEMENT_KANJI: Record<Element, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  water: "水",
  metal: "金",
};

// Maps precipitation state to its Phosphor fill-weight icon. Picked
// to mirror the original Unicode glyphs (☀ ☂ ❄ ⚡) that read at a
// glance — sun for clear, rain/snow clouds for the wet states, and
// lightning for storm.
const PRECIP_ICON: Record<Precipitation, Icon> = {
  clear: Sun,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

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
    <section className="flex h-full min-h-0 flex-col overflow-hidden border-t border-l border-puru-surface-border bg-puru-cloud-bright shadow-puru-tile">
      <header className="relative shrink-0 bg-puru-cloud-bright px-6 py-4 shadow-[0_1px_0_0_var(--puru-surface-border),0_2px_4px_var(--puru-surface-shadow-sm)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <h3 className="font-puru-display text-xl text-puru-ink-rich">
              Weather
            </h3>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2.5 font-puru-mono text-2xs uppercase tracking-[0.22em] text-puru-ink-dim">
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
        className="grid flex-1 grid-cols-2 auto-rows-fr gap-3 overflow-y-auto bg-puru-cloud-base px-4 py-4"
        style={{
          backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${state.amplifiedElement}-vivid) var(--puru-bleed-mix), transparent) 0%, transparent var(--puru-bleed-stop))`,
        }}
      >
        <KpiCell
          label="temperature"
          value={`${state.temperature_c}°${state.temperature_unit ?? ""}`}
          aside={<Thermometer weight="fill" />}
        />
        {(() => {
          const PrecipIcon = PRECIP_ICON[state.precipitation];
          return (
            <KpiCell
              label="sky"
              value={<span className="capitalize">{state.precipitation}</span>}
              aside={<PrecipIcon weight="fill" />}
            />
          );
        })()}
        <KpiCell
          label="location"
          value={state.location}
          aside={<MapPin weight="fill" />}
        />
        <KpiCell
          label="amplifies"
          value={<span className="capitalize">{state.amplifiedElement}</span>}
          aside={ELEMENT_KANJI[state.amplifiedElement]}
          asideStyle={{ color: `var(--puru-${state.amplifiedElement}-vivid)` }}
        />
      </div>
    </section>
  );
}
