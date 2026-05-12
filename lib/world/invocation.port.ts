/**
 * Invocation Service · write-only command surface for ceremony triggers.
 *
 * Per state-ownership matrix: owns commandsPubSub (publishes only).
 * NOT to be confused with lib/ceremony/ which contains UI animation utilities (BB-011 rename).
 */

import { Context, Effect, Stream } from "effect";
import type { Element } from "@/lib/score";

export type InvocationCommand =
  | { readonly _tag: "TriggerStoneClaim"; readonly element: Element }
  | { readonly _tag: "ResetPopulation" }
  | { readonly _tag: "ShiftWeather"; readonly toElement: Element };

export class Invocation extends Context.Tag("compass/Invocation")<
  Invocation,
  {
    readonly invoke: (cmd: InvocationCommand) => Effect.Effect<void>;
    readonly commands: Stream.Stream<InvocationCommand>;
  }
>() {}
