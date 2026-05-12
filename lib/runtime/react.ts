"use client";

import { Effect, Fiber, Stream } from "effect";
import { useEffect, useState } from "react";
import { INITIAL_WEATHER_STATE, type WeatherState } from "@/lib/domain/weather";
import { WeatherFeed } from "@/lib/ports/weather.port";
import { Sonifier, type PlayEventOpts } from "@/lib/ports/sonifier.port";
import { runtime } from "./runtime";

// Subscribe to the WeatherFeed stream + seed with current. React consumers
// don't see the Effect surface — useState semantics only.
export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>(INITIAL_WEATHER_STATE);

  useEffect(() => {
    const fiber = runtime.runFork(
      Effect.gen(function* () {
        const feed = yield* WeatherFeed;
        const initial = yield* feed.current;
        setState(initial);
        yield* Stream.runForEach(feed.stream, (s) => Effect.sync(() => setState(s)));
      }),
    );
    return () => {
      runtime.runFork(Fiber.interrupt(fiber));
    };
  }, []);

  return state;
}

// Imperative sonifier handle backed by the Effect service. Module-level
// + stable so consumers can call from useEffect without adding it to deps
// (matches the prior getSonifier() singleton shape).
export const sonifier = {
  start: (): Promise<void> =>
    runtime.runPromise(
      Effect.gen(function* () {
        const s = yield* Sonifier;
        yield* s.start;
      }),
    ),
  stop: (): void => {
    runtime.runFork(
      Effect.gen(function* () {
        const s = yield* Sonifier;
        yield* s.stop;
      }),
    );
  },
  play: (opts: PlayEventOpts): void => {
    runtime.runFork(
      Effect.gen(function* () {
        const s = yield* Sonifier;
        yield* s.play(opts);
      }),
    );
  },
};
