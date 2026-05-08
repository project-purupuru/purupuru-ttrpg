// Minimal Solana Actions types · per Solana Actions specification
// SDD r2 §4.1+§4.2 · we only need the response shapes · not full client SDK.
//
// Reference: https://docs.solana.com/actions
// v0 keeps this minimal · upgrade to @solana/actions package when ergonomics demand.

// Action chained linked button (GET-chain · per FR-2 actionChaining:true).
export interface LinkedAction {
  label: string
  href: string // GET endpoint URL · server resolves next step
  // input fields disallowed v0 per BLINK_DESCRIPTOR · button-multichoice only
}

// Standard ActionGetResponse · what GET endpoints return.
export interface ActionGetResponse {
  icon: string // URL to image (≤ 128 KiB · per BLINK_DESCRIPTOR)
  title: string // ≤ 80 chars
  description: string // ≤ 280 chars
  label: string
  links?: {
    actions: LinkedAction[]
  }
  disabled?: boolean
  error?: { message: string }
}

// ActionPostResponse · what POST endpoints return (sprint-1 mint endpoint S1-T9).
export interface ActionPostResponse {
  transaction: string // base64-encoded Solana transaction
  message?: string
  links?: {
    next?: NextActionLink
  }
}

// NextAction chain link · for action-chaining via POST → GET (cycle-2 work · stub here).
export type NextActionLink =
  | { type: "post"; href: string }
  | { type: "inline"; action: ActionGetResponse }

// BLINK_DESCRIPTOR constraints (cycle-X upstream PR target · per FR-2).
// Mirrors freeside-mediums sealed-schema discriminated-union pattern.
export const BLINK_DESCRIPTOR = {
  _tag: "blink" as const,
  iconMaxBytes: 128 * 1024,
  titleMaxChars: 80,
  descriptionMaxChars: 280,
  buttonsMax: 5,
  inputFieldsAllowed: [] as const, // v0 disallows · button-multichoice only
  txShape: "anchor-witness | anchor-genesis-stone-claim",
  actionChaining: true,
  walletAwareGet: false, // GET is anonymous per Actions spec
  presentationBoundary: "cmp-boundary-presentation",
  nftStandard: "metaplex-token-metadata",
} as const

export type BlinkDescriptor = typeof BLINK_DESCRIPTOR
