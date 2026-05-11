# Pattern · the delete-heavy refactor cycle

Adopt this pack in an existing codebase by *deleting* more than you write.
Net LOC must go negative. If it doesn't, you're rewriting, not organizing.

## When to fire

- Implementation is half-emergent in the code (a `subscribe(cb)` pattern, a
  module singleton with global state, the same try/catch boilerplate at 3+
  sites, element tables redeclared per component).
- Test count says behavior is locked.
- The team can spend a half-day or more on a coordinated pass.

## When NOT to fire

- During an active feature ship. Refactor in a clean room, not during
  product work.
- Before tests cover the relevant behavior. FAGAN-safe wrap requires
  *verifiable* behavior preservation.
- If the team is unfamiliar with Effect Layer + Context.Tag basics. Read
  the Effect docs first.

## The recipe (six sprints)

### Sprint 0 · prep

- Confirm test suite green at every package: `pnpm vitest run`.
- Capture visual baselines (optional, but the highest-ROI verification
  surface for UI-heavy apps). Skip only if visual diff via revert
  spot-checks is acceptable.
- Read the codebase enough to identify candidate hoists (the duplicated
  tables · the imperative singletons · the dead routes).

### Sprint 1 · domain hoist + dead-code purge (low-risk · parallel)

The fastest negative-LOC win. Three bundled moves:

1. **Hoist domain primitives** — element tables, token registries, anything
   redeclared in N components → one `lib/domain/<name>.ts`. Update the N
   importers. Estimated savings: 30-50 LOC.
2. **Hoist boilerplate helpers** — localStorage try/catch, retry wrappers,
   anything that's 5-10 lines copy-pasted at 3+ sites → one helper module.
   Estimated savings: 20-40 LOC.
3. **Delete dead code** — orphan routes, unused mocks, stale fixtures.
   Verify with `grep` before delete. Estimated savings: highly variable
   (compass shipped −1100 LOC from a single orphan route).

Commit shape: `feat(substrate): domain hoist + dead-code purge`.

### Sprint 2 · suffix rename + barrel (mechanical · zero risk)

Touch only filenames + imports. Pure mechanical pass:

- Find files whose name doesn't say what they are. Rename with the suffix
  convention (`population.ts` → `population.system.ts`).
- Update importers (`git mv` keeps history).
- Create a barrel (`lib/sim/index.ts`) that re-exports the package's surface.
  Existing consumers can continue deep-importing; the barrel is for new
  consumers and grep enumeration.

Commit shape: `refactor(sim): suffix-as-type rename + barrel`.

### Sprint 3 · Effect substrate (the heart of the cycle)

For each service that survives:

1. **Add `*.port.ts`** declaring the Context.Tag.
2. **Move the existing implementation to `*.live.ts`** — verbatim if possible.
   Wrap with `Layer.succeed(Tag, { ... })` at the file's bottom. The Layer
   exposes Effect surfaces (`current: Effect<T>`, `stream: Stream<T>`); the
   imperative core stays module-private.
3. **Move the mock to `*.mock.ts`** with the same wrapping pattern.
4. **Create `lib/runtime/runtime.ts`** with `Layer.mergeAll(...)` and
   `ManagedRuntime.make`. This is the ONE Effect.provide site.
5. **Wire consumers through a React adapter** (`useService` hook or a
   module-level handle) so React components see useState semantics, not
   Effect types.
6. **Delete the old shapes** — the original imperative files are now
   redundant.

**FAGAN-safe posture** (critical): wrap, don't rewrite. The behavior of the
service must be IDENTICAL before and after. The `*.live.ts` file contains
the original implementation verbatim — only the EXPOSED surface changes.
Behavior-change-masquerading-as-refactor is the most common failure mode.

Commit shape: `feat(substrate): Effect-layered <service> · ONE provide site`.

### Sprint 4 · style consolidation (highest visual risk)

CSS theme block consolidation, duplicate token cleanup. Highest risk because
visual regressions are expensive. Requires visual diff verification.

**Verify before deleting any failsafe**: search the codebase for explicit
comments about why a "duplicate" block exists. Architects often document the
JS-disabled / cold-paint failure case in a `try/catch` comment somewhere.

If the failsafe is intentional, skip the consolidation. The cycle's negative
LOC doesn't need this sprint to win.

Commit shape: `style(theme): collapse duplicate token blocks`. (Or skip.)

### Sprint 5 · docs slim + agent-readable substrate

- Cut em-dash density in the README (target ≤25 — they're tasty in moderation,
  but a hundred of them rot the eye).
- Add per-package `CLAUDE.md` declaring boundary · ports · layers · forbidden
  context. One file per workspace package.
- Add `public/llms.txt` if the project ships a public surface (per
  [llmstxt.org](https://llmstxt.org/)).
- Move long-form contributor docs out of root into `grimoires/loa/ops/`.

Commit shape: `docs(substrate): agent-readable index + per-package SKILL`.

### Sprint 6 · construct pack distillation

The doctrine ships as its own pack (`status: candidate`). After two more
project adoptions, promote to `active`.

## Success gates

The cycle is shippable when:

- ✅ **Net LOC negative** (target: −300 LOC · hard floor: 0).
- ✅ **One `Effect.provide` site** — grep returns exactly 1 file.
- ✅ **Suffix convention adopted** — `*.port.ts`, `*.live.ts`, etc. enumerate.
- ✅ **README em-dashes ≤ 25**.
- ✅ **Test suite green** at every commit (bisectable).
- ✅ **Visual diff zero unexpected pixels** (or revert spot-check OK).

If you write more than you delete, you're rewriting, not organizing. Stop
and rescope.

## FAGAN failure modes (Fagan inspection ·  catches what eyes miss)

1. **"While I'm here" refactor** — implementing session sees an unrelated
   thing to clean up. Counter: the build doc enumerates files. Anything not
   in the file list requires explicit operator approval or a follow-up
   sprint.
2. **`Effect.tryPromise` without `catch` typing** — leaves untyped errors in
   the channel. Counter: every `tryPromise` must declare a `catch` taking
   the failure mode and mapping to a domain error. OR: keep the imperative
   `try/catch returning null` pattern intact (FAGAN-safer; doesn't surface
   typed errors but preserves behavior).
3. **Two `Effect.provide` sites** — fastest way to break Effect's
   invariants. Counter: lint rule `grep -r 'ManagedRuntime\.make(' lib/ app/
   | wc -l` must equal 1.
4. **CSS theme regression** — collapse touches every theme consumer. Counter:
   pre-refactor visual baselines, post-refactor pixel diff, any divergence
   requires operator review. If you can't capture baselines, skip Sprint 4.

## Reference

Tef's "How to write disposable code in large systems"
([programmingisterrible.com](https://programmingisterrible.com/post/139222674273/how-to-write-disposable-code-in-large-systems))
is the doctrinal precedent. "Code is a liability" — the cycle treats it as such.
