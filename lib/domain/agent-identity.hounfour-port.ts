/**
 * Hand-port of hounfour `agent-identity` schema as Effect Schema.
 *
 * Source: hounfour@ec5024938339121dbb25d3b72f8b67fdb0432cad:schemas/agent-identity.schema.json
 * Subset port — compass binds only the fields it surfaces today.
 * Forward-compat: when puruhani materialization (ERC-6551 TBA · post-cycle)
 * needs delegation_authority + max_delegation_depth + governance_weight,
 * extend the Struct then.
 *
 * DO NOT EDIT to match an evolving upstream — let the drift CI flag deltas.
 */

import { Schema as S } from "effect";
import upstreamSchema from "./schemas/hounfour-agent-identity.schema.json";

export const AgentType = S.Literal("model", "orchestrator", "human", "service");
export type AgentType = S.Schema.Type<typeof AgentType>;

export const AgentIdentityPort = S.Struct({
  agent_id: S.String.pipe(S.pattern(/^[a-z][a-z0-9_-]{2,63}$/)),
  display_name: S.String.pipe(S.minLength(1), S.maxLength(128)),
  agent_type: AgentType,
  capabilities: S.Array(S.String),
  contract_version: S.String,
  // Recommended-tier · adopt minimal subset · expand when puruhani lands
  trust_scopes: S.optional(S.Unknown),
  delegation_authority: S.optional(S.Unknown),
  max_delegation_depth: S.optional(S.Number),
  governance_weight: S.optional(S.Number),
});

export type AgentIdentityPort = S.Schema.Type<typeof AgentIdentityPort>;

export const AgentIdentityUpstreamSchema = upstreamSchema;
