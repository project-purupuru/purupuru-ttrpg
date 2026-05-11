# Pattern · ECS ≡ Effect ≡ Hexagonal (the load-bearing insight)

Three architectural vocabularies have been describing the same structure for
years. Naming the isomorphism makes the choice between them a vocabulary
preference, not an architecture decision.

## The mapping

| ECS (game dev) | Effect (FP) | Hexagonal (Cockburn) | Filesystem |
|---|---|---|---|
| World | Layer | Application | `lib/runtime/runtime.ts` |
| System | Service (with capabilities) | Use case | `lib/ports/*.port.ts` |
| System impl | Layer.succeed(Tag, ...) | Adapter | `lib/live/*.live.ts` · `lib/mock/*.mock.ts` |
| Component | Schema record | DTO / value object | `lib/domain/*.ts` |
| Archetype query | Port interface | Port | `lib/ports/*.port.ts` |
| Entity | Schema-validated record + identity | Aggregate root | (domain layer) |
| Tick / frame | runFork the Layer | Application loop | `lib/runtime/react.ts` |

## What this is NOT

The mapping is not an instruction to use all three vocabularies at once. Pick
the one that matches the team's mental model:

- **Effect** — when the team thinks in terms of capabilities, dependency
  injection, and effect tracking.
- **ECS** — when the team thinks in terms of entities, components, and
  per-frame transforms.
- **Hexagonal** — when the team thinks in terms of inside / outside, ports,
  and adapters.

The four-folder pattern (`domain/ports/live/mock`) is the structure all
three converge on. Pick the words you like; keep the filenames.

## When ECS framing pays off

The ECS reframe is load-bearing when:

1. **Entity-heavy domain** — many records of the same shape that transform
   each frame (game sim, dataflow, streaming, animations).
2. **Cross-cutting "what runs over what"** — a System named
   `breath.system.ts` operates over all entities with a `Puruhani`
   component. The filename declares the contract.
3. **Tick-driven update loop** — there's a natural "advance state by dt"
   shape that doesn't fit request-response.

The ECS reframe is *decorative* when:

- Domain is CRUD on a few records with no per-frame transform.
- Service capabilities are request-response (fetch user · save preference).
  Effect's Service vocabulary fits cleaner.

## When Effect framing pays off

Effect framing is load-bearing when:

1. **Dependency injection needs** — services that are environment-specific
   (Live vs Mock) and need to swap by composition, not patching.
2. **Effect tracking matters** — async failure paths that should appear in
   the type signature (typed errors, retry policies, schedules).
3. **Concurrency / cancellation** — Fibers and Scopes are the natural fit
   for canvas loops, intervals, and subscription cleanup.

Effect framing is *decorative* when:

- You wrap a `fetch` call and that's it. Plain `try/catch` is shorter.
- The whole codebase is synchronous CPU work. Effect adds runtime cost
  for no benefit.

## When Hexagonal framing pays off

Hexagonal framing is load-bearing when:

1. **Multiple deployment targets** — same business logic shipped as a
   web app, a CLI, and an HTTP API. Ports + adapters per target.
2. **Strong test isolation needs** — tests run against the same Ports as
   production, with different Adapters. Layer composition does this
   automatically.
3. **Long codebase lifetime** — the inside / outside discipline is the
   one that ages best. Vocabulary survives framework migrations.

Hexagonal framing is *decorative* when:

- The app has one target (web only) and is throwaway in 6 months.

## The composition we recommend

For most TS apps with stateful in-world domains (compass, awareness layers,
games, dashboards with live streams):

1. **Adopt the four-folder pattern** — that's the Hexagonal layer.
2. **Name boundaries with Effect Context.Tag** — that's the Service layer.
3. **Reach for `*.system.ts` when the domain has per-frame transforms** —
   that's the ECS layer.

Don't pre-commit to all three vocabularies in greenfield. Add ECS when the
sim work gets heavy. Add Hexagonal when the second deployment target
arrives. Effect is the load-bearing one — adopt it for service boundaries
from the start.
