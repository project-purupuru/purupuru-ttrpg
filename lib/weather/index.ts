export type { Precipitation, WeatherFeed, WeatherState } from "./types";
import { mockWeatherFeed } from "./mock";
import type { WeatherFeed } from "./types";

export const weatherFeed: WeatherFeed = mockWeatherFeed;
