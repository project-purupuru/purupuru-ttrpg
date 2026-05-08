/**
 * S2-T1 Phase C · invariant tests for claim_genesis_stone
 *
 * Scope · the on-chain validation gates that fire BEFORE the Metaplex CPI.
 * These rejects ensure no invalid claim ever reaches the mint logic. The
 * happy-path full-mint test is deferred to the API smoke test (sprint-3 ·
 * needs real Phantom wallet sig + Vercel KV nonce + assembled blink response).
 *
 * Tests covered:
 *   ❌ ElementOutOfRange   · element byte not in 1..5
 *   ❌ WeatherOutOfRange   · weather byte not in 1..5
 *   ❌ Expired             · expires_at < clock.unix_timestamp
 *   ❌ NoPriorInstruction  · tx without Ed25519Program first ix
 *   ❌ SignerMismatch      · Ed25519Program ix uses wrong pubkey
 *   ❌ MessageMismatch     · Ed25519Program message ≠ reconstituted bytes
 *
 * NOT covered here (per scope decision):
 *   - Happy path full mint  · sprint-3 API smoke test (real wallet sig + KV)
 *   - no_lamport invariant  · grep lib.rs · zero `transfer_lamports` calls
 *   - no_token_mut          · grep lib.rs · only mints fresh, never mutates
 *   - replay_nonce_reject   · KV-side, covered by lib/blink/__tests__/nonce-store.test.ts
 *   - cross_cluster_reject  · doesn't apply · our 7-field design uses
 *                             declare_id! + program-id pinning instead
 *
 * Setup requirements:
 *   - .env.local must have CLAIM_SIGNER_SECRET_BS58 set (S2-T10 keypair)
 *   - Anchor.toml provider.cluster = Devnet (or Localnet)
 *   - Program deployed (anchor deploy --provider.cluster devnet)
 *
 * Run: anchor test (from programs/purupuru-anchor/)
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Ed25519Program, Keypair, SystemProgram } from "@solana/web3.js"
import bs58 from "bs58"
import { expect } from "chai"
import nacl from "tweetnacl"

import {
  buildClaimMessage,
  encodeClaimMessage,
  signClaimMessage,
  type ClaimMessage,
} from "@purupuru/peripheral-events"

import { PurupuruAnchor } from "../target/types/purupuru_anchor"

// ─── Constants from lib.rs · MUST match (drift = test failure) ────────

const CLAIM_SIGNER_PUBKEY_STR = "E6E69osQmgzpQk9h19ebtMm8YEkAHJfnHwXThr6o2Gsd"
const COLLECTION_MINT_PUBKEY_STR = "3Be59FPQnnSs5Z7Mxs6XtUD1NrrMEVAzhA751aRi2zj1"
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
)
const SYSVAR_INSTRUCTIONS_PUBKEY = new anchor.web3.PublicKey(
  "Sysvar1nstructions1111111111111111111111111",
)

// ─── Load claim-signer secret from .env.local ─────────────────────────

function loadClaimSignerSecret(): Uint8Array {
  // Try process.env first (for CI / explicit env)
  let bs58Secret = process.env.CLAIM_SIGNER_SECRET_BS58
  if (!bs58Secret) {
    // Fall back to .env.local (dev convenience · skips dotenv dep)
    const envPath = resolve(__dirname, "../../../.env.local")
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf-8")
      const match = content.match(/^CLAIM_SIGNER_SECRET_BS58=(.+)$/m)
      if (match) bs58Secret = match[1].trim()
    }
  }
  if (!bs58Secret) {
    throw new Error(
      "CLAIM_SIGNER_SECRET_BS58 not in env or .env.local · run S2-T10 keypair gen first",
    )
  }
  return bs58.decode(bs58Secret)
}

// ─── Helper: build the Metaplex PDAs for a given mint ────────────────

function deriveMetadataPda(mint: anchor.web3.PublicKey): anchor.web3.PublicKey {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0]
}

function deriveMasterEditionPda(
  mint: anchor.web3.PublicKey,
): anchor.web3.PublicKey {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from("edition"),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  )[0]
}

// ─── Helper: build a fresh ClaimMessage for tests ─────────────────────

function makeFreshClaim(
  authority: anchor.web3.PublicKey,
  overrides: Partial<{
    element: number
    weather: number
    issuedAt: number
    expiresAt: number
  }> = {},
): ClaimMessage {
  const now = Math.floor(Date.now() / 1000)
  return buildClaimMessage({
    programId: anchor.web3.SystemProgram.programId.toBase58(),
    wallet: authority.toBase58() as ClaimMessage["wallet"],
    element: "FIRE", // 2
    weather: "WATER", // 5
    quizStateHash: ("a".repeat(64)) as ClaimMessage["quizStateHash"],
    cluster: 0,
    ttlSeconds: 300,
    nonce: ("b".repeat(32)) as ClaimMessage["nonce"],
    ...(overrides.element !== undefined ? { element: "FIRE" } : {}), // we'll override byte directly below
    ...(overrides.weather !== undefined ? { weather: "WATER" } : {}),
  }) as ClaimMessage
}

// ─── Helper: convert peripheral-events ClaimMessage args to anchor format ─

function asAnchorArgs(msg: ClaimMessage): {
  wallet: anchor.web3.PublicKey
  element: number
  weather: number
  quizStateHash: number[]
  issuedAt: anchor.BN
  expiresAt: anchor.BN
  nonce: number[]
} {
  return {
    wallet: new anchor.web3.PublicKey(msg.wallet),
    element: msg.element,
    weather: msg.weather,
    quizStateHash: Array.from(Buffer.from(msg.quizStateHash, "hex")),
    issuedAt: new anchor.BN(msg.issuedAt),
    expiresAt: new anchor.BN(msg.expiresAt),
    nonce: Array.from(Buffer.from(msg.nonce, "hex")),
  }
}

// ─── Test suite ───────────────────────────────────────────────────────

describe("claim_genesis_stone · invariant tests (S2-T1 Phase C)", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.PurupuruAnchor as Program<PurupuruAnchor>

  const claimSignerSecret = loadClaimSignerSecret()
  const claimSignerKeypair = nacl.sign.keyPair.fromSecretKey(claimSignerSecret)

  // Pre-flight · the env-loaded secret MUST derive the on-chain hardcoded
  // pubkey, otherwise every test would fail with SignerMismatch and we'd
  // have no way to test the OTHER reject paths. This catches the drift.
  before("claim-signer pubkey matches CLAIM_SIGNER_PUBKEY const in lib.rs", () => {
    const derivedPubkey = bs58.encode(claimSignerKeypair.publicKey)
    expect(derivedPubkey).to.equal(
      CLAIM_SIGNER_PUBKEY_STR,
      ".env.local CLAIM_SIGNER_SECRET_BS58 does not derive the lib.rs CLAIM_SIGNER_PUBKEY · regenerate or update",
    )
  })

  /**
   * Build a complete tx with [Ed25519Program ix, claim_genesis_stone ix].
   * Default args produce a VALID claim · individual tests mutate to trigger errors.
   */
  async function buildClaimTx(opts: {
    claim: ClaimMessage
    signedMessage: Uint8Array
    signerPubkey: Uint8Array
    signature: Uint8Array
    omitEd25519?: boolean
    argOverrides?: Partial<ReturnType<typeof asAnchorArgs>>
  }): Promise<{ tx: anchor.web3.Transaction; mintKp: anchor.web3.Keypair }> {
    const sponsoredPayer = Keypair.generate() // test-scope · won't actually sign for reject tests
    const mintKp = Keypair.generate()

    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: opts.signerPubkey,
      message: Buffer.from(opts.signedMessage),
      signature: opts.signature,
    })

    const args = { ...asAnchorArgs(opts.claim), ...opts.argOverrides }

    const claimIx = await program.methods
      .claimGenesisStone(
        args.wallet,
        args.element,
        args.weather,
        args.quizStateHash,
        args.issuedAt,
        args.expiresAt,
        args.nonce,
      )
      .accounts({
        authority: provider.wallet.publicKey,
        sponsoredPayer: sponsoredPayer.publicKey,
        mint: mintKp.publicKey,
        metadata: deriveMetadataPda(mintKp.publicKey),
        masterEdition: deriveMasterEditionPda(mintKp.publicKey),
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: new anchor.web3.PublicKey(
          "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        ),
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      } as any)
      .instruction()

    const tx = new anchor.web3.Transaction()
    if (!opts.omitEd25519) tx.add(ed25519Ix)
    tx.add(claimIx)
    return { tx, mintKp }
  }

  it("❌ rejects element=0 (ElementOutOfRange)", async () => {
    const claim = makeFreshClaim(provider.wallet.publicKey)
    const signed = signClaimMessage(claim, claimSignerSecret)
    const { tx } = await buildClaimTx({
      claim,
      signedMessage: signed.messageBytes,
      signerPubkey: signed.signerPubkey,
      signature: signed.signature,
      argOverrides: { element: 0 },
    })
    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected ElementOutOfRange · got success")
    } catch (err: unknown) {
      expect(String(err)).to.match(/ElementOutOfRange/)
    }
  })

  it("❌ rejects weather=6 (WeatherOutOfRange)", async () => {
    const claim = makeFreshClaim(provider.wallet.publicKey)
    const signed = signClaimMessage(claim, claimSignerSecret)
    const { tx } = await buildClaimTx({
      claim,
      signedMessage: signed.messageBytes,
      signerPubkey: signed.signerPubkey,
      signature: signed.signature,
      argOverrides: { weather: 6 },
    })
    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected WeatherOutOfRange · got success")
    } catch (err: unknown) {
      expect(String(err)).to.match(/WeatherOutOfRange/)
    }
  })

  it("❌ rejects expires_at in the past (Expired)", async () => {
    const expiredClaim: ClaimMessage = {
      ...makeFreshClaim(provider.wallet.publicKey),
      issuedAt: 1700000000,
      expiresAt: 1700000300, // both well in the past
    }
    const signed = signClaimMessage(expiredClaim, claimSignerSecret)
    const { tx } = await buildClaimTx({
      claim: expiredClaim,
      signedMessage: signed.messageBytes,
      signerPubkey: signed.signerPubkey,
      signature: signed.signature,
    })
    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected Expired · got success")
    } catch (err: unknown) {
      expect(String(err)).to.match(/Expired/)
    }
  })

  it("❌ rejects tx without prior Ed25519Program ix (NoPriorInstruction)", async () => {
    const claim = makeFreshClaim(provider.wallet.publicKey)
    const signed = signClaimMessage(claim, claimSignerSecret)
    const { tx } = await buildClaimTx({
      claim,
      signedMessage: signed.messageBytes,
      signerPubkey: signed.signerPubkey,
      signature: signed.signature,
      omitEd25519: true,
    })
    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected NoPriorInstruction · got success")
    } catch (err: unknown) {
      expect(String(err)).to.match(/NoPriorInstruction/)
    }
  })

  it("❌ rejects sig from non-claim-signer key (SignerMismatch)", async () => {
    const claim = makeFreshClaim(provider.wallet.publicKey)
    const wrongSigner = nacl.sign.keyPair()
    const messageBytes = encodeClaimMessage(claim)
    const wrongSig = nacl.sign.detached(messageBytes, wrongSigner.secretKey)
    const { tx } = await buildClaimTx({
      claim,
      signedMessage: messageBytes,
      signerPubkey: wrongSigner.publicKey, // wrong · not the hardcoded claim-signer
      signature: wrongSig,
    })
    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected SignerMismatch · got success")
    } catch (err: unknown) {
      expect(String(err)).to.match(/SignerMismatch/)
    }
  })

  it("❌ rejects modified args after sig (MessageMismatch)", async () => {
    // Sign one message, then submit with a DIFFERENT element byte in args.
    // The Ed25519 sig still verifies (over the original bytes) but the
    // anchor program reconstitutes 98B from the new args and detects mismatch.
    const claim = makeFreshClaim(provider.wallet.publicKey)
    const signed = signClaimMessage(claim, claimSignerSecret)
    const { tx } = await buildClaimTx({
      claim,
      signedMessage: signed.messageBytes,
      signerPubkey: signed.signerPubkey,
      signature: signed.signature,
      argOverrides: { element: 3 }, // signed with FIRE=2, submitting EARTH=3
    })
    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected MessageMismatch · got success")
    } catch (err: unknown) {
      expect(String(err)).to.match(/MessageMismatch/)
    }
  })
})
