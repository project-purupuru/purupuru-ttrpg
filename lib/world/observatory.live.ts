/**
 * ObservatoryLive · pure projection of awareness state into display shape.
 * NO state ownership · NO writes.
 *
 * Captures Awareness in Layer.effect setup so Service methods have R = never.
 */

import { Effect, Layer } from "effect";
import type { Element } from "@/lib/score";
import { Observatory, type ObservatoryProjection } from "./observatory.port";
import { Awareness } from "./awareness.port";

export const ObservatoryLive = Layer.effect(
  Observatory,
  Effect.gen(function* () {
    const awareness = yield* Awareness;
    return Observatory.of({
      project: Effect.gen(function* () {
        const state = yield* awareness.current;
        const total = state.populationCount;
        const elements = Object.entries(state.distribution) as Array<[Element, number]>;
        const breakdown = elements.map(([element, count]) => ({
          element,
          count,
          share: total > 0 ? count / total : 0,
        }));
        const leader = breakdown.reduce<{ element: Element; count: number } | null>(
          (acc, cur) => (cur.count > (acc?.count ?? 0) ? cur : acc),
          null,
        );
        const projection: ObservatoryProjection = {
          leadingElement: leader?.count ? leader.element : null,
          populationTotal: total,
          elementBreakdown: breakdown,
          observedAt: state.observedAt,
        };
        return projection;
      }),
    });
  }),
);
