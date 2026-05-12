/**
 * Awareness Service · the world's consolidated belief about what's happening.
 * Composes weather + activity + population into one queryable + observable surface.
 *
 * Lift-pattern reference: grimoires/loa/specs/lift-pattern-template.md
 * Force-chain mapping: step 3 belief (per grimoires/loa/context/13-force-chain-mapping.md)
 */

import { Context, Effect, Stream } from "effect";
import type { Element } from "@/lib/score";

export interface AwarenessState {
  readonly populationCount: number;
  readonly distribution: Record<Element, number>;
  readonly recentEventCount: number;
  readonly currentWeatherElement: Element | null;
  readonly observedAt: string;
}

export interface AwarenessChange {
  readonly _tag: "PopulationDrift" | "WeatherShift" | "ActivitySpike";
  readonly delta: number;
  readonly observedAt: string;
}

export class Awareness extends Context.Tag("compass/Awareness")<
  Awareness,
  {
    readonly current: Effect.Effect<AwarenessState>;
    readonly changes: Stream.Stream<AwarenessChange>;
  }
>() {}
