---
status: candidate
type: naming doctrine + repo topology RFC
created: 2026-05-14
mode: ARCH
domain: project-purupuru repository taxonomy
source_class: operator decision crystallization
use_label: usable-after-review
owners: project-purupuru maintainers
---

# Purupuru Repo Taxonomy

## Thesis

Repo names are agent-facing type signatures.

In the agentic age, the repo list is not just navigation for humans. It is the
first routing surface for agents. If a repo name and description do not say
what kind of thing the repo is, agents infer ownership from vibes, history, or
the files they happen to see first. That creates accidental sources of truth.

Purupuru should use the same grammar that works in the 0xHoneyJar/Freeside
ecosystem:

```text
freeside-<module>     = generic installable module contract
<module>-purupuru     = Purupuru implementation or consumer of that module
world-purupuru        = deployed Purupuru world composition
world-purupuru-*      = deployment/app surface within the Purupuru world family
compass               = current workbench/sub-surface, not canonical substrate
```

The important shift: Purupuru repos are not only "domain repos." Many are
instances of Freeside module types. The name should say which Freeside module
they consume or implement.

## Naming Grammar

### Generic Module

Use `freeside-<module>` for reusable module contracts in the Freeside ecosystem.

Examples:

- `freeside-storage`
- `freeside-score`
- `freeside-worlds`
- `freeside-auth`

These repos define generic contracts, schemas, ports, adapters, CLIs, or
operational doctrine. They do not contain Purupuru-specific product truth unless
it is an example fixture.

### Purupuru Module Instance

Use `<module>-purupuru` when the repo is the Purupuru-specific implementation,
configuration, or consumer of a Freeside module.

Examples:

- `storage-purupuru`: Purupuru storage implementation; consumes
  `freeside-storage`; owns bucket layout, S3/CDN mirror policy, asset publish
  configuration, parity checks, and storage-specific runbooks.
- `score-purupuru`: Purupuru scoring implementation; consumes
  `freeside-score`; owns Purupuru behavioral intelligence, score adapters, and
  score-specific schema extensions.
- `game-purupuru`: Purupuru game substrate; owns Wuxing rules, cards, match
  lifecycle, burn/transcendence, collection state, and headless test adapters.
- `assets-purupuru` or `purupuru-assets`: Purupuru visual asset substrate; owns
  bytes, labels, manifests, generated projections, and publish plans.

Capability-first names are preferred when the repo implements a broader module
type. `score-purupuru` is more useful to agents than `purupuru-score` because it
answers "what kind of module is this?" before "which world is it for?"

### World Composition

Use `world-purupuru` for the deployed Purupuru world composition.

`world-purupuru` consumes Purupuru module instances and binds them into a live
experience. It owns presentation, deployment wiring, routes, environment
coordination, and app-level integration.

It does not own canonical storage, score, asset, game, or contract truth if
those substrates have dedicated module repos.

### World Sub-Surfaces

Use `world-purupuru-*` for separately deployed apps or surfaces that are part of
the Purupuru world family.

Examples:

- `world-purupuru-compass`
- `world-purupuru-sky-eyes`
- `world-purupuru-observatory`

Use this shape only when the surface has an independent deployment/runtime
identity. If it is just a route or package inside the world app, keep it under
`world-purupuru/apps/<surface>`.

### Compass

`compass` is currently the primary operator workbench and integration zone. It
has also accumulated substrate work because it was the place where features were
discovered and stabilized.

Directionally, Compass should be demoted from "source of truth" to
"world-purupuru sub-surface/workbench."

Acceptable future shapes:

- `world-purupuru/apps/compass` if Compass becomes an app inside the world
  monorepo.
- `world-purupuru-compass` if Compass needs separate deployment/runtime
  ownership.
- Keep repo name `compass` only if its GitHub description explicitly says it is
  the Compass sub-surface for `world-purupuru`, not the canonical substrate.

## Repository Class Table

| Class | Name Pattern | Owns | Does Not Own |
|---|---|---|---|
| Freeside module | `freeside-<module>` | Generic contract, schema, ports, installable module behavior | Purupuru product truth |
| Purupuru module instance | `<module>-purupuru` | Purupuru implementation/configuration of one module type | Full world composition |
| World composition | `world-purupuru` | Deployment, routes, presentation, app-level integration | Canonical module contracts |
| World surface | `world-purupuru-*` or `apps/<surface>` | Independent world-family app surface | Cross-module substrate truth |
| Workbench | `compass` | Operator exploration, integration proving ground, Loa planning artifacts | Durable canonical schemas once extracted |
| Construct | `construct-*` | Agent expertise/persona/procedure pack | Product runtime state |

## Schema Ownership

Schemas live with the authority that owns the behavior.

- `freeside-<module>/schemas`: generic module contract.
- `<module>-purupuru/schemas`: Purupuru-specific implementation contract.
- `world-purupuru/schemas`: world-composition contracts only.
- `compass/grimoires/loa/schemas`: planning, mirrors, and transition contracts;
  not the final canonical home unless the behavior is Compass-only.

Vendored schemas must include provenance:

```text
source repo
source commit or release
refresh policy
local owner
allowed local divergence
```

If Compass needs to consume a schema from an upstream module, it should vendor
or pin it with provenance instead of silently becoming the schema authority.

