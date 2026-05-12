---
title: Lift-pattern template (S1-T10 deliverable)
type: cycle-template
cycle: substrate-agentic-translation-adoption-2026-05-12
status: ratified
applies_to: S4 (mechanically) · future world-substrate additions
---

# Lift-pattern template · canonical 4-file trio

Per BB-012 REFRAME + SDD §5.4: S1 establishes this pattern with `Activity` and `Population` lifts. S4 applies it mechanically to the world-substrate systems (`Awareness`, `Observatory`, `Invocation`).

## When to use

Any time you need to expose a vanilla TS singleton or callback-based subscriber as an **Effect Service** that the runtime can compose.

Triggers:
- A `subscribe(cb)` pattern with a singleton store
- A module-level state machine that consumers reach into
- Any cross-system event surface that should ride the canonical envelope

## The 4-file canonical trio (+ test = 4)

For a system named `<name>` (e.g., `awareness`):

```
lib/<dir>/
├── <name>.port.ts      # Effect Service Tag · contract
├── <name>.live.ts      # Layer.succeed wrapping the existing impl
├── <name>.mock.ts      # in-memory test substrate · per-instance state
└── __tests__/<name>.test.ts  # smoke + Layer.provide composition
```

Plus the runtime extension:

```typescript
// lib/runtime/runtime.ts (modify existing · DO NOT create new file)
import { <Name>Live } from "@/lib/<dir>/<name>.live";

export const AppLayer = Layer.mergeAll(
  // ... existing layers
  <Name>Live,
);
```

## Step-by-step procedure

### 1 · Author `<name>.port.ts`

```typescript
import { Context, Effect, Stream } from "effect";
import type { /* domain types */ } from "./types";

export class <Name> extends Context.Tag("compass/<Name>")<
  <Name>,
  {
    // 3 standard primitives: read · subscribe · write
    readonly current: Effect.Effect</* state */>;
    readonly events: Stream.Stream</* event */>;
    readonly invoke: (cmd: /* command */) => Effect.Effect</* ack */, /* error */>;
    // Add system-specific methods · keep the 3 standard ones for grep-discoverability
  }
>() {}
```

### 2 · Author `<name>.live.ts`

Wrap the existing impl. If the impl is a singleton with `subscribe(cb)`:

```typescript
import { Effect, Layer, Stream } from "effect";
import { <Name> } from "./<name>.port";
import { existingSingleton } from "./existing-impl";

export const <Name>Live = Layer.succeed(
  <Name>,
  <Name>.of({
    current: Effect.sync(() => existingSingleton.current()),
    events: Stream.async((emit) => {
      const unsubscribe = existingSingleton.subscribe((e) => {
        void emit.single(e);
      });
      return Effect.sync(() => unsubscribe());
    }),
    invoke: (cmd) => Effect.sync(() => existingSingleton.write(cmd)),
  }),
);
```

### 3 · Author `<name>.mock.ts`

Per-instance state · NO module singletons. Returns a Layer factory:

```typescript
import { Effect, Layer, Stream } from "effect";
import { <Name> } from "./<name>.port";

export const <Name>Mock = (seed: readonly /* state */[] = []) => {
  const buffer = [...seed];
  const subscribers = new Set<(e: /* event */) => void>();

  return Layer.succeed(<Name>, <Name>.of({
    current: Effect.sync(() => buffer.slice()),
    events: Stream.async((emit) => {
      const cb = (e: /* event */) => { void emit.single(e); };
      subscribers.add(cb);
      return Effect.sync(() => { subscribers.delete(cb); });
    }),
    invoke: (cmd) => Effect.sync(() => {
      buffer.push(/* derived */);
      for (const cb of subscribers) cb(/* event */);
    }),
  }));
};
```

### 4 · Author `__tests__/<name>.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { Effect, Layer } from "effect";
import { <Name> } from "../<name>.port";
import { <Name>Mock } from "../<name>.mock";

describe("<Name>Live lift", () => {
  it("current returns seeded state", async () => {
    const program = Effect.gen(function* () {
      const s = yield* <Name>;
      return yield* s.current;
    });
    const result = await Effect.runPromise(Effect.provide(program, <Name>Mock(/* seed */)));
    expect(result).toBeDefined();
  });
  // + 1-2 more for events/invoke
});
```

### 5 · Extend AppLayer in `lib/runtime/runtime.ts`

```typescript
import { <Name>Live } from "@/lib/<dir>/<name>.live";

export const AppLayer = Layer.mergeAll(
  WeatherLive,
  SonifierLive,
  ActivityLive,    // S1
  PopulationLive,  // S1
  <Name>Live,      // your addition
);
```

### 6 · Verify

```bash
pnpm test                                    # all tests pass
bash scripts/check-single-runtime.sh         # 1 ManagedRuntime.make site
```

## Naming conventions

| File | Suffix | Required? |
|---|---|---|
| `<name>.port.ts` | `.port.ts` | YES · grep-discovery |
| `<name>.live.ts` | `.live.ts` | YES · grep-discovery |
| `<name>.mock.ts` | `.mock.ts` | YES · test substrate |
| `__tests__/<name>.test.ts` | `.test.ts` | YES · vitest discovery |

Service Tag: `Context.Tag("compass/<Name>")` — prefix `compass/` distinguishes from upstream loa Service Tags.

## Anti-patterns

- ❌ Creating a new file in `lib/runtime/` (runtime.ts is THE single site · per BB-001)
- ❌ Authoring a Mock that uses module-singleton state (mocks must be per-instance)
- ❌ Forgetting `Layer.succeed` wrapping (raw object won't compose into AppLayer)
- ❌ Skipping `Stream.async` cleanup function (memory leak in test/dev)
- ❌ Adding `*.adapter.ts` files (NO new top-level adapter folder per D5)

## What S4 inherits

S4 systems (`Awareness`, `Observatory`, `Invocation`) follow this template **mechanically** · no novel design. The structural decisions are locked:

- Each system gets the 4-file trio
- Each system extends `AppLayer` (not a separate Layer)
- Each system has at least 1 `*-example.tsx` component in `app/_components/`
- Each system declares state ownership in `lib/world/SKILL.md` (BB-006)
- No system writes to a Ref/PubSub it doesn't own (CI-enforced)

## Reference impls

- `lib/activity/activity.{port,live,mock,test}.ts` — exemplar
- `lib/sim/population.{port,live,mock,test}.ts` — exemplar
- `lib/live/weather.live.ts` (existing) · already follows pattern · reference for IO-heavy Live
- `lib/live/sonifier.live.ts` (existing) · reference for Web-API-bound Live
