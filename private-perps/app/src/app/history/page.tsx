"use client";

import { useEffect, useState } from "react";
import { loadLoans, loadSettlements } from "@/lib/local-state";
import { LoanPosition, LoanSettlement } from "@/types";

export default function HistoryPage() {
  const [rows, setRows] = useState<Array<{ position: LoanPosition; settlement: LoanSettlement }>>([]);

  useEffect(() => {
    const all = loadLoans().filter((item) => item.status === "REPAID");
    const settlements = loadSettlements();

    const mapped = all
      .map((position) => ({
        position,
        settlement: settlements[position.id],
      }))
      .filter((item): item is { position: LoanPosition; settlement: LoanSettlement } => Boolean(item.settlement));

    setRows(mapped);
  }, []);

  return (
    <section className="py-8">
      <h1 className="mb-6 text-center text-5xl font-black md:text-6xl">
        REPAYMENT <span className="text-[rgb(var(--accent))]">HISTORY</span>
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.length === 0 ? (
          <p className="arcade-outline rounded-xl bg-[rgb(var(--panel-soft))] p-5 text-sm text-text-muted">No settled loans yet.</p>
        ) : (
          rows.map(({ position, settlement }) => (
            <div key={position.id} className="arcade-outline space-y-3 rounded-2xl bg-[rgb(var(--panel-soft))] p-5">
              <p className="text-sm font-semibold text-text-muted">
                Loan #{position.id} • {position.collateralAsset} collateral • {position.borrowAsset} debt
              </p>
              <p className="text-sm text-text">
                Interest settled privately: <span className="font-bold">{settlement.interestPaid} USDC</span>
              </p>
              <p className="arcade-mono text-sm text-text-muted">
                Total repaid: {settlement.totalRepaid} USDC on{" "}
                {new Date(settlement.settledAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
