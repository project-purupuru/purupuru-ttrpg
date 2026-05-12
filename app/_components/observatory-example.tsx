"use client";
import { useEffect, useState } from "react";
import { Effect } from "effect";
import { runtime } from "@/lib/runtime/runtime";
import { Observatory, type ObservatoryProjection } from "@/lib/world/observatory.port";

export function ObservatoryExample() {
  const [projection, setProjection] = useState<ObservatoryProjection | null>(null);
  useEffect(() => {
    const program = Effect.gen(function* () {
      const o = yield* Observatory;
      return yield* o.project;
    });
    runtime.runPromise(program).then(setProjection).catch(console.error);
  }, []);
  if (!projection) return <pre>loading observatory…</pre>;
  return (
    <pre style={{ fontFamily: "monospace", fontSize: 11 }}>
      leading: {projection.leadingElement ?? "(none)"}
      {"\n"}total: {projection.populationTotal}
      {"\n"}breakdown: {JSON.stringify(projection.elementBreakdown, null, 2)}
    </pre>
  );
}
