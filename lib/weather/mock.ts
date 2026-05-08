import type { WeatherFeed, WeatherState } from "./types";

const STATIC_STATE: WeatherState = {
  temperature_c: 14,
  precipitation: "clear",
  cosmic_intensity: 0.62,
  amplifiedElement: "fire",
  amplificationFactor: 1.0,
  observed_at: new Date(0).toISOString(),
};

export const mockWeatherFeed: WeatherFeed = {
  subscribe(_cb: (s: WeatherState) => void): () => void {
    return () => {};
  },
  current(): WeatherState {
    return STATIC_STATE;
  },
};
