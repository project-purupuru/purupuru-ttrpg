//! Sp2 · ed25519 verification via Solana instructions sysvar
//!
//! Spike pattern for SDD r2 §5.1 (claim_genesis_stone signature verification).
//!
//! ## What this proves
//!
//! Solana programs CANNOT directly call ed25519 verification (no syscall · no compute
//! budget for it). The idiomatic pattern is:
//!
//!   1. Caller builds a transaction with TWO instructions:
//!      a) Ed25519Program instruction (Solana's built-in sig verifier)
//!      b) Our program instruction (reads instructions sysvar · validates prior ix)
//!
//!   2. Solana's runtime executes Ed25519Program FIRST · which would FAIL the entire
//!      tx if the signature is invalid. So if our instruction runs at all · we know
//!      the signature was valid for some (signer, message, signature) tuple.
//!
//!   3. Our program reads the instructions sysvar to extract WHICH signer + WHICH
//!      message the Ed25519Program verified · then validates THOSE match what we
//!      expect (e.g., signer == hardcoded claim-signer · message == passed args).
//!
//! ## Why this matters for the demo
//!
//! `claim_genesis_stone` (S2-T1) requires server-signed authorization. The server
//! holds an ed25519 private key (claim-signer · separate from sponsored-payer). It
//! signs a `ClaimMessage` payload (wallet · element · weather · nonce · expiry).
//!
//! The mint flow:
//!   1. Client POSTs to /mint · server signs ClaimMessage · returns partially-signed tx
//!      (containing Ed25519Program ix + claim_genesis_stone ix)
//!   2. Wallet signs as authority · submits
//!   3. Solana runtime verifies ed25519 sig · then runs claim_genesis_stone
//!   4. claim_genesis_stone reads instructions sysvar · confirms the sig was over the
//!      EXPECTED claim-signer pubkey + EXPECTED ClaimMessage bytes
//!   5. Mint proceeds (or rejects on mismatch)
//!
//! Without instructions sysvar reads · an attacker could submit ANY ed25519 sig from
//! ANY signer over ANY message · and our program wouldn't know.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::ed25519_program::ID as ED25519_PROGRAM_ID;
use anchor_lang::solana_program::sysvar::instructions::{
    load_current_index_checked, load_instruction_at_checked, ID as INSTRUCTIONS_SYSVAR_ID,
};

declare_id!("PupuruAnch0r111111111111111111111111111111");

#[program]
pub mod purupuru_anchor {
    use super::*;

    /// Verify that the prior instruction in this transaction was an Ed25519Program
    /// instruction signing `expected_message` with `expected_signer`'s key.
    ///
    /// Errors:
    ///   - NoPriorInstruction · this is the first ix in the tx
    ///   - PriorIxNotEd25519  · prior ix is not the Ed25519Program
    ///   - InvalidEd25519Data · prior ix data is malformed
    ///   - SignerMismatch     · ed25519 signer != expected_signer
    ///   - MessageMismatch    · ed25519 message != expected_message
    pub fn verify_signed_message(
        ctx: Context<VerifySignedMessage>,
        expected_signer: Pubkey,
        expected_message: Vec<u8>,
    ) -> Result<()> {
        let instructions_sysvar = &ctx.accounts.instructions_sysvar;

        // Step 1: figure out our position in the tx · need a prior ix to inspect.
        let current_index = load_current_index_checked(instructions_sysvar)?;
        require!(current_index > 0, ErrorCode::NoPriorInstruction);

        // Step 2: load the prior instruction (the Ed25519Program verify call).
        let prior_index = current_index - 1;
        let prior_ix = load_instruction_at_checked(prior_index as usize, instructions_sysvar)?;

        // Step 3: confirm it's the Ed25519Program (program ID match).
        require_keys_eq!(
            prior_ix.program_id,
            ED25519_PROGRAM_ID,
            ErrorCode::PriorIxNotEd25519
        );

        // Step 4: parse the Ed25519Program instruction binary layout to extract
        //         (signer_pubkey, message_bytes). Format documented at:
        //         https://docs.solana.com/developing/runtime-facilities/programs#ed25519-program
        let parsed = parse_ed25519_instruction(&prior_ix.data)?;

        // Step 5: signer pubkey must match expected.
        require!(
            parsed.signer_pubkey == expected_signer.to_bytes(),
            ErrorCode::SignerMismatch
        );

        // Step 6: message bytes must match expected.
        require!(
            parsed.message == expected_message.as_slice(),
            ErrorCode::MessageMismatch
        );

        msg!(
            "✅ ed25519 verified · signer matches · message matches · {} bytes",
            parsed.message.len()
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct VerifySignedMessage<'info> {
    /// Authority calling this instruction (typically the user wallet · not the signer).
    pub authority: Signer<'info>,

    /// Solana instructions sysvar · gives us read access to all instructions in this tx.
    /// CHECK: address-validated against canonical sysvar pubkey.
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("No prior instruction in transaction (this must run AFTER an Ed25519Program ix)")]
    NoPriorInstruction,
    #[msg("Prior instruction is not the Ed25519Program")]
    PriorIxNotEd25519,
    #[msg("Ed25519 instruction data is malformed")]
    InvalidEd25519Data,
    #[msg("Signer pubkey does not match expected claim-signer")]
    SignerMismatch,
    #[msg("Message bytes do not match expected payload")]
    MessageMismatch,
}

/// Parsed Ed25519Program instruction data.
struct Ed25519IxData {
    signer_pubkey: [u8; 32],
    message: Vec<u8>,
}

/// Parse the Ed25519Program instruction binary layout.
///
/// Layout (16-byte header + variable data):
///   [0]      : num_signatures (u8) · we require == 1
///   [1]      : padding (u8) · ignored
///   [2..4]   : signature_offset (u16 LE) · byte index where 64-byte sig starts
///   [4..6]   : signature_instruction_index (u16 LE) · 0xFFFF = current ix
///   [6..8]   : public_key_offset (u16 LE) · byte index where 32-byte pubkey starts
///   [8..10]  : public_key_instruction_index (u16 LE)
///   [10..12] : message_data_offset (u16 LE)
///   [12..14] : message_data_size (u16 LE)
///   [14..16] : message_instruction_index (u16 LE)
///   [16+]    : signature || pubkey || message (offsets point into here)
fn parse_ed25519_instruction(data: &[u8]) -> Result<Ed25519IxData> {
    require!(data.len() >= 16, ErrorCode::InvalidEd25519Data);

    let num_sigs = data[0];
    require!(num_sigs == 1, ErrorCode::InvalidEd25519Data);

    let pk_offset = u16::from_le_bytes([data[6], data[7]]) as usize;
    let msg_offset = u16::from_le_bytes([data[10], data[11]]) as usize;
    let msg_size = u16::from_le_bytes([data[12], data[13]]) as usize;

    require!(data.len() >= pk_offset + 32, ErrorCode::InvalidEd25519Data);
    require!(
        data.len() >= msg_offset + msg_size,
        ErrorCode::InvalidEd25519Data
    );

    let mut signer_pubkey = [0u8; 32];
    signer_pubkey.copy_from_slice(&data[pk_offset..pk_offset + 32]);

    let message = data[msg_offset..msg_offset + msg_size].to_vec();

    Ok(Ed25519IxData {
        signer_pubkey,
        message,
    })
}
