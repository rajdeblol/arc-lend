import { PerpAsset, PriceSnapshot } from "@/types";

const JUPITER_IDS: Record<PerpAsset, string> = {
  "SOL-PERP": "So11111111111111111111111111111111111111112",
  "BTC-PERP": "qfnqNqsob7wL4Jj6wJ6hN6K5m2sAfW8i9zY2e6xfgxM",
  "ETH-PERP": "7vfCXTUXx5W3x9akH8Q6P5N22ocL9fB7Yz3sFs8NHQvG",
};

async function fetchJupiterPrice(asset: PerpAsset): Promise<PriceSnapshot> {
  const id = JUPITER_IDS[asset];
  const endpoint = `https://price.jup.ag/v6/price?ids=${id}`;
  const response = await fetch(endpoint, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Live pricing is temporarily unavailable.");
  }

  const json = (await response.json()) as {
    data?: Record<string, { price?: number }>;
  };

  const price = json.data?.[id]?.price;
  if (!price || Number.isNaN(price)) {
    throw new Error("Could not read a valid market price.");
  }

  return {
    asset,
    price,
    source: "JUPITER",
    updatedAt: Date.now(),
  };
}

export async function fetchAssetPrice(asset: PerpAsset): Promise<PriceSnapshot> {
  return fetchJupiterPrice(asset);
}
