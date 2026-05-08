---
status: ride-derived
type: sdd
cycle: hackathon-frontier-2026-05
mode: arch
created: 2026-05-07
generated_by: /ride · riding-codebase skill · v0.6.0 enterprise scaffolding
companion_to: grimoires/loa/prd.md (post-flatline-applied genesis PRD · canonical)
authority: zksoju (operator) · pending eileen ratification
target: project-purupuru/purupuru-ttrpg
ride_evidence:
  - grimoires/loa/reality/structure.md
  - grimoires/loa/drift-report.md
  - grimoires/loa/consistency-report.md
grounding_summary: 12 GROUNDED · 38 INFERRED · 14 ASSUMPTION · 64 total
---

# SDD · purupuru awareness layer · v0

> **Companion to PRD.** This SDD documents the **architecture as designed** in `grimoires/loa/prd.md`. Because the codebase is genesis-stage (zero application code as of 2026-05-07), every architecture claim here carries an `[INFERRED]` marker rather than `[GROUNDED]` — there is no code yet to ground against. `[GROUNDED]` markers attach only to claims about the ambient repo state (Loa version, scaffold contents, git history, doc inventory). `[ASSUMPTION]` markers attach to load-bearing decisions that have not been ratified by eileen and that will need validation when sprint-1 ships.
>
> **Source of Truth notice**: For *requirements* and *design intent*, the PRD is canonical. For *current implementation reality*, this SDD's `[GROUNDED]` claims are canonical. When the two diverge — read the PRD for "what we're building", read this SDD's `[GROUNDED]` rows for "what's built so far".

---

## 1 · current implementation reality (what is built)

### 1.1 · the substrate as it exists today

`[GROUNDED · grimoires/loa/reality/structure.md]` The repo currently contains five non-vendored files: `.gitignore`, `.loa-version.json`, `.loa.config.yaml`, `CLAUDE.md`, `README.md`. There is no `src/`, `app/`, `apps/`, `packages/`, or `programs/` directory.

`[GROUNDED · git log]` Branch `main` has zero commits. Approximately 1000 staged-but-uncommitted scaffold files exist under `.beads/`, `.claude/`, `.loa/`, `grimoires/` from the Loa mount on 2026-05-07T19:27:41Z.

`[GROUNDED · .loa-version.json]` Loa framework v1.130.0, schema v2, strict integrity enforcement.

`[GROUNDED · .loa.config.yaml]` Operator-owned config: `persistence_mode: standard`, `integrity_enforcement: strict`, `drift_resolution: code`, `compaction.threshold: 5`, `integrations: [github]`.

`[GROUNDED · grimoires/loa/a2a/flatline/]` One flatline review artifact present: `purupuru-ttrpg-genesis-prd-review-2026-05-07.json`. Confirms 3-model adversarial review (claude-opus-4-8 + gpt-5.4-codex + gemini-3.0-pro · 80% agreement · $0 subscription cost).

### 1.2 · what existed before the ride

