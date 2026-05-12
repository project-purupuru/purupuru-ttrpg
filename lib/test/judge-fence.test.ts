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
import { verify, judge, type Verified } from "../domain/verify-fence";

const TestSchema = S.Struct({ id: S.String });
type Test = S.Schema.Type<typeof TestSchema>;

describe("verify⊥judge fence · compile-time", () => {
  it("judge accepts Verified<Test> · returns Effect", () => {
    const verified = {} as Verified<Test>;
    const result = judge(verified, (e) => Effect.succeed(e.id));
    expectTypeOf(result).toMatchTypeOf<Effect.Effect<unknown, unknown, never>>();
    expect(result).toBeDefined();
  });

  it("verify returns Effect<Verified<T>, VerifyError>", () => {
    const eff = verify(TestSchema, { id: "x" });
    expectTypeOf(eff).toMatchTypeOf<Effect.Effect<Verified<Test>, unknown, never>>();
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
