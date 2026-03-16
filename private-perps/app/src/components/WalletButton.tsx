"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

function shortAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  return connected && publicKey ? (
    <button
      type="button"
      onClick={() => void disconnect()}
      className="arcade-btn arcade-btn-secondary text-sm"
    >
      {shortAddress(publicKey.toBase58())} • DISCONNECT
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className="arcade-btn arcade-btn-primary text-sm"
    >
      CONNECT WALLET
    </button>
  );
}
