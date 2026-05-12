---
status: draft
type: sdd
cycle: substrate-agentic-translation-adoption-2026-05-12
mode: arch + adopt
prd: grimoires/loa/prd.md
created: 2026-05-12
operator: zksoju
---

# SDD · Substrate-Agentic Translation Layer · Compass Adoption Cycle

## 1 · Abstract (PRAISE-001 verbatim · load-bearing)

> **The original 5-doc Gemini synthesis (`grimoires/loa/context/07..11-*.md`) proposed inventing a translation layer. KEEPER pre-flight + grounding in upstream repos established that the translation layer already exists. This cycle is INTEGRATION, not invention.**

This SDD describes HOW compass conforms to three already-shipping upstream substrates per PRD D1-D6:
- **Hand-port** ~5 hounfour schemas as Effect Schemas owned in `compass/lib/domain/` (D1)
- **Vendor** rooms-substrate handoff envelope JSON files into `compass/lib/domain/schemas/` (D5)
- **Doc-only** force-chain mapping + compile-time TypeScript brand-type fence for verify⊥judge (D2)
- **In-memory only** persistence for new system layers (D4)
- **No new top-level folders** — chain-bindings stay in `lib/live/` (D5)
- **Envelope-shell first** then narrow `verdict` typing in S2 (D6)

The SDD's customer is the implementer agent in S1-S6 sprints and the operator pair-points at gates. Every section names file paths · code shapes · acceptance criteria · NOT design rationale (PRD owns rationale).

## 2 · Stack & decisions

### 2.1 · Confirmed stack (from compass repo state · NOT changed by cycle)

| Layer | Tech | Compass version |
|---|---|---|
| Runtime | Next.js | 16.2.6 (Turbopack default) |
| UI | React | 19.2.4 |
| Styles | Tailwind | 4.x (`@tailwindcss/postcss` · `@theme` in CSS, no JS config) |
| Schema/Effects | `effect` | from package.json (verify pin at S0) |
| Chain | Solana / Anchor / Metaplex | unchanged |
| Pkg manager | pnpm | 10.x |

### 2.2 · New dependencies introduced this cycle

| Package | Sprint | Purpose | Justification |
|---|---|---|---|
| `ajv` + `ajv-formats` | S1 | Validate vendored handoff envelope JSON Schemas at parse boundaries | NFR-SEC-3 · structural conformance · already-canonical JSON Schema validator |
| `expect-type` (or `tstyche`) | S3 | Verify⊥judge compile-time fence assertion | Q6 / NFR-SEC-1 |
| **NOT** `@sinclair/typebox` | — | — | PRD D1 explicitly forbids · compass does not host TypeBox |
| **NOT** `loa-hounfour` (npm) | — | — | PRD D1 hand-port pattern · upstream is reference, not import |
| **NOT** `loa-straylight` (npm) | — | — | PRD D2 doc-only · zero runtime imports |

### 2.3 · Resolved SDD-level decisions (PRD §11 closures)

**SDD-D1 · Single `Effect.provide` site for the new envelope** (PRD §11 Q1). The existing `lib/runtime/` directory is the host. New file: `lib/runtime/world.runtime.ts` that exports `WorldRuntime` Effect Layer composing all world systems + envelope routing. `app/layout.tsx` invokes `Runtime.fromLayer(WorldRuntime)` at the React root.

**SDD-D2 · Drift-detection mechanism** (PRD §11 Q2). GitHub Actions weekly cron at `.github/workflows/hounfour-drift.yml`. Runs `pnpm hounfour:drift` which: (a) reads each `lib/domain/*.hounfour-port.ts` · (b) reads its `Source: hounfour@<sha>:schemas/<file>` annotation · (c) fetches `https://raw.githubusercontent.com/0xHoneyJar/loa-hounfour/<sha>/schemas/<file>.schema.json` (or local clone if available) · (d) parses both, runs structural diff via `json-schema-diff` package · (e) writes report to `grimoires/loa/drift-reports/YYYY-MM-DD.md` · (f) opens GitHub issue if delta > 2 fields.

**SDD-D3 · Hand-port idiom: `Schema.Struct` baseline · `Schema.Class` for branded types** (PRD §11 Q3). Default to `Schema.Struct({...})` for plain records (matches existing compass pattern in `peripheral-events/src/world-event.ts`). Use `Schema.Class<T>("Name")({...})` ONLY when (a) the type needs nominal identity OR (b) the type is wrapped by a brand (e.g., `VerifiedEvent<T>`). Rationale: keeps imports light · matches compass's prevailing style · Class adds named identifier in error messages where it matters.

