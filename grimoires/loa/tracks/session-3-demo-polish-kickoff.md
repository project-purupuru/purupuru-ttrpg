---
session: 3
date: 2026-05-10
type: kickoff
status: planned
---

# Session 3 — Demo Polish · Eileen's 4 Proofs (kickoff)

## Scope

Final polish session before Solana Frontier ship 2026-05-11. Audit current build against Eileen's 4 demo proofs · close the smallest-sharpest gaps · prepare operator runway for recording.

- Cross-construct audit · KEEPER (user truth) · ALEXANDER (craft) · WEAVER (composition) · ROSENZU (spatial)
- Synthesize must-ship vs nice-to-have vs cannot-craft
- Execute the consensus must-ship items
- Build doc + clipboard pointer for next session (recording)

## Artifacts

- Build doc: `specs/enhance-demo-polish-2026-05-11.md` (source of truth · arch + execution + runway)
- This track: `tracks/session-3-demo-polish-kickoff.md`

## Prior session

Session 2 closed (claim-flow-kickoff · sprint-3 T1+T2 mint route + HMAC verify across routes · committed at `6ce7f1e` · merged to main at `ea6ee82`). README + journey map + lexicon all current on main.

## Decisions made (R4 audit synthesis)

1. **Reveal copy** · expanded ARCHETYPE_REVEALS to 2-beat structure (trait + consequence) per element. Was 8-word aphorism · now ~15-word reading. ALEXANDER + KEEPER both flagged.
2. **Secondary CTA dropped** · result reveal now single "Claim Your Stone" CTA (was 2 buttons). WEAVER + ROSENZU concur · proof #3 needs single-decision moment.
3. **Post-mint `links.next` bridge** · mint POST response returns inline `external-link` to `purupuru-blink.vercel.app/?welcome=<element>`. Closes proof #3→#4 seam without building Z5.
4. **Welcome-param fixture seed** · ObservatoryClient reads `?welcome=` query param · emits one JoinActivity to activityStream 5s after intro. Stand-in for zerker's radar indexer until wired. Proof #4 ("I am not alone") needs visible arrival.
5. **Hold quiz at 3 answers** · NOT 5. ALEXANDER override · 3 reads as "world offering you a shape," 5 reads as "menu."
6. **Hold "You are Wood." reveal title** · don't soften · identity-locating phrase earned by step 8 (KEEPER).
7. **Phantom chrome unfixable** · all four agents concur · voiceover does the trust-crossing work.
8. **Don't record in dial.to** · ROSENZU: dev tool dressed as demo. Record from real Twitter (or composite frame for Beat 1 backup).
9. **Skip Z8 (login/profile) for v0** · WEAVER: competes with proof #3.
10. **Step-indicator atmospheric clauses** · ALEXANDER 🟡 spec deferred to "if time" · pre-record runway item.

## Open at handoff

- 6 operator-only pre-record items in build doc (§ Operator Runway)
- 4 Vercel env vars on `purupuru-quiz` project (CLAIM_SIGNER_SECRET_BS58 + SPONSORED_PAYER_SECRET_BS58 + KV_REST_API_URL + KV_REST_API_TOKEN)
- Upgrade-authority freeze (irreversible · post-validation only)
- Dialect Action registry submission (parallel · doesn't block · 1-5 day review window · post-hackathon hygiene)

## What carries to session 4 (recording day)

- The 3-min recording skeleton from build doc § Recording
- The voiceover script anchors (KEEPER's proof-by-proof emotional asks)
- The composite Twitter frame backup for Beat 1 if dial.to banner appears in real unfurl
