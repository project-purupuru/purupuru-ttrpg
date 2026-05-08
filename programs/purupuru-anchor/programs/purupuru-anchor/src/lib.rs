//! purupuru_anchor · awareness-layer-spine v0
//!
//! Sprint-2 program · two purposes wired through one instruction:
//!
//!   `claim_genesis_stone` · server-signed mint of an element-weather-imprint NFT.
//!
//! Pattern stack (proven incrementally · spike → sprint):
//!
//!   * Sp2 (Phase A)  · ed25519 verification via instructions sysvar · ✅ proved
//!   * S2-T1 Phase A  · extends to ClaimMessage args · 98B reconstitution · expiry guard
//!   * S2-T1 Phase B  · Metaplex CPI to mint the NFT into Genesis Stones collection
//!
//! ## End-to-end flow that lands here
//!
//!   1. User completes 5-question bazi quiz (off-chain · packages/peripheral-events)
//!   2. API at /api/actions/mint/genesis-stone (sprint-3) builds a tx with TWO ix:
//!        a) Ed25519Program  · verifies claim-signer's sig over the 98-byte canonical
//!        b) claim_genesis_stone · this instruction · validates + mints
//!   3. Sponsored-payer partial-signs (covers fees) · returns tx via Action POST
//!   4. Wallet adds its sig as authority · submits
//!   5. Solana runtime verifies BOTH sigs · then runs claim_genesis_stone
//!   6. We read instructions sysvar · confirm ed25519 sig was over OUR canonical bytes
//!      with OUR claim-signer · then mint via Metaplex CPI (Phase B)
//!
//! ## Three-keypair model (per SDD r2 §6.1)
//!
//!   sponsored-payer  · pays tx fees · separate Solana keypair · NO authority over mint
//!   claim-signer     · ed25519 keypair signing ClaimMessage · pubkey hardcoded BELOW
//!   user wallet      · the actual mint authority · receives the NFT
//!
//! Drift between off-chain `encodeClaimMessage` (packages/peripheral-events) and
//! the on-chain reconstitution below = silent forgery vulnerability. The 98-byte
//! layout in `reconstitute_claim_message` MUST exactly mirror the layout doc in
//! packages/peripheral-events/src/claim-message.ts.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::ed25519_program::ID as ED25519_PROGRAM_ID;
use anchor_lang::solana_program::sysvar::instructions::{
    load_current_index_checked, load_instruction_at_checked, ID as INSTRUCTIONS_SYSVAR_ID,
};

declare_id!("7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38");

// ─────────────────────────────────────────────────────────────────────────
// Hardcoded constants · domain separation enforcement
// ─────────────────────────────────────────────────────────────────────────

/// Ed25519 public key of the claim-signer · hardcoded so attackers cannot
/// substitute their own signer in the prior Ed25519Program ix.
///
/// Generated S2-T10 of sprint-2 · 2026-05-08 · NEVER reused for anything
/// other than this program. If leaked, mint endpoint goes down for rotation.
const CLAIM_SIGNER_PUBKEY: Pubkey = pubkey!("E6E69osQmgzpQk9h19ebtMm8YEkAHJfnHwXThr6o2Gsd");

/// Genesis Stones Collection NFT mint pubkey · references this in CreateV1
/// CPI's collection field so child stones group under the parent in Phantom's
/// collectibles tab.
///
/// **TBD until S2-T1.5 bootstrap-collection.ts runs · UPDATE BEFORE DEPLOY.**
/// Compiles with the System Program sentinel for now · Phase B replaces this
/// constant + adds the Metaplex CPI that uses it.
const COLLECTION_MINT_PUBKEY: Pubkey = pubkey!("11111111111111111111111111111111");

// ─────────────────────────────────────────────────────────────────────────
// Program
// ─────────────────────────────────────────────────────────────────────────

#[program]
pub mod purupuru_anchor {
    use super::*;

