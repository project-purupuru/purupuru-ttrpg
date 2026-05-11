# Pattern · domain · ports · live · mock (the four-folder pattern)

The four-folder pattern names the seam between *what shape data has* and
*what behavior the system performs on it*.

```
lib/
├── domain/          ← Schema only. Pure data shapes. No effects.
├── ports/           ← Context.Tag service interfaces. The behavior boundary.
├── live/            ← Production Layer implementations.
└── mock/            ← Test / dev Layer implementations.
```

This is Alistair Cockburn's Hexagonal Architecture (Ports & Adapters) folder-
realized for TypeScript with Effect Layer as the adapter mechanism.

## What lives where

### `domain/`

Pure data shapes — Effect Schema records, TypeScript types, branded
primitives, constants.

```ts
// lib/domain/element.ts
import { Schema } from "effect";

export const Element = Schema.Literal("wood", "fire", "earth", "metal", "water");
export type Element = Schema.Schema.Type<typeof Element>;
export const ELEMENT_KANJI: Record<Element, string> = { ... };
```

**Rules**:
- May import from `effect/Schema` and other `domain/*` files only.
- No runtime imports — no `fetch`, no `localStorage`, no `useEffect`.
- A `domain/` module is referentially transparent — same input always
  produces the same output.

### `ports/`

`Context.Tag` service interfaces. One file per service. The filename suffix
`*.port.ts` makes them grep-enumerable.

```ts
// lib/ports/weather.port.ts
import { Context, Effect, Stream } from "effect";
import type { WeatherState } from "@/lib/domain/weather";

export class WeatherFeed extends Context.Tag("WeatherFeed")<
  WeatherFeed,
  {
    readonly current: Effect.Effect<WeatherState>;
    readonly stream: Stream.Stream<WeatherState>;
  }
>() {}
```

**Rules**:
- A port file declares the *interface* only — never an implementation.
- May import from `domain/` and `effect`. Nothing else.
- The Service shape captures the *capability*, not the *language* — if the
  consumer wants both Effect access and a synchronous escape hatch, both
  go in the Service.

### `live/`

Production Layer implementations. One file per service: `*.live.ts`.

The Layer wraps the imperative core. The imperative core can be a class,
a module-singleton state machine, a third-party SDK — whatever the domain
needs. Effect appears only at the Layer boundary.

```ts
// lib/live/weather.live.ts
import { Effect, Layer, Stream } from "effect";
import { WeatherFeed } from "@/lib/ports/weather.port";

// Imperative module-private state machine — preserved exactly from the
// pre-refactor implementation. No behavior change.
let state: WeatherState = INITIAL_WEATHER_STATE;
function subscribe(cb: (s: WeatherState) => void): () => void { ... }

export const WeatherLive = Layer.succeed(WeatherFeed, {
  current: Effect.sync(() => state),
  stream: Stream.async<WeatherState>((emit) => {
    const unsub = subscribe((s) => emit.single(s));
    return Effect.sync(unsub);
  }),
});
```

**Rules**:
- Implementation can use any language idiom (classes, closures, raw
  promises, mutable state) — Effect lives at the boundary, not throughout.
- May import from `domain/`, `ports/`, and runtime libraries.
- Must NOT import from `app/` or React. Adapter is environment-agnostic.

### `mock/`

Test / dev Layer implementations. One file per service: `*.mock.ts`. Same
boundary, different source of data.

```ts
// lib/mock/weather.mock.ts
export const WeatherMock = Layer.succeed(WeatherFeed, {
  current: Effect.sync(() => mockState),
  stream: Stream.async<WeatherState>(...),  // emits drift on a schedule
});
```

**Rules**:
- Stand-in for `live/` — same Port, different Layer.
- Often the smaller / deterministic version of the live adapter.
- Tests reach for `WeatherMock` via `Layer.provide(WeatherMock)`.

## The single Effect.provide site

There is **exactly one** `ManagedRuntime.make` call in the app. It composes
all Layers and exports the runtime. Every other consumer goes through this:

```ts
// lib/runtime/runtime.ts
import { Layer, ManagedRuntime } from "effect";
import { WeatherLive } from "@/lib/live/weather.live";
import { SonifierLive } from "@/lib/live/sonifier.live";

export const AppLayer = Layer.mergeAll(WeatherLive, SonifierLive);
export const runtime = ManagedRuntime.make(AppLayer);
```

**Verification gate** (FAGAN-checkable):

```bash
grep -r "ManagedRuntime\.make(" lib/ app/ --include='*.ts' --include='*.tsx' | wc -l
# Should return 1
```

A second `ManagedRuntime.make` site forks the Layer scope and breaks Effect's
invariants — typically the symptom is "service not provided" errors at
runtime in components that bypass the central runtime.

## Why this composes

- **Domain** is the contract — both sides agree on shape.
- **Ports** is the negotiable surface — implementations can move behind it.
- **Live / Mock** are interchangeable Layers — `Layer.provide(WeatherMock)`
  in a test, `Layer.provide(WeatherLive)` in production.
- **Runtime** is the wiring — a single composition root, easy to audit.

This is Hexagonal Architecture's promise: the application's heart doesn't
care which adapter is plugged in. The four-folder layout makes the promise
visible at the filesystem level so a fresh reader (or AI agent) can see the
seam in one `ls`.
