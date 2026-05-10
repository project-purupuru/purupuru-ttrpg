# How Our Anchor Program Works

> **Audience**: zksoju (learning Solana programs for the first time) + future contributors who need to read or modify `programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs`.
>
> **Approach**: concept primer first (so the vocabulary is loaded) · then a section-by-section walkthrough of OUR specific code · then how it all fits together at runtime.
>
> **Time to read**: 30-45 min. Code references throughout · best read with `programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs` open in another tab.

---

## Part 1 · Solana + Anchor Concept Primer

You don't need to know Rust deeply to read this code. You DO need to know what Solana is doing under the hood that makes the patterns make sense. Here's the minimum vocabulary.

### A Solana program is a stateless function

A Solana **program** is a piece of compiled code (a `.so` file · "shared object") that lives at a specific public-key address on-chain. Anyone can send it transactions. The program runs, validates, and either succeeds or fails.

The crucial difference from Ethereum smart contracts: **Solana programs hold no state of their own**. They read and write to **accounts** — separate on-chain data slots that the program is authorized to operate on. Think of the program as a stateless function and accounts as the database rows it operates on.

When a transaction calls our program, it must explicitly list every account the program will touch. The program can't "go look up" some other account on its own — every account that the program reads or writes must be passed in as part of the instruction.

This is why every Anchor program has an **Accounts struct** that declares "here are the accounts I need." The runtime validates that the caller passed exactly those accounts before our code runs.

### Accounts struct + the `#[derive(Accounts)]` macro

In our code (`lib.rs:242-291`):

```rust
#[derive(Accounts)]
pub struct ClaimGenesisStone<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub sponsored_payer: Signer<'info>,
    pub mint: Signer<'info>,
    pub metadata: UncheckedAccount<'info>,
    // ...
}
```

This declares the 9 accounts our `claim_genesis_stone` instruction needs. Anchor's macro generates the validation code that runs BEFORE our function body — checking that:

- `authority` is a signer (someone signed the tx with this wallet)
- `mint` is a signer (the new mint keypair signed the tx)
- `metadata` is just an arbitrary account we'll validate ourselves (the `UncheckedAccount` type bypasses Anchor's automatic validation; we promise to validate it · in our case Metaplex's CPI does the validation for us)

`#[account(mut)]` says "this account will be modified during the instruction." The Solana runtime tracks reads vs writes for parallelism — accounts marked mutable can't be touched concurrently by other transactions.

`Signer<'info>` says "this account must have signed the transaction." Without that, our program would reject the tx during account deserialization, before the function body runs.

### PDAs · Program Derived Addresses

Some accounts in our program are PDAs — addresses that are deterministically derived from a set of "seeds" rather than randomly generated.

In `lib.rs`, the `metadata` and `master_edition` accounts are PDAs derived by Metaplex's program. The seeds for the metadata PDA are:

```
seeds = [b"metadata", token_metadata_program_id, mint_pubkey]
```

Given those three pieces of input, anyone can compute the SAME pubkey deterministically. PDAs are useful because:

1. **No private key**: PDAs are derived "off the curve" — they have no private key, so no one can sign transactions FROM them. Only programs can sign on their behalf via CPI.
2. **Predictable addresses**: clients can compute the PDA address before the account exists. This lets you fetch metadata for a given mint without needing a registry lookup.
3. **One per seed combo**: there's exactly one PDA for `[metadata, prog_id, mint_X]`. No collisions.

For our program, we don't derive PDAs ourselves — Metaplex's CPI does it internally. But knowing the seed structure helps you understand how Phantom resolves "show me the metadata for this NFT": it computes `[metadata, MetaplexID, mint_pubkey]`, fetches that PDA, parses the metadata JSON URI, fetches the JSON, fetches the image. Three lookups, all addressable from just the mint pubkey.

### CPI · Cross-Program Invocation

Programs can call OTHER programs. This is called a **CPI** (Cross-Program Invocation). Our `claim_genesis_stone` instruction calls Metaplex's `CreateV1` instruction via CPI to mint the NFT — we don't reimplement minting, we delegate to the canonical NFT-minting program.

