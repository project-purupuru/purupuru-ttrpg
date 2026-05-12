import { Layer, ManagedRuntime } from "effect";
import { WeatherLive } from "@/lib/live/weather.live";
import { SonifierLive } from "@/lib/live/sonifier.live";
// S1 lifts (substrate-agentic-2026-05-12 cycle):
import { ActivityLive } from "@/lib/activity/activity.live";
import { PopulationLive } from "@/lib/sim/population.live";

// THE single Effect.provide site for the app. Lint check: a grep for
// `ManagedRuntime.make` in lib/ or app/ should return exactly one match
// — this file. A second site would fragment the service graph and
// fork the Layer scope.
export const AppLayer = Layer.mergeAll(
  WeatherLive,
  SonifierLive,
  ActivityLive,
  PopulationLive,
);
export const runtime = ManagedRuntime.make(AppLayer);
