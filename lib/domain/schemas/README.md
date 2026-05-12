# Vendored upstream schemas

Source-of-truth JSON Schemas vendored from upstream repos. **DO NOT EDIT** — refresh from upstream at S6 distill or operator decree.

## Provenance

| File | Source repo | SHA | Refresh policy |
|---|---|---|---|
| `construct-handoff.schema.json` | `0xHoneyJar/construct-rooms-substrate` | `8259a765dac2e5e88325a359675b80e761c378c8` | Manual annual refresh (no public GitHub repo · operator-machine clone is canonical) |
| `room-activation-packet.schema.json` | `0xHoneyJar/construct-rooms-substrate` | `8259a765dac2e5e88325a359675b80e761c378c8` | Same as above |
| `hounfour-*.schema.json` (added in S2) | `0xHoneyJar/loa-hounfour@7.0.0` | `ec5024938339121dbb25d3b72f8b67fdb0432cad` | Weekly drift CI (`.github/workflows/hounfour-drift.yml` · S6) |

## Why vendored

- `construct-rooms-substrate` is operator-machine-only · NOT npm-published · NOT public GitHub.
- Vendoring keeps compass production builds reproducible (Vercel can't reach `~/.claude/scripts/`).
- Hand-port pattern (`lib/domain/*.hounfour-port.ts`) consumes these JSON files at module load via AJV for runtime structural conformance (NFR-SEC-3).

## Editing

If a schema must change for compass-specific reasons, **don't edit here** — fork the upstream pattern as a compass-owned schema in `lib/domain/` and reference it explicitly. Vendored copies stay as upstream-mirror.
