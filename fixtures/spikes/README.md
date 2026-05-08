# Sprint-1 Spikes · Day-1 De-Risking

This directory holds throw-away-allowed spike artifacts. **Spikes are bounded technical investigations that produce KNOWLEDGE, not features.** Per Kent Beck's XP playbook + flatline r3 PRAISE-1.

## The 3 spikes

| spike | question | success | failure path |
|---|---|---|---|
| **Sp1** | Does Phantom render a Metaplex NFT on devnet? | NFT visible in collectibles tab w/ image | revert FR-3 to PDA-only · deck "mint" → "claim record" |
| **Sp2** | Can Anchor verify ed25519 sig from prior instruction sysvar? | invariant tests pass · signer mismatch rejected | drop claim_genesis_stone · ship witness-only memo |
| **Sp3** | Does backend partial-sign + Phantom-sign-and-submit work? | tx confirms · wallet balance unchanged | drop sponsored-payer · users pay gas |

## Sp1 · how to run

```bash
# 1. Make sure you have solana CLI installed
solana --version  # if missing: sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# 2. Set cluster to devnet
solana config set --url https://api.devnet.solana.com

# 3. Make sure your default keypair has SOL (for tx fees · ~0.01 SOL needed)
solana balance  # if low: solana airdrop 1

# 4. Run the mint script · pass your Phantom DEVNET pubkey as recipient
pnpm exec tsx scripts/sp1-mint-metaplex.ts <YOUR_PHANTOM_DEVNET_PUBKEY>

# 5. Check Phantom (set Phantom to devnet mode in settings) · collectibles tab should show the NFT
```

**Where to find your Phantom devnet pubkey:**
- Phantom settings → Developer Settings → Testnet Mode · enable
- Switch to "Devnet" in the network selector (top of Phantom)
- Click your wallet address at top → copies pubkey

## Sp2 · how to run

Anchor program at `programs/purupuru-anchor/` · scaffolded with full README.

```bash
cd programs/purupuru-anchor
yarn install         # or pnpm install
anchor build         # first build · auto-generates program keypair
solana address -k target/deploy/purupuru_anchor-keypair.json
# paste that pubkey into BOTH:
#   - Anchor.toml [programs.devnet] purupuru_anchor = "..."
#   - Anchor.toml [programs.localnet] purupuru_anchor = "..."
#   - programs/purupuru-anchor/src/lib.rs declare_id!("...")
anchor build         # rebuild with synced ID
anchor test --skip-local-validator   # against devnet · 3 invariant tests
```

Pre-flight (one-time): `cargo install --git https://github.com/coral-xyz/anchor avm --force && avm install 0.30.1 && avm use 0.30.1`. See `programs/purupuru-anchor/README.md` for full setup.

3 tests cover: ✅ valid sig accepts · ❌ wrong signer rejected (SignerMismatch) · ❌ wrong message rejected (MessageMismatch).

## Sp3 · how to run

Pure-TS spike · no Solana program deploy needed. Uses SPL Memo program as the no-op target to exercise the partial-sign pattern with minimal complexity.

```bash
# 1. From repo root (already on devnet from Sp1)
pnpm exec tsx scripts/sp3-partial-sign-flow.ts
```

The script:
1. Generates fresh sponsored-payer + user wallet keypairs (in-memory)
2. Airdrops 0.5 SOL to sponsored-payer ONLY (NOT user wallet)
3. Backend builds tx · feePayer = sponsored-payer · memo ix authority = user wallet
4. Backend partial-signs · serializes to base64
5. "Wallet" (simulated · `userWallet.partialSign()`) deserializes + adds its sig
6. Submits fully-signed tx · expects confirm
7. Validates user wallet balance is still 0 SOL (proves sponsored-payer paid fees)

## Outcomes

After running each spike, document the result here:

```
Sp1 · 2026-05-XX · ✅ PASS · NFT renders in Phantom · mint sig: <sig>
Sp2 · 2026-05-XX · ✅ PASS · invariant tests pass · program ID: <pid>
Sp3 · 2026-05-XX · ✅ PASS · gasless mint confirmed · operator wallet balance unchanged
```

Or document FAIL + fallback path if applicable.

## Why this matters

Per SDD r2 §9 + sprint.md cut triggers · these 3 spikes GATE the rest of sprint-1+2. If Sp1 fails, we revert to PDA-only TODAY before sprint-2 sinks 4 hours into a `claim_genesis_stone` instruction that won't show up in user wallets. Front-loading the discovery saves the 4-day clock.

## Handoff to zerker

**Sp1 mint script** doubles as the reference implementation for zerker's indexer (S3-T9 · post-anchor-deploy). The indexer subscribes to `StoneClaimed` events on the real anchor program (S2-T1) and feeds Score · the structure of *what gets emitted* mirrors the structure of *what gets minted* here.

**Sp2 program (`programs/purupuru-anchor/`)** is the security-spine pattern that S2-T1's `claim_genesis_stone` will extend. The `verify_signed_message` instruction shows the canonical ed25519-via-instructions-sysvar pattern · S2-T1 wraps this with Metaplex `create_nft` CPI + nonce check + replay guard.

**Sp3 helpers (`lib/blink/sponsored-payer.ts`)** are production-ready · `/api/actions/mint/genesis-stone` route (S2-T2) imports `loadSponsoredPayer()` + `buildPartialSignedTx()` directly. The spike script in `scripts/` is throw-away · the lib is keep.
