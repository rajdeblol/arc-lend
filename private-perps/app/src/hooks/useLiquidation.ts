"use client";

import { useState } from "react";

export function useLiquidation() {
  const [status, setStatus] = useState<Record<string, boolean>>({});

  function setLiquidatable(positionId: string, value: boolean): void {
    setStatus((prev) => ({
      ...prev,
      [positionId]: value,
    }));
  }

  return {
    status,
    setLiquidatable,
  };
}
