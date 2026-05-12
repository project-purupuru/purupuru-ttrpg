"use client";
/**
 * AwarenessExample · copy-paste reference for wiring world Services into Next.js.
 * Operator pattern: import the runtime, get the Service, call its methods inside useEffect.
 */
import { useEffect, useState } from "react";
import { Effect } from "effect";
import { runtime } from "@/lib/runtime/runtime";
import { Awareness, type AwarenessState } from "@/lib/world/awareness.port";

export function AwarenessExample() {
  const [state, setState] = useState<AwarenessState | null>(null);
  useEffect(() => {
    const program = Effect.gen(function* () {
      const awareness = yield* Awareness;
      return yield* awareness.current;
    });
    runtime.runPromise(program).then(setState).catch(console.error);
  }, []);
  if (!state) return <pre>loading awareness…</pre>;
  return (
    <pre style={{ fontFamily: "monospace", fontSize: 11 }}>
      population: {state.populationCount}
      {"\n"}distribution: {JSON.stringify(state.distribution)}
      {"\n"}observed: {state.observedAt}
    </pre>
  );
}
