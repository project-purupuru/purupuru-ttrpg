export type { Precipitation, WeatherFeed, WeatherState } from "./types";
import { liveWeatherFeed } from "./live";
import type { WeatherFeed } from "./types";

export const weatherFeed: WeatherFeed = liveWeatherFeed;
