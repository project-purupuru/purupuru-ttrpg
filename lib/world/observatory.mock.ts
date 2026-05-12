/**
 * ObservatoryMock · returns a fixed projection.
 */

import { Effect, Layer } from "effect";
import { Observatory, type ObservatoryProjection } from "./observatory.port";

const defaultProjection: ObservatoryProjection = {
  leadingElement: null,
  populationTotal: 0,
  elementBreakdown: [],
  observedAt: new Date(0).toISOString(),
};

export const ObservatoryMock = (projection: ObservatoryProjection = defaultProjection) =>
  Layer.succeed(
    Observatory,
    Observatory.of({
      project: Effect.succeed(projection),
    }),
  );