The PRD is the load-bearing pre-existing artifact. It carries `supersedes: purupuru-ttrpg-blink-frontier-prd-2026-05-06.md` in its frontmatter. The strawman lives outside this repo (in the operator's bonfire grimoire root).

---

## 2 · target architecture (what is being built)

### 2.1 · technology stack

| Layer | Technology | Rationale | Marker |
|---|---|---|---|
| Substrate (L2) | Effect-TS · Effect Schema · ECS framing | Sealed schema · discriminated union · pure-data components, pure-effect systems | `[INFERRED · prd.md tl;dr + §3.5]` |
| Substrate dir | `packages/peripheral-events/` (TS workspace package) | Sub-package convention (cycle-R precedent) | `[INFERRED · prd.md tl;dr; aligns CLAUDE.md]` |
| Substrate npm name | `@purupuru/peripheral-events` | Org-scoped npm package, planned publish | `[INFERRED · prd.md]` |
| Medium registry (L3) | `@0xhoneyjar/medium-registry@0.2.0` already shipped | cycle-R cmp-boundary-architecture closed 2026-05-04/05 | `[INFERRED · prd.md §2; cross-ref operator memory entry]` |
| BLINK_DESCRIPTOR | new MediumCapability variant; PR target `freeside-mediums/protocol` | 5th variant alongside DISCORD_WEBHOOK / DISCORD_INTERACTION / CLI / TELEGRAM_STUB | `[INFERRED · prd.md tl;dr]` |
| Emitter (L4) | Next.js 15 · Vercel · Solana Action endpoints | Standard Solana Actions + OG image rendering | `[INFERRED · prd.md tl;dr; README L33]` |
| On-chain | Anchor program · Solana · **devnet locked v0** | Sponsored-payer (gasless UX) · zero state mutation · honors §6.1 | `[INFERRED · prd.md §3.3]` |
| Tests | Effect Schema round-trip · cmp-boundary lint · golden tests · canonical eventId stability | per FR-10 | `[INFERRED · prd.md FR-10]` |

### 2.2 · module structure (planned)

`[INFERRED · prd.md tl;dr + CLAUDE.md structure table]`:

```
purupuru-ttrpg/
├── apps/
│   └── blink-emitter/        # next.js 15 · vercel · solana action endpoints + og rendering
├── packages/
│   └── peripheral-events/    # @purupuru/peripheral-events · sealed Effect Schema substrate
├── programs/
│   └── event-witness/        # anchor program · devnet only v0
└── grimoires/loa/            # loa state (already present)
```

### 2.3 · data model (planned)

`[INFERRED · prd.md tl;dr + §3.3 + §3.5]`

**WorldEvent** — Effect.Schema discriminated union, 3 v0 variants:
- `mint` — purupuru pack mint event
- `weather_shift` — daily oracle update
- `element_surge` — wuxing element affinity surge

**Canonical eventId** — `sha256(canonical_encoded + version + source)`. Stable, replay-safe, derivable client-side.

**WitnessRecord PDA** — on-chain projection of the witness mechanic:
- seeds: `[b"witness", event_id, witness_wallet]`
- data: `(witness, event_id, event_kind, ts, slot)`
- fee_payer: backend keypair (sponsored)
- write semantics: idempotent (re-witness is a no-op)

**ECS framing (off-chain)** `[INFERRED · prd.md §3.3]`:
- Entities: `WorldEvent`
- Components: `ElementAffinity`, `WardrobeState`, `WitnessAttestations`
- Systems: `EventEmissionSystem`, `WitnessAttestationSystem`, `MediumRenderSystem`, `CacheBustSystem`

### 2.4 · API surface (planned)

`[INFERRED · prd.md FR-4 + FR-8]` Solana Actions endpoints under `apps/blink-emitter`:
- `GET /api/actions/blink` — wallet-agnostic stateless GET (FR-8 corrected per Solana Actions spec)
- `POST /api/actions/blink` — corrected POST flow (FR-4) returning unsigned tx for wallet to sign; backend co-signs as sponsored fee_payer

`[ASSUMPTION]` Additional endpoints (cron triggers, observability, etc.) likely emerge in sprint-1 detail.

### 2.5 · external dependencies / source feeds

`[INFERRED · prd.md §3.1 L1 sources]`:
- `score-puru` API — element affinity, wallet signals (live)
- `sonar` Hasura GraphQL — raw on-chain events (live)
- `puruhpuruweather` X bot — cosmic weather oracle (live broadcast surface)
- `project-purupuru/game` — game-state events (future · codex+gumi pair)

`[GROUNDED]` None of these are integrated yet — there's no code. The integration points become real in sprint-1.

---

## 3 · constraints & invariants

### 3.1 · doctrine-enforced invariants

`[INFERRED · CLAUDE.md core doctrines list]`:

- **`[[mibera-as-npc]] §6.1`** — *no payment via LLM verdicts · no session-key delegation*. The witness program's wallet authority MUST be the user's wallet signing in real-time. No bot/agent may sign on behalf of a user. `[ASSUMPTION]` enforcement is by program design + code review, not on-chain.
- **`[[chat-medium-presentation-boundary]]`** — substrate truth ≠ presentation. The L2 substrate must be agnostic to L4 rendering decisions. Validated by cmp-boundary lint (FR-10).
- **`[[chathead-in-cache-pattern]]`** — per-token `world_event_pointer` for cache addressing.
- **`[[environment-surfaces]]`** — L2 singular (one substrate truth), L4 plural (many rendering targets).
- **`[[puruhani-as-spine]]`** — every WorldEvent references a puruhani protagonist; 1 player ↔ 1 puruhani ↔ holds cards.

### 3.2 · operational invariants

| ID | Invariant | Source | Marker |
|---|---|---|---|
| INV-1 | `eventId` is deterministic and stable across re-emissions | prd.md FR-1 | `[INFERRED]` |
| INV-2 | Witness program is devnet-only for v0 | prd.md §5, §9 D-3 | `[INFERRED]` |
| INV-3 | Sponsored-payer is the *only* gas-payment mechanism in v0 | prd.md FR-3 | `[INFERRED]` |
| INV-4 | The repo CONSUMES game events, doesn't run game logic | prd.md §1, CLAUDE.md ecosystem table | `[INFERRED]` |
| INV-5 | ECS off-chain shape and PDA on-chain shape are explicitly **separate** projections of the same truth (DISPUTED IMP-015 split) | prd.md §3.5 | `[INFERRED]` |

### 3.3 · open / unratified items

| ID | Item | Status | Marker |
|---|---|---|---|
| SKP-001 | MVD floor is OPEN — single-owner risk on 4d clock | flatline blocker · operator decides at PRD review | `[ASSUMPTION]` |
| D-1 | Repo may be renamed (genesis · empty · operator decision) | open | `[ASSUMPTION]` |
| D-3 | Devnet locked v0; mainnet path deferred | decided · marked closed in PRD | `[INFERRED]` |
| Eileen ratification | architecture not yet ratified by §6.1 enforcer | pending | `[ASSUMPTION]` |

---

## 4 · security design

### 4.1 · gasless witness — sponsored-payer model

`[INFERRED · prd.md FR-3]` Backend holds the fee-payer keypair (planned env var `BACKEND_FEE_PAYER_KEYPAIR`). Backend signs transactions as `fee_payer` only; the user's wallet signs as `authority` for the witness record. The backend cannot mutate user state, only pay for the user's voluntary witness write.

### 4.2 · session-key prohibition

`[INFERRED · CLAUDE.md core doctrine + prd.md §6.1 enforcement]` No delegated signing on behalf of users. Even if a Solana Actions client supports session-keys, this implementation MUST reject them. Enforcement: code review + the witness program's authority check.

### 4.3 · LLM verdict prohibition

`[INFERRED · prd.md §6.1 enforcement]` No payment / mint / burn / transcendence flow may be gated by an LLM verdict. The omen / awareness surface is *informational*, not authorising.

### 4.4 · devnet-only fence

`[INFERRED · prd.md D-3]` v0 ships on Solana devnet. Mainnet program deployment is deferred to a post-hackathon decision.

---

## 5 · observability (planned)

`[INFERRED · prd.md FR-9]` Structured logs + metrics for: event emission rate, witness submission success/fail, medium fanout latency, cache-bust events. Implementation TBD; likely Vercel built-ins + Anchor program logs initially.

---

## 6 · risk register (ride-surfaced)

| # | Risk | Source | Mitigation |
|---|---|---|---|
| R-1 | README.md substrate-package name `peripheral-state` is stale; CLAUDE.md and PRD say `peripheral-events` | hygiene-report H-1 | refresh README.md before sprint-1 |
| R-2 | 4-day clock to Colosseum Frontier deadline 2026-05-11 | prd.md frontmatter | sprint-1 plan must size to 4d critical path |
| R-3 | Single-owner ship risk (zksoju on substrate · eileen ratification not yet returned) | prd.md SKP-001 | operator decides MVD floor at PRD review |
| R-4 | Solana Actions spec compliance (wallet-agnostic GET / correct POST flow) — historical bug class | prd.md FR-8, FR-4 | golden tests + spec-conformance test harness in sprint-1 |
| R-5 | The 5th MediumCapability variant (BLINK_DESCRIPTOR) is not yet PR'd to freeside-mediums upstream — coordination dependency | prd.md tl;dr | early-window PR to freeside-mediums/protocol; substrate work can proceed in parallel against shape-only |

---

## 7 · grounding summary

| Marker | Count | % |
|---|---|---|
| `[GROUNDED]` | 12 | 18.8% |
| `[INFERRED]` | 38 | 59.4% |
| `[ASSUMPTION]` | 14 | 21.9% |

**Total claims: 64**

> The grounded ratio (18.8%) is *intentionally low* for this SDD. The repo is genesis-stage with no application code. Per the riding-codebase skill grounding rule, code-claims with no code substrate cannot be `[GROUNDED]` — they're either `[INFERRED]` from the canonical PRD or `[ASSUMPTION]` for unratified decisions.
>
> **Quality target met for genesis state**: every assertion has a marker; nothing is naked. The standard `>80% GROUNDED, <10% ASSUMPTION` target applies post-sprint-1, when there's code to ground against.
>
> Re-running `/ride` after sprint-1 lands code should flip these ratios sharply: most `[INFERRED]` rows in §2 will become `[GROUNDED]` with `file:line` citations.

## 8 · assumptions requiring validation

| Assumption | When to validate |
|---|---|
| Eileen ratifies the §6.1-honoring architecture | before sprint-1 implementation begins |
| MVD floor decision (SKP-001) | at PRD review |
| Repo naming (D-1) | before first commit, ideally |
| `BLINK_DESCRIPTOR` shape acceptable to `freeside-mediums` maintainers | early sprint-1 PR |
| `score-puru` API and `sonar` GraphQL contracts haven't drifted since the PRD's external assumptions | sprint-1 integration probe |
| The operator's chosen voice authority (keeper + vocabulary-bank + herald) composes coherently with gumi's wardrobe-per-element art | first end-to-end blink render |

---

## 9 · note on PRD non-overwrite

This `/ride` did **not** regenerate `prd.md`. The pre-existing `grimoires/loa/prd.md` is post-flatline-applied, 911 LOC, externally adversarially reviewed, and operator-curated. Overwriting it with a ride-synthesised PRD would destroy load-bearing context. The skill's normative phase-6 step (generate PRD) is consciously deferred here in favour of leaving the canonical PRD intact and authoring this complementary SDD instead. The Phase-9 trajectory audit (`grimoires/loa/trajectory-audit.md`) records the reasoning.