## Current Purupuru Mapping

| Current Repo/Area | Directional Identity | Notes |
|---|---|---|
| `compass` | `world-purupuru` workbench/sub-surface | Primary integration zone today; should shed canonical substrates as they stabilize. |
| `world-purupuru` | world composition | Should become the clearest home for deployed Purupuru app surfaces. |
| `purupuru-assets` | `assets-purupuru` class | Name may stay for continuity, but description should say "Purupuru visual asset substrate." |
| `score` | `score-purupuru` | Implementation of score for Purupuru; consumer of `freeside-score`. |
| `game` or `lib/honeycomb` | `game-purupuru` with package `@purupuru/honeycomb` | Honeycomb can remain the internal engine name. Repo should say game substrate. |
| `contracts` | `contracts-purupuru` or `purupuru-contracts` | Capability-first is preferred if aligned with Freeside module grammar. |
| `sonar` / `radar` | likely `indexer-purupuru-*` or module-specific names | Keep poetic names only if descriptions state contract role clearly. |
| `fukuro` / `observatory` | `world-purupuru-*` surface or score/eval module | Decide by ownership: app surface vs evaluation substrate. |
| `puru` | `ui-purupuru` or `design-purupuru` | Shared design tokens/materials should be typed as UI/design substrate. |

## Honeycomb Direction

Honeycomb is the current in-Compass game substrate. It is mechanically healthy:

- `lib/honeycomb/SKILL.md` defines the room contract and service ownership.
- `*.port.ts`, `*.live.ts`, and `*.mock.ts` make services grep-enumerable.
- `scripts/check-honeycomb-discipline.sh` keeps React, Next, chain SDKs, and
  backend clients out of the substrate.

The naming improvement is to separate repo identity from engine identity:

```text
repo:    game-purupuru
package: @purupuru/honeycomb
engine:  Honeycomb
```

Agents then know:

- `game-purupuru` is the Purupuru game substrate repo.
- `@purupuru/honeycomb` is the importable headless engine package.
- Honeycomb is the internal rules/match/burn/collection engine, not a whole
  world app.

## Extraction Sequence

Do not move everything at once. Use naming first, extraction second.

1. Update repository descriptions so GitHub search gives agents clear routing.
2. Add README boundary sections to each active repo:
   - what this is
   - what this is not
   - owned contracts
   - consumed upstream modules
   - integration points
   - forbidden responsibilities
3. In Compass, move stabilized substrates into local packages before repo
   extraction:
   - `packages/honeycomb` for `@purupuru/honeycomb`
   - `packages/asset-contracts` only if needed as a temporary mirror
   - preserve app imports through package exports instead of arbitrary internals
4. Create or rename dedicated Purupuru module repos only after local package
   boundaries hold.
5. Replace Compass-owned schema mirrors with pinned upstream schema sources.
6. Demote Compass README language from "primary zone" to "Compass surface /
   operator workbench for world-purupuru."

## Repo Description Templates

### `storage-purupuru`

> Purupuru implementation of Freeside storage: S3/CDN mirror policy, asset
> storage keys, parity checks, publish plans, and storage runbooks. Consumes
> `freeside-storage`; does not own canonical asset labels or frontend display
> logic.

### `score-purupuru`

> Purupuru implementation of Freeside score: behavioral intelligence,
> element-affinity scoring, score adapters, and Purupuru score schemas. Consumes
> `freeside-score`; does not own world presentation or wallet/auth behavior.

### `game-purupuru`

> Headless Purupuru game substrate: Honeycomb rules engine, Wuxing graph, card
> definitions, match lifecycle, clash resolution, burn/transcendence, collection
> state, and deterministic test adapters. Consumed by `world-purupuru`; does not
> own deployed UI routes.

### `world-purupuru`

> Deployed Purupuru world composition: app routes, presentation, deployment
> wiring, and integration of Purupuru modules such as assets, game, score,
> storage, and contracts. Owns world experience; does not own extracted module
> contracts.

### `world-purupuru-compass`

> Compass surface for `world-purupuru`: operator workbench, integration proving
> ground, and Loa planning zone. Consumes Purupuru module contracts; does not own
> canonical storage, score, game, asset, or contract truth after extraction.

### `assets-purupuru` / `purupuru-assets`

> Purupuru visual asset substrate: source-controlled media bytes, SHA256 asset
> catalog, labels, provenance, generated projections, and storage publish plans.
> Consumed by world surfaces and storage publishing; does not own frontend
> display behavior or final visual truth without human-approved labels.

## Non-Goals

- This RFC does not rename repos by itself.
- This RFC does not move code out of Compass by itself.
- This RFC does not make Compass context files canonical substrate truth.
- This RFC does not require poetic names to disappear. It requires every poetic
  name to have a contract-shaped description.
- This RFC does not override Freeside generic module contracts.

## Acceptance Criteria

This doctrine is ready to promote from candidate when:

1. The operator approves the naming grammar.
2. GitHub descriptions for active Purupuru repos follow the grammar.
3. Compass README clearly says Compass is a surface/workbench, not the durable
   substrate authority.
4. At least one extracted substrate uses the pattern end-to-end:
   `freeside-<module>` generic contract plus `<module>-purupuru` implementation.
5. Future PRs have a rule: if they add durable schemas, they must name the owning
   repo class before implementation.

