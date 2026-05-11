"use client";

/**
 * SolanaWalletProvider — reusable wrapper around the Solana
 * wallet-adapter trio (ConnectionProvider / WalletProvider /
 * WalletModalProvider). Lifted from `components/blink/blink-preview.tsx`
 * (originally scoped there) so the observatory page can also access
 * the connected wallet for "YOU" attribution on real radar mints.
 *
 * Defaults to devnet RPC. Phantom is the only registered adapter;
 * adding more (Solflare, Backpack, etc.) is a one-line tweak.
 *
 * Why this exists: the wallet hook `useWallet()` is only valid inside
 * a `WalletProvider`. The observatory's activity rail uses that hook
 * to detect when an arriving radar event matches the connected wallet
 * (renders the YOU badge).
 */

import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo, type ReactNode } from "react";

const DEFAULT_RPC = "https://api.devnet.solana.com";

interface SolanaWalletProviderProps {
  children: ReactNode;
  /** Override the RPC endpoint. Defaults to devnet. */
  endpoint?: string;
}

export function SolanaWalletProvider({
  children,
  endpoint = DEFAULT_RPC,
}: SolanaWalletProviderProps) {
  // useMemo keeps the adapter instance stable across re-renders so
  // WalletProvider doesn't re-init mid-session (same rationale as in
  // blink-preview.tsx — see comment there).
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {/* autoConnect=true so the wallet survives client-side route
          changes + page reloads — the user's connection from the Blink
          flow carries into the observatory and YOU attribution
          continues to work without re-prompting. */}
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
