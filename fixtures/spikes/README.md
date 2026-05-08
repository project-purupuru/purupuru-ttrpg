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
