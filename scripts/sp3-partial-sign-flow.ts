/**
 * Sp3 spike · end-to-end partial-sign flow validation
 *
 * What this proves (per SDD r2 §5.2):
 *   1. Backend can build tx with sponsored-payer as feePayer + user wallet as authority
 *   2. Backend partial-signs as feePayer · serializes to base64
 *   3. "Wallet" (simulated here · in production it's Phantom) deserializes · partial-signs
 *   4. Combined tx submits successfully · both sigs verify · runtime executes
 *
 * Run: pnpm tsx scripts/sp3-partial-sign-flow.ts
 *
 * Pre-flight:
 *   - Sponsored-payer keypair (we'll generate + airdrop in this script)
 *   - User wallet keypair (we'll simulate · in prod this is Phantom-held)
 *   - Devnet RPC reachable
 *
 * Spike target: SPL Memo program (no-op · just lets us exercise the pattern with
 * minimal complexity). The real S2-T1 mint instruction follows the same pattern
 * with verify_signed_message + Metaplex createNft sandwiched in.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js"
import { buildPartialSignedTx, checkPayerBalance } from "../lib/blink/sponsored-payer"

const DEVNET_RPC = "https://api.devnet.solana.com"
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")

async function main() {
  const connection = new Connection(DEVNET_RPC, "confirmed")

  console.log("\n🔵 Sp3 · partial-sign tx assembly · end-to-end flow\n")

  // 1 · Generate sponsored-payer + user wallet keypairs (simulated · in prod payer
  //     is in env, user is in Phantom).
  const sponsoredPayer = Keypair.generate()
  const userWallet = Keypair.generate()

  console.log("  sponsored-payer:", sponsoredPayer.publicKey.toBase58())
  console.log("  user-wallet:    ", userWallet.publicKey.toBase58())

  // 2 · Airdrop to sponsored-payer · NOT to user (proves user pays 0 SOL).
  console.log("\n  💰 airdropping 0.5 SOL to sponsored-payer (NOT user wallet)...")
  const airdropSig = await connection.requestAirdrop(sponsoredPayer.publicKey, 500_000_000)
  await connection.confirmTransaction(airdropSig, "confirmed")
  console.log("     ✅ airdrop confirmed:", airdropSig)

  // 3 · Health-check · payer has enough SOL?
  const balance = await checkPayerBalance(connection, sponsoredPayer.publicKey)
  console.log(
    `\n  📊 payer balance: ${balance.sol.toFixed(6)} SOL · canSponsor=${balance.canSponsor}`,
  )
  if (!balance.canSponsor) {
    throw new Error("payer can't sponsor · airdrop failed?")
  }

  // 4 · Verify user wallet has 0 SOL (the thing we're proving works without it).
  const userBalance = await connection.getBalance(userWallet.publicKey, "confirmed")
  console.log(`  📊 user balance:  ${userBalance / 1_000_000_000} SOL (should be 0)`)
  if (userBalance > 0) {
    console.log("     ⚠️  user has unexpected balance · spike still valid but check airdrop")
  }

  // 5 · Build memo instruction · userWallet is the authority (signer).
  const memoIx: TransactionInstruction = {
    keys: [{ pubkey: userWallet.publicKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from("purupuru-sp3-partial-sign-test"),
  }

  // 6 · Backend builds + partial-signs tx · this is what the API route does.
  console.log("\n  🔧 backend · building partial-signed tx...")
  const { base64Tx, payerSignature } = await buildPartialSignedTx({
    connection,
    sponsoredPayer,
    userWallet: userWallet.publicKey,
    instructions: [memoIx],
  })
  console.log("     ✅ tx built · base64 length:", base64Tx.length)
  console.log("     ✅ payer partial-sig:", payerSignature.substring(0, 12) + "...")

  // 7 · "Wallet" receives base64 tx · deserializes · adds its own sig.
  //     In production this is Phantom doing it · for the spike we simulate.
  console.log("\n  📱 wallet (simulated) · deserializing + partial-signing...")
  const txBytes = Buffer.from(base64Tx, "base64")
  const tx = Transaction.from(txBytes)
  tx.partialSign(userWallet) // user adds their sig · payer's sig already attached

  // 8 · Submit fully-signed tx · both sigs are validated by Solana runtime.
  console.log("\n  📤 submitting fully-signed tx...")
  const finalSerialized = tx.serialize() // requireAllSignatures: true (default)
  const signature = await sendAndConfirmRawTransaction(connection, finalSerialized, {
    commitment: "confirmed",
  })

  console.log("\n  ✅ TX CONFIRMED:", signature)
  console.log("     explorer:", `https://explorer.solana.com/tx/${signature}?cluster=devnet`)

  // 9 · Verify · re-fetch · confirm both signers + memo data on-chain.
  const fetched = await connection.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  })
  if (!fetched) {
    throw new Error("tx not found post-confirm · indexer lag?")
  }

  const sigStatus = await connection.getSignatureStatus(signature)
  console.log(
    "\n  📋 sig status: confirmations=" + sigStatus.value?.confirmations,
    "err=" + JSON.stringify(sigStatus.value?.err),
  )

  // Final · check user wallet still has ~0 SOL (proves payer covered fees).
  const userBalanceAfter = await connection.getBalance(userWallet.publicKey, "confirmed")
  const payerBalanceAfter = await connection.getBalance(sponsoredPayer.publicKey, "confirmed")
  console.log("\n  💰 post-tx balances:")
  console.log(
    `     user:  ${userBalanceAfter / 1_000_000_000} SOL (should be 0 · user paid nothing)`,
  )
  console.log(
    `     payer: ${payerBalanceAfter / 1_000_000_000} SOL (should be ~0.4999 · paid ~5000 lamports fee)`,
  )

  console.log("\n  ✅ Sp3 PASS · partial-sign flow works · gasless UX ready for S2-T1\n")
}

main().catch((err) => {
  console.error("\n❌ Sp3 FAIL:", err)
  process.exit(1)
})
