import { Context, Effect, Stream } from "effect";
import type { WeatherState } from "@/lib/domain/weather";

export class WeatherFeed extends Context.Tag("WeatherFeed")<
  WeatherFeed,
  {
    readonly current: Effect.Effect<WeatherState>;
    readonly stream: Stream.Stream<WeatherState>;
  }
>() {}
