/**
 * Hand-port of hounfour `domain-event` schema as Effect Schema.
 *
 * Source: hounfour@ec5024938339121dbb25d3b72f8b67fdb0432cad:schemas/domain-event.schema.json
 *
 * This is the cross-cutting envelope for aggregate state changes.
 * Compass uses this to type the `verdict` field of ConstructHandoff
 * (lib/domain/handoff.schema.ts) at S2-T10 narrowing.
 *
 * additionalProperties:true upstream → S.Struct extends with extra fields ok.
 */

import { Schema as S } from "effect";
import upstreamSchema from "./schemas/hounfour-domain-event.schema.json";

export const AggregateType = S.Literal(
  "agent",
  "conversation",
  "billing",
  "tool",
  "transfer",
  "delegation",
);
export type AggregateType = S.Schema.Type<typeof AggregateType>;

export const DomainEventPort = S.Struct({
  event_id: S.String.pipe(S.minLength(1)),
  aggregate_id: S.String.pipe(S.minLength(1)),
  aggregate_type: AggregateType,
  type: S.String,
  version: S.Number,
  occurred_at: S.String,
  actor: S.String,
  payload: S.Unknown,
  contract_version: S.String,
});

export type DomainEventPort = S.Schema.Type<typeof DomainEventPort>;

export const DomainEventUpstreamSchema = upstreamSchema;
