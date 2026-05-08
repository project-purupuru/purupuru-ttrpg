// Sp2 · invariant tests for ed25519-via-instructions-sysvar verification
//
// We test 3 scenarios:
//   ✅ valid sig from expected signer over expected message → success
//   ❌ valid sig from WRONG signer → SignerMismatch error
//   ❌ valid sig but message MISMATCHES expected → MessageMismatch error
//
// Run: anchor test (from programs/purupuru-anchor/ root)

import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Ed25519Program, Keypair, SystemProgram } from "@solana/web3.js"
import nacl from "tweetnacl"
import { expect } from "chai"

import { PurupuruAnchor } from "../target/types/purupuru_anchor"

const SYSVAR_INSTRUCTIONS_PUBKEY = new anchor.web3.PublicKey(
  "Sysvar1nstructions1111111111111111111111111",
)

describe("sp2 · ed25519 verification via instructions sysvar", () => {
  // Anchor's TS test harness · uses the cluster + wallet from Anchor.toml.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.PurupuruAnchor as Program<PurupuruAnchor>

  // Generate a fresh "claim-signer" keypair (the off-chain server's identity).
  // In production this is held in vercel env · for tests we generate fresh.
  const claimSigner = nacl.sign.keyPair()
  const claimSignerPubkey = new anchor.web3.PublicKey(claimSigner.publicKey)

  it("✅ accepts valid sig from expected signer over expected message", async () => {
    const message = Buffer.from("purupuru-genesis-stone-claim-payload-v1")

    // Server-side signs message with claim-signer's secret key.
    const signature = nacl.sign.detached(message, claimSigner.secretKey)

    // Build the Ed25519Program verify instruction.
    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: claimSigner.publicKey, // 32-byte pubkey
      message,
      signature, // 64-byte sig
    })

    // Build our verify_signed_message instruction · expects same (signer, message).
    const verifyIx = await program.methods
      .verifySignedMessage(claimSignerPubkey, message)
      .accounts({
        authority: provider.wallet.publicKey,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction()

    // Bundle · Ed25519Program FIRST · then our verifier.
    const tx = new anchor.web3.Transaction()
    tx.add(ed25519Ix, verifyIx)

    // Send · should succeed.
    const sig = await provider.sendAndConfirm(tx)
    console.log("    success · tx:", sig)
  })

  it("❌ rejects sig from a DIFFERENT signer (SignerMismatch)", async () => {
    const message = Buffer.from("purupuru-genesis-stone-claim-payload-v1")

    // OTHER signer signs · NOT our claim-signer.
    const otherSigner = nacl.sign.keyPair()
    const signature = nacl.sign.detached(message, otherSigner.secretKey)

    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: otherSigner.publicKey,
      message,
      signature,
    })

    // Our verifier still expects the canonical claim-signer.
    const verifyIx = await program.methods
      .verifySignedMessage(claimSignerPubkey, message)
      .accounts({
        authority: provider.wallet.publicKey,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction()

    const tx = new anchor.web3.Transaction()
    tx.add(ed25519Ix, verifyIx)

    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected SignerMismatch error · got success")
    } catch (err: any) {
      // Anchor surfaces error name in logs.
      const errStr = String(err)
      expect(errStr).to.include("SignerMismatch")
    }
  })

  it("❌ rejects sig over a MISMATCHED message (MessageMismatch)", async () => {
    const realMessage = Buffer.from("purupuru-genesis-stone-claim-payload-v1")
    const expectedMessage = Buffer.from("DIFFERENT-EXPECTED-MESSAGE")

    // Sign the real message with the right signer.
    const signature = nacl.sign.detached(realMessage, claimSigner.secretKey)

    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: claimSigner.publicKey,
      message: realMessage, // signed THIS
      signature,
    })

    // But our verifier expects a DIFFERENT message.
    const verifyIx = await program.methods
      .verifySignedMessage(claimSignerPubkey, expectedMessage) // expects this · mismatch
      .accounts({
        authority: provider.wallet.publicKey,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction()

    const tx = new anchor.web3.Transaction()
    tx.add(ed25519Ix, verifyIx)

    try {
      await provider.sendAndConfirm(tx)
      expect.fail("expected MessageMismatch error · got success")
    } catch (err: any) {
      const errStr = String(err)
      expect(errStr).to.include("MessageMismatch")
    }
  })
})
