"use client";

import { ShieldCheck } from "lucide-react";
import { LoanPosition } from "@/types";

interface PositionCardProps {
  position: LoanPosition;
  healthMessage?: string;
  healthTone?: "ok" | "warn" | "error";
  checkingHealth?: boolean;
  repaying?: boolean;
  onCheckLiquidation: (id: string) => Promise<void>;
  onClosePosition: (id: string) => Promise<void>;
}

export function PositionCard({
  position,
  healthMessage,
  healthTone = "ok",
  checkingHealth = false,
  repaying = false,
  onCheckLiquidation,
  onClosePosition,
}: PositionCardProps) {
  return (
    <div className="arcade-outline rounded-2xl bg-[rgb(var(--panel-soft))] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-text">LOAN #{position.id}</p>
          <p className="mt-1 text-xs font-semibold text-text-muted">
            Collateral {position.collateralAsset} • Borrow {position.borrowAsset} • {position.termDays}d term
          </p>
        </div>
        <div className="arcade-chip flex items-center gap-2 text-xs text-text">
          <ShieldCheck className="h-3.5 w-3.5" />
          ENCRYPTED RISK STATE
        </div>
      </div>

      <p className="arcade-mono mt-4 text-sm text-text-muted">
        Opened {new Date(position.openedAt).toLocaleString()}
      </p>
      <p className="mt-2 text-sm text-text-muted">
        Collateral balance, borrow principal, live LTV, and health factor are not publicly exposed.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onCheckLiquidation(position.id)}
          className="arcade-btn arcade-btn-secondary text-sm disabled:opacity-60"
          disabled={checkingHealth}
        >
          {checkingHealth ? "CHECKING..." : "ENCRYPTED HEALTH CHECK"}
        </button>
        <button
          type="button"
          onClick={() => void onClosePosition(position.id)}
          className="arcade-btn arcade-btn-primary text-sm disabled:opacity-60"
          disabled={repaying}
        >
          {repaying ? "REPAYING..." : "REPAY AND CLOSE"}
        </button>
      </div>

      {healthMessage ? (
        <p
          className={`mt-3 rounded-lg border-2 px-3 py-2 text-sm font-semibold ${
            healthTone === "warn"
              ? "border-[#a16b00] bg-[#ffe7b2] text-[#6e4a00]"
              : healthTone === "error"
                ? "border-[#8a2d2d] bg-[#ffd8d8] text-[#6e1f1f]"
                : "border-[#2f6aa3] bg-[#dff1ff] text-[#103b63]"
          }`}
        >
          {healthMessage}
        </p>
      ) : null}
    </div>
  );
}
