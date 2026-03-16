"use client";

import { useEffect, useState } from "react";
import { fetchAssetPrice } from "@/lib/prices";
import { PerpAsset, PriceSnapshot } from "@/types";

export function PriceOracle({ asset }: { asset: PerpAsset }) {
  const [snapshot, setSnapshot] = useState<PriceSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const next = await fetchAssetPrice(asset);
        if (alive) {
          setSnapshot(next);
          setError(null);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Price feed unavailable.");
        }
      }
    };

    void load();
    const id = setInterval(() => {
      void load();
    }, 20_000);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [asset]);

  if (error) {
    return <p className="text-sm text-loss">{error}</p>;
  }

  if (!snapshot) {
    return <p className="text-sm text-text-muted">Loading live market price...</p>;
  }

  return (
    <p className="text-sm text-text-muted">
      {asset}: <span className="font-medium text-text">${snapshot.price.toFixed(2)}</span>
    </p>
  );
}
