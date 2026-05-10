/**
 * Weather domain — IRL+cosmic state mapped through wuxing.
 * v0.1 ships interface + static mock; v0.3 ticks updates on interval.
 */

import type { Element } from "@/lib/score";

export type Precipitation = "clear" | "rain" | "snow" | "storm";

export interface WeatherState {
  temperature_c: number;
  precipitation: Precipitation;
  cosmic_intensity: number;
  amplifiedElement: Element;
  amplificationFactor: number;
  observed_at: string;
  /** Geographic frame the reading represents (e.g. "Tokyo", "Global avg"). */
  location: string;
  /** Adapter / data origin label (e.g. "@puruhpuruweather", "synthetic · demo"). */
  source: string;
  /** Local sunrise (ISO) — present when the live adapter has data. */
  sunrise?: string;
  /** Local sunset (ISO). */
  sunset?: string;
  /** True when local clock is past sunset or before sunrise. Drives theme. */
  is_night?: boolean;
  /** "C" or "F" — drives the on-screen suffix. Inferred from the resolved country code. */
  temperature_unit?: "C" | "F";
}

export interface WeatherFeed {
  subscribe(cb: (s: WeatherState) => void): () => void;
  current(): WeatherState;
}
