"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { BorrowAsset, CollateralAsset, MpcStep } from "@/types";
import { MpcStatus } from "@/components/MpcStatus";
import { loadLoans } from "@/lib/local-state";

interface TradeFormProps {
  isWalletConnected: boolean;
  onSubmitTrade: (input: {
    collateralAsset: CollateralAsset;
    collateralAmount: number;
    borrowAsset: BorrowAsset;
    borrowAmount: number;
    termDays: number;
  }) => Promise<void>;
}

export function TradeForm({ isWalletConnected, onSubmitTrade }: TradeFormProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [collateralAsset, setCollateralAsset] = useState<CollateralAsset>("SOL");
  const [borrowAsset, setBorrowAsset] = useState<BorrowAsset>("USDC");
  const [collateralAmount, setCollateralAmount] = useState<number>(4);
  const [borrowAmount, setBorrowAmount] = useState<number>(300);
  const [termDays, setTermDays] = useState<number>(14);
  const [step, setStep] = useState<MpcStep>("IDLE");
  const [error, setError] = useState<string | null>(null);
  const [walletSolBalance, setWalletSolBalance] = useState<number>(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [balanceHint, setBalanceHint] = useState<string | null>(null);
  const [lockedSolCollateral, setLockedSolCollateral] = useState<number>(0);
  const borrowRate = collateralAsset === "BTC" ? 43000 : collateralAsset === "ETH" ? 2500 : 120;
  const availableSolBalance = Math.max(0, walletSolBalance - lockedSolCollateral);
  const collateralBalance = collateralAsset === "SOL" ? availableSolBalance : 12;
  const clusterLabel = useMemo(() => {
    const endpoint = connection.rpcEndpoint.toLowerCase();
    if (endpoint.includes("devnet")) {
      return "Solana Devnet";
    }
    if (endpoint.includes("testnet")) {
      return "Solana Testnet";
    }
    if (endpoint.includes("mainnet")) {
      return "Solana Mainnet";
    }
    return "Custom RPC";
  }, [connection.rpcEndpoint]);

  const disabled = useMemo(() => step !== "IDLE" && step !== "DONE" && step !== "ERROR", [step]);

  async function refreshSolBalance(): Promise<void> {
    if (!publicKey) {
      setWalletSolBalance(0);
      setBalanceHint(null);
      return;
    }

    try {
      setIsBalanceLoading(true);
      const [currentLamports, devnetLamports, testnetLamports] = await Promise.all([
        connection.getBalance(publicKey, "confirmed"),
        new Connection("https://api.devnet.solana.com", "confirmed").getBalance(publicKey, "confirmed"),
        new Connection("https://api.testnet.solana.com", "confirmed").getBalance(publicKey, "confirmed"),
      ]);

      const currentBalance = currentLamports / LAMPORTS_PER_SOL;
      const devnetBalance = devnetLamports / LAMPORTS_PER_SOL;
      const testnetBalance = testnetLamports / LAMPORTS_PER_SOL;

      setWalletSolBalance(currentBalance);

      if (currentBalance > 0) {
        setBalanceHint(null);
        return;
      }

      if (devnetBalance > 0 || testnetBalance > 0) {
        const target = devnetBalance >= testnetBalance ? "devnet" : "testnet";
        const amount = Math.max(devnetBalance, testnetBalance).toFixed(4);
        setBalanceHint(`Detected ${amount} SOL on ${target}. Switch RPC/network to ${target} to use it.`);
      } else {
        setBalanceHint("No SOL found on current/devnet/testnet for this wallet.");
      }
    } finally {
      setIsBalanceLoading(false);
    }
  }

  function refreshLockedCollateral(): void {
    const activeLoans = loadLoans().filter(
      (loan) => loan.status === "ACTIVE" && loan.collateralAsset === "SOL",
    );
    const locked = activeLoans.reduce(
      (sum, loan) => sum + (typeof loan.collateralAmount === "number" ? loan.collateralAmount : 0),
      0,
    );
    setLockedSolCollateral(locked);
  }

  useEffect(() => {
    void refreshSolBalance();
    refreshLockedCollateral();
  }, [publicKey, connection]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (collateralAmount <= 0) {
      setError("Collateral amount must be greater than 0.");
      return;
    }

    if (borrowAmount <= 0) {
      setError("Borrow amount must be greater than 0.");
      return;
    }

    if (collateralAsset === "SOL" && collateralAmount > availableSolBalance) {
      setError(`Insufficient available SOL. Max available is ${availableSolBalance.toFixed(4)} SOL.`);
      return;
    }

    if (!isWalletConnected) {
      setError("Connect your wallet first.");
      return;
    }

    try {
      setStep("ENCRYPTING");
      await new Promise((resolve) => setTimeout(resolve, 300));
      setStep("SUBMITTING");
      await onSubmitTrade({
        collateralAsset,
        collateralAmount,
        borrowAsset,
        borrowAmount,
        termDays,
      });
      setStep("COMPUTING");
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStep("DECRYPTING");
      await new Promise((resolve) => setTimeout(resolve, 400));
      setStep("DONE");
      refreshLockedCollateral();
      await refreshSolBalance();
    } catch (err) {
      setStep("ERROR");
      setError(err instanceof Error ? err.message : "Your private loan request could not be submitted.");
    }
  }

  return (
    <form onSubmit={submit} className="arcade-outline mx-auto max-w-2xl space-y-5 rounded-2xl bg-[rgb(var(--surface))] p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="arcade-chip">Network: {clusterLabel}</span>
          <span className="arcade-chip">Circuit: ArcLend Risk Engine</span>
        </div>
        <button
          type="button"
          className="arcade-btn arcade-btn-secondary px-3 py-1 text-xl"
          onClick={() => void refreshSolBalance()}
          title="Refresh wallet balance"
        >
          ↻
        </button>
      </div>

      <div className="arcade-outline rounded-xl bg-[rgb(var(--panel-soft))] p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xl font-bold">From (Collateral)</p>
          <div className="text-right">
            <p className="arcade-mono text-lg text-text-muted">
            Balance:{" "}
            {collateralAsset === "SOL"
              ? `${isBalanceLoading ? "..." : availableSolBalance.toFixed(4)} SOL`
              : `${collateralBalance.toFixed(2)} ${collateralAsset} (demo)`}
            </p>
            {collateralAsset === "SOL" ? (
              <p className="arcade-mono mt-1 text-xs text-text-muted">
                Wallet: {walletSolBalance.toFixed(4)} SOL • Locked: {lockedSolCollateral.toFixed(4)} SOL
              </p>
            ) : null}
            {collateralAsset === "SOL" && balanceHint ? (
              <p className="mt-1 text-xs font-semibold text-[#a16b00]">{balanceHint}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <input
            type="number"
            min={1}
            value={collateralAmount}
            onChange={(event) => setCollateralAmount(Number(event.target.value))}
            className="arcade-mono w-full rounded-lg border-[3px] border-black bg-transparent px-3 py-3 text-5xl font-bold text-text"
            required
          />
          <select
            value={collateralAsset}
            onChange={(event) => setCollateralAsset(event.target.value as CollateralAsset)}
            className="h-16 min-w-44 rounded-lg border-[3px] border-black bg-white px-4 text-2xl font-bold text-text"
          >
            <option value="SOL">SOL</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setCollateralAmount(Number((collateralBalance * 0.25).toFixed(2)))} className="arcade-btn arcade-btn-secondary px-3 py-1 text-sm">25%</button>
          <button type="button" onClick={() => setCollateralAmount(Number((collateralBalance * 0.5).toFixed(2)))} className="arcade-btn arcade-btn-secondary px-3 py-1 text-sm">50%</button>
          <button type="button" onClick={() => setCollateralAmount(Number((collateralBalance * 0.75).toFixed(2)))} className="arcade-btn arcade-btn-secondary px-3 py-1 text-sm">75%</button>
          <button type="button" onClick={() => setCollateralAmount(Number(collateralBalance.toFixed(2)))} className="arcade-btn arcade-btn-secondary px-3 py-1 text-sm">100%</button>
        </div>
      </div>

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-black bg-[rgb(var(--blue))] text-2xl text-[rgb(var(--brand-dark))]">
        ↓
      </div>

      <div className="arcade-outline rounded-xl bg-[rgb(var(--panel-strong))] p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xl font-bold">To (Borrow Est.)</p>
          <p className="arcade-mono text-lg text-text-muted">Term: {termDays} days</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <input
            type="number"
            min={1}
            value={borrowAmount}
            onChange={(event) => setBorrowAmount(Number(event.target.value))}
            className="arcade-mono w-full rounded-lg border-[3px] border-black bg-transparent px-3 py-3 text-5xl font-bold text-text"
            required
          />
          <select
            value={borrowAsset}
            onChange={(event) => setBorrowAsset(event.target.value as BorrowAsset)}
            className="h-16 min-w-44 rounded-lg border-[3px] border-black bg-white px-4 text-2xl font-bold text-text"
          >
            <option value="USDC">USDC</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-semibold text-text-muted">Adjust term</label>
          <input
            type="range"
            min={7}
            max={90}
            step={1}
            value={termDays}
            onChange={(event) => setTermDays(Number(event.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="font-semibold">Rate</p>
        <p className="arcade-mono font-bold">
          1 {collateralAsset} = {borrowRate} {borrowAsset}
        </p>
      </div>

      <MpcStatus step={step} />
      <p className="text-xs text-text-muted">
        LTV, interest accrual, and liquidation thresholds are evaluated inside encrypted Arcium state.
      </p>

      {error ? <p className="text-sm text-loss">{error}</p> : null}
      {step === "DONE" && !error ? (
        <p className="rounded-lg border-2 border-[#2c9b64] bg-[#ddffe8] px-4 py-3 text-sm font-bold text-[#14623c]">
          Transaction complete: Borrowed successfully.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="arcade-btn arcade-btn-primary w-full py-4 text-3xl disabled:opacity-60"
      >
        {!isWalletConnected
          ? "CONNECT WALLET TO BORROW"
          : step === "DONE"
            ? "BORROW SUCCESSFUL"
            : "OPEN PRIVATE LOAN"}
      </button>
    </form>
  );
}
