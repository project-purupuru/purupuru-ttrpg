# /kickoff Skill · Rigorous Improvement Spec · 2026-05-11

> Operator directive: bridge `/kickoff` (currently a monolithic SKILL.md) with the substrate shift across `loa-rooms-substrate` + `loa-compositions` + `loa-constructs`. `/kickoff` should compose with `/enhance` (upstream-canon), embrace **room mode** invocation where authority is claimed, and emit observable handoff packets. Operator latitude: question the question, work on whatever, % of work doesn't have to be reported.

## TL;DR — the shift in one sentence

`/kickoff` was written when constructs were **personas to embody** (studio mode). The substrate shift makes constructs **native subagents to spawn** (room mode), and compositions **YAML-defined chains** that emit observable handoff packets. `/kickoff` hasn't caught up.

## What I read to ground this

| Source | What I extracted |
|---|---|
| `~/.claude/skills/kickoff/SKILL.md` | Current 5-phase pipeline: DIG → PREPLAN → ARCH+craft → ENHANCE → SESSION TRACK + CLIPBOARD. All construct work is **studio-mode embodiment** ("read OSTROM.md, embody Alexander") |
| `~/Documents/GitHub/construct-rooms-substrate/README.md` | The observability thesis · 3 invariants (≥32-char `why.rationale` · cross-validation signals · WHY surfaces at top) · manifest v4 · adapter generation · `parallel` and `pair-relay` composition patterns |
| `~/Documents/GitHub/construct-rooms-substrate/docs/runtime/composition-patterns.md` | `parallel` (v0.1.0 · chain · one-pass) vs `pair-relay` (v0.2.0 · sequence · cycles with operator pair-points · convergence_criteria) |
| `~/Documents/GitHub/construct-rooms-substrate/templates/construct-adapter.template.md` | The native-subagent shape constructs become · `tools`, `description`, `loa.{construct_slug, schema_version, persona_path, streams.{reads, writes}, invocation_modes}` |
| `~/Documents/GitHub/construct-compositions/README.md` + `compositions/discovery/audit-feel.yaml` | Compositions are YAML-defined teams · workstream-organized (discovery/delivery/experimentation/sorry-for-ur-loss) · explicit inputs/chain/outputs · `hivemind_labels` + JTBD framing · `composes_symmetrically_with` declarations |
| `loa-constructs/grimoires/loa/prd-cycle-rooms-observatory.md` | The vision: observability station that reads `.run/compose/<run_id>/orchestrator.jsonl` + envelopes · surfaces rationale-vs-behavior divergence per the Anthropic NLA paper · `/constructs install construct-rooms-substrate` distribution path |

## The 8 gaps · ranked by impact

### GAP 1 · /kickoff has no concept of compositions · should BE a composition

**Current**: monolithic SKILL.md with phases as prose sections.

**Substrate-aligned**: `/kickoff` should live as `construct-compositions/compositions/discovery/kickoff.yaml`. The SKILL.md becomes a thin orchestrator that loads + dispatches the composition.

Why this matters:
- Compositions are inspectable by `loom` (composition browser construct)
- Compositions can be **overridden per-project** in local `.claude/` without forking the upstream skill
- Compositions are **versioned independently** from SKILL.md
- Other compositions can `compose_with` /kickoff (e.g. a `dogfood-cycle` composition could invoke kickoff as its first stage)
- Operator can `/loom fire kickoff` from anywhere

**Proposed composition shape** (sketch):