CPI in Anchor looks like this (`lib.rs:172-194`):

```rust
CreateV1CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
    .metadata(&ctx.accounts.metadata.to_account_info())
    .master_edition(Some(&ctx.accounts.master_edition.to_account_info()))
    .mint(&ctx.accounts.mint.to_account_info(), true)
    .authority(&ctx.accounts.authority.to_account_info())
    .payer(&ctx.accounts.sponsored_payer.to_account_info())
    // ... lots of args
    .invoke()?;
```

A few things to notice:

1. **The accounts we pass to the CPI are accounts WE already declared.** Metaplex needs `metadata`, `master_edition`, `mint`, etc. — those are all in our `ClaimGenesisStone` Accounts struct. We're passing them through.
2. **`.invoke()?` performs the actual CPI.** The `?` propagates any error — if Metaplex fails for any reason (bad accounts, validation fails, etc.), our instruction fails and the whole tx reverts atomically.
3. **The CPI builder pattern** is Metaplex's library convention — they expose a fluent builder so you don't have to construct the raw instruction-data bytes yourself.

The key insight: **our program is a thin coordination layer**. It validates the claim is legit, then asks Metaplex to do the heavy NFT lifting. We never manage SPL token accounts ourselves; Metaplex handles all of that.

### Sysvars

A **sysvar** is a special read-only account whose data the Solana runtime maintains automatically. Examples:

- `Clock` (current slot, unix_timestamp)
- `Rent` (minimum lamports for rent-exemption)
- `Instructions` (the list of all instructions in the current tx)

The instructions sysvar is the load-bearing one for our program. Here's why.

### The `ed25519-via-instructions-sysvar` Pattern (THE clever piece)

Solana programs **cannot directly verify ed25519 signatures**. There's no syscall for it. But many real-world programs need to verify signatures from off-chain sources (server-signed authorizations, oracle attestations, etc.).

The canonical pattern Solana uses:

