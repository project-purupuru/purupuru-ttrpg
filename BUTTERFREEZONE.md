<!-- AGENT-CONTEXT
name: purupuru-ttrpg
type: framework
purpose: ``` 🌧 daily weather (already broadcast by @puruhpuruweather)    ↓ 🪺 today's omen (gumi's template bank · keyed to wuxing element clash)    ↓ 🐝 your puruhani's reaction (wardrobe shifts per today's element)
key_files: [CLAUDE.md, .claude/loa/CLAUDE.loa.md, .loa.config.yaml, .claude/scripts/, .claude/skills/]
interfaces:
  core: [/auditing-security, /autonomous-agent, /bridgebuilder-review, /browsing-constructs, /bug-triaging]
  project: [/cost-budget-enforcer, /cross-repo-status-reader, /graduated-trust, /hitl-jury-panel, /loa-setup]
dependencies: [git, jq, yq]
capability_requirements:
  - filesystem: read
  - filesystem: write (scope: state)
  - filesystem: write (scope: app)
  - git: read_write
  - shell: execute
  - github_api: read_write (scope: external)
version: unknown
installation_mode: unknown
trust_level: L1-tests-present
-->

# purupuru-ttrpg

<!-- provenance: CODE-FACTUAL -->
``` 🌧 daily weather (already broadcast by @puruhpuruweather)    ↓ 🪺 today's omen (gumi's template bank · keyed to wuxing element clash)    ↓ 🐝 your puruhani's reaction (wardrobe shifts per today's element)

The framework provides 39 specialized skills, built with TypeScript/JavaScript, Python, Shell.

## Key Capabilities
<!-- provenance: CODE-FACTUAL -->

# API Surface
## Public APIs (planned, not built)
## Public Exports (planned)
- `WorldEvent` — Effect.Schema discriminated union (3 v0 variants: `mint`, `weather_shift`, `element_surge`)
- `eventId(event)` — canonical hash derivation, `sha256(canonical_encoded + version + source)`
- Ports: `EventSourcePort`, `EventResolverPort`, `WitnessAttestationPort`, `MediumRenderPort`, `NotifyPort`
- Adapters: `ScoreAdapter`, `SonarAdapter`, `SolanaWitnessAdapter`, `BlinkRenderAdapter`
## Public Programs (planned)
- `witness_event(event_id, event_kind)` — writes an idempotent `WitnessRecord` PDA `[b"witness", event_id, witness_wallet]`. Sponsored fee_payer; zero state mutation beyond the PDA write.
## What's Stable Today

## Architecture
<!-- provenance: CODE-FACTUAL -->
The architecture follows a three-zone model: System (`.claude/`) contains framework-managed scripts and skills, State (`grimoires/`, `.beads/`) holds project-specific artifacts and memory, and App (`src/`, `lib/`) contains developer-owned application code. The framework orchestrates       39 specialized skills through slash commands.
```mermaid
graph TD
    grimoires[grimoires]
```
Directory structure:
```
./grimoires
./grimoires/loa
```

## Interfaces
<!-- provenance: CODE-FACTUAL -->
### Skill Commands

#### Loa Core

- **/auditing-security** — Paranoid Cypherpunk Auditor
- **/autonomous-agent** — Autonomous Agent Orchestrator
- **/bridgebuilder-review** — Bridgebuilder — Autonomous PR Review
- **/browsing-constructs** — Unified construct discovery surface for the Constructs Network. This skill is a **thin API client** — all search intelligence, ranking, and composability analysis lives in the Constructs Network API.
- **/bug-triaging** — Bug Triage Skill
- **/butterfreezone-gen** — BUTTERFREEZONE Generation Skill
- **/continuous-learning** — Continuous Learning Skill
- **/deploying-infrastructure** — DevOps Crypto Architect Skill
- **/designing-architecture** — Architecture Designer
- **/discovering-requirements** — Discovering Requirements
- **/enhancing-prompts** — Enhancing Prompts
- **/eval-running** — Eval Running Skill
- **/flatline-knowledge** — Provides optional NotebookLM integration for the Flatline Protocol, enabling external knowledge retrieval from curated AI-powered notebooks.
- **/flatline-reviewer** — Uflatline reviewer
- **/flatline-scorer** — Uflatline scorer
- **/flatline-skeptic** — Uflatline skeptic
- **/gpt-reviewer** — Ugpt reviewer
- **/implementing-tasks** — Sprint Task Implementer
- **/managing-credentials** — /loa-credentials — Credential Management
- **/mounting-framework** — Mounting the Loa Framework
- **/planning-sprints** — Sprint Planner
- **/red-teaming** — Use the Flatline Protocol's red team mode to generate creative attack scenarios against design documents. Produces structured attack scenarios with consensus classification and architectural counter-designs.
- **/reviewing-code** — Senior Tech Lead Reviewer
- **/riding-codebase** — Riding Through the Codebase
- **/rtfm-testing** — RTFM Testing Skill
- **/run-bridge** — Run Bridge — Autonomous Excellence Loop
- **/run-mode** — Run Mode Skill
- **/simstim-workflow** — Simstim - HITL Accelerated Development Workflow
- **/translating-for-executives** — DevRel Translator Skill (Enterprise-Grade v2.0)
#### Project-Specific

