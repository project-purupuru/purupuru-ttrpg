---
title: Per-world adoption playbook · loa substrate conformance
status: S5 deliverable · cycle substrate-agentic-translation-adoption-2026-05-12
type: cycle-doc
audience: future world curators (Pru, Sprawl, Mibera, etc.)
created: 2026-05-12
---

# Adoption playbook · how to bring your world onto the canonical loa substrate

Compass (Solana hackathon · Next.js) is the worked example. Three sister worlds — `world-purupuru`, `world-sprawl`, `world-mibera` — get the playbook here. None are forced to adopt; this is a checklist for when you're ready.

## The 6-step checklist

1. **Vendor the canonical envelope** · copy `~/Documents/GitHub/construct-rooms-substrate/data/trajectory-schemas/construct-handoff.schema.json` into your repo. Mirror as your stack's schema (Effect Schema, Zod, TypeBox, whatever).
2. **Annotate your event variants** with `output_type ∈ {Signal, Verdict, Artifact, Intent, Operator-Model}`. Add a CI check (compass: `scripts/check-envelope-coverage.sh`).
3. **Hand-port the hounfour schemas you need** · pin a SHA · vendor JSON Schemas · author Effect/Zod/TypeBox mirrors. Compass's set: `domain-event` + `audit-trail-entry` + `agent-identity` + `agent-lifecycle-state` + `capability-scoped-trust`. Yours may differ.
4. **Single Effect.provide site** · one `ManagedRuntime.make(AppLayer)` per app. Enforce with `grep -c "ManagedRuntime\.make(" lib/ app/`.
5. **Brand-type fence for verify⊥judge** · ZERO straylight runtime imports until Phase 23b lands. Compile-time `unique symbol` brand.
6. **Lift-pattern template** · for each system surface (UI module, daemon, agent), ship 4 files: `*.port.ts` + `*.live.ts` + `*.mock.ts` + `*.test.ts`.

Compass references throughout: `compass/grimoires/loa/specs/lift-pattern-template.md`.

## Per-world stub

### world-purupuru (Next.js · Wuxing tactics + bazi reading + soul engine)

Spiral engine prototype. Currently: vanilla TypeScript with side-channel CDN helpers (`lib/cdn.ts:1`). No Effect Layer composition yet. Adoption surface: lift `lib/cdn.ts` and similar service-shaped utilities into `*.port + *.live + *.mock` trios. Vendor envelope schemas. Compass's S1+S4 work is the closest template.

Predicted LOC: +400 substrate scaffold once the Spiral engine has its first composable Layer.

### world-sprawl (SvelteKit · cubquests + dashboard · Bun runtime)

Larger surface (`apps/`, `cubquests/`, `cubquests-dashboard/`). Already structured into apps + workspace packages. Adoption surface: define a top-level `runtime.ts` per app with `ManagedRuntime.make`, vendor the envelope schemas into a shared workspace package, lift cubquests state into Layered services. The `plur/vitest.workspace.ts:1` workspace-test config suggests the team already groks workspace-shape composition · adoption is a natural extension.

Predicted LOC: +600 substrate scaffold. Larger app footprint = more lift work.

### world-mibera (SvelteKit · realtime + wallet)

Already has Layer-shaped surfaces in idiomatic Svelte (`src/lib/realtime.svelte.ts:1`, `src/lib/wallet.svelte.ts:1`) using Svelte 5 runes. Adoption surface: vendor envelopes, hand-port hounfour, then the lift-pattern template adapts naturally to Svelte runes (one runes-export per port, one realtime/wallet wrapper per live).

Predicted LOC: +300 substrate scaffold. Smallest of the three — the rune-based architecture is closest to Effect Service shape conceptually.

## What this playbook is NOT

- Not mandatory · adoption is opt-in
- Not synchronous · each world adopts when ready
- Not a one-size-fits-all template · Effect Schema is the easiest target on TypeScript stacks but Zod/TypeBox are valid alternates
- Not a guarantee of cross-world interop · interop requires additional contracts (envelope routing, signed assertions when straylight ships)

## Cross-references

- Compass cycle artifacts: `~/bonfire/compass/grimoires/loa/{prd,sdd,sprint}.md`
- Lift-pattern template: `~/bonfire/compass/grimoires/loa/specs/lift-pattern-template.md`
- Force-chain mapping: `~/bonfire/compass/grimoires/loa/context/13-force-chain-mapping.md`
- Conformance map: `~/bonfire/compass/grimoires/loa/context/12-hounfour-conformance-map.md`
- Upstream tracking issues: `0xHoneyJar/loa-hounfour#115` · `construct-rooms-substrate#1` · `loa-straylight#26`
