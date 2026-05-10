# Session 2 — sprint-2 · claim_genesis_stone flow + on-chain mint

> Sprint-1 day-1 de-risking complete. All 3 spikes green. This session extends proven patterns into the real claim flow: server-signed ClaimMessage → Anchor `claim_genesis_stone` ix → Metaplex CPI mint → NFT in collection. Stop at API layer · UI is sprint-3.

**Type**: interactive learning session · operator pairs through anchor extension (highest learning density) · TS wiring (HMAC/KV) can shift to agent-driven once the conceptual leap is made.

**Mode**: ARCH (Ostrom) for structure · craft lens (Alexander) for code clarity · SHIP (Barth) for scope discipline (NO UI work).

---

## Why this session exists

Sprint-1 proved 3 patterns work on Solana that we couldn't take for granted:
- **Sp1** · Metaplex Token Metadata renders in Phantom on devnet (not just Token-2022, not just SPL · the actual NFT pattern)
- **Sp2** · Anchor program can verify ed25519 sig from prior instruction via instructions sysvar (the canonical "server-signed authorization" pattern)
- **Sp3** · Backend can partial-sign tx with sponsored-payer · client adds wallet sig · runtime accepts both (gasless UX without delegating authority)

Sprint-2 weaves these three together into ONE on-chain instruction (`claim_genesis_stone`) + ONE API route (`/api/actions/mint/genesis-stone`). That's the WHOLE technical novelty of the awareness-layer demo.

After sprint-2: technical risk is zero · only UI/polish remain (sprint-3+4).

---

## Spike retro (what we learned · keep at hand)

Hard-won during the spike phase · fold into S2 work to avoid re-discovery:

**Anchor toolchain**:
- Use anchor-cli **0.31.1** · NOT 0.30.1 (latter has E0282 in old `time` crate vs rustc 1.95+)
- avm wrapper is fragile · install anchor-cli directly via `cargo install --git https://github.com/solana-foundation/anchor --tag v0.31.1 anchor-cli --locked --force`
- Solana CLI from Anza: `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"` · add `~/.local/share/solana/install/active_release/bin` to PATH (already in `~/.zshrc`)
- Rust nightly required for IDL generation: `rustup install nightly && rustup component add rust-src --toolchain nightly`
- `Anchor.toml [scripts] test` switched yarn → `pnpm exec` (corepack pnpm-only enforcement on this monorepo)

**Solana NFT model** (vs Ethereum):
- Each NFT = its own SPL Token mint pubkey (NOT shared contract address w/ tokenIds)
- "Collection" = a separate Collection NFT (`isCollection: true`) · child NFTs reference it via `collection: { key, verified }` field
- `verifyCollectionV1` (collection-authority sig) flips child's `verified: true` · only THEN does Phantom group them in collectibles tab
- Sp1's two orphan stones (`4n3W5T…`, `Hwqm47…`) are unrelated mints because we set `isCollection: false` w/o collection field. S2-T1 fixes this: bootstrap collection NFT + every claim child references it.

**Ed25519 verify pattern** (Sp2 proved):
- Solana programs CANNOT call ed25519 directly (no syscall)
- Pattern: Ed25519Program ix FIRST in tx (Solana built-in verifier · runtime fails entire tx if invalid), then your program reads `instructions sysvar` to extract WHICH (signer, message) was verified, then validates those match expected
- Without instructions sysvar reads: attacker submits ANY ed25519 sig over ANY message · your program never knows
- Sp2's `parse_ed25519_instruction` helper handles the binary layout · S2-T1 reuses verbatim

**Sponsored-payer pattern** (Sp3 proved):
- Backend keypair pays tx fees (env var `SPONSORED_PAYER_SECRET_BS58`)
- User wallet signs as authority for the actual mint
- Two separate sigs in one tx · runtime verifies both
- 0.05 SOL threshold · `checkPayerBalance` before accepting mint requests (fail-closed)

**Repo state checkpoints**:
- Branch: `feat/awareness-layer-spine` · commits `0ca843c` (Sp2 close) · `2194582` (Sp3 close)
- Anchor program ID: `7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38` (synced in 3 spots: Anchor.toml × 2 + lib.rs declare_id)
- Genesis Stone Collection NFT: NOT YET MINTED · S2-T1 bootstrap step is mint-once

