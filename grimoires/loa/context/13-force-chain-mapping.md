---
title: Force-chain mapping for puruhani lifecycle (compass)
status: doc-only · S3-T2 deliverable · NO straylight runtime imports per D2
type: cycle-context
cycle: substrate-agentic-translation-adoption-2026-05-12
created: 2026-05-12
operator: zksoju
---

# Force-chain mapping · puruhani lifecycle (compass)

> Per straylight Phase 23a doctrine: a memory is not automatically a belief; a belief is not automatically an instruction; a plan is not automatically permission to act. Each promotion across the chain requires explicit operator activation OR an existing Loa gate.

The 9-step force chain (per `~/.claude/CLAUDE.md` Straylight Memory Discipline):

```
observation → memory → belief → instruction → plan → permission → action → commitment → permanence
```

This file maps each step to a compass surface. Status flags indicate whether the gate is implemented, doc-only, or deferred.

| # | Step | Compass surface | Gate location | Status |
|---|---|---|---|---|
| 1 | observation | weather + activity events flow into stream | `lib/activity/index.ts` (multi-source bridge) + `lib/weather/*.ts` (geolocation→Open-Meteo) | ✅ exists · S1 lifted to `Activity` Effect Service |
| 2 | memory | activity stream history (subscribed buffer) | `lib/activity/index.ts:84` (`recent()` method) + subscriber set | ✅ exists · S1 lifted to `Activity.recent()` + `Activity.events` |
| 3 | belief | KEEPER-style aggregation (puruhani interprets stream as world-state) | NOT YET — placeholder for puruhani-aware. S4 `Awareness` Service is the future home | 🟡 doc-only · S4 implements |
| 4 | instruction | ceremony invocation (operator-triggered ritual) | `lib/ceremony/*.ts` (UI helpers) + future `Invocation` Service (S4) | ✅ pure-function helpers exist · S4 wraps as Service |
| 5 | plan | (no compass surface yet · post-cycle) | — | ⏳ deferred N+2 |
| 6 | permission | wallet signature gate (Phantom click-to-sign) | `lib/blink/sponsored-payer.ts` + `lib/blink/claim-message.ts` (Solana scope) | ✅ exists · Solana-bound · unchanged this cycle |
| 7 | action | claim message exec (mint instruction submitted) | `lib/blink/claim-message.ts` (build + sign) + `app/api/.../route.ts` (POST handler) | ✅ exists · Solana scope |
| 8 | commitment | Solana tx confirmation (slot finalized) | claim handler awaits `confirmTransaction` | ✅ exists |
| 9 | permanence | on-chain state (NFT lives in wallet · Metaplex metadata stored) | Solana program PDA + Metaplex Token Metadata account | ✅ exists |

## Why doc-only this cycle (PRD D2)

Straylight Phase 23a is "schema-contract DRAFT only · runtime BLOCKED on hounfour v8.6 delta #8 (estate-transition.schema)" (verified 2026-05-12 at SHA `151d454a`). The recall-receipt + signed-assertion APIs that would runtime-enforce this chain do not yet exist as TypeScript exports.

Compass adopts the **shape** (compile-time brand-type fence at `lib/domain/verify-fence.ts`) without importing the **runtime** (no `assert()` / `recall()` calls). When Phase 23b ships, swap implementation: `Verified<T>` → `RecallReceipt<T>` mechanically. Issue opened upstream: `0xHoneyJar/loa-straylight#26`.

## Verify⊥judge fence in compass

`verify` is **substrate-anchored** (steps 1-2 + 6-9 above): runs against on-chain truth (Solana commitment) OR against vendored hounfour JSON Schema (AJV validation at parse boundaries · NFR-SEC-3).

`judge` is **LLM-bound and revocable** (would live at step 3 belief and step 5 plan when those land): the daemon's voice / personality / vibe interpretation — happens INSIDE finn-runtime (a separate service · compass does NOT host finn).

The compile-time fence (`lib/domain/verify-fence.ts`) ensures `judge` cannot consume an unverified envelope at the type level. If a future cycle wires LLM-bound judgment into compass, the brand-type fence is the structural safeguard that prevents the common failure mode: "we just passed unvalidated user input into an LLM call."

## Pre-cycle state vs post-cycle state

| Aspect | Pre-cycle (commit `f4ce25e`) | Post-cycle (this cycle) |
|---|---|---|
| Force-chain awareness | implicit in code | explicit doc + compile-time fence |
| Verify⊥judge boundary | not separated | separated at type level (`Verified<T>` brand) |
| Straylight reference | none | issue 26 + this doc + capability-scoped-trust hand-port |
| Runtime impact on existing flows | (n/a) | ZERO · all changes additive · existing wallet-claim flow unchanged |

## What S3 ships beyond this doc

- `lib/domain/verify-fence.ts` — the brand-type implementation (S3-T3)
- `lib/test/judge-fence.spec-types.ts` — compile-time assertion that the fence holds (S3-T5)
- `package.json` `test:types` script via `expect-type` (S3-T4)
- `.github/workflows/test-types.yml` CI gate (S3-T6)

## What N+2 cycle would change

When straylight Phase 23b lands AND hounfour v8.6 ships estate-transition.schema:
- Replace `Verified<T>` brand with straylight's `RecallReceipt<T>`
- Wire `verify()` to call straylight's `assert()`
- Wire `judge()` to honor straylight's recall receipts
- Update this doc's status flags from "doc-only" to "wired"

The cycle 002 ratification note for `construct-effect-substrate` doctrine (S6-T1) should reference this mapping as the worked example of "substrate doctrine adopted compile-time before runtime API exists."
