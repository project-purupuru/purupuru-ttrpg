# Session 3 — sprint-3 · mint-route wiring · the last 10%

> Sprint-2 closed the substrate (anchor program shipped to devnet · 6/6 invariants · ClaimMessage signing · KV nonce · Metaplex CPI mint). What's missing is the API layer that turns the live Quiz Blink's "Claim Your Stone" button into a real `claim_genesis_stone` transaction. **This sprint is one well-scoped wiring task** · not new substrate.
>
> **Time pressure**: T-2 days to ship 2026-05-11. Sprint must close TODAY or tomorrow morning.
>
> **Type**: agent-driven implementation · operator reviews PR before merge.
>
> **Mode**: SHIP (Barth) — finish-line is visible · no scope creep · no "while I'm here" cleanups.

---

## Why this session exists

The PRD gap-map (`grimoires/loa/context/prd-gap-map.md`) called five must-do items the critical path:

1. Replace mint POST mock memo with real `claim_genesis_stone` integration
2. Switch quiz step HMAC from `PLACEHOLDER_MAC` to real verify
3. Issue `quiz_state_token` (5-min expiry) at result reveal · validate at mint POST
4. Sponsored-payer partial-sign before tx return (folds into #1)
5. Run `solana program set-upgrade-authority --final` (operator-run · last)

Items 1-4 are wiring the substrate that already exists. Item 5 is a single command. **Total estimated effort: ~1.75d** (gap-map estimate). With the substrate already proven, the actual code change is small.

The deck/demo story REQUIRES the live mint to work. Without this sprint, the Blink shows a quiz that ends in "transaction signed" but no NFT appears in Phantom. With it, the e2e flow lands a real on-chain stone visible in the user's collectibles.

---

## Pre-flight (substrate that's already done · don't rebuild)

| Substrate piece | Where | Status |
|---|---|---|
| HMAC sign + verify for quiz state | `packages/peripheral-events/src/bazi-quiz-state.ts` | ✅ shipped |
| ClaimMessage 98-byte canonical encoding + ed25519 sign helper | `packages/peripheral-events/src/claim-message.ts` | ✅ shipped |
| KV nonce store with NX EX 300 atomic check-and-set | `lib/blink/nonce-store.ts` | ✅ shipped + tested |
| Anchor program with `claim_genesis_stone` instruction | program ID `7u27WmTz...` on devnet | ✅ shipped |
| 5 element metadata fixtures pointing at gumi PNGs | `fixtures/stones/{element}.json` | ✅ shipped |
| Sponsored-payer keypair handling + balance check | `lib/blink/payer.ts` (or similar · operator confirm path) | ✅ shipped (sprint-1 spike #3) |
| `parse_ed25519_instruction` helper · canonical layout | `lib.rs:411-445` (anchor side) + builder pattern | ✅ shipped |

Three-keypair model (already operational):
- **sponsored-payer** · pays tx fees · `SPONSORED_PAYER_SECRET_BS58` env
- **claim-signer** · signs ClaimMessage off-chain · `CLAIM_SIGNER_SECRET_BS58` env · pubkey hardcoded as `CLAIM_SIGNER_PUBKEY` in `lib.rs:57`
- **user wallet** · signs tx as `authority` from Phantom

---

## Sprint task list (in execution order · check off as we close)

### S3-T1 · Replace mint POST mock memo with real claim_genesis_stone tx · 0.5d

**File**: `app/api/actions/mint/genesis-stone/route.ts`

**Current state**: returns Sp1 mock memo via `buildMockMemoTx` + `composeMintMemo` (lines ~75 onward).

**Target state**: returns serialized devnet transaction with TWO instructions:
1. `Ed25519Program.createInstructionWithPublicKey({ publicKey, message, signature })` — the prior-ix sig verification
2. `claim_genesis_stone` instruction with the 7 args + 9 accounts

The TS-side instruction builder either (a) uses Anchor's auto-generated client from the IDL, OR (b) constructs the ix manually using `TransactionInstruction` + Borsh-encoded args. **Recommendation**: use Anchor's IDL client (less error surface).

**Server-side flow**:
```
1. Parse + validate POST body · `account` field (well-formed pubkey)
2. Parse answers from URL query (a1..a8) · validate each in 0..buttons-1 range
3. Verify HMAC `mac` over canonical answers (drops S1 lenient mode)
4. Compute archetype from validated answers via archetypeFromAnswers
5. Compute weather byte (sprint-3 stub keyed off day-of-week is fine for v0)
6. Compute quiz_state_hash = sha256(canonical answers)
7. Generate nonce = randomBytes(16) · base64url for KV key
8. KV atomic claim: SET nonce-key "claimed" NX EX 300 · 409 if collision
9. Compute issued_at = now · expires_at = now + 300
10. Build ClaimMessage struct + signClaimMessage (ed25519)
11. Generate fresh mint Keypair (server-side · serves as ix signer)
12. Build Ed25519Program ix: { publicKey: claimSignerPubkey, message: messageBytes, signature }
13. Build claim_genesis_stone ix with args + 9 accounts
14. Assemble Transaction with feePayer = sponsoredPayer.publicKey + recentBlockhash
15. partialSign with [sponsoredPayer, mint] · serialize { requireAllSignatures: false }
16. Return { transaction: base64, message: "Your stone is being claimed..." } per Action spec
```

**Acceptance**:
- Live mint at `/preview` (or hosted Blink) results in NFT visible in Phantom collectibles
- Devnet explorer shows `StoneClaimed` event in tx logs
- Two consecutive claims with same wallet succeed (different mints · idempotency at NFT layer · NOT per-wallet)
- Replay attack with same nonce returns 409 (`/api/actions/mint/genesis-stone` second call rejects)
- Wrong HMAC returns 400
- Mock-memo code is DELETED · not commented out (clean diff)

### S3-T2 · Wire real HMAC verify on quiz step + result · 0.25d

**Files**:
- `app/api/actions/quiz/step/route.ts` (currently lenient with `PLACEHOLDER_MAC`)
- `app/api/actions/quiz/result/route.ts` (likely needs same)

**Target state**: every step transition validates the prior `mac` query param against `verifyQuizState({ step, answers, mac, secret })`. Reject with 400 if invalid.

The HMAC sign happens server-side at each step's response (where buttons are constructed): each next-step button URL embeds a fresh `mac` covering `{step: N+1, answers: [...newAnswer]}`. This is already what the renderer does — sprint-3 just needs the route to actually verify the incoming one.

**Acceptance**:
- Tampering an answer in the URL (e.g. `&a3=99`) returns 400
- Stripping the `mac` returns 400
- Valid forward progression continues to work

### S3-T3 · Issue and verify quiz_state_token at result reveal · 0.5d (collapsible)

**Decision point**: PRD §FR-4 calls for a 5-min `quiz_state_token` (JWT-shape) issued at result reveal that the mint POST validates. **In practice** the URL state already carries the answers + HMAC, and the mint POST recomputes archetype from them. The token's purpose is to bind the (wallet, archetype, weather, quiz_state_hash) tuple at a point in time and prevent the wallet from being swapped between reveal and mint.

**Two options**:
- **Option A (full)**: implement quiz_state_token. Issue at `/api/actions/quiz/result` POST · sign with `QUIZ_STATE_TOKEN_SECRET` · embed in mint button URL · verify at mint POST.
- **Option B (collapsed)**: skip the token. Rely on the mint POST's own HMAC re-validation + the KV nonce. The (wallet, archetype, weather) tuple gets validated in S3-T1 step 4-6 anyway. Document the deferral in NOTES.md.

**Recommendation**: **Option B** for hackathon. The token adds a ~3h surface that doesn't change security posture (wallet is in the POST body · server recomputes archetype regardless of any token claim). Post-hackathon hardening adds it.

### S3-T4 · sponsored-payer partial-sign · folded into S3-T1 step 14-15 · 0d

Already in the S3-T1 flow. No separate task.

### S3-T5 · solana program set-upgrade-authority --final · 5min · operator-run

```bash
solana program set-upgrade-authority \
  7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38 \
  --final \
  --keypair ~/.config/solana/id.json \
  --url devnet
```

**Run BEFORE demo recording**, AFTER S3-T1 + T2 are confirmed working. Once frozen, the program cannot be patched — any bug requires a fresh deploy (new program ID · invalidates all hardcoded references).

**Operator's call · agent does NOT run this**.

### S3-T6 (post-T1) · Re-export StoneClaimed Effect Schema · 0.25d · for zerker

**File**: `packages/peripheral-events/src/index.ts`

Add an `S.Struct` mirror of the IDL's `StoneClaimed` event so zerker can import a typed schema instead of hand-rolling it. ~20 LOC.

```ts
export const StoneClaimedSchema = S.Struct({
  wallet: SolanaPubkey,
  element: S.Literal(1, 2, 3, 4, 5),
  weather: S.Literal(1, 2, 3, 4, 5),
  mint: SolanaPubkey,
})
export type StoneClaimed = S.Schema.Type<typeof StoneClaimedSchema>
```

Issue #5 on `project-purupuru/purupuru-ttrpg` references this as 🟡 in-flight. Closing it lets zerker `import { StoneClaimedSchema } from "@purupuru/peripheral-events"`.

---

## Out-of-scope for sprint-3 (resist temptation)

- IP rate limiting (post-hackathon)
- `getBalance` ≥ 0.01 SOL sybil check (post-hackathon)
- Sponsored-payer balance halt threshold (post-hackathon)
- BLINK_DESCRIPTOR upstream PR (post-hackathon)
- Length-extension forgery golden test (post-hackathon)
- CI lint workflow (post-hackathon)
- Demo simulator (sprint-4)
- README polish + BUTTERFREEZONE refresh (sprint-4)

If you find yourself doing any of the above during sprint-3 work, that's scope creep. Save it for sprint-4 or post-hackathon.

---

## Definition of done · sprint-3 complete when

- [ ] `/preview` page · click through quiz · click "Claim Your Stone" · Phantom prompts · sign · NFT appears in Phantom collectibles tab within 30s
- [ ] Devnet explorer shows tx with `StoneClaimed` event in logs
- [ ] Two valid claims back-to-back both succeed (different mints)
- [ ] One replay attempt (same nonce) rejected with 409
- [ ] One tampered HMAC rejected with 400
- [ ] Anchor program upgrade-authority set to `--final` (operator-run)
- [ ] StoneClaimedSchema exported from `@purupuru/peripheral-events`
- [ ] Issue #5 updated with note that schema export is live

---

## After sprint-3 · what's next

Sprint-4 candidates (operator picks at sprint-3 close):
- README polish for hackathon presentation
- BUTTERFREEZONE refresh
- Demo script + recording rehearsal
- Demo simulator (fixture replay OR synthetic generator)
- Deck final pass

Loa-shape: this is the SHIP-mode close. After demo records, the cycle is "tend" (post-hackathon hardening) and "frame" (positioning for what comes next).