---

## Load order (read in this order before building)

1. **`CLAUDE.md`** · project conventions (Loa framework rules)
2. **`grimoires/loa/sdd.md`** §5.1 + §5.2 · the on-chain spec — `claim_genesis_stone` instruction shape + `/api/actions/mint/genesis-stone` route shape
3. **`grimoires/loa/sprint.md`** · sprint-2 task list (S2-T1 through S2-T10) + acceptance criteria + cut triggers
4. **`programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs`** · Sp2 anchor program (the foundation that S2-T1 extends)
5. **`lib/blink/sponsored-payer.ts`** · Sp3 helpers (production-ready · S2-T4 imports directly)
6. **`scripts/sp1-mint-metaplex.ts`** · Umi `createNft` pattern (reference for S2-T1's Metaplex CPI shape)
7. **`packages/peripheral-events/src/claim-message.ts`** · already scaffolded · S2-T3 makes it real

---

## Build sequence (learning-density ordered)

The 10 sprint-2 tasks regrouped by learning density · pair tightly on HIGH · agent-drive LOW.

### 🟢 Easy wins first (operator solo OR agent · ~1h)

#### S2-T9 + S2-T10 · keypair generation (30m + 30m)
Mint two fresh keypairs · separate from each other · separate from operator's main wallet:

```bash
solana-keygen new --no-bip39-passphrase --silent --outfile ~/.config/solana/sponsored-payer.json
solana-keygen new --no-bip39-passphrase --silent --outfile ~/.config/solana/claim-signer.json

# fund sponsored-payer (claim-signer doesn't need SOL · it just signs messages)
solana transfer --from ~/.config/solana/id.json \
    $(solana-keygen pubkey ~/.config/solana/sponsored-payer.json) \
    1.0 --allow-unfunded-recipient --url devnet
```

Add to `.env.local` (NEVER commit):
```
SPONSORED_PAYER_SECRET_BS58=<bs58 of sponsored-payer.json bytes>
CLAIM_SIGNER_SECRET_BS58=<bs58 of claim-signer.json bytes>
ANCHOR_PROGRAM_ID=7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38
GENESIS_STONE_COLLECTION_MINT=<filled after T1.5 below>
```

Helper to convert keypair JSON → bs58 (write as throwaway script):
```typescript
import { readFileSync } from "fs"
import bs58 from "bs58"
const bytes = JSON.parse(readFileSync(process.argv[2], "utf-8")) as number[]
console.log(bs58.encode(new Uint8Array(bytes)))
```

**SECURITY**: claim-signer secret ≠ sponsored-payer secret · rotation independence · blast radius isolation. If sponsored-payer drained → only fee-paying lost. If claim-signer leaked → attacker mints unlimited stones until rotated.

---

### 🟡 Medium learning · pair mid (~3h)

#### S2-T2 · HMAC quiz state (1.5h)

Replace the dev-mode "trust-the-URL" quiz state with proper HMAC-SHA256 + canonical-CBOR encoding · length-extension safe.

File: `packages/peripheral-events/src/bazi-quiz-state.ts` (already scaffolded · we're hardening it)

Why it matters: SDD §HIGH-1 flatline · without HMAC, attacker forges quiz state to mint any element they want. With HMAC + canonical-CBOR (deterministic byte order) + constant-time compare (timing-attack safe) · forgery requires the HMAC key.

Key code shape:
```typescript
import { createHmac, timingSafeEqual } from "node:crypto"
import * as cbor from "cbor-x"  // canonical CBOR encoder

const HMAC_KEY = Buffer.from(process.env.QUIZ_HMAC_KEY!, "hex")  // 32 bytes
const HMAC_TAG_LEN = 16  // truncated SHA-256 · still 128-bit security

export function signQuizState(state: QuizState): string {
  const canonical = cbor.encode(state)  // CBOR is byte-stable across implementations
  const tag = createHmac("sha256", HMAC_KEY).update(canonical).digest().slice(0, HMAC_TAG_LEN)
  return `${canonical.toString("base64url")}.${tag.toString("base64url")}`
}

export function verifyQuizState(token: string): QuizState | null {
  const [stateB64, tagB64] = token.split(".")
  const canonical = Buffer.from(stateB64, "base64url")
  const expectedTag = createHmac("sha256", HMAC_KEY).update(canonical).digest().slice(0, HMAC_TAG_LEN)
  const actualTag = Buffer.from(tagB64, "base64url")
  if (actualTag.length !== expectedTag.length) return null
  if (!timingSafeEqual(actualTag, expectedTag)) return null
  return cbor.decode(canonical) as QuizState
}
```

**LEARNING**: `timingSafeEqual` not `===` · constant-time prevents byte-by-byte timing oracle. CBOR over JSON because JSON has multiple valid serializations of the same object (key order, whitespace) · CBOR canonical mode is byte-stable.

#### S2-T3 · ClaimMessage signing (2h)

Server-side signs `ClaimMessage` payload · returns sig + message bytes for Ed25519Program instruction.

File: `packages/peripheral-events/src/claim-message.ts` (already has Schema · adding signing functions)

Key code shape:
```typescript
import nacl from "tweetnacl"

export function signClaimMessage(
  msg: ClaimMessage,
  claimSignerSecret: Uint8Array,  // 64-byte secret key from CLAIM_SIGNER_SECRET_BS58
): { messageBytes: Uint8Array; signature: Uint8Array; signerPubkey: Uint8Array } {
  const messageBytes = encodeClaimMessage(msg)  // deterministic byte layout · MUST match anchor program's parser
  const keypair = nacl.sign.keyPair.fromSecretKey(claimSignerSecret)
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey)
  return { messageBytes, signature, signerPubkey: keypair.publicKey }
}

// Byte layout · MUST exactly match programs/purupuru-anchor/src/lib.rs reconstitution:
//   [0..32]  wallet pubkey
//   [32]     element byte (1=Wood..5=Water)
//   [33]     weather byte (0..4 enum)
//   [34..66] quizStateHash (sha256)
//   [66..74] issuedAt (i64 LE)
//   [74..82] expiresAt (i64 LE)
//   [82..98] nonce (16 bytes)
//   total: 98 bytes
function encodeClaimMessage(msg: ClaimMessage): Uint8Array {
  const buf = new Uint8Array(98)
  buf.set(msg.wallet.toBytes(), 0)
  buf[32] = elementToByte(msg.element)
  buf[33] = weatherToByte(msg.weather)
  buf.set(msg.quizStateHash, 34)
  new DataView(buf.buffer).setBigInt64(66, BigInt(msg.issuedAt), true)
  new DataView(buf.buffer).setBigInt64(74, BigInt(msg.expiresAt), true)
  buf.set(msg.nonce, 82)
  return buf
}
```

**LEARNING**: byte stability is THE invariant. If the off-chain encoder and on-chain parser disagree on even ONE byte · Ed25519Program verifies fine but `claim_genesis_stone` rejects with `MessageMismatch`. Make both sides reference the SAME layout doc (paste this layout block as a comment in BOTH files).

#### S2-T4 · Vercel KV nonce store (2h)

Single-region (iad1) KV with `SET nonce ... NX EX 300` · fail-closed if Redis unreachable.

File: `lib/blink/nonce-store.ts` (NEW)

Key code shape:
```typescript
import { kv } from "@vercel/kv"

const NONCE_TTL_SEC = 300  // 5 min · matches ClaimMessage expiresAt window

export async function claimNonce(nonce: string): Promise<"fresh" | "replay" | "kv-down"> {
  try {
    const result = await kv.set(`nonce:${nonce}`, "1", { nx: true, ex: NONCE_TTL_SEC })
    return result === "OK" ? "fresh" : "replay"
  } catch {
    return "kv-down"  // fail-closed · caller returns 503
  }
}
```

**LEARNING**: NX (only-if-not-exists) is the atomic primitive that prevents replay. EX 300 caps storage growth. Single-region iad1 = strongly-consistent reads (vs multi-region eventual consistency where same nonce could pass twice if two requests hit different regions before replication).

---

### 🔴 Highest learning · pair tightly (~4h)

#### S2-T1 · `claim_genesis_stone` Anchor program · the conceptual leap

This is THE session's main event. Extends Sp2's `verify_signed_message` into a full mint instruction.

File: `programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs` (REWRITE · don't keep both functions)

What changes from Sp2:
1. **Rename** `verify_signed_message` → `claim_genesis_stone`
2. **Args**: take ClaimMessage struct (wallet, element, weather, quiz_hash, issued_at, expires_at, nonce) instead of raw `Vec<u8>`
3. **Reconstitute** the 98-byte message from args (must match TS `encodeClaimMessage` exactly)
4. **Verify ed25519** via prior ix (same Sp2 pattern · one helper call now)
5. **Validate**: signer pubkey == hardcoded CLAIM_SIGNER_PUBKEY constant · `expires_at >= clock.now()` · `nonce` not used (off-chain KV check is the source of truth · on-chain just refuses expired msgs)
6. **CPI to Metaplex Token Metadata**: `CreateV1` instruction · creates the NFT mint + metadata account + sets collection field
7. **Emit** `StoneClaimed { wallet, element, weather, mint }` event for indexer

NEW concepts (operator hasn't seen yet):
- **CPI** (Cross-Program Invocation) · how Anchor calls Metaplex from inside our program
- **PDA derivation** · Metaplex metadata account is at PDA `["metadata", token_metadata_program_id, mint_pubkey]`
- **`#[account(...)]` constraints** · declarative validation (e.g., `#[account(mut, signer)]`, `#[account(constraint = ...)]`)
- **`emit!` macro** · for events the indexer subscribes to
- **`Clock` sysvar** · reading on-chain time for expiry check
- **Optional accounts** · how Metaplex's myriad optional fields work in Anchor

Pattern to follow · Metaplex's official `mpl-token-metadata` Anchor examples:
- https://docs.metaplex.com/programs/token-metadata/instructions
- https://github.com/metaplex-foundation/mpl-token-metadata/tree/main/programs/token-metadata/program/tests

Skeleton (operator + agent fills in together):
```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::ed25519_program::ID as ED25519_PROGRAM_ID;
use anchor_lang::solana_program::sysvar::instructions::{
    load_current_index_checked, load_instruction_at_checked, ID as INSTRUCTIONS_SYSVAR_ID,
};
use anchor_lang::solana_program::clock::Clock;

declare_id!("7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38");

const CLAIM_SIGNER_PUBKEY: Pubkey = pubkey!("REPLACE_WITH_PUBKEY_FROM_T10");
const COLLECTION_MINT_PUBKEY: Pubkey = pubkey!("REPLACE_AFTER_BOOTSTRAP_BELOW");

#[program]
pub mod purupuru_anchor {
    use super::*;

    pub fn claim_genesis_stone(
        ctx: Context<ClaimGenesisStone>,
        wallet: Pubkey,
        element: u8,           // 1..5 (Wood..Water)
        weather: u8,           // 0..4 enum
        quiz_state_hash: [u8; 32],
        issued_at: i64,
        expires_at: i64,
        nonce: [u8; 16],
    ) -> Result<()> {
        // 1. expiry guard
        let now = Clock::get()?.unix_timestamp;
        require!(now <= expires_at, ErrorCode::Expired);

        // 2. reconstitute exact 98-byte message (matches encodeClaimMessage)
        let mut message = [0u8; 98];
        message[0..32].copy_from_slice(&wallet.to_bytes());
        message[32] = element;
        message[33] = weather;
        message[34..66].copy_from_slice(&quiz_state_hash);
        message[66..74].copy_from_slice(&issued_at.to_le_bytes());
        message[74..82].copy_from_slice(&expires_at.to_le_bytes());
        message[82..98].copy_from_slice(&nonce);

        // 3. verify ed25519 sig from prior ix (Sp2 pattern · UNCHANGED)
        let prior_ix = load_instruction_at_checked(
            (load_current_index_checked(&ctx.accounts.instructions_sysvar)? - 1) as usize,
            &ctx.accounts.instructions_sysvar,
        )?;
        require_keys_eq!(prior_ix.program_id, ED25519_PROGRAM_ID, ErrorCode::PriorIxNotEd25519);
        let parsed = parse_ed25519_instruction(&prior_ix.data)?;
        require!(parsed.signer_pubkey == CLAIM_SIGNER_PUBKEY.to_bytes(), ErrorCode::SignerMismatch);
        require!(parsed.message == message, ErrorCode::MessageMismatch);

        // 4. CPI to Metaplex CreateV1 · mints NFT + metadata · references collection
        // ... (operator + agent fills in together · this is the MAIN learning step)

        // 5. emit event
        emit!(StoneClaimed {
            wallet,
            element,
            weather,
            mint: ctx.accounts.mint.key(),
        });

        Ok(())
    }
}

#[event]
pub struct StoneClaimed {
    pub wallet: Pubkey,
    pub element: u8,
    pub weather: u8,
    pub mint: Pubkey,
}

// ... Accounts struct + Errors + parse_ed25519_instruction (Sp2 verbatim)
```

#### S2-T1.5 · Bootstrap Genesis Stone Collection NFT (15min · ONE-TIME)

Before S2-T1 can finalize (the `COLLECTION_MINT_PUBKEY` const), bootstrap the parent collection NFT:

File: `scripts/bootstrap-collection.ts` (NEW)

```typescript
// adapted from scripts/sp1-mint-metaplex.ts · sets isCollection: true
const result = await createNft(umi, {
  mint: collectionMintSigner,
  name: "Genesis Stones",
  symbol: "PGS",
  uri: COLLECTION_METADATA_URI,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,   // ← THE difference from Sp1
  tokenOwner: umi.identity.publicKey,
}).sendAndConfirm(umi)
```

Run ONCE · paste resulting mint pubkey into:
1. `.env.local` `GENESIS_STONE_COLLECTION_MINT=...`
2. `programs/purupuru-anchor/.../src/lib.rs` `COLLECTION_MINT_PUBKEY` const
3. Rebuild anchor · redeploy

#### S2-T1 invariant tests (per sprint plan AC)

7 tests · all in `programs/purupuru-anchor/tests/sp2-claim.ts` (rename from sp2-ed25519.ts):

| invariant | test |
|---|---|
| no_lamport | program does NOT transfer SOL on its own |
| no_token_mut | program does NOT mutate other token accounts |
| double_claim_reject | same nonce twice → 2nd fails (off-chain KV check · simulated in test) |
| unsigned_reject | tx without Ed25519Program prior ix → rejects |
| expired_sig_reject | `expires_at < now` → ErrorCode::Expired |
| cross_cluster_reject | claim with wrong cluster constant → reject (mainnet sig on devnet program) |
| replay_nonce_reject | nonce check (KV · simulated · this test asserts via mock) |

---

### S2-T7 · dependency-cruiser CI guard (1h · agent-driven)

After T1-T4 done · add CI guard for substrate purity (per HIGH-1).

File: `.dependency-cruiser.cjs` (root)

Block:
- `packages/peripheral-events/**` importing `next/*` · `react` · `@solana/*` (substrate must be pure)
- `packages/medium-blink/**` importing `packages/world-sources/**` directly (must go through API boundary)

CI fails build if violations present. Synthetic violation test in CI: temporarily inject `import "react" from "../../packages/peripheral-events/test"` · CI must red.

---

### Deferred to next session (S2 stretch · not gating)

- **S2-T5** · BLINK_DESCRIPTOR upstream PR to freeside-mediums (external repo · async)
- **S2-T6** · gumi voice integration (external dep · gumi authoring)
- **S2-T8** · cmp-boundary lint (depends on S2-T6)

If session ends with stretch deferred · sprint-2 still ships AC-S2-1, AC-S2-2, AC-S2-5 (the critical ones).

---

## Design rules (Alexander · craft lens)

For the code we write this session:

- **Anchor program comments**: explain WHY each `require!` exists. Future-you (or zerker) needs to know the security reasoning · not just the constraint.
- **Byte layout doc**: paste the exact 98-byte ClaimMessage layout as a `///` comment block in BOTH `claim-message.ts` AND `lib.rs`. Drift = silent forgery vulnerability.
- **Error codes**: every reject path returns a SPECIFIC `ErrorCode` enum variant. Anchor surfaces these in tx logs · `MessageMismatch` vs generic `InvalidArgument` is the difference between "I can debug this in 30s" and "I'm grepping for hours."
- **No `unwrap()` in program code**: every Result is propagated via `?` or asserted via `require!`. Panics in Solana programs are runtime aborts · cryptic failures.
- **TypeScript on the API side**: every external call (KV, Connection, claim-signer access) wrapped in try/catch with explicit fail-closed branch. Return 5xx not 4xx for backend issues · users retry instead of giving up.
- **No emojis in code or commits.** Operator preference. Comments are functional · use `·` separator and Unicode arrows where helpful.

## Verify (acceptance criteria)

End-of-session checklist:
- [ ] `anchor test` · 7 invariant tests pass
- [ ] `pnpm test` · TS unit tests pass (HMAC roundtrip · ClaimMessage signing roundtrip · KV nonce semantics)
- [ ] `solana program deploy ... --url devnet` · program live on devnet at `7u27WmTz…`
- [ ] Genesis Stone Collection NFT minted · pubkey in env · constant in program
- [ ] curl POST `/api/actions/mint/genesis-stone` (with valid signed quiz state) → returns base64 tx
- [ ] Smoke test: paste Blink in operator's Phantom · sign · NFT appears in collectibles **inside the Genesis Stones collection** (not orphan like Sp1)
- [ ] Replay attack: same nonce 2x · second returns 409
- [ ] Expired claim: stale `expires_at` · returns 410

## What NOT to build (Barth · scope discipline)

- **NO UI work**. Pixi quiz canvas · Blink card visuals · animations · ALL sprint-3.
- **NO Twitter integration**. Sprint-4.
- **NO WebSocket realtime**. Post-hackathon.
- **NO Score API integration**. Session 3 (sprint-3).
- **NO `verifyCollectionV1`** · we set `collection: { key, verified: false }` on mint · post-hackathon background job verifies. Phantom still groups unverified collection children, just with a yellow badge instead of green checkmark.
- **NO BLINK_DESCRIPTOR upstream PR** unless time permits (T5 stretch).
- **NO gumi voice** unless gumi has shipped strings (T6 external).

When tempted by "while I'm here, let me also..." · pause · capture as next-session todo · move on.

## Time budget

| step | est | learning |
|---|---|---|
| T9+T10 keypair gen | 1h | low |
| T2 HMAC quiz state | 1.5h | medium |
| T3 ClaimMessage signing | 2h | medium |
| T4 KV nonce store | 1h (after install) | medium |
| T1.5 bootstrap collection | 30m | low (just running Sp1-shaped script) |
| **T1 anchor program (the main event)** | **3-4h** | **HIGH** |
| invariant tests + deploy | 1h | medium |
| smoke test + close | 30m | — |

**Total**: ~10-12 hours. Realistic for one focused session if operator is available all day. Natural stop point: after T1 + invariant tests pass · pick up T7 in agent-driven mode next session.

If shorter session available: prioritize T1 alone (~5h) · TS work (T2/T3/T4) can shift to agent-driven next session since concept is "implement this spec" not "learn new substrate."

## Key references

| Topic | File |
|---|---|
| PRD r6 | grimoires/loa/prd.md |
| SDD r2 | grimoires/loa/sdd.md (§5.1 + §5.2 critical) |
| Sprint plan | grimoires/loa/sprint.md (§Sprint 2) |
| Sp2 anchor base | programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs |
| Sp1 Umi mint | scripts/sp1-mint-metaplex.ts |
| Sp3 sponsored-payer | lib/blink/sponsored-payer.ts |
| ClaimMessage Effect schema | packages/peripheral-events/src/claim-message.ts |
| Metaplex docs | https://developers.metaplex.com/token-metadata |
| Anchor 0.31 docs | https://www.anchor-lang.com |

---

## Operator latitude (per kickoff args)

- "Question the question" · MAY-LATITUDE-3. If something here doesn't fit reality during build, surface it. The plan is a hypothesis · the build is the test.
- "Work on whatever you want in addition" · creative latitude (MAY-LATITUDE-2 · 20%). E.g., if a small refactor in `lib/blink/` would clean up the API integration, do it · group into end-of-session summary.
- "% of stuff you don't even have to report about" · micro-fix threshold (MAY-LATITUDE-1). Cosmetic/config/imports/typos · just fix · disclose later if non-trivial.

The commitment: NO UI work · NO scope creep into sprint-3+4. Everything else is open.
