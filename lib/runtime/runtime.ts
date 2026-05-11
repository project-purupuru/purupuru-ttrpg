import { Layer, ManagedRuntime } from "effect";
import { WeatherLive } from "@/lib/live/weather.live";
import { SonifierLive } from "@/lib/live/sonifier.live";

// THE single Effect.provide site for the app. Lint check: a grep for
// `ManagedRuntime.make` in lib/ or app/ should return exactly one match
// — this file. A second site would fragment the service graph and
// fork the Layer scope.
export const AppLayer = Layer.mergeAll(WeatherLive, SonifierLive);
export const runtime = ManagedRuntime.make(AppLayer);
