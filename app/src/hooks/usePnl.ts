"use client";

import { useMemo, useState } from "react";
import { PnlResult } from "@/types";

export function usePnl() {
  const [results, setResults] = useState<Record<string, PnlResult>>({});

  function setPnl(positionId: string, result: PnlResult): void {
    setResults((prev) => ({
      ...prev,
      [positionId]: result,
    }));
  }

  const totalRealizedPnl = useMemo(
    () => Object.values(results).reduce((sum, item) => sum + item.realizedPnl, 0),
    [results],
  );

  return {
    results,
    setPnl,
    totalRealizedPnl,
  };
}
