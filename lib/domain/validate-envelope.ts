/**
 * Runtime structural validator for ConstructHandoff envelopes.
 * Uses AJV against the vendored upstream JSON Schema.
 * NFR-SEC-3 surface: parse-boundary validation.
 */

import Ajv, { type ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { ConstructHandoffJsonSchema, type ConstructHandoff } from "./handoff.schema";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(ConstructHandoffJsonSchema);

export class EnvelopeValidationError extends Error {
  readonly _tag = "EnvelopeValidationError" as const;
  constructor(public readonly errors: ErrorObject[] | null) {
    super(`Envelope validation failed: ${JSON.stringify(errors)}`);
    this.name = "EnvelopeValidationError";
  }
}

export function validateEnvelope(input: unknown): ConstructHandoff {
  if (!validate(input)) {
    throw new EnvelopeValidationError(validate.errors ?? null);
  }
  return input as ConstructHandoff;
}
