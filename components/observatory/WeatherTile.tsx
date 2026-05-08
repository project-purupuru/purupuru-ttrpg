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
        className="grid grid-cols-3 gap-2 px-3 py-3"
        style={{
          backgroundImage: `linear-gradient(to left, color-mix(in oklch, var(--puru-${state.amplifiedElement}-vivid) 10%, transparent) 0%, transparent 60%)`,
        }}
      >
        {(() => {
          const PrecipIcon = PRECIP_ICON[state.precipitation];
          return (
            <KpiCell
              label="temperature"
              value={`${state.temperature_c}°`}
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
          value={state.amplifiedElement}
          aside={ELEMENT_KANJI[state.amplifiedElement]}
          asideStyle={{ color: `var(--puru-${state.amplifiedElement}-vivid)` }}
        />
      </div>
    </section>
  );
}
