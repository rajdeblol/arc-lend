"use client";

import { PropsWithChildren, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export function AppProviders({ children }: PropsWithChildren) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
    (network === "devnet" ? "https://api.devnet.solana.com" : "https://api.testnet.solana.com");
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
