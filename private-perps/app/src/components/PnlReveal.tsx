"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import { PnlResult } from "@/types";

interface PnlRevealProps {
  value: PnlResult;
}

export function PnlReveal({ value }: PnlRevealProps) {
  const colorClass = value.isProfit ? "text-profit" : "text-loss";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border border-surface-border bg-surface p-4"
    >
      <p className="text-sm text-text-muted">Realized PnL</p>
      <p className={`mt-2 text-2xl font-semibold ${colorClass}`}>
        <CountUp
          start={0}
          end={value.realizedPnl}
          duration={1}
          decimals={2}
          prefix="$"
          formattingFn={(num) => `${num < 0 ? "-$" : "$"}${Math.abs(num).toFixed(2)}`}
        />
      </p>
      <p className="mt-1 text-xs text-text-muted">Only you can view this final result.</p>
    </motion.div>
  );
}
