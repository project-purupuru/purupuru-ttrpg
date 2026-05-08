// ClaimMessage · server-signed payload for genesis-stone mint
// SDD r2 §3.3 · structured payload + ed25519 via Solana instructions sysvar
//
// Anchor program reads instructions sysvar at index N-1, verifies prior
// instruction is Ed25519Program with claim-signer pubkey + canonical
// ClaimMessage bytes. Anchor decodes message and validates fields.
//
// S1-T2 ships the schema. S2-T3 fills server-side ed25519 signing.
// Nonce store: Vercel KV with NX EX 300 · single-region iad1 · fail-closed.

import { Schema as S } from "effect"

import { Element, SolanaPubkey } from "./world-event"

// Cluster discriminator · prevents cross-cluster signature replay.
export const SolanaCluster = S.Literal(0, 1) // 0=devnet · 1=mainnet
export type SolanaCluster = S.Schema.Type<typeof SolanaCluster>

// 32-byte hex digest (sha256 of canonical quiz state).
export const QuizStateHash = S.String.pipe(S.length(64), S.brand("QuizStateHash"))
export type QuizStateHash = S.Schema.Type<typeof QuizStateHash>

// 16-byte hex nonce · UUID v4 collapsed to hex.
export const ClaimNonce = S.String.pipe(S.length(32), S.brand("ClaimNonce"))
export type ClaimNonce = S.Schema.Type<typeof ClaimNonce>

// Element-as-byte mapping for on-chain ClaimMessage encoding:
//   1=Wood · 2=Fire · 3=Earth · 4=Metal · 5=Water
export const elementToByte = (e: Element): number => {
  switch (e) {
    case "WOOD":
      return 1
    case "FIRE":
      return 2
    case "EARTH":
      return 3
    case "METAL":
      return 4
    case "WATER":
      return 5
  }
}

export const byteToElement = (b: number): Element => {
  switch (b) {
    case 1:
      return "WOOD"
    case 2:
      return "FIRE"
    case 3:
      return "EARTH"
    case 4:
      return "METAL"
    case 5:
      return "WATER"
    default:
      throw new Error(`Invalid element byte: ${b}`)
  }
}

// Canonical signed payload · matches Rust struct in programs/purupuru-anchor.
//
// SECURITY · per flatline r2 SKP-004 + r3 SKP-002:
//   - domain: prevents cross-application signature reuse
//   - version: schema version · forward-compatible
//   - cluster: prevents cross-cluster replay
//   - programId: prevents cross-program replay
//   - wallet: binds claim to specific authority
//   - element + weather: cosmic-weather imprint at mint time
//   - quizStateHash: links claim to validated quiz answers
//   - issuedAt + expiresAt: 5-minute server-side TTL window
//   - nonce: server-tracked · Vercel KV NX EX 300 · prevents replay
export const ClaimMessage = S.Struct({
  domain: S.String, // "purupuru.awareness.genesis-stone"
  version: S.Number.pipe(S.between(0, 255)),
  cluster: SolanaCluster,
  programId: S.String, // base58 pubkey
  wallet: SolanaPubkey,
  element: S.Number.pipe(S.between(1, 5)), // byte form per elementToByte
  weather: S.Number.pipe(S.between(1, 5)),
  quizStateHash: QuizStateHash,
  issuedAt: S.Number, // unix seconds
  expiresAt: S.Number,
  nonce: ClaimNonce,
})
export type ClaimMessage = S.Schema.Type<typeof ClaimMessage>

// Construct a fresh ClaimMessage at mint time · server-side helper.
export const buildClaimMessage = (params: {
  programId: string
  wallet: SolanaPubkey
  element: Element
  weather: Element
  quizStateHash: QuizStateHash
  cluster: SolanaCluster
  ttlSeconds?: number
  nonce: ClaimNonce
}): ClaimMessage => {
  const issuedAt = Math.floor(Date.now() / 1000)
  const ttl = params.ttlSeconds ?? 300
  return {
    domain: "purupuru.awareness.genesis-stone",
    version: 1,
    cluster: params.cluster,
    programId: params.programId,
    wallet: params.wallet,
    element: elementToByte(params.element),
    weather: elementToByte(params.weather),
    quizStateHash: params.quizStateHash,
    issuedAt,
    expiresAt: issuedAt + ttl,
    nonce: params.nonce,
  }
}
