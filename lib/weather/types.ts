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
}

export interface WeatherFeed {
  subscribe(cb: (s: WeatherState) => void): () => void;
  current(): WeatherState;
}
