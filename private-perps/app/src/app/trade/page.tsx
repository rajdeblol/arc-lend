"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { TradeForm } from "@/components/TradeForm";
import { encryptForMpc } from "@/lib/arcium";
import { loadLoans, saveLoans } from "@/lib/local-state";
import { LoanPosition } from "@/types";

export default function TradePage() {
  const { connected, publicKey } = useWallet();

  async function onSubmitTrade(input: {
    collateralAsset: "SOL" | "BTC" | "ETH";
    collateralAmount: number;
    borrowAsset: "USDC";
    borrowAmount: number;
    termDays: number;
  }): Promise<void> {
    if (!connected || !publicKey) {
      throw new Error("Connect your Solana wallet first.");
    }

    const encoder = new TextEncoder();
    const payload = encoder.encode(JSON.stringify(input));
    await encryptForMpc(payload);

    const next: LoanPosition = {
      id: `${Date.now()}`,
      owner: publicKey.toBase58(),
      collateralAsset: input.collateralAsset,
      collateralAmount: input.collateralAmount,
      borrowAsset: input.borrowAsset,
      openedAt: Date.now(),
      status: "ACTIVE",
      termDays: input.termDays,
      encryptedState: "encrypted:collateral+borrow+ltv",
      encryptedHealthState: "encrypted:health-factor",
    };

    const existing = loadLoans();
    saveLoans([next, ...existing]);
  }

  return (
    <section className="py-8">
      <h1 className="text-center text-5xl font-black tracking-tight md:text-7xl">
        BORROW <span className="text-[rgb(var(--accent))]">PRIVATELY</span>
      </h1>
      <p className="arcade-mono mx-auto mb-6 mt-4 max-w-3xl text-center text-xl text-text-muted">
        ArcLend on Arcium keeps LTV, collateral balances, debt size and health factors hidden from liquidation bots.
      </p>
      <TradeForm isWalletConnected={connected && Boolean(publicKey)} onSubmitTrade={onSubmitTrade} />
    </section>
  );
}
