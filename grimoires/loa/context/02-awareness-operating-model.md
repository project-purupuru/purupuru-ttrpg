---
title: Purupuru Awareness Operating Model
type: context
status: draft
created: 2026-05-07
authority: zksoju operator context
companion_to:
  - grimoires/loa/prd.md
  - grimoires/loa/sdd.md
purpose: "A human-and-agent operating model for scaffolding the Purupuru awareness layer without overbuilding."
---

# Purupuru Awareness Operating Model

This document is the operator map for building the Purupuru awareness layer.
It is not a final implementation spec, and it is not a demand to create every package on day one.

The goal is to make the architecture legible enough that humans and agents can place new work in the right boundary without turning the repo into a maze.

## 1. Core Pushback

Do not make "package" equal "ECS component."

An ECS component is typed data attached to an entity. `Element`, `WeatherReading`, `Affinity`, `BaziQuizState`, and `VisualState` should not each become packages. They should usually be data shapes inside a domain package.

A package is a responsibility boundary. It exists when a part of the system needs its own ownership, tests, import rules, or adapter surface.

The architecture should help isolate responsibilities. It should not create ceremony before the first vertical slice works.

## 2. The Five Questions

When adding a feature, ask these in order:

1. What is true?
2. What happened?
3. What computes from it?
4. Where did the data come from?
5. Where is it shown?

These map to architecture boundaries:

| Question | Boundary | Example |
|---|---|---|
| What is true? | Domain schema / ECS component data | `BaziQuizState`, `Element`, `WeatherReading` |
| What happened? | World event substrate | `WeatherEvent`, `MintEvent`, `ElementShiftEvent` |
| What computes from it? | System / pure domain workflow | `BaziResolverSystem`, `EventIdSystem` |
| Where did data come from? | Source adapter | Score API, Sonar GraphQL, weather fixture |
| Where is it shown? | Medium adapter / app | Blink response, OG card, Discord post |

The app route is the last mile. It should wire systems together. It should not own game rules.

## 3. Working Mental Model

The user experience may look like this:

```txt
User answers quiz
  -> BaziQuizState component data
  -> BaziResolverSystem derives Element + Archetype
  -> WorldEvent may be emitted
  -> MediumBlinkRenderer turns result into a Solana Action response
  -> app route returns payload to the client
```

The app is where deployment, HTTP, and framework concerns live. The systems live below it.

## 4. Module Map

Start smaller than the final architecture. The first useful scaffold is:

```txt
apps/
  blink-emitter/
    Next.js routes, Vercel runtime, Solana Action endpoints, OG image routes.

packages/
  peripheral-events/
    WorldEvent, BaziQuizState, canonical eventId, Effect Schema validation,
    typed accessors, fixtures.

  world-sources/
    Score, Sonar, weather, and fixture adapters.
    This package knows how to talk to external systems.

  medium-blink/
    Blink response rendering, BLINK_DESCRIPTOR constraints,
    Solana Action response builders.

fixtures/
  Stable JSON examples for local development, tests, and world-lab previews.
```

Add these later only when pressure exists:

```txt
packages/
  game-domain/
    Shared ECS vocabulary and pure game/world rules if peripheral-events grows too broad.

  visual-registry/
    Named materials, effects, typography, colors, motion presets, and render tokens.

tools/
  puru/
    Tiny agent/operator CLI for map, explain, fixture, and boundary checks.

programs/
  purupuru-anchor/
    Solana Anchor program. Minimal projection of domain state, not game rules.
```

## 5. Composition Flow

Preferred flow:

```txt
source adapter
  -> domain schema / event substrate
  -> pure system
  -> medium renderer
  -> app route
```

Concrete example:

```txt
ScoreAdapter / WeatherFixture
  -> BaziQuizState + WeatherReading
  -> BaziResolverSystem
  -> MediumBlinkRenderer
  -> POST /api/actions/quiz/result
```

Avoid this:

```txt
Next route
  -> random API call
  -> random CSS/design constants
  -> inline game rules
  -> one-off Solana response
```

That shape ships quickly once, then becomes hard for agents and humans to safely extend.

## 6. Import Rules

Use simple one-way imports:

```txt
apps/* may import packages/*

packages/medium-* may import:
  - peripheral-events
  - game-domain when it exists

packages/world-sources may import:
  - peripheral-events
  - external clients

packages/peripheral-events should not import:
  - Next.js
  - React
  - Solana Action route code
  - concrete Score/Sonar clients
  - rendering libraries

programs/* should not depend on TypeScript runtime packages.
It may share concepts and generated IDL/schema references, but the chain program remains its own projection.
```

If a package import feels convenient but violates these rules, prefer a port/interface or a fixture.

## 7. Effect TS And ECS

ECS is the world model:

```txt
Entity: an ID, such as player, quiz session, world event, or genesis stone.
Component: typed data attached to an entity, such as Element or WeatherReading.
System: behavior that queries component data and writes new component data or events.
```

Effect TS is the boundary and workflow model:

```txt
Schema validation
typed errors
dependency injection
test layers
external service calls
structured observability
```

Good Effect TS use:

```txt
decode quiz state
fetch score affinity
derive archetype
authorize mint
render Blink response
log structured result
```

Avoid wrapping every tiny pure function in Effect. Keep simple math and simple transformations simple.

## 8. Brownfield Rule

Do not move existing Purupuru materials, effects, typography, colors, fixtures, and design systems into new packages immediately.

Wrap first. Move later.

Good:

```txt
visual-registry resolves "fire-card-glow" to an existing material/effect implementation.
Medium renderer asks for a named visual preset.
```

Bad:

```txt
Blink route imports random material files and hardcodes visual behavior.
```

The existing Purupuru world already has valuable design and effect work. The awareness layer should consume that work through stable names and adapters, not rewrite it.

## 9. World Lab

The world lab is a visual learning and debugging surface. It is not a product surface and not a full editor.

Minimum useful lab:

```txt
Preview:
  - Blink card
  - archetype card
  - quiz result
  - mock mint outcome

Controls:
  - Element
  - WeatherReading energy/confidence
  - quiz answers
  - score affinity fixture
  - visual preset
  - motion preset

Actions:
  - derive archetype
  - emit weather event
  - render Blink
  - mock mint
  - export fixture JSON
```

The rule: every control should map to component data or a system command.

Good:

```txt
Control changes WeatherReading.energy.
System derives result.
Preview renders result.
```

Bad:

```txt
Control directly changes random CSS or bypasses domain data.
```

## 10. Agent Navigation

Agents should orient by responsibility, not by guessing filenames.

Ask:

```txt
Am I changing domain truth?
  -> peripheral-events or game-domain

Am I changing an external integration?
  -> world-sources

Am I changing one presentation medium?
  -> medium-blink or another medium package

Am I changing deployment/framework glue?
  -> apps/blink-emitter

Am I changing visual tuning?
  -> world-lab / visual-registry / named preset

Am I changing on-chain projection?
  -> programs/purupuru-anchor
```

Future tiny CLI commands may help:

```bash
puru map
puru module peripheral-events
puru explain BaziQuizState
puru fixture quiz-fire
puru render blink --fixture quiz-fire
puru check-boundaries
```

Do not build this CLI before the architecture map and first vertical slice exist.

## 11. How Loa Fits

Loa owns project memory and operating discipline. It does not own runtime architecture.

Use Loa artifacts this way:

```txt
grimoires/loa/prd.md
  What we intend to build.

grimoires/loa/sdd.md
  The architecture claim and implementation plan.

grimoires/loa/context/*
  Operator mental models, design doctrine, unresolved framing.

grimoires/loa/reality/*
  What is actually built now.

grimoires/loa/a2a/*
  Reviews, adversarial feedback, sprint artifacts.
```

When implementation lands, reality should be regenerated or updated so agents can compare intended architecture against actual code.

## 12. What Not To Build Yet

Do not build these first:

```txt
- a full product CLI
- a literal ECS engine
- a package per ECS component
- a full visual editor
- a custom plugin framework
- a rewrite of existing visual/design systems
- generalized Discord/Telegram/Twitter adapters before Blink works
```

Build one vertical slice first:

```txt
Bazi quiz fixture
  -> archetype derivation
  -> Blink response preview
  -> fixture-backed world lab
```

Then let the second slice tell us which abstraction is actually earning its keep.

## 13. Operator Checklist

Before approving new work, ask:

```txt
Which boundary owns this?
Can it be tested with a fixture?
Does it import only in the allowed direction?
Is this domain logic or presentation?
Is the route thin?
Will an agent know where to change this next time?
```

If the answer is unclear, write the boundary first. Then write code.