**SDD-D4 · Compass-as-fixture-vs-tutorial** (PRD §11 Q4 / IMP-016) · DEFER to S6 distill. SDD does not commit; S6 operator pair-point decides whether to PR a `compass-conformance.test.ts` upstream into hounfour CI.

## 3 · Type-system bridge implementation (D1)

### 3.1 · Hand-port file convention

For each candidate hounfour schema in PRD §5.1.1, ship one file at `lib/domain/<name>.hounfour-port.ts`:

```typescript
/**
 * Hand-port of hounfour `<name>` schema as Effect Schema.
 *
 * Source: hounfour@<resolved-S0-SHA>:schemas/<name>.schema.json
 * Drift policy: see lib/domain/__tests__/<name>.drift.test.ts
 *
 * DO NOT EDIT to match an evolving upstream — let the drift CI flag deltas.
 * Adopting an upstream change requires bumping the SHA + re-porting + operator pair-point.
 */
import { Schema as S } from "effect"

export const <Name>Port = S.Struct({
  // 1:1 mapping of upstream JSON Schema fields
  // Optionality, nullability, enums match upstream semantics
})

export type <Name>Port = S.Schema.Type<typeof <Name>Port>

// Runtime conformance check at module load (NFR-SEC-3 surface)
export const <Name>UpstreamSchema = require("./schemas/hounfour-<name>.schema.json")
```

### 3.2 · Per-port test substrate

Each `*.hounfour-port.ts` ships with:

| File | Role |
|---|---|
| `lib/domain/__tests__/<name>.port.test.ts` | Decode / encode round-trip · sample payload conformance |
| `lib/domain/__tests__/<name>.drift.test.ts` | Structural-diff test against vendored JSON Schema · runs on every CI |
| `lib/domain/<name>.mock.ts` | Factory function returning a valid mock instance |

### 3.3 · Vendored JSON Schema location

Vendored copies of upstream JSON Schemas live at `lib/domain/schemas/hounfour-<name>.schema.json`. These are NOT edited; they are refreshed by the operator at S6 (or when the SHA pin moves).

### 3.4 · Hand-port checklist for each schema (S2 task contract)

1. Read upstream `schemas/<name>.schema.json` at the pinned SHA.
2. Vendor as `lib/domain/schemas/hounfour-<name>.schema.json`.
3. Author `lib/domain/<name>.hounfour-port.ts` following §3.1.
4. Author `<name>.mock.ts` factory with realistic defaults.
5. Author `__tests__/<name>.port.test.ts` with decode + encode round-trip + 1 invalid-input case.
6. Author `__tests__/<name>.drift.test.ts` that asserts structural equivalence (uses `ajv.compile(upstreamSchema)` against `Schema.encode(<Name>Port)(mockInstance)`).
7. Run `pnpm test` — must stay green.
8. Operator pair-point review for Effect-Schema idiom-fit before marking sprint-task closed.

## 4 · Envelope vendoring implementation (D5)

### 4.1 · Vendoring procedure

Two JSON files copied verbatim from `~/Documents/GitHub/construct-rooms-substrate/data/trajectory-schemas/`:

| Source | Vendored at |
|---|---|
| `room-activation-packet.schema.json` | `lib/domain/schemas/room-activation-packet.schema.json` |
| `construct-handoff.schema.json` | `lib/domain/schemas/construct-handoff.schema.json` |

Both files are copy-only · no edits. Provenance comment in `lib/domain/schemas/README.md` names the source SHA (resolved at S0 per PRD §10.5).

### 4.2 · Effect Schema mirror at type level

`lib/domain/handoff.schema.ts`:

```typescript
import { Schema as S } from "effect"

const OutputType = S.Literal("Signal", "Verdict", "Artifact", "Intent", "Operator-Model")
const InvocationMode = S.Literal("room", "studio", "headless")

// Verdict starts as Unknown per PRD D6 · narrows in S2
export const ConstructHandoff = S.Struct({
  construct_slug: S.String,
  output_type: OutputType,
  verdict: S.Unknown, // S2 narrows to discriminated union of hand-ported types
  invocation_mode: InvocationMode,
  cycle_id: S.String,
  // optional fields per upstream schema
  persona: S.optional(S.String),
  output_refs: S.optional(S.Array(S.String)),
  evidence: S.optional(S.Unknown),
})
export type ConstructHandoff = S.Schema.Type<typeof ConstructHandoff>

// Vendored JSON Schema for runtime AJV validation
export const ConstructHandoffSchema = require("./schemas/construct-handoff.schema.json")
```

