/**
 * Compile-time fence assertion (S3-T5 · Q6 surface).
 *
 * The @ts-expect-error directive IS the fence: if the type-mismatch ever
 * stops being an error, `tsc --noEmit` fails · CI red.
 *
 * Per BB-005: uses expect-type (composes with vitest · zero new infra).
 * Per BB-008 example pattern (SDD §6.3 corrected).
 */

import { describe, it, expect } from "vitest";
import { expectTypeOf } from "expect-type";
import { Effect, Schema as S } from "effect";
import { verify, judge, type Verified, VerifyError, JudgeError } from "../domain/verify-fence";

const TestSchema = S.Struct({ id: S.String });
type Test = S.Schema.Type<typeof TestSchema>;

describe("verify⊥judge fence · compile-time", () => {
  it("judge returns the inner judgmentFn's Effect with JudgeError channel", () => {
    // Tightened per BB-PR-004: toEqualTypeOf catches brand erosion.
    // judge<T,R>(Verified<T>, fn) returns Effect.Effect<R, JudgeError, never>
    const verified = {} as Verified<Test>;
    const result = judge(verified, (e) => Effect.succeed(e.id));
    expectTypeOf(result).toEqualTypeOf<Effect.Effect<string, JudgeError, never>>();
    expect(result).toBeDefined();
  });

  it("verify returns Effect<Verified<T>, VerifyError, never>", () => {
    // Tightened per BB-PR-004: toEqualTypeOf — if Verified brand erodes
    // (e.g., a refactor accidentally returns raw T), this assertion fails.
    const eff = verify(TestSchema, { id: "x" });
    expectTypeOf(eff).toEqualTypeOf<Effect.Effect<Verified<Test>, VerifyError, never>>();
  });

  it("judge MUST reject raw Test at the type level (the fence)", () => {
    const raw: Test = { id: "x" };
    // @ts-expect-error -- raw T is not assignable to Verified<T> · the fence
    judge(raw, (e) => Effect.succeed(e.id));
    // If the @ts-expect-error directive is unused (no error to suppress),
    // tsc fails with TS2578 · meaning the fence has BROKEN.
    expect(true).toBe(true);
  });
});
