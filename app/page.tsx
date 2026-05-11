import { ObservatoryClient } from "@/components/observatory/ObservatoryClient";
import { SolanaWalletProvider } from "@/components/wallet/SolanaWalletProvider";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata("home");

export default function ObservatoryPage() {
  // Wallet provider trio (Connection/Wallet/WalletModal) wraps the
  // observatory so ActivityRail's `useWallet()` hook resolves to the
  // user's connected Solana wallet for YOU attribution on real radar
  // mints.
  return (
    <SolanaWalletProvider>
      <ObservatoryClient />
    </SolanaWalletProvider>
  );
}