1. **Caller builds a transaction with TWO instructions:**
   - First: an instruction to the **`Ed25519Program`** (Solana's built-in signature verifier). This instruction takes `(pubkey, message, signature)` and the Solana runtime verifies them. If the signature is invalid, the entire transaction fails before any other instructions run.
   - Second: our program's instruction.

2. **Solana runs the Ed25519Program ix first.** If the signature is invalid → tx fails atomically. So if our instruction runs at all, we know SOME signature was verified.

3. **Our instruction reads the `Instructions sysvar`** to look back at the previous instruction. We extract WHICH (pubkey, message) was verified.

4. **We validate** that the verified pubkey matches our hardcoded claim-signer pubkey, AND that the verified message matches the bytes we expect (reconstituted from the args we received).

If both match, we know an ed25519 signature was made by our trusted server over the exact data we expected. Without this pattern, an attacker could submit a valid signature from ANY signer over ANY message and our program wouldn't notice.

The function `verify_prior_ed25519` (`lib.rs:373-403`) implements this. The function `parse_ed25519_instruction` (`lib.rs:411-445`) parses the binary layout of the Ed25519Program's instruction data.

### Events · `#[event]` and `emit!`

Solana doesn't have a built-in event log like Ethereum's `event`. Anchor adds this via **structured logs**: when you call `emit!(MyEvent { ... })`, Anchor base64-encodes the struct and writes it to the transaction logs.

Indexers (like our planned indexer for the awareness layer) subscribe to the program's logs via WebSocket (`connection.onLogs(programId)`), parse out the base64 event data using the program's IDL (interface definition language file generated by Anchor at build time), and emit structured events to downstream systems.

In our code (`lib.rs:299-306`):

```rust
#[event]
pub struct StoneClaimed {
    pub wallet: Pubkey,
    pub element: u8,
    pub weather: u8,
    pub mint: Pubkey,
}
```

This declares the event shape. When `emit!(StoneClaimed { ... })` runs, the event is written to the tx log. Zerker's indexer will read these to build the awareness-layer feed.

### Errors · `#[error_code]`

Anchor lets you declare custom errors with the `#[error_code]` attribute. These get an automatic numeric code (starting at 6000) and a descriptive message. When you `require!(condition, ErrorCode::Variant)` and the condition is false, the program returns that error and the tx fails with the descriptive message visible in the tx logs.

Our errors (`lib.rs:312-339`):

```rust
#[error_code]
pub enum ErrorCode {
    NoPriorInstruction,
    PriorIxNotEd25519,
    InvalidEd25519Data,
    SignerMismatch,
    MessageMismatch,
    ElementOutOfRange,
    WeatherOutOfRange,
    IssuedAfterExpiry,
    Expired,
}
```

Each variant maps to a `#[msg("...")]` description visible in tx logs. Specific error codes make debugging way easier than generic "instruction failed" — when our invariant tests check for `ElementOutOfRange`, they're matching against this enum's specific variant.

### Anchor's `#[program]` block

The `#[program]` attribute marks a module as the Solana program's entry point. Each `pub fn` inside the block becomes an instruction the program can be called with. Anchor generates the dispatch code that maps incoming instruction data to the right function.

Our program has one instruction: `claim_genesis_stone`. When a tx is sent to our program, Anchor's generated code routes it to that function based on the discriminator (an 8-byte hash of the function name) at the start of the instruction data.

---

## Part 2 · `lib.rs` Walkthrough

OK with that vocabulary loaded, let's walk through the actual file. References are line numbers in `programs/purupuru-anchor/programs/purupuru-anchor/src/lib.rs`.

### Top-of-file doc comment (lines 1-37)

A bird's-eye doc-comment describing what the program does, the three-keypair model (sponsored-payer · claim-signer · user wallet), and the end-to-end flow. Future-you reading this in 6 months will be grateful · always lead with "what is this for."

### Imports (lines 39-49)

```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use anchor_lang::solana_program::ed25519_program::ID as ED25519_PROGRAM_ID;
use anchor_lang::solana_program::sysvar::instructions::{
    load_current_index_checked, load_instruction_at_checked, ID as INSTRUCTIONS_SYSVAR_ID,
};
use mpl_token_metadata::instructions::CreateV1CpiBuilder;
use mpl_token_metadata::types::{Collection, PrintSupply, TokenStandard};
use mpl_token_metadata::ID as TOKEN_METADATA_PROGRAM_ID;
```

Reading top-to-bottom:

- `anchor_lang::prelude::*` — imports the macros + types every Anchor program needs (`#[program]`, `#[derive(Accounts)]`, `Pubkey`, `Result`, `msg!`, `require!`, etc.). The `prelude` pattern is Rust's idiomatic "give me all the common stuff" import.
- `Clock` — read on-chain time for our expiry check.
- `ED25519_PROGRAM_ID` — the public key of Solana's built-in Ed25519Program · we compare the prior ix's `program_id` against this.
- `load_current_index_checked` + `load_instruction_at_checked` — the two helpers we use to read the instructions sysvar. "Checked" means they validate input bounds and return `Result` instead of panicking.
- `INSTRUCTIONS_SYSVAR_ID` — the sysvar's pubkey · we use it in our Accounts struct to validate that the instruction-sysvar account passed in is actually the canonical sysvar.
- `CreateV1CpiBuilder` + `Collection`, `PrintSupply`, `TokenStandard` — Metaplex's instruction builder + the type enums we'll pass to it.
- `TOKEN_METADATA_PROGRAM_ID` — Metaplex's program pubkey · we pin our program to it via the Accounts struct.

### `declare_id!` (line 51)

```rust
declare_id!("7u27WmTz2hZHvvhL89XcSCY3eFhxEfHjUN5MjzMY6v38");
```

Hardcodes the program's deployed pubkey. This MUST match the address the program is actually deployed at on-chain · if it doesn't, no transactions can find your program. Anchor uses this in three places:

1. The compiled binary embeds it (so the runtime can verify the program is at the right address).
2. Anchor.toml references it for `anchor deploy`.
3. Tests + clients use it to construct transactions.

If you ever change the program's deployed address, update this constant in all three places · drift is silent and confusing.

### Hardcoded constants (lines 57-94)

```rust
const CLAIM_SIGNER_PUBKEY: Pubkey = pubkey!("E6E69osQmgzpQk9h19ebtMm8YEkAHJfnHwXThr6o2Gsd");
const COLLECTION_MINT_PUBKEY: Pubkey = pubkey!("3Be59FPQnnSs5Z7Mxs6XtUD1NrrMEVAzhA751aRi2zj1");

const URI_WOOD: &str = "https://raw.githubusercontent.com/...";
const URI_FIRE: &str = "...";
// ...etc
```

These are **load-bearing security/integrity constants**:

- `CLAIM_SIGNER_PUBKEY` is the only ed25519 pubkey our program will accept as a claim authorizer. Hardcoding it means an attacker can't substitute their own signer in the prior Ed25519Program ix — our `verify_prior_ed25519` checks this exact pubkey.
- `COLLECTION_MINT_PUBKEY` is the parent NFT (the "Genesis Stones" collection). When we mint child stones, we set their `collection.key` field to this pubkey. Phantom + dial.to + Twitter all use this for collection grouping.
- `URI_*` constants are the metadata JSON URLs per element. Hardcoding them prevents client-supplied URIs (which could be phishing redirects).

`pubkey!("...")` is an Anchor macro that converts a base58 string to a `Pubkey` at compile time. If the string is invalid, it fails to compile (good · catches typos before deploy).

### `element_name` + `element_uri` helpers (lines 96-119)

```rust
fn element_name(byte: u8) -> &'static str {
    match byte {
        1 => "Wood", 2 => "Fire", 3 => "Earth", 4 => "Metal", 5 => "Water",
        _ => "Unknown",
    }
}

fn element_uri(byte: u8) -> &'static str {
    match byte {
        1 => URI_WOOD, 2 => URI_FIRE, /* ... */
        _ => URI_FIRE,
    }
}
```

Plain Rust pattern matching. Maps the 1-5 element byte to its name (for the NFT display name) and URI (for the metadata pointer).

The `_` arm is a fallback that should never run (we validate `1..=5` before reaching this code) but Rust requires exhaustive match for compile-safety. Returning a sensible default beats panicking.

### `#[program]` block (lines 121-200)

The big one. This is where instructions live.

```rust
#[program]
pub mod purupuru_anchor {
    use super::*;

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
        // ...validation + CPI + emit
    }
}
```

#### The function signature

- `Context<ClaimGenesisStone>` — Anchor wraps the Accounts struct in a `Context` that also gives access to `ctx.program_id`, `ctx.remaining_accounts`, etc. Our function only uses `ctx.accounts` to grab the validated accounts.
- The other args (wallet, element, etc.) are the **instruction args**. The client passes these as part of the instruction data when calling our program. Anchor handles the (de)serialization automatically using Borsh (the Solana-native serialization format).

#### Validation gates (lines 138-156)

```rust
require!((1..=5).contains(&element), ErrorCode::ElementOutOfRange);
require!((1..=5).contains(&weather), ErrorCode::WeatherOutOfRange);
require!(issued_at <= expires_at, ErrorCode::IssuedAfterExpiry);

let now = Clock::get()?.unix_timestamp;
require!(now <= expires_at, ErrorCode::Expired);
```

`require!(condition, error)` is Anchor's macro for "if condition is false, return this error." If any of these fail, the function returns early, the tx reverts atomically, and the user sees the specific error code in their tx log. None of the side effects happen.

The `Clock::get()?` reads the on-chain clock sysvar. The `?` propagates any error from the syscall (extremely rare · but rust forces us to handle it).

#### Reconstitute + verify (lines 158-170)

```rust
let canonical = reconstitute_claim_message(/* args */);
verify_prior_ed25519(
    &ctx.accounts.instructions_sysvar,
    CLAIM_SIGNER_PUBKEY,
    &canonical,
)?;
```

This is the security-critical part. We rebuild the exact 98-byte message that was signed off-chain (`reconstitute_claim_message` is a few helpers down at line 369), then call `verify_prior_ed25519` to confirm the prior instruction was an Ed25519Program ix that verified those exact bytes with our hardcoded claim-signer pubkey.

If anything is off — wrong signer, wrong bytes, no prior ix at all — we error out with a specific `ErrorCode` variant.

#### `msg!` log line (lines 172-179)

```rust
msg!(
    "claim_genesis_stone validated · wallet={} element={} weather={} expires_in={}s",
    wallet, element, weather, expires_at - now,
);
```

`msg!` writes to the program log (visible in tx Explorer, parseable by indexers). Useful for debug and for ops to see "yep, validation passed, here's why this mint succeeded." Comparable to `console.log`.

#### Metaplex CPI (lines 181-204)

```rust
let stone_name = format!("Genesis Stone · {}", element_name(element));
let stone_uri = element_uri(element).to_string();

CreateV1CpiBuilder::new(&ctx.accounts.token_metadata_program.to_account_info())
    .metadata(&ctx.accounts.metadata.to_account_info())
    .master_edition(Some(&ctx.accounts.master_edition.to_account_info()))
    .mint(&ctx.accounts.mint.to_account_info(), true)
    .authority(&ctx.accounts.authority.to_account_info())
    .payer(&ctx.accounts.sponsored_payer.to_account_info())
    .update_authority(&ctx.accounts.authority.to_account_info(), true)
    .system_program(&ctx.accounts.system_program.to_account_info())
    .sysvar_instructions(&ctx.accounts.instructions_sysvar.to_account_info())
    .spl_token_program(Some(&ctx.accounts.token_program.to_account_info()))
    .name(stone_name)
    .symbol("PGS".to_string())
    .uri(stone_uri)
    .seller_fee_basis_points(0)
    .token_standard(TokenStandard::NonFungible)
    .print_supply(PrintSupply::Zero)
    .collection(Collection {
        verified: false,
        key: COLLECTION_MINT_PUBKEY,
    })
    .invoke()?;
```

This is the actual NFT minting. We delegate to Metaplex via CPI. Each builder method either:

- Wires an account through (`.metadata()`, `.master_edition()`, `.mint()`, etc.) — these come from our Accounts struct
- Sets a metadata field (`.name()`, `.uri()`, `.seller_fee_basis_points()`)
- Configures the token type (`.token_standard(TokenStandard::NonFungible)` — classic NFT, NOT pNFT, NOT fungible)
- References the parent collection (`.collection(...)` with `verified: false` because we haven't run `verifyCollectionV1` yet · post-hackathon job sets that to true)

`.invoke()?` makes the actual CPI. Solana runtime verifies that our program is authorized to call Metaplex with these accounts (it is, because we pass the right signers and the right PDAs), then Metaplex's `CreateV1` runs, creates the SPL Mint, creates the Metadata PDA, creates the Master Edition PDA, and returns. If anything fails inside Metaplex (bad accounts, bad metadata, etc.), the error propagates up via `?` and our whole instruction reverts.

#### Emit event (lines 206-211)

```rust
emit!(StoneClaimed {
    wallet,
    element,
    weather,
    mint: ctx.accounts.mint.key(),
});
```

After the mint succeeds, we emit a structured event. Zerker's indexer subscribes to our program's logs and parses these out to build the awareness-layer feed.

### Accounts struct (lines 218-275)

This is the long one. Each field declares an account the instruction needs, with constraints validated by Anchor before the function body runs.

```rust
#[derive(Accounts)]
pub struct ClaimGenesisStone<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,                    // user wallet · signs

    #[account(mut)]
    pub sponsored_payer: Signer<'info>,              // backend keypair · signs · pays

    #[account(mut)]
    pub mint: Signer<'info>,                          // fresh keypair · signs

    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,           // PDA · validated by Metaplex CPI

    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,     // PDA · validated by Metaplex CPI

    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: AccountInfo<'info>,     // canonical sysvar pubkey check

    pub system_program: Program<'info, System>,      // automatic · Anchor type-validates

    #[account(address = anchor_spl::token::ID)]
    pub token_program: AccountInfo<'info>,           // pinned to SPL Token program

    #[account(address = TOKEN_METADATA_PROGRAM_ID)]
    pub token_metadata_program: AccountInfo<'info>,  // pinned to Metaplex program
}
```

Each account type means something:

- `Signer` — must have signed the tx
- `UncheckedAccount` — Anchor doesn't validate the structure (the CPI inside the function does)
- `AccountInfo` — raw account info, no built-in validation
- `Program<System>` — typed reference to the System Program (Anchor knows what it is)

`#[account(mut)]` says it's writable. `#[account(address = X)]` says "this account's pubkey must equal X." That's how we pin `token_program` to `anchor_spl::token::ID` — a sneaky attacker can't pass a malicious "token program" because Anchor checks the pubkey before the function runs.

### `StoneClaimed` event (lines 281-288)

```rust
#[event]
pub struct StoneClaimed {
    pub wallet: Pubkey,
    pub element: u8,
    pub weather: u8,
    pub mint: Pubkey,
}
```

Already explained · this is the schema indexers will read.

### `ErrorCode` enum (lines 294-321)

Already explained · 9 specific reject paths. Each has a `#[msg("...")]` that surfaces in tx logs. When Phantom shows "Error: ElementOutOfRange — Element byte must be in 1..5..." that's literally the text from this enum.

### `reconstitute_claim_message` (lines 351-368)

```rust
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
```

Builds the exact 98-byte canonical layout from the args. **MUST EXACTLY MATCH** the off-chain TS encoder in `packages/peripheral-events/src/claim-message.ts:encodeClaimMessage` — drift by one byte and our `verify_prior_ed25519` will reject all valid claims with `MessageMismatch`. The same layout block-comment lives in BOTH files for that reason.

The `to_le_bytes()` is "little-endian byte order" — Solana standard for multi-byte integers in transaction data.

### `verify_prior_ed25519` (lines 373-403)

```rust
fn verify_prior_ed25519(
    instructions_sysvar: &AccountInfo,
    expected_signer: Pubkey,
    expected_message: &[u8],
) -> Result<()> {
    let current_index = load_current_index_checked(instructions_sysvar)?;
    require!(current_index > 0, ErrorCode::NoPriorInstruction);

    let prior_index = current_index - 1;
    let prior_ix = load_instruction_at_checked(prior_index as usize, instructions_sysvar)?;

    require_keys_eq!(prior_ix.program_id, ED25519_PROGRAM_ID, ErrorCode::PriorIxNotEd25519);

    let parsed = parse_ed25519_instruction(&prior_ix.data)?;

    require!(parsed.signer_pubkey == expected_signer.to_bytes(), ErrorCode::SignerMismatch);
    require!(parsed.message == expected_message, ErrorCode::MessageMismatch);

    Ok(())
}
```

The five-step ed25519 verification:

1. Find OUR position in the tx (`current_index`).
2. Require there's a prior ix at all (`current_index > 0`).
3. Load that prior ix.
4. Require its program is `Ed25519Program` (not just any program).
5. Parse the binary layout to extract `(signer, message)`.
6. Require both match what we expected.

If all pass, we know:
- An ed25519 signature was verified by the runtime (so it's mathematically valid)
- The signer is our hardcoded claim-signer (not someone else's pubkey)
- The signed bytes are exactly what we reconstituted from the args (not different data)

### `parse_ed25519_instruction` (lines 411-445)

```rust
fn parse_ed25519_instruction(data: &[u8]) -> Result<Ed25519IxData> {
    require!(data.len() >= 16, ErrorCode::InvalidEd25519Data);

    let num_sigs = data[0];
    require!(num_sigs == 1, ErrorCode::InvalidEd25519Data);

    let pk_offset = u16::from_le_bytes([data[6], data[7]]) as usize;
    let msg_offset = u16::from_le_bytes([data[10], data[11]]) as usize;
    let msg_size = u16::from_le_bytes([data[12], data[13]]) as usize;

    require!(data.len() >= pk_offset + 32, ErrorCode::InvalidEd25519Data);
    require!(data.len() >= msg_offset + msg_size, ErrorCode::InvalidEd25519Data);

    let mut signer_pubkey = [0u8; 32];
    signer_pubkey.copy_from_slice(&data[pk_offset..pk_offset + 32]);

    let message = data[msg_offset..msg_offset + msg_size].to_vec();

    Ok(Ed25519IxData { signer_pubkey, message })
}
```

Parses the binary layout of the Ed25519Program's instruction data. The layout (documented in the comment block above the function) is:

```
[0]      num_signatures (u8)
[1]      padding (u8)
[2..4]   signature_offset (u16 LE)
[4..6]   signature_instruction_index (u16 LE)
[6..8]   public_key_offset (u16 LE)
[8..10]  public_key_instruction_index (u16 LE)
[10..12] message_data_offset (u16 LE)
[12..14] message_data_size (u16 LE)
[14..16] message_instruction_index (u16 LE)
[16+]    signature || pubkey || message (offsets point into here)
```

We only care about extracting (pubkey, message) for our checks. The ACTUAL signature verification has already happened — Solana's runtime did it before we even got here. We just need to verify what was verified.

The bounds checks (`require!(data.len() >= ...)`) are defense against malformed input. Without them, a malicious caller could craft an Ed25519Program ix with bad offsets that point outside the data buffer, causing us to read garbage memory.

---

## Part 3 · How It All Fits Together (Runtime Flow)

Now picture what actually happens when a user clicks "Claim Your Stone":

### Off-chain prep (sprint-3 API route work)

1. User completes 8-question quiz in the Blink. URL state carries `step=8&a1=...&a8=...&mac=...`.
2. User clicks "Claim Your Stone" → Phantom prompts wallet connect → user signs.
3. Behind the scenes, the API route at `/api/actions/mint/genesis-stone` does:
   - Validates URL HMAC
   - Computes archetype from validated answers
   - Generates a UUID-v4 nonce
   - Atomically claims the nonce in Vercel KV (replay protection)
   - Builds a `ClaimMessage` struct with all the args
   - Encodes to 98 canonical bytes (`encodeClaimMessage`)
   - Signs those 98 bytes with the claim-signer secret (loaded from env)
   - Generates a fresh mint keypair (server-side · signs the tx as `mint`)
   - Loads sponsored-payer keypair (signs as fee payer · pays rent)
   - Assembles a Solana transaction with TWO instructions:
     - **Ix #1**: `Ed25519Program.createInstructionWithPublicKey(...)` — Solana's built-in sig verifier
     - **Ix #2**: Our anchor program's `claimGenesisStone` instruction with the 7 args + 9 accounts
   - Sets `tx.feePayer = sponsoredPayer.publicKey`
   - Server-side: partial-signs as `sponsored_payer` and `mint`
   - Returns the base64-serialized tx in the Action POST response (still missing the user's `authority` signature)

### On-chain (this is where our program runs)

4. Phantom receives the tx, prompts user to sign as `authority`. User signs.
5. Phantom submits the tx to a Solana RPC node.
6. RPC validates the tx structure, propagates to validators.
7. A validator picks up the tx and starts executing instructions in order.

8. **Ix #1 — `Ed25519Program`**:
   - Solana runtime verifies the ed25519 signature against the (pubkey, message) bytes.
   - If invalid → entire tx fails atomically. We never get to ix #2.
   - If valid → log entry recorded. Move to next ix.

9. **Ix #2 — Our `claim_genesis_stone`**:
   - Anchor's generated dispatch code maps the discriminator to our function.
   - Anchor's account validation runs:
     - Check `authority` is a signer ✓
     - Check `sponsored_payer` is a signer ✓
     - Check `mint` is a signer ✓
     - Check `instructions_sysvar` matches `INSTRUCTIONS_SYSVAR_ID` ✓
     - Check `token_program` matches `anchor_spl::token::ID` ✓
     - Check `token_metadata_program` matches `TOKEN_METADATA_PROGRAM_ID` ✓
     - All accounts decoded into `ctx.accounts`
   - Function body runs:
     - Range checks (element 1..5, weather 1..5, issued_at <= expires_at)
     - Clock check (now <= expires_at)
     - Reconstitute the 98-byte canonical message from args
     - `verify_prior_ed25519` reads the instructions sysvar, extracts (signer, message) from ix #1, validates they match
     - `msg!` log line written
     - Metaplex `CreateV1` CPI:
       - Anchor passes our authorization to Metaplex
       - Metaplex creates the SPL Mint
       - Creates the Metadata PDA
       - Creates the Master Edition PDA
       - Sets `collection.key = COLLECTION_MINT_PUBKEY` (with `verified: false`)
       - Returns successfully
     - `emit!(StoneClaimed { ... })` writes structured event to log

10. The validator includes the tx in a block. Within ~30s on devnet, it's confirmed.

11. Phantom polls the RPC, sees the tx confirmed, queries the new mint's metadata via Metaplex's `getMetadata(mint)` (which derives the metadata PDA and fetches its content).

12. Metadata's `image` field points to `https://purupuru-blink.vercel.app/art/stones/{element}.png` · Phantom fetches that PNG.

13. The user's collectibles tab updates to show their stone, grouped under "Genesis Stones" (with a yellow unverified badge until `verifyCollectionV1` is run post-hackathon).

14. **Zerker's indexer** (next on the roadmap) subscribes to our program's logs via `connection.onLogs(programId)`, parses the `StoneClaimed` event using the IDL, and emits to the awareness-layer feed: "wallet X claimed a Wood stone at slot Y."

### What's elegant about all this

- **Stateless validation**: our program holds no state. The on-chain mint records (Metaplex's metadata + master edition PDAs) ARE the state. Our program is just a coordinator.
- **Atomic safety**: every check uses `require!` or `?` — any failure reverts the entire tx atomically. No partial state.
- **Server authority without server signatures on-chain**: the claim-signer never holds SOL or signs Solana transactions. Its sole job is to sign 98-byte messages off-chain. The Ed25519Program does the on-chain crypto. Our program reads what was verified.
- **CPI for delegation**: Metaplex is the canonical NFT-minter. We don't reimplement it; we delegate. If Metaplex updates their canonical mint flow, we update one CPI call, not a hundred lines of token-creation logic.
- **Events for observability**: Zerker's indexer doesn't need API access to our backend. It just reads logs from the public Solana network. The event schema in IDL is the only contract.

---

## Where to Read Next

When you want to go deeper:

| Topic | Where to look |
|---|---|
| Solana Programs | https://solana.com/docs/programs |
| Anchor Book | https://www.anchor-lang.com/ |
| Metaplex Token Metadata | https://developers.metaplex.com/token-metadata |
| Solana Actions spec | https://solana.com/docs/advanced/actions |
| The ed25519-via-sysvar pattern | Sp2 commit `0ca843c` and the test file at `programs/purupuru-anchor/tests/sp2-claim.ts` |
| Our SDD §5 · the on-chain spec | `grimoires/loa/sdd.md` lines 354-410 |

---

## Glossary (skim first if a term in this doc is unfamiliar)

- **PDA** · Program Derived Address. Deterministic address with no private key.
- **CPI** · Cross-Program Invocation. One Solana program calling another.
- **Sysvar** · System variable account · runtime maintains it · we read.
- **Borsh** · Solana's binary serialization format. Anchor handles this for us.
- **IDL** · Interface Definition Language. Anchor generates a JSON file describing instruction signatures and event schemas. Clients use it to encode/decode.
- **`#[program]`** · Anchor macro marking the entry-point module.
- **`#[derive(Accounts)]`** · Anchor macro generating account validation code from a struct.
- **`#[event]`** · Anchor macro making a struct emittable as a structured log entry.
- **`#[error_code]`** · Anchor macro making an enum into specific error variants.
- **`require!`** · Anchor macro: if condition false, return error.
- **`emit!`** · Anchor macro: write event to tx log.
- **`msg!`** · Anchor macro: write plain-text log line.
- **`Pubkey`** · 32-byte ed25519 public key. The atomic addressable unit of Solana.
- **`Signer<'info>`** · Anchor type · account that must have signed the tx.
- **`UncheckedAccount<'info>`** · Anchor type · we promise to validate manually.
- **`Context<T>`** · Anchor type wrapping the Accounts struct + program info.
- **`Result<()>`** · Rust's success/error union. `Ok(())` for success, `Err(...)` for fail.
- **Discriminator** · 8-byte hash prefix Anchor uses to route instruction data to the right function.
