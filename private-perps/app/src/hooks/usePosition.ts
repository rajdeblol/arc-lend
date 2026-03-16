"use client";

import { useCallback, useMemo, useState } from "react";
import { PositionMeta } from "@/types";

export function usePosition() {
  const [positions, setPositions] = useState<PositionMeta[]>([]);

  const openPositions = useMemo(() => positions.filter((item) => item.isOpen), [positions]);
  const closedPositions = useMemo(() => positions.filter((item) => !item.isOpen), [positions]);

  const addPosition = useCallback((position: PositionMeta) => {
    setPositions((prev) => [position, ...prev]);
  }, []);

  const closePositionById = useCallback((id: string) => {
    setPositions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isOpen: false,
            }
          : item,
      ),
    );
  }, []);

  return {
    positions,
    openPositions,
    closedPositions,
    addPosition,
    closePositionById,
  };
}
