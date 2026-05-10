// Mock memo transaction builder · S1-T9 spine path
// SDD r2 §9 day-1-spine fallback when Spike 2+3 not yet validated.
//
// Returns a real Solana memo transaction (SPL Memo program · built-in to Solana).
// Wallet can sign + submit · tx confirms on devnet · no anchor program needed.
//
// S2-T1 + S3-T2 swap this out for the real claim_genesis_stone tx (after Spike 2 passes).

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"

// SPL Memo program ID · canonical · same on all clusters.
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
)

const DEVNET_RPC = "https://api.devnet.solana.com"

export interface BuildMockMemoTxParams {
  /** wallet public key from POST body's `account` field · this signs the tx */
  authority: string
  /** memo string to embed (≤566 bytes) · daemon-voiced reveal */
  memo: string
  /** optional · custom RPC endpoint (defaults to public devnet) */
  rpcUrl?: string
}

export interface MockMemoTxResult {
  /** base64-encoded serialized transaction · ready for Action POST response */
  transactionBase64: string
  /** the recent_blockhash baked into the tx (for diagnostics) */
  recentBlockhash: string
}

/**
 * Build a no-op memo transaction · authority signs · no fee_payer co-sign yet.
 *
 * Sprint-1 limitation: no sponsored-payer co-signing (wallet pays gas).
 * Sprint-3 (S3-T2) wires sponsored-payer for gasless mint.
 *
 * The wallet signs as fee_payer AND as the only signer. Memo program is read-only,
 * so this just records "I was here" on-chain at minimal cost (~5000 lamports).
 */
export const buildMockMemoTx = async (
  params: BuildMockMemoTxParams,
): Promise<MockMemoTxResult> => {
  const { authority, memo, rpcUrl = DEVNET_RPC } = params

  const connection = new Connection(rpcUrl, { commitment: "confirmed" })
  const authorityPubkey = new PublicKey(authority)

  // Get a fresh blockhash · valid for ~150 slots (~60-90 seconds)
  const { blockhash } = await connection.getLatestBlockhash("confirmed")

  // Single instruction: memo program · no accounts required · just data
  const memoInstruction = new TransactionInstruction({
    keys: [],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf-8"),
  })

  const tx = new Transaction()
  tx.add(memoInstruction)
  tx.recentBlockhash = blockhash
  tx.feePayer = authorityPubkey // wallet pays · S3-T2 swaps to sponsored-payer

  // Serialize WITHOUT signatures · wallet provides them on submission
  const serialized = tx.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  })

  return {
    transactionBase64: serialized.toString("base64"),
    recentBlockhash: blockhash,
  }
}

/**
 * Compose a daemon-voiced memo string · what gets recorded on-chain.
 *
 * Per SDD r2 §FR-7 voice register · cosmic-weather observer · sora-tower lyric.
 * Memo limit: 566 bytes · we stay well under.
 */
export const composeMintMemo = (params: {
  archetype: string
  weather?: string
}): string => {
  const weatherFragment = params.weather ? ` · weather ${params.weather}` : ""
  // Keep terse · this is on-chain forever (or at least until devnet wipes).
  return `purupuru genesis · the tide read ${params.archetype}${weatherFragment} · S1 spine`
}
