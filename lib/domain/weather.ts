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
export const INITIAL_WEATHER_STATE: WeatherState = {
  temperature_c: 14.2,
  precipitation: "clear",
  cosmic_intensity: 0.62,
  amplifiedElement: "fire",
  amplificationFactor: 1.0,
  observed_at: new Date(0).toISOString(),
  location: "Tokyo",
  source: "@puruhpuruweather",
};
