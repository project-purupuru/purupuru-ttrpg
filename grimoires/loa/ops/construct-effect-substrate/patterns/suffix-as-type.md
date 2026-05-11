# Pattern · suffix-as-type (grep-enumerable behavior)

Filenames are agent-readable metadata. A consistent suffix convention turns
every `find` command into a contract enumeration.

## The four suffixes

| Suffix | Meaning | What lives there |
|---|---|---|
| `*.port.ts` | `Context.Tag` service interface | One per service. No impl. |
| `*.live.ts` | Production Layer | One per service, in production. |
| `*.mock.ts` | Test / dev Layer | One per service, for tests. |
| `*.system.ts` | ECS System (Effect.gen pipeline) | One per transform over components. |

## Why this matters

A fresh Claude (or human) joining the codebase can enumerate the application's
behavior surface in one second:

```bash
$ find lib -name '*.port.ts'
lib/ports/weather.port.ts
lib/ports/sonifier.port.ts

$ find lib -name '*.live.ts'
lib/live/weather.live.ts
lib/live/sonifier.live.ts

$ find lib -name '*.system.ts'
lib/sim/population.system.ts
```

**Three reads, three full surfaces.** Compare to a codebase where services
are scattered across `lib/weather/index.ts`, `lib/audio/sonify.ts`,
`lib/sim/population.ts` — same files, different vocabulary, no enumeration.

## Why filename-as-type beats import-organization

You could organize the same code by directory (`lib/services/`, `lib/ports/`)
without the suffix. That works for humans browsing in a file tree.

But:
- AI agents don't browse trees. They `grep` and `find`.
- Cross-cutting concerns (e.g. all `*.live.ts` files have the same shape:
  `Layer.succeed(Tag, { ... })`) are invisible to directory organization.
- A linter / CI check can enforce "every `*.live.ts` must export a `*Live`
  Layer" — suffix convention enables tooling.

## Enforcement (lightweight)

Two grep-based gates are enough for most teams:

### Gate 1 · single Effect.provide site

```bash
grep -r "ManagedRuntime\.make(" lib/ app/ --include='*.ts' --include='*.tsx' | wc -l
# = 1
```

### Gate 2 · suffix → file pairs

```bash
# Every *.port.ts has a corresponding *.live.ts:
for port in $(find lib/ports -name '*.port.ts'); do
  base=$(basename "$port" .port.ts)
  [[ -f "lib/live/${base}.live.ts" ]] || echo "MISSING: lib/live/${base}.live.ts"
done
```

Mocks can lag (some services don't need a mock for tests). The port + live
pairing is the load-bearing one.

## Failure modes this prevents

- **Service grew an implementation but no port** — caller imports concrete
  module directly, services become inseparable.
- **Two implementations of the same conceptual service** — one in
  `lib/foo.ts`, one in `lib/services/foo.ts`, neither named the same.
- **Test substitution requires monkey-patching** — without a Port + Mock
  pair, tests resort to `vi.mock(...)`, which is brittle and DOM-coupled.

## A note on `*.system.ts`

ECS Systems differ from Effect Services in that they process *batches* of
entities rather than expose request/response capabilities. The `*.system.ts`
suffix marks files that run an `Effect.gen` pipeline over a collection of
component records — typically called from a tick / frame loop rather than
from a route handler.

Example: `lib/sim/population.system.ts` exposes `populationStore` which a
canvas tick reads from every frame. It's not a *service* in the request-
response sense, but it IS a behavior surface that maps over components.

The suffix tells you the call shape before you open the file.