### 4.3 · AJV validation utility

`lib/domain/validate-envelope.ts`:

```typescript
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { ConstructHandoffSchema } from "./handoff.schema"

const ajv = new Ajv({ allErrors: true, strict: true })
addFormats(ajv)
const validate = ajv.compile(ConstructHandoffSchema)

export const validateEnvelope = (input: unknown) => {
  if (!validate(input)) throw new EnvelopeValidationError(validate.errors)
  return input as ConstructHandoff
}
```

### 4.4 · Output_type coverage rule (Q4)

S1 adds CI step:

```bash
# .github/workflows/envelope-coverage.yml
node -e "
  const events = require('./packages/peripheral-events/src/world-event.ts')
  // count discriminated union variants vs output_type annotations
  // fail if mismatch
"
```

(Actual implementation uses ts-morph or simpler regex on the source file. SDD names the surface; sprint plan picks tooling.)

## 5 · Single Effect.provide site (SDD-D1)

### 5.1 · `lib/runtime/world.runtime.ts`

```typescript
import { Layer, Effect } from "effect"
import { ActivityLive } from "@/lib/activity"
import { WeatherLive } from "@/lib/weather"
import { PopulationLive } from "@/lib/sim/population.live"
import { CeremonyLive } from "@/lib/ceremony"
// S4 additions:
import { WorldSystemLive } from "@/lib/world/world.system"
import { AwarenessLive } from "@/lib/world/awareness.live"
import { ObservatoryLive } from "@/lib/world/observatory.live"
// import { CeremonyPortLive } from "@/lib/world/ceremony.live"  // S4 task

export const WorldRuntime = Layer.mergeAll(
  ActivityLive,
  WeatherLive,
  PopulationLive,
  CeremonyLive,
  WorldSystemLive,
  AwarenessLive,
  ObservatoryLive,
)
```

### 5.2 · React-root wiring

`app/layout.tsx` (sprint S1 modification):

```typescript
import { Runtime } from "effect"
import { WorldRuntime } from "@/lib/runtime/world.runtime"

const runtime = Runtime.fromLayer(WorldRuntime)

// Provide via React Context provider · components use a thin hook
```

### 5.3 · Grep rule (FR-S1-4 enforcement)

`grep -rn "Layer.provideMerge\|Runtime.fromLayer" --include="*.ts" --include="*.tsx" lib/ app/` MUST return ≤ 1 hit (the one in `lib/runtime/world.runtime.ts` AND `app/layout.tsx`). CI step in S1.

## 6 · Force-chain mapping + compile-time fence (D2 / FR-S3-1..3)

### 6.1 · Force chain doc shape

`grimoires/loa/context/13-force-chain-mapping.md` ships with this skeleton:

```markdown
| Step | Compass surface | Gate location | Status |
|---|---|---|---|
| observation | weather + activity events flow | lib/activity/index.ts | ✅ exists |
| memory | activity stream history | lib/activity/index.ts (Stream subscription) | ✅ exists |
| belief | KEEPER-style aggregation | NOT YET — placeholder for puruhani-aware | 🟡 doc-only |
| instruction | ceremony invocation | lib/ceremony/* | ✅ exists |
| plan | (no compass surface yet · post-cycle) | — | ⏳ deferred |
| permission | wallet signature gate | lib/blink/sponsored-payer.ts | ✅ exists (Solana scope) |
| action | claim message exec | lib/blink/claim-message.ts | ✅ exists |
| commitment | Solana tx confirmation | claim handler | ✅ exists (Solana scope) |
| permanence | on-chain state | Solana program | ✅ exists |
```

### 6.2 · Compile-time brand-type fence

`lib/domain/verify-fence.ts` (no straylight import per D2):

