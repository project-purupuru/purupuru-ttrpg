# Loa Project Notes

## Decision Log — 2026-04-24 (cycle-093-stabilization)

### Flatline sprint-plan integration — 3→3A/3B split, bypass governance, parser defenses (2026-04-24)
- **Trigger**: Flatline sprint-plan review flagged Sprint 3 as dangerously oversized (13 tasks, 2-3 days budget) with 3 CRITICAL blockers concentrated on keystone. User approved "apply all integrations."
- **Structural change**: Sprint 3 split into 3A (core probe + cache, global ID 116) and 3B (resilience + CI + integration + runbook, global ID 117). Sprint 4 renumbered to global ID 118. Cycle grows from 4 to 5 sprints.
- **Ledger**: `grimoires/loa/ledger.json` updated — `global_sprint_counter: 118`, cycle-093 sprints array now has 5 entries with `local_id: "3A"` and `"3B"` (mixed int + string local_ids).
- **Tasks added** (8 new from Flatline sprint review): 3A.canary (live-provider non-blocking smoke), 3A.rollback_flag (LOA_PROBE_LEGACY_BEHAVIOR=1), 3A.hardstop_tests (budget exit 5 enforcement); 3B.bypass_governance (dual-approval label + 24h TTL + mandatory reason), 3B.bypass_audit (audit alerts + webhook), 3B.centralized_scrubber (SKP-005 single-source redaction), 3B.secret_scanner (post-job gitleaks), 3B.concurrency_stress (N=10 parallel + stale-PID cleanup), 3B.platform_matrix (macOS+Linux CI), 3B.runbook (added rollback + key rotation sections).
- **Risks added (R22–R27)**: split integration lag, bypass friction, parser rollback-flag crutch, macOS divergence, secret scanner false positives, GPT-5.5 non-ship.
- **G-6 re-scope**: "GPT-5.5 operational" → "GPT-5.5 infrastructure ready". Live validation deferred to follow-up cycle.
- **Testing language shift**: replace "80% line coverage" with "100% critical paths + every BLOCKER has regression test" (DISPUTED IMP-004 resolution).
- **Meta-finding banked**: Across 3 Flatline runs (PRD+SDD+Sprint), **19/19 blockers sourced from tertiary skeptic (Gemini 2.5 Pro)**. Strongest empirical case yet for 3-model Flatline protocol + Gemini 3.1 Pro upgrade in T2.1.
- **How to apply**: 5-sprint cycle with canonical merge order 1→2→3A→3B→4, 6h rebase slack per dependent sprint.

