---
session: 2
date: 2026-05-08
type: kickoff
status: planned
---

# Session 2 — sprint-2 · claim flow + on-chain mint (kickoff)

## Scope

- Extend Sp2's `verify_signed_message` → `claim_genesis_stone` with Metaplex CPI mint into collection NFT
- Build `/api/actions/mint/genesis-stone` route using Sp3's sponsored-payer helpers
- HMAC-protect quiz state (per SDD §HIGH-1 flatline)
- Vercel KV nonce store (single-region, fail-closed, 300s TTL)
- Generate sponsored-payer + claim-signer keypairs · fund sponsored-payer
- 7 invariant tests · devnet deploy · end-to-end smoke

**Out of scope this session**: UI (Pixi · Blink visuals · animations), Twitter, gumi voice integration, BLINK_DESCRIPTOR upstream PR

## Artifacts

- Build doc: `grimoires/loa/context/03-sprint-2-kickoff.md`
- PRD: `grimoires/loa/prd.md`
- SDD: `grimoires/loa/sdd.md` §5.1 + §5.2
- Sprint plan: `grimoires/loa/sprint.md` §Sprint 2

## Prior session (sprint-1 day-1 · 2026-05-07)

Shipped:
- Sp1 ✅ · Phantom renders Metaplex NFT · mint `4n3W5T…` confirmed in operator's Phantom
- Sp2 ✅ · Anchor 0.31.1 ed25519-via-instructions-sysvar pattern · 3/3 tests pass · program ID `7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38`
- Sp3 ✅ · Sponsored-payer partial-sign flow · gasless tx confirmed · `4TufRtSBTv6c…`

Closing commits: `0ca843c` (Sp2 close · anchor 0.31.1 sync) · `2194582` (Sp3 close · airdrop fix)

## Decisions made (PREPLAN)

- **Anchor 0.31.1** · NOT 0.30.1 (rustc 1.95 incompat with old `time` crate)
- **Single program** · `purupuru_anchor` covers all on-chain logic · NO splitting into multiple programs
- **Server-signed claim** · NOT zkproof-of-quiz · ed25519 + HMAC sufficient for hackathon scope
- **Fail-closed everywhere** · KV down → 503 · claim-signer missing → boot-time fatal · sponsored-payer < 0.05 SOL → 503
- **Phantom unverified collection acceptable** · `verifyCollectionV1` is post-hackathon polish (collection still groups, just with yellow badge)
- **Learning-density task ordering** · pair tightly on T1 (anchor + Metaplex CPI) · agent-drive T2/T4/T7
- **No UI work** · UI is sprint-3 · Barth scope discipline

## Persona / mode

- **ARCH** (Ostrom) · structural design of the claim instruction
- **Craft lens** (Alexander) · code clarity · byte-layout doc · error codes
- **SHIP** (Barth) · scope discipline · NO sprint-3 creep
- **DIG** as needed · for Metaplex CPI patterns the operator hasn't seen

## Risk flags for next session

- Metaplex CPI is the only NEW Solana concept the operator hasn't paired through · budget ~30min for the conceptual leap before writing code
- ClaimMessage byte layout drift between `claim-message.ts` and `lib.rs` is the #1 silent failure mode · paste the layout as `///` comment in BOTH files · diff them in code review
- Vercel KV provisioning needs operator's vercel account · could block T4 if not pre-set up · suggest doing this in parallel during T9/T10 keypair gen
- Operator using zerker's existing repo state · sprint-2 commits on `feat/awareness-layer-spine` · NO main merges until sprint-2 complete (operator gate)