```typescript
import { Effect } from "effect"
import { Schema as S } from "effect"

// Branded marker — only constructable via verify()
declare const VerifiedBrand: unique symbol
export type Verified<T> = T & { readonly [VerifiedBrand]: true }

export class VerifyError extends S.TaggedError<VerifyError>()(
  "VerifyError",
  { reason: S.String },
) {}

export class JudgeError extends S.TaggedError<JudgeError>()(
  "JudgeError",
  { reason: S.String },
) {}

/**
 * Verify is pure · substrate-anchored. Accepts raw T, returns Verified<T>.
 * Implementation = AJV validation against the vendored JSON Schema.
 */
export const verify = <T>(
  schema: S.Schema<T>,
  input: unknown,
): Effect.Effect<Verified<T>, VerifyError, never> =>
  S.decodeUnknown(schema)(input).pipe(
    Effect.map((decoded) => decoded as Verified<T>),
    Effect.mapError((cause) => new VerifyError({ reason: String(cause) })),
  )

/**
 * Judge is LLM-bound (in future cycles) · revocable.
 * INVARIANT: signature requires Verified<T> · raw T won't typecheck.
 */
export const judge = <T, R>(
  e: Verified<T>,
  judgmentFn: (e: T) => Effect.Effect<R, JudgeError, never>,
): Effect.Effect<R, JudgeError, never> => judgmentFn(e)
```

### 6.3 · Compile-time fence assertion (Q6 surface)

`lib/test/judge-fence.spec-types.ts`:

```typescript
import { expectType, expectError } from "tstyche"
import { verify, judge, type Verified } from "@/lib/domain/verify-fence"
import { Schema as S } from "effect"
import { Effect } from "effect"

const TestSchema = S.Struct({ id: S.String })
type Test = S.Schema.Type<typeof TestSchema>

// PASSING: judge accepts Verified<Test>
const verified: Verified<Test> = {} as Verified<Test>
expectType<Effect.Effect<string, never, never>>(
  judge(verified, (e) => Effect.succeed(e.id)),
)

// FAILING: judge MUST reject raw Test
const raw: Test = { id: "x" }
expectError(
  // @ts-expect-error -- raw T is not assignable to Verified<T>
  judge(raw, (e) => Effect.succeed(e.id)),
)
```

CI step in S3:

```bash
# package.json scripts
"test:types": "tstyche lib/test/judge-fence.spec-types.ts"
```

Failure of either expectation = CI red.

### 6.4 · Issue-on-straylight contract (FR-S3-4)

After landing the brand-type fence, sprint S3 closes by opening one issue on `0xHoneyJar/loa-straylight`:

> **Title**: compass adoption tracker [substrate-agentic-2026-05-12]
>
> **Body**: Compass implements a compile-time verify⊥judge fence at `lib/domain/verify-fence.ts:1` using a `Verified<T>` brand. When Phase 23b ships the signed-assertion API, is this brand-shape compatible with that contract — i.e., would `Verified<T>` correspond to a `RecallReceipt<T>` or do we need to refactor to a different shape?

## 7 · World substrate (S4 · D3)

### 7.1 · `lib/world/` umbrella

NEW directory · 12 files maximum (G5b budget):

```
lib/world/
├── SKILL.md                       # FR-S4-4 · agent navigation surface
├── world.system.ts                # composes all systems · orchestrator
├── awareness.port.ts              # what does awareness expose
├── awareness.live.ts              # impl
├── awareness.mock.ts              # test substrate
├── awareness.test.ts
├── observatory.port.ts            # read of world state
├── observatory.live.ts
├── observatory.mock.ts
├── observatory.test.ts
├── ceremony.port.ts               # write into world state (wraps existing lib/ceremony/)
├── ceremony.live.ts
├── ceremony.mock.ts
└── ceremony.test.ts
```

If S4 task analysis at S0 reveals more systems are needed, operator pair-point per FR-S4-6.

### 7.2 · Port shape contract

Every `*.port.ts` follows this Effect Service pattern:

```typescript
import { Context, Effect, Stream } from "effect"

export interface AwarenessShape {
  readonly currentState: Effect.Effect<AwarenessState, never, never>
  readonly stateChanges: Stream.Stream<AwarenessChange, never, never>
  readonly invoke: (cmd: AwarenessCommand) => Effect.Effect<AwarenessAck, AwarenessError, never>
}

export class Awareness extends Context.Tag("compass/Awareness")<
  Awareness,
  AwarenessShape
>() {}
```

Three primitives per port: read · subscribe · write. This is the contract every system honors so the agent grep test works (Q operator-vibe-check).

### 7.3 · Wiring example component (FR-S4-3)

For each new port, ship one Next.js component example at `app/_components/<system>-example.tsx`:

```typescript
"use client"
import { useEffect, useState } from "react"
import { runtime } from "@/lib/runtime/use-runtime"
import { Awareness } from "@/lib/world/awareness.port"
import { Effect, Stream } from "effect"

export function AwarenessExample() {
  const [state, setState] = useState<AwarenessState | null>(null)
  useEffect(() => {
    const fiber = runtime.runFork(
      Effect.gen(function* () {
        const awareness = yield* Awareness
        const initial = yield* awareness.currentState
        setState(initial)
        yield* Stream.runForEach(awareness.stateChanges, (change) =>
          Effect.sync(() => setState((s) => applyChange(s, change))),
        )
      }),
    )
    return () => runtime.runSync(fiber.interruptAsFork(fiber.id()))
  }, [])
  return <pre>{JSON.stringify(state, null, 2)}</pre>
}
```

Operator copy-pastes pattern into actual app routes when integrating.

### 7.4 · `lib/world/SKILL.md` template (FR-S4-4)

```markdown
# Compass · world substrate

Agent: this directory is the umbrella for compass's world experience.
Each system is one port + one live + one mock + one test.

## Systems

- `awareness` — what the world believes is happening (read+subscribe+write)
- `observatory` — read-only projection of awareness for display
- `ceremony` — write-only invocation surface (wraps lib/ceremony/)

## How to add one

1. Copy the awareness.* trio (port + live + mock + test).
2. Update `world.system.ts` to merge the new Live Layer.
3. Add a `<system>-example.tsx` showing how to wire it.
4. Update this SKILL.md.

## Guarantees

- All cross-system events flow through `lib/runtime/world.runtime.ts` (single Effect.provide site).
- All envelopes carry `output_type` ∈ Signal/Verdict/Artifact/Intent/Operator-Model.
- No system reads or writes Solana directly; that's `lib/live/solana.live.ts`'s job.
```

### 7.5 · No persistence · no Solana writes (D4 enforcement)

CI grep rules:

```bash
# any new file in lib/world/ MUST NOT import @solana/web3.js OR write to KV
grep -rE "from ['\"]@solana|kvSet|kv\.put" lib/world/ # must be empty
```

### 7.6 · Operator iteration test (FR-S4-6)

After S4 ships:

```bash
# Operator runs:
git checkout -b test/rename-awareness
git mv lib/world/awareness.{port,live,mock,test}.ts lib/world/{a-rename}.{port,live,mock,test}.ts
# update lib/runtime/world.runtime.ts import path
pnpm test  # must stay green in 1 commit
```

Pass = ship S4. Fail = re-design system layout.

## 8 · Hand-port idiom guide (SDD-D3)

### 8.1 · Default: `Schema.Struct`

```typescript
export const AgentIdentityPort = S.Struct({
  agent_id: S.String,
  display_name: S.String,
  capabilities: S.Array(S.String),
})
```

### 8.2 · `Schema.Class` ONLY when nominal identity matters

```typescript
export class AuditTrailEntryPort extends S.Class<AuditTrailEntryPort>("AuditTrailEntryPort")({
  ts: S.DateFromString,
  actor: S.String,
  action: S.String,
  evidence: S.Unknown,
}) {}
```

Rationale: Class-based gives named identity in error messages, useful for audit-trail debugging. Plain Struct is enough for value types.

### 8.3 · Brand types for verify⊥judge fence

`Verified<T>` (§6.2) uses `unique symbol` brand. Operator-confirmed pattern · do NOT use `S.brand("...")` because we want the unbranding to happen ONLY through `verify()` not through arbitrary brand-stripping.

## 9 · Drift-detection mechanism (SDD-D2 / Q10)

### 9.1 · `pnpm hounfour:drift` script

`scripts/hounfour-drift.ts`:

```typescript
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const portFiles = readdirSync("lib/domain")
  .filter(f => f.endsWith(".hounfour-port.ts"))

const reports: DriftReport[] = []
for (const file of portFiles) {
  const content = readFileSync(join("lib/domain", file), "utf-8")
  const sourceMatch = content.match(/Source: hounfour@(\w+):schemas\/(\S+\.schema\.json)/)
  if (!sourceMatch) continue
  const [, sha, schemaPath] = sourceMatch
  const upstreamUrl = `https://raw.githubusercontent.com/0xHoneyJar/loa-hounfour/${sha}/${schemaPath}`
  const upstream = await fetch(upstreamUrl).then(r => r.json())
  const vendored = JSON.parse(readFileSync(`lib/domain/schemas/hounfour-${file.replace(".hounfour-port.ts", ".schema.json")}`, "utf-8"))
  const diff = structuralDiff(upstream, vendored)  // uses json-schema-diff package
  if (diff.changes.length > 0) reports.push({ file, sha, diff })
}

