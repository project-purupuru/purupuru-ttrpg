/**
 * Observatory Service · read-only projection of world state for display.
 *
 * Per state-ownership matrix: NO writes to any Ref/PubSub. Pure reader.
 * Reads from awareness + (optionally) weather.
 */

import { Context, Effect } from "effect";
import type { Element } from "@/lib/score";

export interface ObservatoryProjection {
  readonly leadingElement: Element | null;
  readonly populationTotal: number;
  readonly elementBreakdown: ReadonlyArray<{ element: Element; count: number; share: number }>;
  readonly observedAt: string;
}

export class Observatory extends Context.Tag("compass/Observatory")<
  Observatory,
  {
    readonly project: Effect.Effect<ObservatoryProjection>;
  }
>() {}
