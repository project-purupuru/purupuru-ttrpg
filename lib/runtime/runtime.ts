import { Layer, ManagedRuntime } from "effect";
import { WeatherLive } from "@/lib/live/weather.live";
import { SonifierLive } from "@/lib/live/sonifier.live";
// S1 lifts (substrate-agentic-2026-05-12 cycle):
import { ActivityLive } from "@/lib/activity/activity.live";
import { PopulationLive } from "@/lib/sim/population.live";
// S4 world substrate (substrate-agentic-2026-05-12 cycle):
import { AwarenessLive } from "@/lib/world/awareness.live";
import { ObservatoryLive } from "@/lib/world/observatory.live";
import { InvocationLive } from "@/lib/world/invocation.live";

// THE single Effect.provide site for the app. Lint check: a grep for
// `ManagedRuntime.make` in lib/ or app/ should return exactly one match
// — this file. A second site would fragment the service graph and
// fork the Layer scope.
//
// Composition: primitives at the bottom, derived layers on top. Awareness
// depends on Population + Activity. Observatory depends on Awareness.
// Each tier is provided into the next so the AppLayer surface has
// R = never (all deps resolved).
const PrimitivesLayer = Layer.mergeAll(
  WeatherLive,
  SonifierLive,
  ActivityLive,
  PopulationLive,
  InvocationLive,
);
const AwarenessOnPrimitives = Layer.provide(AwarenessLive, PrimitivesLayer);
const ObservatoryOnAwareness = Layer.provide(ObservatoryLive, AwarenessOnPrimitives);

export const AppLayer = Layer.mergeAll(
  PrimitivesLayer,
  AwarenessOnPrimitives,
  ObservatoryOnAwareness,
);
export const runtime = ManagedRuntime.make(AppLayer);