```yaml
schema_version: "1.0"
kind: workflow
name: kickoff
description: Cross-repo build session handoff — DIG → PREPLAN → ARCH+craft → ENHANCE → CLIPBOARD
hivemind_labels:
  workstream: discovery
  jtbd:
    category: personal
    description: "Help Me Hand Off — operator wants the next session to start at full speed"

inputs:
  - type: Intent
    name: topic
    description: What to research, plan, prepare for building
    required: true
  - type: Operator-Model
    name: operator_context
    source: hivemind (personal + org) via /hivemind skill
    required: false
  - type: Artifact
    name: target_repo
    required: false
    notes: Resolves to current repo if absent · checked for Loa mount in Phase 0

chain:
  - stage: 1
    construct: k-hole
    skill: dig
    reads: [Intent, Operator-Model]
    writes: [Signal]
    role: research
    pattern: parallel  # codebase + landscape in parallel rooms
    notes: STAMETS — exploration, not invention. Emits structured findings.

  - stage: 2
    construct: # operator-driven preplan · no spawn
    skill: preplan  # could be inline skill or operator pair-point
    reads: [Signal]
    writes: [Artifact]  # preplan notes
    role: synthesis
    surface_mode: interactive  # operator pair-point at preplan

  - stage: 3
    construct: the-arcade
    skill: architecting
    reads: [Artifact]  # preplan
    writes: [Verdict]  # arch decisions + blast radius
    role: structural-authority
    persona: OSTROM

  - stage: 4
    construct: artisan
    skill: decomposing-feel
    reads: [Verdict]  # arch decisions
    writes: [Verdict]  # craft specifications
    role: craft-authority
    persona: ALEXANDER

  - stage: 5
    construct: # composition-internal · invokes /enhance skill
    skill: enhance  # bridges to upstream-canon /enhance
    reads: [Verdict, Verdict]  # arch + craft
    writes: [Artifact]  # build doc + session track + clipboard pointer
    role: handoff-prep

outputs:
  - type: Artifact
    destination: "{target_repo}/grimoires/loa/specs/enhance-{topic-slug}.md"
    description: Build doc · source of truth
  - type: Artifact
    destination: "{target_repo}/grimoires/loa/tracks/session-{N}-{topic-slug}-kickoff.md"
    description: Session track
  - type: Verdict
    destination: .run/compose/{run_id}/handoff.json
    schema: .claude/schemas/handoff-packet.schema.json
    description: Final kickoff verdict · WHY rationale + cross-validation

compose_with:
  - k-hole
  - the-arcade
  - artisan
  - enhance  # upstream-canon, do not modify

when_to_use:
  - End of build session, before clipboard handoff to next session
  - Cross-repo bridge (work in repo A, next session in repo B)
  - Multi-day project where context is lossy without explicit artifacts
```

### GAP 2 · ARCH phase should spawn rooms, not embody studios

**Current**: "Embody both simultaneously: Ostrom + Alexander."

