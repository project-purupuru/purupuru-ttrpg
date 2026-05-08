"use client"

// Client-side Blink preview using @dialectlabs/blinks · the official
// Dialect React renderer. This is what users actually see in Phantom mobile,
// dial.to, or Twitter feeds (with the renderer's own card frame, typography,
// and button styling — NOT our app's design tokens).
//
// Why client-only: `useBlink` from @dialectlabs/blinks-core uses React hooks
// to fetch + watch the action JSON; the WalletProvider context the adapter
// hook depends on is also browser-only.

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { Blink, useAction } from "@dialectlabs/blinks"
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import "@dialectlabs/blinks/index.css"
import "@solana/wallet-adapter-react-ui/styles.css"

const DEVNET_RPC = "https://api.devnet.solana.com"

interface BlinkPreviewProps {
  url: string
  stylePreset?: "default" | "x-dark" | "x-light"
}

// Inner renderer · runs inside all the providers · grabs adapter + blink.
function BlinkInner({ url, stylePreset = "default" }: BlinkPreviewProps) {
  const { adapter } = useActionSolanaWalletAdapter(DEVNET_RPC)
  const { blink, isLoading } = useAction({ url })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-puru-cloud-shadow bg-puru-cloud-base p-8 text-center text-puru-ink-soft text-sm font-puru-mono">
        loading action…
      </div>
    )
  }
  if (!blink) {
    return (
      <div className="rounded-2xl border border-puru-fire-vivid bg-puru-fire-pastel p-6 text-puru-ink-rich text-sm">
        <p className="font-puru-display text-base mb-1">action did not load</p>
        <p className="text-xs font-puru-mono break-all opacity-70">
          target: {url}
        </p>
      </div>
    )
  }
  return <Blink blink={blink} adapter={adapter} stylePreset={stylePreset} />
}

// Outer · provides wallet/connection context (read-only · empty wallets array
// means Blink's wallet-required actions will prompt connect-flow if exercised
// · our preview's main goal is the visual render, not signing).
export function BlinkPreview(props: BlinkPreviewProps) {
  return (
    <ConnectionProvider endpoint={DEVNET_RPC}>
      <WalletProvider wallets={[]} autoConnect={false}>
        <WalletModalProvider>
          <BlinkInner {...props} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