// emit report · open issue if delta > threshold
```

### 9.2 · CI workflow

`.github/workflows/hounfour-drift.yml`:

```yaml
name: hounfour drift detection
on:
  schedule:
    - cron: "0 6 * * 1"  # Mondays 6am UTC
  workflow_dispatch:

jobs:
  drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install
      - run: pnpm hounfour:drift
      - if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Hounfour drift detected ${new Date().toISOString().slice(0,10)}`,
              body: require('fs').readFileSync('grimoires/loa/drift-reports/latest.md', 'utf-8'),
              labels: ['drift']
            })
```

## 10 · Testing approach

### 10.1 · Layered tests

| Layer | Test kind | Tool |
|---|---|---|
| Schema decode | Round-trip + invalid input | vitest + Effect Schema decode |
| Schema drift | Structural diff against vendored JSON | json-schema-diff |
| Compile-time fence | Type-error assertion | tstyche or expect-type |
| Port + Live + Mock | Effect Layer composition test | vitest + Effect Layer.provide test layer |
| World system integration | Composes all S4 systems · runs against mocks | vitest |
| Existing tests | Continue to pass | vitest (pnpm test) |

### 10.2 · No new test infrastructure

No Playwright. No Storybook. No new bench harness. Compass already has vitest; new tests slot in.

## 11 · CI / lint additions

### 11.1 · Per-sprint CI additions

| Sprint | New CI step | Purpose |
|---|---|---|
| S1 | `pnpm envelope-coverage` | FR-S1-2 100% output_type tagging |
| S1 | `grep -c "Layer.provideMerge\|Runtime.fromLayer"` ≤ 2 | FR-S1-4 single Effect.provide site |
| S2 | `pnpm hounfour:drift` (manual until S6 cron) | Q10 drift detection |
| S3 | `pnpm test:types` (tstyche) | Q6 compile-time fence |
| S4 | `find compass/lib -name '*card*' -o -name '*battle*'` empty | Q card-game-stays-out gate |
| S4 | `grep -rE "from ['\"]@solana\|kvSet" lib/world/` empty | D4 in-memory enforcement |
| S4 | `find lib -path '*adapter*'` empty | D5 no adapters folder |
| S6 | `find . -path '*/construct-translation-layer*'` empty | §2.3 cuts list (CI lint forever) |

### 11.2 · Suffix discipline lint (NFR-MAINT-1)

NEW `eslint-plugin-local` rule OR simpler: `scripts/check-suffixes.sh`:

```bash
# every *.live.ts must have a sibling *.port.ts
# every *.live.ts SHOULD have a sibling *.mock.ts
# enforced as warning (not error) initially
```

## 12 · Deployment considerations

### 12.1 · Vercel-safe imports

All vendored JSON Schemas are bundled at build time (Next.js handles `require("./schemas/*.json")` natively). No operator-machine paths in compiled output.

### 12.2 · No new env vars this cycle

Hand-port pattern needs no API keys. Drift detection runs against public GitHub raw URLs (no auth).

### 12.3 · No Solana program changes

D4 in-memory enforcement preserves current Solana posture. The deployed Anchor program is untouched.

## 13 · File inventory by sprint

### 13.1 · S0 (no code · only docs)

- `grimoires/loa/context/12-hounfour-conformance-map.md` — FR-S0-1
- `grimoires/loa/specs/upstream-issue-templates.md` — FR-S0-3 templates
- `NOTES.md` decision log entry — FR-S0-4 + Q7 promotion gate result
- PRD §10.5 SHA-pin manifest filled in

### 13.2 · S1 (envelope shell)

NEW:
- `lib/domain/schemas/construct-handoff.schema.json` (vendored)
- `lib/domain/schemas/room-activation-packet.schema.json` (vendored)
- `lib/domain/schemas/README.md`
- `lib/domain/handoff.schema.ts`
- `lib/domain/validate-envelope.ts`
- `lib/runtime/world.runtime.ts`
- `lib/runtime/use-runtime.ts` (React hook)
- `.github/workflows/envelope-coverage.yml`
- `scripts/check-envelope-coverage.ts`

