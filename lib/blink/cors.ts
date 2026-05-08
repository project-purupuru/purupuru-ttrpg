// Solana Actions CORS headers · per spec
// https://solana.com/docs/advanced/actions
//
// Required headers for Action endpoints to be unfurled by dialect/X/Phantom etc.

export const ACTION_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Action-Version, X-Blockchain-Ids",
  "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
  "X-Action-Version": "2.4",
  "X-Blockchain-Ids": "solana:devnet", // v0 devnet only · S2-T1 sets per env
  "Content-Type": "application/json",
} as const

// Resolve the deployment base URL · prefer canonical env · fall back to localhost.
// Used to construct absolute href paths in ActionGetResponse buttons.
export const getBaseUrl = (request?: Request): string => {
  // Prefer explicit env var (set in vercel · sprint-3 production deploy).
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Derive from request origin if present.
  if (request) {
    const url = new URL(request.url)
    return `${url.protocol}//${url.host}`
  }
  return "http://localhost:3000"
}