    /// Server-signed mint of a Genesis Stone · the awareness-layer demo's
    /// only mutating instruction.
    ///
    /// The 7 args projected from off-chain `ClaimMessage`:
    ///   - `wallet`: the user's pubkey · also the mint recipient
    ///   - `element`: bazi-derived element byte (1=Wood..5=Water · per byteOf rules)
    ///   - `weather`: cosmic weather byte at mint time
    ///   - `quiz_state_hash`: sha256 of the validated 5-answer quiz state
    ///   - `issued_at`: unix seconds · when claim-signer signed
    ///   - `expires_at`: unix seconds · 5min after issued (server-side TTL)
    ///   - `nonce`: 16-byte nonce · server-side replay protection (Vercel KV)
    ///
    /// The full 11-field off-chain ClaimMessage struct also contains
    /// {domain, version, cluster, programId} · those are NOT in the signed
    /// bytes. Domain separation is enforced via:
    ///   - `declare_id!()` pins the program (cluster + programId implicit)
    ///   - hardcoded `CLAIM_SIGNER_PUBKEY` pins the signer
    ///   - dedicated single-purpose claim-signer key (domain implicit)
    ///
    /// If the claim-signer key is ever shared across programs/clusters,
    /// upgrade the canonical bytes to include those fields BEFORE doing so.
    pub fn claim_genesis_stone(
        ctx: Context<ClaimGenesisStone>,
        wallet: Pubkey,
        element: u8,
        weather: u8,
        quiz_state_hash: [u8; 32],
        issued_at: i64,
        expires_at: i64,
        nonce: [u8; 16],
    ) -> Result<()> {
        // ─── Phase A · validation ───────────────────────────────────────

        // Args sanity (domain checks happen in the off-chain Effect Schema
        // too · belt-and-suspenders here).
        require!((1..=5).contains(&element), ErrorCode::ElementOutOfRange);
        require!((1..=5).contains(&weather), ErrorCode::WeatherOutOfRange);
        require!(
            issued_at <= expires_at,
            ErrorCode::IssuedAfterExpiry
        );

        // Expiry guard · server-side TTL window must not have lapsed.
        // SDD §3.3: expires_at = issued_at + 300. We check on-chain too because
        // the off-chain KV nonce ttl alone is insufficient if server clock drifts
        // or if the tx sits in mempool past the window (rare but possible).
        let now = Clock::get()?.unix_timestamp;
        require!(now <= expires_at, ErrorCode::Expired);

        // Verify ed25519 signature from prior instruction (Sp2 pattern reused).
        let canonical = reconstitute_claim_message(
            &wallet,
            element,
            weather,
            &quiz_state_hash,
            issued_at,
            expires_at,
            &nonce,
        );
        verify_prior_ed25519(
            &ctx.accounts.instructions_sysvar,
            CLAIM_SIGNER_PUBKEY,
            &canonical,
        )?;

        // Logging · helpful for devnet smoke + demo · stripped before mainnet.
        msg!(
            "✅ claim_genesis_stone validated · wallet={} element={} weather={} expires_in={}s",
            wallet,
            element,
            weather,
            expires_at - now,
        );

        // ─── Phase B · Metaplex CPI mint ────────────────────────────────
        //
        // TODO(S2-T1 Phase B · pair-tight): CreateV1CpiBuilder mints NFT with
        //   - mint = ctx.accounts.mint (fresh keypair from API)
        //   - metadata + master_edition = derived PDAs
        //   - update_authority = sponsored-payer (or the program · TBD)
        //   - token_owner = wallet (the user)
        //   - collection = Some({ key: COLLECTION_MINT_PUBKEY, verified: false })
        //   - token_standard = NonFungible
        //   - print_supply = Zero
        //
        //   Sub-decisions to pair on:
        //     1. NonFungible vs ProgrammableNonFungible (royalty enforcement)
        //     2. Anchor-spl 0.31.1 vs direct mpl-token-metadata 5.x
        //     3. Should sponsored-payer or claim-signer hold update authority?
        //     4. Idempotent re-claim (PDA seed [b"stone", wallet]) — currently
        //        nonce + KV blocks replay; do we ALSO want PDA-level uniqueness?

        // ─── Phase C · indexer event ────────────────────────────────────
        //
        // TODO(S2-T1 Phase C): emit!(StoneClaimed {
        //     wallet, element, weather, mint: ctx.accounts.mint.key()
        // });

        Ok(())
    }
}

// ─────────────────────────────────────────────────────────────────────────
// Accounts struct
// ─────────────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct ClaimGenesisStone<'info> {
    /// Authority calling this instruction · the user wallet · also the mint
    /// recipient. NOT the sponsored-payer (sponsored-payer pays tx fees but
    /// has no mint authority).
    pub authority: Signer<'info>,

    /// Solana instructions sysvar · gives us read access to the prior
    /// Ed25519Program ix data via load_instruction_at_checked.
    /// CHECK: address-validated against canonical sysvar pubkey.
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: AccountInfo<'info>,

    // TODO(Phase B): expand with Metaplex accounts:
    //   - mint: Account<Mint> · fresh keypair · init via SPL
    //   - metadata: PDA at [b"metadata", token_metadata_program, mint]
    //   - master_edition: PDA at [b"metadata", token_metadata_program, mint, b"edition"]
    //   - mint_authority + update_authority + payer
    //   - collection_metadata: PDA for Genesis Stones collection
    //   - token_metadata_program · spl_token_program · system_program · rent
    //
    // Anchor's `#[account(init, payer = ..., mint::decimals = 0, mint::authority = ...)]`
    // can scaffold the mint init · the Metaplex CPI then layers metadata on top.
}

// ─────────────────────────────────────────────────────────────────────────
// Events · for indexer (S3-T9 zerker handoff)
// ─────────────────────────────────────────────────────────────────────────

/// Emitted on successful Genesis Stone claim · indexer subscribes via
/// program logs to update the awareness-layer feed.
///
/// NOT emitted in Phase A (no mint yet · `mint` field not available).
/// Phase B + C add the emit! call.
#[event]
pub struct StoneClaimed {
    pub wallet: Pubkey,
    pub element: u8,
    pub weather: u8,
    pub mint: Pubkey,
}

