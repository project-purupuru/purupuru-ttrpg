import { Context, Effect } from "effect";
import type { Element } from "@/lib/domain/element";

export interface PlayEventOpts {
  element: Element;
  kind: "join" | "mint";
  velocity?: number;
}

export class Sonifier extends Context.Tag("Sonifier")<
  Sonifier,
  {
    readonly start: Effect.Effect<void>;
    readonly stop: Effect.Effect<void>;
    readonly play: (opts: PlayEventOpts) => Effect.Effect<void>;
  }
>() {}