MODIFIED:
- `app/layout.tsx` — Runtime.fromLayer wiring
- `lib/activity/index.ts:42-48` — migrate subscribe(cb) to Effect.PubSub
- `lib/sim/population.system.ts:69` — migrate subscribe(cb) to Effect.PubSub
- `packages/peripheral-events/src/world-event.ts` — add `output_type` annotation to every union variant

### 13.3 · S2 (hand-port hounfour)

NEW (per candidate schema · §5.1.1 · ~5-8 schemas):
- `lib/domain/<name>.hounfour-port.ts`
- `lib/domain/<name>.mock.ts`
- `lib/domain/__tests__/<name>.port.test.ts`
- `lib/domain/__tests__/<name>.drift.test.ts`
- `lib/domain/schemas/hounfour-<name>.schema.json` (vendored copy)
- `scripts/hounfour-drift.ts`

MODIFIED:
- `lib/domain/handoff.schema.ts` — narrow `verdict: S.Unknown` → discriminated union of hand-ported types

### 13.4 · S3 (force-chain doc + compile-time fence)

NEW:
- `grimoires/loa/context/13-force-chain-mapping.md`
- `lib/domain/verify-fence.ts`
- `lib/test/judge-fence.spec-types.ts`
- (one issue opened on loa-straylight via FR-S3-4)

MODIFIED:
- `package.json` — `tstyche` (or `expect-type`) added · `test:types` script
- `.github/workflows/test-types.yml` — CI step for compile-time fence

### 13.5 · S4 (world substrate)

NEW (per §7.1):
- 14 files in `lib/world/`
- 4 files in `app/_components/<system>-example.tsx`
- `scripts/check-world-discipline.sh` (D4 enforcement grep)

MODIFIED:
- `lib/runtime/world.runtime.ts` — merge S4 Live Layers

### 13.6 · S5 (multi-world playbook)

NEW:
- `grimoires/loa/specs/per-world-adoption-playbook.md`

### 13.7 · S6 (distill upstream)

MODIFIED (in `~/Documents/GitHub/loa-constructs/packs/effect-substrate/` or wherever `construct-effect-substrate` lives):
- pack manifest: `status: candidate` → `status: validated · 1-project`
- SKILL.md: add hand-port pattern reference
- examples/: add `compass-adoption-example.md`

NEW:
- `.github/workflows/hounfour-drift.yml` (cron · per §9.2)
- Possibly: `compass-conformance.test.ts` PR'd upstream into hounfour CI (SDD-D4 · operator-decided)

## 14 · Sequencing & rollback (NFR-ROLLBACK)

### 14.1 · Per-sprint feature branches

```
main
└── feat/substrate-agentic-adoption
    ├── feat/sa-s0-conformance-audit       # PR · merge to feat/sa parent
    ├── feat/sa-s1-envelope-shell          # PR · merge to feat/sa parent
    ├── feat/sa-s2-hand-port-hounfour      # PR · merge to feat/sa parent
    ├── feat/sa-s3-force-chain-fence       # PR · merge to feat/sa parent
    ├── feat/sa-s4-world-substrate         # PR · merge to feat/sa parent
    ├── feat/sa-s5-multi-world-playbook    # PR · merge to feat/sa parent
    └── feat/sa-s6-distill-upstream        # PR · merge to feat/sa parent
# Final: PR feat/substrate-agentic-adoption → main · cycle close
```

### 14.2 · Atomic commit contract (NFR-ROLLBACK-3)

Each S2 hand-port = one commit per schema (`adopt-hounfour-<name>: hand-port + drift test + mock`). `git revert` of one commit removes one schema cleanly.

### 14.3 · Test-failure pause threshold (NFR-ROLLBACK-2)

If `pnpm test` fails > 5 simultaneously after any S1-S4 commit, sprint pauses + operator pair-point. CI auto-comments on the PR.

### 14.4 · Inter-sprint rollback

Each `feat/sa-sN-*` branch is independently revertable to `feat/substrate-agentic-adoption`. No cross-sprint commits in S0-S5.

## 15 · Open SDD-level decisions (none currently · all in PRD §11 closed via D1-D6 + SDD-D1-D4)

Anything that emerges during S0-S6 implementation surfaces via NOTES.md decision log + operator pair-point.