// ─────────────────────────────────────────────────────────────────────────
// Error codes · specific reject messages for debug-grepping
// ─────────────────────────────────────────────────────────────────────────

#[error_code]
pub enum ErrorCode {
    // Sp2 · ed25519 verification (preserved verbatim)
    #[msg("No prior instruction in transaction (this must run AFTER an Ed25519Program ix)")]
    NoPriorInstruction,
    #[msg("Prior instruction is not the Ed25519Program")]
    PriorIxNotEd25519,
    #[msg("Ed25519 instruction data is malformed")]
    InvalidEd25519Data,
    #[msg("Signer pubkey does not match the hardcoded claim-signer")]
    SignerMismatch,
    #[msg("Message bytes do not match the reconstituted canonical layout")]
    MessageMismatch,

    // S2-T1 Phase A · ClaimMessage validation
    #[msg("Element byte must be in 1..5 (1=Wood, 2=Fire, 3=Earth, 4=Metal, 5=Water)")]
    ElementOutOfRange,
    #[msg("Weather byte must be in 1..5 (same element scale)")]
    WeatherOutOfRange,
    #[msg("issued_at is after expires_at (clock or producer bug)")]
    IssuedAfterExpiry,
    #[msg("Claim has expired (now > expires_at · 5min server-side TTL window)")]
    Expired,
}

// ─────────────────────────────────────────────────────────────────────────
// Internals · ed25519 verification (reused from Sp2 verbatim where possible)
// ─────────────────────────────────────────────────────────────────────────

/// Reconstitute the 98-byte canonical signed bytes from claim_genesis_stone args.
///
/// MUST EXACTLY MATCH the off-chain encoder in:
///   packages/peripheral-events/src/claim-message.ts · `encodeClaimMessage`
///
/// Layout (98 bytes total):
///
///   offset  size  field
///   ------  ----  -------------------------------------------------
///   [ 0..32] 32B  wallet pubkey (raw 32B from Solana Pubkey::to_bytes)
///   [32..33]  1B  element byte (1=Wood..5=Water)
///   [33..34]  1B  weather byte (1..5)
///   [34..66] 32B  quiz_state_hash (raw 32B sha256 digest)
///   [66..74]  8B  issued_at (i64 little-endian)
///   [74..82]  8B  expires_at (i64 little-endian)
///   [82..98] 16B  nonce (raw 16B)
///
/// Drift here = silent forgery vulnerability. If you change this layout,
/// update encodeClaimMessage in lockstep AND bump CANONICAL_VERSION on
/// both sides (forces clean upgrade · old sigs become unverifiable).
fn reconstitute_claim_message(
    wallet: &Pubkey,
    element: u8,
    weather: u8,
    quiz_state_hash: &[u8; 32],
    issued_at: i64,
    expires_at: i64,
    nonce: &[u8; 16],
) -> [u8; 98] {
    let mut buf = [0u8; 98];
    buf[0..32].copy_from_slice(&wallet.to_bytes());
    buf[32] = element;
    buf[33] = weather;
    buf[34..66].copy_from_slice(quiz_state_hash);
    buf[66..74].copy_from_slice(&issued_at.to_le_bytes());
    buf[74..82].copy_from_slice(&expires_at.to_le_bytes());
    buf[82..98].copy_from_slice(nonce);
    buf
}

/// Verify the prior instruction in this tx was an Ed25519Program ix
/// signing `expected_message` with `expected_signer`'s key. Reuses Sp2's
/// proven pattern · the only change vs Sp2 is the helper now operates on
/// a concrete `[u8; 98]` instead of a `Vec<u8>`.
fn verify_prior_ed25519(
    instructions_sysvar: &AccountInfo,
    expected_signer: Pubkey,
    expected_message: &[u8],
) -> Result<()> {
    let current_index = load_current_index_checked(instructions_sysvar)?;
    require!(current_index > 0, ErrorCode::NoPriorInstruction);

    let prior_index = current_index - 1;
    let prior_ix = load_instruction_at_checked(prior_index as usize, instructions_sysvar)?;

    require_keys_eq!(
        prior_ix.program_id,
        ED25519_PROGRAM_ID,
        ErrorCode::PriorIxNotEd25519
    );

    let parsed = parse_ed25519_instruction(&prior_ix.data)?;

    require!(
        parsed.signer_pubkey == expected_signer.to_bytes(),
        ErrorCode::SignerMismatch
    );

    require!(
        parsed.message == expected_message,
        ErrorCode::MessageMismatch
    );

    Ok(())
}

/// Parsed Ed25519Program instruction data (verbatim from Sp2).
struct Ed25519IxData {
    signer_pubkey: [u8; 32],
    message: Vec<u8>,
}

/// Parse the Ed25519Program instruction binary layout (verbatim from Sp2).
///
/// Layout (16-byte header + variable data):
///   [0]      : num_signatures (u8) · we require == 1
///   [1]      : padding (u8) · ignored
///   [2..4]   : signature_offset (u16 LE)
///   [4..6]   : signature_instruction_index (u16 LE) · 0xFFFF = current ix
///   [6..8]   : public_key_offset (u16 LE)
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
