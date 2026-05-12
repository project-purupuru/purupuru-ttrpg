/**
 * Hand-port of hounfour `agent-lifecycle-state` schema as Effect Schema.
 *
 * Source: hounfour@ec5024938339121dbb25d3b72f8b67fdb0432cad:schemas/agent-lifecycle-state.schema.json
 * Drift policy: see scripts/hounfour-drift.ts (Q10 · weekly cron at S6)
 *
 * DO NOT EDIT to match an evolving upstream — let the drift CI flag deltas.
 */

import { Schema as S } from "effect";
import upstreamSchema from "./schemas/hounfour-agent-lifecycle-state.schema.json";

// 6-state lifecycle from upstream JSON Schema anyOf.
// Compass maps puruhani lifecycle (dormant→stirring→breathing→soul) to:
// DORMANT (no spawn yet) → PROVISIONING (mint in flight) → ACTIVE (spawned)
// → SUSPENDED (idle off-canvas) → TRANSFERRED (wallet move) → ARCHIVED (final)
export const AgentLifecycleStatePort = S.Literal(
  "DORMANT",
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "TRANSFERRED",
  "ARCHIVED",
);

export type AgentLifecycleStatePort = S.Schema.Type<typeof AgentLifecycleStatePort>;

export const AgentLifecycleStateUpstreamSchema = upstreamSchema;
