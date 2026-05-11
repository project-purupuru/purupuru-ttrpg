import { Schema } from "effect";
import type { Element } from "./element";

// Note: Schema is descriptive of shape, not behavior — the temperature_c
// unit, location string, and sunrise/sunset ISO format are runtime invariants
// not encoded in the type system. Adapters must honor them.
export const Precipitation = Schema.Literal("clear", "rain", "snow", "storm");
export type Precipitation = Schema.Schema.Type<typeof Precipitation>;

export interface WeatherState {
  temperature_c: number;
  precipitation: Precipitation;
  cosmic_intensity: number;
  amplifiedElement: Element;
  amplificationFactor: number;
  observed_at: string;
  location: string;
  source: string;
  sunrise?: string;
  sunset?: string;
  is_night?: boolean;
  temperature_unit?: "C" | "F";
}

// Pre-fetch seed so React state has data before the runtime boots. Mirrors
// the mock feed's first-emit so the awareness layer never reads "no weather"
// during cold start; gets overwritten by the live feed within ~2 seconds.
// `observed_at` must be a recent timestamp (not epoch) — `WeatherTile`'s
// `timeAgo` formatter renders it directly and a 1970 seed reads as "55
// years ago" before the live emit lands. The pre-refactor mock used
// `Date.now() - 6_000` so the very first render reads "synced 6s ago".
export function initialWeatherState(): WeatherState {
  return {
    temperature_c: 14.2,
    precipitation: "clear",
    cosmic_intensity: 0.62,
    amplifiedElement: "fire",
    amplificationFactor: 1.0,
    observed_at: new Date(Date.now() - 6_000).toISOString(),
    location: "Tokyo",
    source: "@puruhpuruweather",
  };
}

// Lazy module-level seed for callers that need a stable reference. Computed
// once at import time — fine for SSR (timestamp is per-process, not per
// request) and the value is overwritten within ~2 seconds by the live feed.
export const INITIAL_WEATHER_STATE: WeatherState = initialWeatherState();
