# Sprint 2 Indexer · In-Session Adversarial Review

> Reviewer: Claude Opus 4.7 (in-session, single-model)
> Date: 2026-05-09
> Reason: Flatline + /gpt-review tooling broken in this repo (3 backends failed: hounfour config gap, codex CLI subprocess error, OpenAI Responses API SSRF allowlist block). Single-model in-session review used as the realistic alternative.
> Document: grimoires/loa/sprints/indexer-sprint.md
> Companion: PRD amendment (prd.md:943-1064), SDD §13 (sdd.md:660-1074)

## Findings

### BLOCKER (2)
- B1: Railway free-tier sleep would silently kill demo. Fix: external uptime monitor + paid plan check.
- B2: A4 spike incomplete — reads IDL but doesn't verify EventParser actual TypeScript output. Fix: extend A4 to invoke EventParser against real prior event.

### HIGH (4)
- H1: Time estimates tight for learning curve (B5/B6/F3/G1 each likely 1.5-2x estimated).
- H2: 15s getSlot heartbeat is aggressive for free-tier devnet. Bump to 20-30s.
- H3: Reconnect logic doesn't explicitly handle subscription-handle invalidation. F3 should test post-reconnect event flow.
- H4: Task count discrepancy — sprint says "21 tasks", body has 32, beads has 32.

### MEDIUM (5)
- M1: A4 gate over-conservative; only B3+F1 depend on element encoding.
- M2: F2 test should assert ring buffer length invariant under load.
- M3: Missing test for malformed event / IDL skew (add F5).
- M4: No prerequisite check for Railway account in Phase G.
- M5: C2 HMR smoke shouldn't run extended `INDEXER_MODE=real` locally.

### LOW (2)
- L1: dry-run-evidence directory doesn't exist; needs creation.
- L2: §J forward dispatch is stale.

## Recommendation

Address B1 + B2 + H1 before /run sprint-plan dispatches. Other items can be picked up during execution.