**Why this is wrong**: when /kickoff produces an architecture doc that another session will execute from, **authority is being claimed** (this is the arch · this is the blast radius · this is the persona's verdict). The substrate's room mode is the proper invocation here — explicit construct, explicit handoff packet, explicit transcript.

**Substrate-aligned**: Phase 3 invokes `construct-the-arcade` and `construct-artisan` as native subagents (via the generated adapter at `.claude/agents/construct-{slug}.md`). Each emits its own handoff packet with rationale + cross-validation.

**Even better — use pair-relay**: A declares structure → B inscribes taste → A confirms / revises. Per the spec doc, this is the canonical fidelity-audit shape (`A · declare → B · validate → A · confirm`). Operator pair-point at each cycle boundary if `surface_mode: interactive`.

### GAP 3 · No handoff packet emission at any phase

**Current**: writes markdown artifacts only.

**Substrate-aligned**: every phase boundary should emit a handoff packet to `.run/compose/<run_id>/envelopes/<stage>.<slug>.handoff.json`. At minimum the final phase's packet should be present so the observability station can render the /kickoff chain.

**Concretely add to Phase 5**:
```bash
# Emit final kickoff handoff packet
bash .claude/scripts/handoff-emit.sh \
  --run-id "$KICKOFF_RUN_ID" \
  --stage final \
  --construct kickoff \
  --output-refs "$BUILD_DOC,$SESSION_TRACK,$CLIPBOARD_POINTER" \
  --rationale "Kickoff for $TOPIC · {phases_completed} · {decisions_made}" \
  --tools-used "Read,Write,Agent(k-hole),Agent(the-arcade),Agent(artisan),Skill(enhance)" \
  --decisions-considered "studio-vs-room for ARCH · pair-relay vs parallel · skip-dig flag"
```

### GAP 4 · Phase 0 doesn't detect substrate installation

**Current Phase 0**: checks `.loa.config.yaml` + `.claude/` + `BUTTERFREEZONE.md`.

**Substrate-aligned**: ALSO check:
- `construct-rooms-substrate` installed? (presence of `.claude/scripts/handoff-emit.sh` or `.claude/agents/construct-*.md` adapters)
- Construct manifests v4? (check `construct.yaml schema_version: 4` on referenced constructs)
- `construct-compositions` accessible? (compositions/ folder or registry resolution)

**Routing**:
- All three installed → full Room mode for /kickoff
- Substrate but no compositions → Room mode without composition YAML (inline chain)
- Neither installed → Studio mode (current behavior) · BUT log the fallback in the final handoff packet so operator knows to install

### GAP 5 · /enhance composition is implicit · should be explicit

**Operator directive**: "kickoff should compose with /enhance."

**Current Phase 4 ENHANCE** is named after the skill but doesn't invoke it. It just writes a build doc.

**Substrate-aligned**: Phase 4 (or new Phase 5.5) explicitly invokes the `/enhance` skill with the build doc draft as input. The output of /enhance becomes:
- The build doc final version (the input prompt for the next session, refined per PTCF framework)
- The clipboard pointer (which is what the operator pastes)

This composition can be declared in the kickoff.yaml as a `chain[]` stage. /enhance becomes a **stage construct** that any composition can call.

**This also matches** what I did at the end of session 4 — I drafted a session-5 kickoff pointer, then ran the /enhance skill on it manually, then copied to clipboard. That should be the canonical /kickoff Phase 5 shape.

### GAP 6 · No OperatorOS mode-pluggability

**Current**: /kickoff phases are fixed.

**Operator's CLAUDE.md** declares 6 modes (FEEL/ARCH/DIG/SHIP/FRAME/TEND). Each mode has different needs at handoff time:
- FEEL kickoff → skip DIG (we just need the craft handoff, not landscape research)
- ARCH kickoff → full pipeline
- DIG kickoff → emphasize DIG, skip ARCH (research session, not build session)
- SHIP kickoff → emphasize ENHANCE, skip DIG (we already know what to build)
- FRAME kickoff → emphasize ENHANCE + craft, gtm-collective spawn instead of arcade
- TEND kickoff → cycle pattern (observer + crucible) instead of arch

**Substrate-aligned**: /kickoff resolves the operator's current mode at Phase 0 (via `archetype-resolver.sh` if substrate installed, or AskUserQuestion otherwise) and routes to mode-specific phase sequences. Each mode is its own composition YAML.

```
compositions/discovery/
├── kickoff.yaml              # default · ARCH-mode shape
├── kickoff-feel.yaml         # FEEL mode · skip DIG, lean craft
├── kickoff-ship.yaml         # SHIP mode · skip DIG, lean enhance
├── kickoff-tend.yaml         # TEND mode · observer + crucible
└── kickoff-frame.yaml        # FRAME mode · gtm-collective + showcase
```

The base SKILL.md becomes mode-aware and dispatches to the right composition.

### GAP 7 · No observability of the kickoff itself

**Current**: /kickoff is a black box. Operator sees the 3 artifacts at the end. No visibility into per-phase decisions, dead ends, agent transcripts.

**Substrate-aligned**: every phase emits to `.run/compose/<run_id>/orchestrator.jsonl`. Per-phase handoff packets to `.run/compose/<run_id>/envelopes/`. Per-phase agent transcripts at `~/.claude/projects/.../subagents/`. The observability station (in flight per cycle-rooms-observatory PRD) renders the chain post-hoc.

**Why this matters for /kickoff specifically**: kickoff is high-stakes (the next session inherits its output). If a phase made a wrong call (e.g. STAMETS researched the wrong landscape, OSTROM mis-named the invariants), the operator needs to see WHERE the chain went wrong, not just the final artifact.

### GAP 8 · No pair-relay convergence for ARCH+CRAFT phase

**Current**: "Embody both simultaneously" — but ALEXANDER's craft specs may CONFLICT with OSTROM's structural decisions. The current pipeline has no convergence mechanism.

**Substrate-aligned**: ARCH+CRAFT is the canonical **pair-relay** use case. Per the composition-patterns doc:

> Use pair-relay when two (or more) constructs need to bounce a verdict back and forth — A inscribes intent, B inspects, A confirms or revises. Convergence is operator-judged.

For /kickoff Phase 3:
```yaml
pattern: pair-relay
sequence:
  - construct: the-arcade   # OSTROM declares structure
    role: declare-arch
    persona: OSTROM
  - construct: artisan      # ALEXANDER inscribes craft on the arch
    role: inscribe-craft
    persona: ALEXANDER
  - construct: the-arcade   # OSTROM confirms craft fits structure
    role: confirm-or-revise
    persona: OSTROM
max_cycles: 3
surface_mode: interactive   # operator pair-points at each cycle
convergence_criteria: >
  Operator accepts OSTROM's final-cycle verdict that the craft specs
  are consistent with the structural decisions · no remaining conflicts.
```

This catches the case where (e.g.) Alexander specifies a 16px gap but Ostrom's grid requires 12px — they bounce it back, Alexander revises to 12px, Ostrom confirms. Operator sees the bounce.

## Proposed migration · phased, low-risk

### Phase A · Compatibility shim (1 commit · zero risk)

Add a `kickoff.yaml` composition file at `construct-compositions/compositions/discovery/kickoff.yaml` that DESCRIBES the current /kickoff shape (no behavior change). This is documentation as code — makes the composition shape inspectable to `loom` without changing the runtime.

### Phase B · Phase 0 substrate detection (1 commit · feature-flag · low risk)

Add the substrate-detection block to Phase 0. If substrate not installed → current Studio behavior (no regression). If substrate installed → log to `.run/compose/<run_id>/` for future-cycle observability work.

### Phase C · Final-phase handoff emission (1 commit · low risk)

Phase 5 emits a final handoff packet via `handoff-emit.sh` if substrate is installed. Otherwise no-op. This makes /kickoff visible in the observability station MVP (cycle-rooms-observatory).

### Phase D · ARCH phase room-mode promotion (1 commit · medium risk)

Phase 3 detects substrate and routes:
- Substrate installed → spawn `construct-the-arcade` + `construct-artisan` adapters (room mode)
- Substrate not installed → current "embody both" (studio mode)

Test on a real kickoff to ensure room-mode output matches or exceeds studio-mode quality. The handoff packet enables side-by-side comparison.

### Phase E · Pair-relay for ARCH+CRAFT convergence (1 commit · medium risk · operator-opt-in)

Promote Phase 3 to pair-relay pattern with `max_cycles: 3` and operator pair-points. Operator opts in via `--pair-relay` flag at first. After validation in real use, becomes default.

### Phase F · Mode-pluggability (1 commit · medium risk)

Phase 0 resolves OperatorOS mode (via archetype-resolver or AskUserQuestion). /kickoff dispatches to mode-specific composition YAML. Default is current ARCH shape.

### Phase G · /enhance composition (1 commit · low risk)

Phase 4 explicitly invokes the `/enhance` skill as a stage. The composition YAML lists `enhance` in `compose_with`. The PTCF framework runs against the build doc.

## What stays put · don't change these

- **The 3-artifact output contract** (build doc + session track + clipboard pointer). This is the load-bearing operator-visible contract. Don't break it.
- **The cross-repo / target-repo discipline**. Phase 0's target-repo resolution is correct.
- **The "self-contained" rule for the build doc**. The next session must not need to dig. This is what makes /kickoff valuable.
- **The Barth scope discipline** (V1/V2/cut). Operator-loved · don't dilute.
- **Phase 1 DIG parallelism**. Already parallel-by-default · just needs to land in compose envelopes.

## Operator latitude · question-the-question

Two framings worth questioning:

**Q1**: Is `/kickoff` actually the right primitive given the substrate shift? Or is it really TWO things now — a `dig-and-frame` composition (Phases 1-2) and a `build-doc-handoff` composition (Phases 3-5) — that just happen to be invoked sequentially?

If yes → split into two compositions, let operator invoke separately when needed. Today's `/kickoff` becomes a meta-composition that runs both.

**Q2**: Is the studio-vs-room distinction the right axis, or should /kickoff have THREE modes — Studio (current) / Room (full substrate) / **Hybrid** (per-phase choice based on stakes)?

Hybrid argument: DIG phase needs broad exploration (Studio fits); ARCH phase claims authority (Room fits); ENHANCE phase is mechanical (either works). Forcing all-or-nothing is wasteful.

## Recommended next session · how to execute

If operator wants this implemented:

1. **Start with Phase A** (compatibility shim) in a PR against `construct-compositions`. Pure documentation. Operator merges or revises.
2. **Phase B + C together** as a PR against `~/.claude/skills/kickoff/` (the local skill). Substrate detection + handoff emission. Backwards compatible. Land before Phase D.
3. **Phase D + E** together — the room-mode promotion + pair-relay. This is the real meat. Test against a real cross-repo kickoff (e.g. session 5 of purupuru-ttrpg).
4. **Phase F** later — mode-pluggability is the largest lift and benefits from D+E being battle-tested first.

Estimated effort: A+B+C = 1 session. D+E = 1 session. F+G = 1 session. Total ~3 sessions of focused work.

## What this distills upstream

Cross-repo contributions this analysis seeds:

| Destination | What to PR |
|---|---|
| `construct-compositions/compositions/discovery/kickoff.yaml` | New composition file (Phase A) |
| `construct-rooms-substrate/docs/runtime/` | Add a "skill-to-composition migration pattern" doc grounded in this kickoff case study |
| `~/.claude/skills/kickoff/SKILL.md` | Substrate-aware behavior + room-mode promotion (Phases B-E) |
| `loa-constructs/grimoires/loa/prd-cycle-kickoff-substrate.md` | New PRD if this becomes its own cycle |

## Bridging back to global CLAUDE.md (OperatorOS)

The operator's global CLAUDE.md declares:
- 6 modes (FEEL/ARCH/DIG/SHIP/FRAME/TEND)
- Construct resolution table (mode → primary + secondary + lens)
- Hard NO boundaries (no studio output driving build work until promoted)
- Doctrine activation protocol

/kickoff should respect ALL of these:
- **Mode-aware** (Gap 6 above)
- **Construct resolution table-aware**: Phase 3's choice of `the-arcade + artisan` is hard-coded today. Should consult the CLAUDE.md construct-resolution table at runtime based on mode + topic domain.
- **Studio-to-build promotion gate**: when /kickoff's Studio-mode output becomes the input to a build session, that's the promotion. The CLAUDE.md says "no studio output driving build work until promoted" — /kickoff IS the promotion ceremony. Make this explicit in the build doc output.
- **Doctrine activation**: if /kickoff reads any vault doctrine (e.g. for KAORI voice extraction), it must emit an activation receipt in the handoff packet.

This makes /kickoff a **named promotion ceremony** in OperatorOS — studio synthesis becomes room-grade build instruction with an audit trail.

---

## Summary verdict

`/kickoff` is functional today but predates the substrate shift. It works as a monolithic SKILL.md, but it's leaving on the table:

- Composition-as-YAML inspectability
- Room-mode authority claims
- Observable handoff packets
- Pair-relay convergence for ARCH+CRAFT
- Mode-pluggability (OperatorOS)
- Explicit /enhance composition

The fix is migration, not rewrite. Seven phases (A-G), each one PR, mostly backwards-compatible. The /enhance skill stays upstream-canon unchanged. /kickoff becomes a composition that uses it.

The biggest unlock: **once /kickoff is observable, every cross-repo handoff becomes auditable**. The operator can trace WHY one session's kickoff produced the build doc it did. The Anthropic NLA-grounded divergence detection (per cycle-rooms-observatory PRD) catches kickoffs where the stated rationale doesn't match what actually happened.
