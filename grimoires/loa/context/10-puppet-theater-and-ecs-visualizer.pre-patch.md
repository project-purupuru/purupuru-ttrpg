---
title: puppet theater and ecs visualizer
status: candidate
composes_with: [architecture-and-layering, daemon-nft-as-composed-runtime]
created: 2026-05-11
source: gemini · substrate↔agentic translation layer · file 4 of 5
---

# Puppet Theater and ECS Visualizer

the operator requires a visualizer · a puppet theater for the daemons. the three.js scene acts as the world. each daemon NFT is a puppet, comprising a mesh and an animator. the strings driving the puppets are the events emitted by the substrate. the ECS ≡ Effect ≡ Hexagonal isomorphism guarantees this composes cleanly. ECS provides the system/component/entity grammar native to game engines, and the daemon NFT is already modeled as an entity.

three.js is uniquely suited for this translation. instanced meshes allow rendering thousands of daemons with a single shader call. the declarative scene graph maps directly to our React tree and metadata structures. GPU-driven particle systems visualize the event emissions natively. post-processing provides the ambient sky aesthetic inherited from the compass hades-pattern.

the ECS-to-three.js bridge connects the axes of the daemon architecture to rendering subsystems. the stack axis maps to the mesh hierarchy. the civic axis determines the camera focus and audience layout. the exodia axis composes the material slots and shaders. the time axis drives the animation timeline, with state-receipts acting as keyframes. the community axis manages the spatial partitioning of the shared scene.

a minimum viable puppet theater requires strict adherence to the substrate doctrine. the MVP consists of specific files using the suffix convention:

* `world.system.ts` · the central ECS loop.
* `puppet.component.ts` · the visual state data.
* `event-stream.port.ts` · the interface for incoming on-chain and finn events.
* `puppet-renderer.live.ts` · the three.js instanced mesh implementation.
* `axis-time.system.ts` · the timeline interpolator.

in this theater, the three-way translation becomes visceral. when a daemon emits an event · a state transition · the operator sees the same event at three altitudes simultaneously. it appears as a glowing particle emitted by the mesh in the scene. it logs as a formatted row in the freeside activity stream UI. it registers as a pending transaction in the Solana log panel.

the puppet theater is not a demo. it is an experimentation thesis. it is a substrate for play. operators use the theater to test compositions and axis interactions before shipping to mainnet. constructs validate behavioral outputs visually before claiming a daemon stage. the theater mirrors the production substrate exactly.

## Sources

* [https://github.com/0xHoneyJar/construct-effect-substrate](https://github.com/0xHoneyJar/construct-effect-substrate)
* [https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md](https://github.com/0xHoneyJar/loa/blob/main/docs/ecosystem-architecture.md)
