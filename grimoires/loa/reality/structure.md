# Code Structure (Reality Snapshot · 2026-05-07)

> Source: `find` on `~/Documents/GitHub/purupuru-ttrpg`, excluding vendored dirs (`.git`, `.loa`, `.beads`, `.claude`, `node_modules`, `grimoires`).
>
> **Verdict**: scaffold-only. Five non-vendored files. No `src/`, no `apps/`, no `packages/`, no `programs/`.

## Directory Tree (max depth 4, vendored dirs collapsed)

```
purupuru-ttrpg/
├── .beads/                    [collapsed · Loa task graph state]
├── .claude/                   [collapsed · Loa system zone, vendored]
├── .git/                      [collapsed · zero commits yet]
├── .loa/                      [collapsed · framework submodule v1.130.0]
├── grimoires/                 [State Zone]
│   └── loa/
│       ├── NOTES.md
│       ├── a2a/
│       │   ├── flatline/      [PRD adversarial-review artifact]
│       │   └── trajectory/    [agent telemetry]
│       ├── context/           [empty pre-ride · populated by /ride]
│       ├── discovery/         [empty]
│       ├── legacy/            [empty]
│       ├── prd.md             [911 LOC · post-flatline-applied genesis PRD]
│       └── reality/           [populated by this ride]
├── .gitignore
├── .loa-version.json
├── .loa.config.yaml
├── CLAUDE.md
└── README.md
```

## Non-Vendored File Inventory

| File | Bytes | Purpose |
|------|-------|---------|
| `.gitignore` | 584 | next.js / node / loa-state ignores · `grimoires/loa/a2a/trajectory/*.jsonl` excluded |
| `.loa-version.json` | 406 | Loa framework version pin (v1.130.0, schema 2, strict integrity) |
| `.loa.config.yaml` | 578 | Operator-owned config · `persistence_mode: standard`, `integrity_enforcement: strict`, `drift_resolution: code` |
| `CLAUDE.md` | 1813 | Repo-level agent guidance · references `@.claude/loa/CLAUDE.loa.md` framework instructions |
| `README.md` | 3774 | Public-facing repo description · ghibli-warm voice · status banner |

## Planned vs. Actual

| Path (planned) | Source of plan | Actual | Drift type |
|----------------|----------------|--------|------------|
| `apps/web/` | README L33, CLAUDE.md, prd.md tl;dr (`apps/blink-emitter`) | absent | GHOST |
| `packages/peripheral-state/` | README L34 | absent | GHOST |
| `packages/peripheral-events/` | CLAUDE.md, prd.md (`@purupuru/peripheral-events`) | absent | GHOST |
| `packages/omen-templates/` | README L35 | absent | GHOST · also OBSOLETE — superseded by post-flatline frame |
| `programs/event-witness/` | CLAUDE.md, prd.md §3.3 | absent | GHOST |

## Git State

- Branch: `main`
- Commits: **0** — `git log` returns "your current branch 'main' does not have any commits yet"
- Remotes: `loa-upstream/main` only
- Staged but uncommitted: ~1000+ files (entire `.beads/`, `.claude/`, `.loa/`, `grimoires/` scaffold from `/mount`)

This is a genesis-stage repo. The next git commit will likely be the initial scaffold + PRD commit.
