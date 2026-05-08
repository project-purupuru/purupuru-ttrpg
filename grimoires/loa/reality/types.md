# Types & Schemas

> Generated 2026-05-07. **Currently: none.** No type, schema, or model code exists.

## Planned (per PRD `grimoires/loa/prd.md`)

### WorldEvent — Effect Schema discriminated union

```ts
// PLANNED · packages/peripheral-events/src/world-event.ts (does not exist yet)
type WorldEvent =
  | { _tag: "mint";          /* mint-specific fields */ }
  | { _tag: "weather_shift"; /* weather-specific fields */ }
  | { _tag: "element_surge"; /* element-affinity-specific fields */ };
```

Three v0 variants. Sealed. Effect Schema for runtime validation + canonical encoding.

### Canonical eventId

```
eventId = sha256(canonical_encoded(event) + version + source)
```

Stable, replay-safe, derivable client-side. PRD FR-1, FR-3.

### WitnessRecord (PDA)

```
seeds:    [b"witness", event_id, witness_wallet]
data:     (witness, event_id, event_kind, ts, slot)
fee_payer: backend keypair (sponsored)
```

Idempotent: re-witness is a no-op.

### ECS components (off-chain)

- `ElementAffinity` — wuxing affinity per puruhani
- `WardrobeState` — visible-state component for rendering
- `WitnessAttestations` — array of witness records associated with a WorldEvent

### Ports (interfaces)

- `EventSourcePort` — read-side
- `EventResolverPort` — server-side eventId → validated event lookup
- `WitnessAttestationPort` — write-side (gates the PDA write)
- `MediumRenderPort` — fan-out to L4
- `NotifyPort` — cache-bust signaling

## How to Use

After sprint-1, this file should list every published type with `file:line` citations. Today, it's a forward-looking summary derived from the PRD.
