# Types & Schemas · 2026-05-11

> Effect Schema discriminated unions and brand types. All schemas live in `packages/peripheral-events/src/`. For function signatures see [api-surface.md](./api-surface.md).

## Element + Affinity

```ts
Element        = "WOOD" | "FIRE" | "EARTH" | "METAL" | "WATER"   // world-event.ts:11
ElementByte    = 1 | 2 | 3 | 4 | 5                                // stone-claimed.ts:20
ElementAffinity = Record<Element, number>                          // world-event.ts:23
OracleSource   = "TREMOR" | "CORONA" | "BREATH"                   // world-event.ts:19
```

Tie-break order (`bazi-resolver.ts`): WOOD > FIRE > EARTH > METAL > WATER.

## Solana primitives

```ts
SolanaPubkey   = string & Brand<"SolanaPubkey">                   // world-event.ts:15
SolanaCluster  = 0 | 1   // 0=devnet · 1=mainnet                  // claim-message.ts:17
ClaimNonce     = string(length=32) & Brand<"ClaimNonce">          // claim-message.ts:25
QuizStateHash  = string(length=64) & Brand<"QuizStateHash">       // claim-message.ts:21
```

## WorldEvent (sealed discriminated union · 4 v0 variants)

```ts
MintEvent = Struct({
  _tag: "MintEvent", mintTx: string, walletId: SolanaPubkey,
  element: Element, ts: number, ...
})                                                                 // world-event.ts:28
WeatherEvent = Struct({
  _tag: "WeatherEvent", source: OracleSource, code: number,
  intensity: number, ts: number, ...
})                                                                 // world-event.ts:39
ElementShiftEvent = Struct({
  _tag: "ElementShiftEvent", fromElement: Element,
  toElement: Element, ts: number, ...
})                                                                 // world-event.ts:50
QuizCompletedEvent = Struct({
  _tag: "QuizCompletedEvent", archetype: Element,
  walletId: SolanaPubkey, ts: number, ...
})                                                                 // world-event.ts:61

WorldEvent = Union(MintEvent, WeatherEvent, ElementShiftEvent, QuizCompletedEvent)
                                                                  // world-event.ts:71
```

## ClaimMessage · server-signed mint payload

```ts
ClaimMessage = Struct({
  // canonical 98-byte signed payload · CLAIM_MESSAGE_SIGNED_BYTES = 98
  walletId, elementByte, expiresAt, nonce, quizStateHash,
  cluster, schemaVersion, ...
})                                                                 // claim-message.ts:74

SignedClaimMessage = {
  message: ClaimMessage,
  signature: Uint8Array,
  signerPubkey: SolanaPubkey,
}                                                                  // claim-message.ts:225
```

## Quiz state · HMAC-validated GET-chain URL state

```ts
Answer              = ...    // bazi-quiz-state.ts
BaziQuizState       = ...    // bazi-quiz-state.ts
CompletedQuizState  = ...    // bazi-quiz-state.ts
QuizStep            = ...    // bazi-quiz-state.ts
QUIZ_COMPLETED_STEP = const
```

## On-chain mirror · `StoneClaimed` (indexer consumption)

```ts
StoneClaimedIndexedFields = Struct({...})                          // stone-claimed.ts:26
StoneClaimedRaw           = Struct({...})                          // stone-claimed.ts:36
StoneClaimedSchema        = extend(IndexedFields, Raw)             // stone-claimed.ts:46
StoneClaimed              = Schema.Type<typeof StoneClaimedSchema> // stone-claimed.ts:50
```

Consumed by `project-purupuru/radar` (zerker's lane · separate repo).

## SourceTag

```ts
SourceTag = "score" | "sonar" | "weather" | "test"                 // event-id.ts:18
```

## QuizMode (renderer config)

```ts
QuizMode = "first-n" | "rotate-n" | "tension-pick"
// Currently only "first-n" implemented · rotate-n / tension-pick are sprint-3 TODO
//                                                          quiz-config.ts:17,18,81
```

## Anchor program (Rust)

```rust
struct ClaimGenesisStone<'info> {                                 // lib.rs:242
  mint: AccountInfo,            // mut · new mint to create
  mint_ata: AccountInfo,        // mut · associated token account
  metadata: AccountInfo,        // mut · Metaplex metadata PDA
  master_edition: AccountInfo,  // mut · master edition PDA
  payer: Signer,                // mut · sponsored-payer
  user_wallet: Signer,          // mint authority (user)
  instructions_sysvar,          // ed25519 instruction inspection
  token_program,                // anchor_spl::token::ID
  token_metadata_program,       // TOKEN_METADATA_PROGRAM_ID
  // ...
}
```

## Schema version

```ts
CURRENT_SCHEMA_VERSION         // event-id.ts · monotonic version pin
PACKAGE_VERSION = "0.0.1"      // peripheral-events/src/index.ts:7
CLAIM_MESSAGE_SIGNED_BYTES = 98 // claim-message.ts:146
```
