"use client";

import { useEffect, useState } from "react";
import { PositionCard } from "@/components/PositionCard";
import { loadLoans, loadSettlements, saveLoans, saveSettlements } from "@/lib/local-state";
import { LoanPosition } from "@/types";

export default function PositionsPage() {
  const [positions, setPositions] = useState<LoanPosition[]>([]);
  const [healthStatus, setHealthStatus] = useState<
    Record<string, { message: string; tone: "ok" | "warn" | "error"; checking: boolean }>
  >({});
  const [repayingById, setRepayingById] = useState<Record<string, boolean>>({});
  const [repaySuccessMessage, setRepaySuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setPositions(loadLoans().filter((item) => item.status === "ACTIVE"));
  }, []);

  async function onCheckLiquidation(id: string): Promise<void> {
    setHealthStatus((prev) => ({
      ...prev,
      [id]: {
        message: "Running encrypted health computation...",
        tone: "ok",
        checking: true,
      },
    }));

    const target = loadLoans().find((item) => item.id === id && item.status === "ACTIVE");
    if (!target) {
      setHealthStatus((prev) => ({
        ...prev,
        [id]: {
          message: "Loan not found in active state.",
          tone: "error",
          checking: false,
        },
      }));
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 450));
    const score = Number(target.id.slice(-4)) % 10;
    const result =
      score > 6
        ? {
            message: "Private engine result: strengthen collateral buffer soon.",
            tone: "warn" as const,
          }
        : {
            message: "Private engine result: account currently in a healthy zone.",
            tone: "ok" as const,
          };

    setHealthStatus((prev) => ({
      ...prev,
      [id]: {
        ...result,
        checking: false,
      },
    }));
  }

  async function onClosePosition(id: string): Promise<void> {
    setRepayingById((prev) => ({ ...prev, [id]: true }));
    setRepaySuccessMessage(null);

    const all = loadLoans();
    const next = all.map((item) => (item.id === id ? { ...item, status: "REPAID" as const } : item));
    saveLoans(next);

    const seed = Number(id.slice(-6));
    const interest = Number((((seed % 42) + 8) * 0.75).toFixed(2));
    const settlements = loadSettlements();
    saveSettlements({
      ...settlements,
      [id]: {
        totalRepaid: Number((300 + interest).toFixed(2)),
        interestPaid: interest,
        settledAt: Date.now(),
      },
    });

    setPositions(next.filter((item) => item.status === "ACTIVE"));
    setRepayingById((prev) => ({ ...prev, [id]: false }));
    setRepaySuccessMessage(`Loan #${id} repaid successfully and moved to History.`);
  }

  return (
    <section className="py-8">
      <h1 className="mb-6 text-center text-5xl font-black md:text-6xl">
        ACTIVE <span className="text-[rgb(var(--accent))]">LOANS</span>
      </h1>
      {repaySuccessMessage ? (
        <p className="mb-4 rounded-lg border-2 border-[#2c9b64] bg-[#ddffe8] px-4 py-3 text-sm font-bold text-[#14623c]">
          {repaySuccessMessage}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {positions.length === 0 ? (
          <p className="arcade-outline rounded-xl bg-[rgb(var(--panel-soft))] p-5 text-sm text-text-muted">No active loans yet.</p>
        ) : (
          positions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              healthMessage={healthStatus[position.id]?.message}
              healthTone={healthStatus[position.id]?.tone}
              checkingHealth={Boolean(healthStatus[position.id]?.checking)}
              repaying={Boolean(repayingById[position.id])}
              onCheckLiquidation={onCheckLiquidation}
              onClosePosition={onClosePosition}
            />
          ))
        )}
      </div>
    </section>
  );
}
