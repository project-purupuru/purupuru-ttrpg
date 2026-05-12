# PRD Review · substrate-agentic-translation-adoption-2026-05-12

> Flatline returned degraded mode (#759). Substituted with 2-agent adversarial pattern (skeptic Agent + improver Agent · same pattern that worked on §07-§11). Both agents verified claims against actual repo state.

## Verdict

**STRUCTURAL REWORK BEFORE SDD.** 8 BLOCKERS + 12 HIGH_CONSENSUS improvements + 5 PRAISE-worthy load-bearing decisions to preserve.

The reframe ("adopt, don't invent") is correct and load-bearing. The PRD reproduces the post-flatline pattern of the §07-§11 docs — asserting upstream substrate state that is more aspirational than shipped. Type-system, Phase 23a status, test count, and schema count are all wrong.

## BLOCKERS (severity ≥700 · operator decision required)

| ID | Sev | Title | Verification failure |
|---|---:|---|---|
| SKEP-001 | 950 | Effect Schema vs TypeBox · re-export impossible | compass uses `effect/Schema`; hounfour uses `@sinclair/typebox` — incompatible type systems |
| SKEP-002 | 920 | Straylight Phase 23a BLOCKED on Hounfour v8.6 delta | Phase 23a = "MVP schema-contract draft only · no schema authored · runtime BLOCKED on Hounfour delta #8 (estate-transition.schema.json) queued in v8.6.x" — adoption substrate does not exist yet |
| SKEP-003 | 880 | Test baseline is 24 not 128 | `pnpm test` returns Tests 24 passed (24); 128 was fabricated/sibling-repo |
| SKEP-004 | 830 | Schema count 92 .schema.json (or 14 dist .d.ts) · not 53 | `find ~/Documents/GitHub/loa-hounfour/schemas -name '*.schema.json' \| wc -l` = 92 |
| SKEP-005 | 780 | G3 straylight signed-assertion is unverifiable | Straylight ships ZERO TS exports of `assert()` or `recall()` — no published npm release |
| SKEP-006 | 750 | G5 LOC -200 contradicts G4 (ship card game) | Card-game minimum surface is 5 new files · realistic 800-2000 LOC; compass `lib/` doesn't have 1000+ LOC of substrate-replicas to delete |
| SKEP-007 | 720 | G8 Eileen/Jani sign-off has 3 conflicting bars | §2.2 SHOULD vs §3.2 qualitative gate vs §12 acceptance — no time-box |
| SKEP-008 | 700 | S4 card game sized as sprint but realistically multi-cycle | Zero existing card game code; rules/win-condition undefined; design + implement + test + design-review compressed |

## HIGH (520-680)

SKEP-009 (680) hounfour MIN_SUPPORTED v6 vs v7 latest — only 1 version forward headroom · SKEP-010 (650) "≥3 upstream issues" is gameable · SKEP-011 (620) puruhani is barely present in compass · SKEP-012 (600) NFR-PERF-1/2 lack measurement infra · SKEP-013 (580) FR-S0-3 unbounded HITL on Eileen/Jani · SKEP-014 (550) "CI lint enforces" hooks don't exist · SKEP-015 (520) operator-global rooms substrate not deployable to Vercel

## HIGH_CONSENSUS improvements (auto-integrate candidates · value 700-950)

| ID | Val | Title |
|---|---:|---|
| IMP-001 | 950 | Pre-name candidate hounfour schemas in §5.1 (S0 confirms/contests · doesn't discover from zero) |
| IMP-002 | 920 | Vendor-vs-import is PRD decision, not SDD deferral — contradicts G5 |
| IMP-003 | 900 | Substrate adoption-order rationale (S1 envelope shell · S2 backfill verdict typing) |
| IMP-004 | 880 | Split LOC metric (conformance vs card-game budget) |
| IMP-005 | 870 | Chain-binding adapter location (NO new `adapters/` folder · use `lib/live/solana.live.ts`) |
| IMP-006 | 850 | S0→S1 promotion gate (binary readiness · ≥80% domain types map · 0 hounfour-breaking-blockers · straylight `locked` or `draft-stable`) |
| IMP-007 | 830 | NFR-ROLLBACK section · atomic per-sprint commits · max-failing-tests pause threshold |
| IMP-008 | 800 | Verify⊥judge compile-time test (`expect-type` or `tstyche` against deliberate type-error fixture) |
| IMP-009 | 780 | G8 restructure: tracking issues opened · 7-day silent-no protocol · cycle ships independently |
| IMP-010 | 750 | Card game MVP rules-of-engagement minimum spec (§5.5.1) |
| IMP-011 | 720 | Card game persistence: IN-MEMORY ONLY MVP · `MockAuditSink` Live Layer · zero chain calls |
| IMP-012 | 700 | §10.5 upstream provenance SHA-pin manifest |

## Missing sections

§5.0 (pre-decided architecture choices) · §6.5 (NFR-ROLLBACK) · §10.5 (upstream provenance pin) · §13 (sprint dependency graph) · §14 (fallback / scope-degradation tree) · §5.5.1 (card game MVP rules) · §11.6 (compass-as-fixture-vs-tutorial)

## PRAISE (preserve verbatim through downstream artifacts)

| ID | Title | Preservation note |
|---|---|---|
| PRAISE-001 | "Adopt don't invent" reframe (§0 + §1.2) | SDD §1 abstract MUST quote §1.2 verbatim · sprint task DoD includes "adopt from <upstream>, do not author" · PR titles `[adopt:<substrate>]` |
| PRAISE-002 | G5 net-LOC-negative as primary goal | Keep as hard architectural constraint not soft target · sprint plan tracks running LOC tally |
| PRAISE-003 | S0 as code-zero sprint with operator pair-point | SDD must NOT collapse S0 into S1 · allocate real time |
| PRAISE-004 | "Card game is the customer" (§3.2 + §5.5) | Preserve as §1 north star · S1/S2/S3 ACs include "does this make S4 easier?" check |
| PRAISE-005 | Explicit cuts list with CI lint enforcement | Extend to lint rules `find . -path '*/construct-translation-layer*'` empty + `find lib -path '*adapter*'` empty |

## Cost / latency

- Flatline degraded run: ~26¢ Phase 1 (output unparseable)
- 2-agent fallback: ~5 min total · within budget envelope

## Source

- Skeptic agent output: 23 findings (8 BLOCKER · 7 HIGH · 6 MEDIUM · 2 LOW)
- Improver agent output: 17 improvements (12 HIGH_CONSENSUS · 4 MEDIUM · 1 LOW) + 5 praise + 7 missing sections
- Verifications: actual `pnpm test` count · actual `find ~/Documents/GitHub/loa-hounfour/schemas` count · actual `package.json` deps · actual `gh search code 'Phase 23' --repo 0xHoneyJar/loa-straylight`