- **/cost-budget-enforcer** — Daily token-cap enforcement for autonomous Loa cycles. Replaces the
- **/cross-repo-status-reader** — Read structured cross-repo state for ≤50 repos in parallel via `gh api`, with TTL cache + stale fallback, BLOCKER extraction from each repo's `grimoires/loa/NOTES.md` tail, and per-source error capture so one repo's failure does not abort the full read. The operator-visibility primitive for the Agent-Network Operator (P1).
- **/graduated-trust** — The L4 primitive maintains a per-(scope, capability, actor) trust ledger
- **/hitl-jury-panel** — Replace `AskUserQuestion`-class decisions during operator absence with a panel of ≥3 deliberately-diverse panelists. Each panelist (model + persona) returns a view and reasoning; the skill logs all views BEFORE selection, then picks one binding view via a deterministic seed derived from `(decision_id, context_hash)`. Provides an autonomous adjudication primitive without compromising auditability.
- **/loa-setup** — /loa setup — Onboarding Wizard
- **/scheduled-cycle-template** — Compose `/schedule` (cron registration) with the existing autonomous-mode primitives into a generic 5-phase cycle: **read state → decide → dispatch → await → log**. Caller plugs five small phase scripts (the *DispatchContract*) into a YAML; the L3 lib runs them under a flock, records every phase to a hash-chained audit log, and (optionally) consults the L2 cost gate before letting any work begin.
- **/soul-identity-doc** — L7 soul-identity-doc
- **/spiraling** — Uspiraling
- **/structured-handoff** — L6 structured-handoff
- **/validating-construct-manifest** — Validate a construct pack directory before it lands in a registry or a local install. Surfaces:

## Module Map
<!-- provenance: CODE-FACTUAL -->
| Module | Files | Purpose | Documentation |
|--------|-------|---------|---------------|
| `grimoires/` | 27 | Loa state and memory files | \u2014 |

## Agents
<!-- provenance: DERIVED -->
The project defines 1 specialized agent persona.

| Agent | Identity | Voice |
|-------|----------|-------|
| Bridgebuilder | You are the Bridgebuilder — a senior engineering mentor who has spent decades building systems at scale. | Your voice is warm, precise, and rich with analogy. |

## Known Limitations
<!-- provenance: CODE-FACTUAL -->
- No CI/CD configuration detected
- No documentation directory present
<!-- ground-truth-meta
head_sha: HEAD
unknown
generated_at: 2026-05-07T19:47:42Z
generator: butterfreezone-gen v1.0.0
sections:
  agent_context: cd983c70c5e7af12b69673f340b4202a058d0e1beed1729d950f762b4433bb43
  capabilities: 08a161a6712c3c6585cba69ccfc18111d790cf0d30601fe8be7808a727375bbd
  architecture: d9d768f04d98df976ba73d45b85f82961241ac9c731518300704f82a3e24eeec
  interfaces: 33882f45516b16b3b17dc8443347566d24ab738d2b09e5af57fc683609f41412
  module_map: 371cf941c226ff88a95cd062feba19d69d6344380e6f07b0ca19b5010d1c025a
  agents: ca263d1e05fd123434a21ef574fc8d76b559d22060719640a1f060527ef6a0b6
  limitations: 2d8379bafbc2a372dd2e2a85d0d59414e7654cda82670a140786815d0938b9f1
-->
