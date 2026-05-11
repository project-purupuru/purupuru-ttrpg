# effect-substrate · how to organize a TS app around ECS + Effect + Hexagonal

> Status: `candidate` · validated in 1 project (compass · 2026-05-11) ·
> needs ≥ 3 projects to promote to `active`.

This pack names the isomorphism between three architectural vocabularies that
keep proposing the same shape:

| ECS (game dev) | Effect (FP) | Hexagonal (Cockburn) |
|---|---|---|
| World | Layer | The application |
| System | Service | Use case |
| Component | Schema record | DTO / value object |
| Archetype query | Port interface | Port |
| Live implementation | Layer.succeed | Adapter |

**The doctrine in one sentence:** name the boundary, type the boundary, and let
implementations move behind it.

## When to fire this pack

- You've shipped enough that the implementation is half-emergent in the code.
  Look for: a `subscribe(cb)` pattern · a singleton with a global state machine
  · the same try/catch boilerplate at 3+ sites · element/token tables
  redeclared per component.
- Test count says the behavior is locked. Wrapping a working imperative module
  is FAGAN-safe; rewriting it during the refactor is not.
- You want **agent-readable**, not just human-readable. Subagents enumerate
  behavior surfaces via grep; they need filenames that say what files are.

## What this pack adopts

Read the patterns in order — each builds on the previous:

1. **[domain-ports-live](patterns/domain-ports-live.md)** — the four-folder
   pattern. Pure shape → service interface → production adapter → test
   adapter. Each folder has one job.

2. **[suffix-as-type](patterns/suffix-as-type.md)** — the filename suffix
   discipline (`*.port.ts`, `*.live.ts`, `*.mock.ts`, `*.system.ts`) that
   makes the behavior surface enumerable in one `find` command.

3. **[ecs-effect-isomorphism](patterns/ecs-effect-isomorphism.md)** — the
   mapping table above, expanded with the boundary semantics. Tells you
   when ECS framing is load-bearing vs decorative.

4. **[delete-heavy-cycle](patterns/delete-heavy-cycle.md)** — the refactor
   recipe. Adopt this pack in an existing codebase by *deleting* more than
   you write. Net LOC must go negative.

The worked example — [compass-cycle-2026-05-11](examples/compass-cycle-2026-05-11.md)
— shows the recipe applied end-to-end.

## What this pack is NOT

- **Not an Effect tutorial.** Read the [Effect docs](https://effect.website/docs/requirements-management/services/)
  for the framework. This pack covers organization, not language.
- **Not a 'rewrite-everything-in-Effect' mandate.** The Effect surface lives
  at boundaries. Inside an adapter, write whatever the domain needs (imperative
  classes, raw promises, audio nodes). Adoption is incremental.
- **Not ECS-everywhere.** ECS framing is most useful for entity-heavy domains
  (sim · game · streaming). Document boundaries that look like CRUD on records
  don't gain from the System/Component reframe.

## Promotion criteria

This pack stays `candidate` until adopted by at least three projects, one of
which is non-Next.js. Each adoption updates `provenance.validated_in` in
[construct.yaml](construct.yaml) with the net LOC delta and a 1-line lesson.

## Composes with

- **the-arcade** (OSTROM lens) for architecture decisions at the seam.
- **artisan** (ALEXANDER lens) for FAGAN-safe refactor discipline.