### Cycle inception — Loa Stabilization & Model-Currency Architecture
- **Scope**: Close silent failures #605 (harness adversarial bypass), #607 (bridgebuilder dist gap), #618 (dissenter hallucination). Re-add Gemini 3.1 Pro Preview. Ship provider health-probe (#574 Option C) as keystone. Latent GPT-5.5 registry entry for auto-onboarding on API ship.
- **Artifact isolation**: `grimoires/loa/cycles/cycle-093-stabilization/` — parallel-cycle pattern per #601 recommendation; keeps cycle-092 PR #603 artifacts (`grimoires/loa/prd.md` etc.) untouched during HITL review.
- **Branch plan**: stay on current cycle-092 branch during PRD/SDD/sprint drafting (artifacts isolated, no collision); split off to `feature/cycle-093-stabilization` from fresh `main` after PR #603 merges.
- **Out-of-scope (deferred)**: #601 (parallel-cycle doctrine), #443 (cross-compaction amnesia), #606 (Self-Refine / Reflexion redesign) — each warrants its own cycle.
- **Interview mode**: minimal (scope pre-briefed exhaustively from open-issue analysis + preceding turn's file-surface audit).
- **T3.1 scope reduction**: Confirmed `gpt-5.3-codex` is already the default dissenter in both `.loa.config.yaml.example:1236,1241` and `adversarial-review.sh:74,102`. T3.1 reduces to "audit + operator-advisory for pinned gpt-5.2 configs" — no migration code needed.
- **Why this satisfies zone-system.md "explicit cycle-level approval"**: cycle-093 PRD at `grimoires/loa/cycles/cycle-093-stabilization/prd.md` authorizes System Zone writes to the enumerated file surfaces for this cycle only.
- **How to apply**: Subsequent cycles (cycle-094+) must re-authorize via their own PRD.

## Decision Log — 2026-04-19 (cycle-092)

### System Zone write authorization
- **Scope**: `.claude/scripts/spiral-harness.sh`, `.claude/scripts/spiral-evidence.sh`, `.claude/scripts/spiral-simstim-dispatch.sh`, `.claude/hooks/hooks.yaml`, new `.claude/scripts/spiral-heartbeat.sh`
- **Authorization trail**:
  1. Issues #598, #599, #600 filed by @zkSoju explicitly target these spiral harness files as the subject of the bugs
  2. Sprint plan (`grimoires/loa/sprint.md` lines 65-322) drafted 2026-04-19 enumerates these files as the subject of Sprints 1–4
  3. User invoked `/run sprint-plan --allow-high` after reading the plan
  4. Precedent: recent merges #588, #592, #594 modified the same files under the same pattern (cycle-level authorization via sprint plan + PR review)
- **Why this satisfies zone-system.md "explicit cycle-level approval"**: In lieu of a formal PRD (this is bug-track work extracted from issue bodies per sprint.md Non-Goals §4), the sprint plan itself is the cycle-level approval artifact. The `--allow-high` invocation is the equivalent of PRD sign-off.
- **How to apply**: Writes to these paths are authorized for cycle-092 only. Subsequent cycles must re-authorize via their own sprint plan.

### Stale sprint artifact cleanup
- Moved stale cycle-053 sprint-1/ → sprint-1-cycle-053; similarly sprint-2/3/4 preserved under dated names. Fresh sprint-N/ directories created for cycle-092 artifacts.

### SpiralPhaseComplete hook — runtime dispatch deferred (cycle-092 Sprint 4, #598)
- **Scope**: operator-configurable per-phase notification hook declared in sprint.md AC for Sprint 4
- **Status**: ⏸ [ACCEPTED-DEFERRED] — schema reserved, runtime exec out of scope
- **Why deferred**: Hook firing requires modifying `_emit_dashboard_snapshot` in `.claude/scripts/spiral-evidence.sh` (Sprint 3's territory) to invoke operator-configured shell commands at `event_type=PHASE_EXIT`. Sprint 4's scope was emitter-only (spiral-heartbeat.sh + config schema + bats tests). Sprint 3 code should not be retouched in Sprint 4 per sprint plan §Scope constraints.
- **What shipped**: `.loa.config.yaml.example:1688-1692` — schema for `spiral.harness.heartbeat.phase_complete_hook.{enabled,command}` with `enabled: false` default. Forward-compatible: future cycle can wire the `exec $command` call without config migration.
- **How to apply**: When a follow-up cycle is scoped, add ~10 lines to `_emit_dashboard_snapshot` at the `event_type == "PHASE_EXIT"` branch:
  1. Read `spiral.harness.heartbeat.phase_complete_hook.enabled` from `.loa.config.yaml`
  2. If true, read `spiral.harness.heartbeat.phase_complete_hook.command`
  3. Export `PHASE`, `COST`, `DURATION_SEC`, `CYCLE_ID` as env vars
  4. Exec the command (`eval` or `bash -c` depending on desired shell semantics)
- **Tracking**: Flagged in Sprint 4 reviewer.md §Known Limitations item #1. Non-blocking for cycle-092; operators who want per-phase notifications today can tail dispatch.log for `Phase N:` transitions manually.

## Session Continuity — 2026-04-13 (cycles 052-054)

### Current state
- **cycle-052** (PR #463) — MERGED: Multi-model Bridgebuilder pipeline + Pass-2 enrichment
- **sprint-bug-104** (PR #465) — MERGED: A1+A2+A3 follow-ups (stdin, warn, docblock)
- **cycle-053** (PR #466) — MERGED: Amendment 1 post-PR loop + kaironic convergence
- **cycle-054** (PR #468) — OPEN: Enable Bridgebuilder on this repo (Option A rollout)

### How to restore context
See **Issue #467** — holds full roadmap, proposal doc references, and session trajectory.

Key entry points:
- `grimoires/loa/proposals/close-bridgebuilder-loop.md` (design rationale)
- `grimoires/loa/proposals/amendment-1-sprint-plan.md` (sprint breakdown)
- `.claude/loa/reference/run-bridge-reference.md` (post-PR integration + kaironic pattern)
- `.run/bridge-triage-convergence.json` (if exists — latest convergence state)
- `grimoires/loa/a2a/trajectory/bridge-triage-*.jsonl` (per-decision audit trail)

### Open work (see #467 for full detail)
- **Option A** — Enable + observe (PR #468 in flight)
- **Option B** — Amendment 2: auto-dispatch `.run/bridge-pending-bugs.jsonl` via `/bug`
- **Option C** — Wire A4 (cross-repo) + A5 (lore loading) from Issue #464
- **Option D** — Amendment 3: pattern aggregation across PRs

### Recent HITL design decisions (locked)
1. Autonomous mode acts on BLOCKERs with mandatory logged reasoning (schema: minLength 10)
2. False positives acceptable during experimental phase
3. Depth 5 inherit from `/run-bridge`
4. No cost gating yet — collect data first
5. Production monitoring: manual + scheduled supported

---

# cycle-040 Notes

## Rollback Plan (Multi-Model Adversarial Review Upgrade)

### Full Rollback

Single-commit revert restores all previous defaults:

```bash
git revert <commit-hash>
```

### Partial Rollback — Disable Tertiary Only

```yaml
# .loa.config.yaml — remove or comment out:
hounfour:
  # flatline_tertiary_model: gemini-2.5-pro
```

Flatline reverts to 2-model mode (Opus + GPT-5.3-codex). No code changes needed.

### Partial Rollback — Revert Secondary to GPT-5.2

```yaml
# .loa.config.yaml
flatline_protocol:
  models:
    secondary: gpt-5.2

red_team:
  models:
    attacker_secondary: gpt-5.2
    defender_secondary: gpt-5.2
```

Also revert in:
- `.claude/defaults/model-config.yaml`: `reviewer` and `reasoning` aliases back to `openai:gpt-5.2`
- `.claude/scripts/gpt-review-api.sh`: `DEFAULT_MODELS` prd/sdd/sprint back to `gpt-5.2`
- `.claude/scripts/flatline-orchestrator.sh`: `get_model_secondary()` default back to `gpt-5.2`

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-26 | Cache: result stored [key: integrit...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: clear-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: clear-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: stats-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: stats-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: test-sec...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: test-key...] | Source: cache |
| 2026-02-26 | Cache: PASS [key: test-key...] | Source: cache |
| 2026-02-26 | Cache: PASS [key: test-key...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: integrit...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: clear-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: clear-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: stats-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: stats-te...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: test-sec...] | Source: cache |
| 2026-02-26 | Cache: result stored [key: test-key...] | Source: cache |
| 2026-02-26 | Cache: PASS [key: test-key...] | Source: cache |
| 2026-02-26 | Cache: PASS [key: test-key...] | Source: cache |
## Blockers

None.
