export type PerpAsset = "SOL-PERP" | "BTC-PERP" | "ETH-PERP";
export type CollateralAsset = "SOL" | "BTC" | "ETH";
export type BorrowAsset = "USDC";

export interface PositionMeta {
  id: string;
  owner: string;
  asset: PerpAsset;
  side: "LONG" | "SHORT";
  openedAt: number;
  isOpen: boolean;
  encryptedState: string;
}

export interface PnlResult {
  realizedPnl: number;
  isProfit: boolean;
}

export interface EncryptedPayload {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

export type MpcStep =
  | "IDLE"
  | "ENCRYPTING"
  | "SUBMITTING"
  | "COMPUTING"
  | "DECRYPTING"
  | "DONE"
  | "ERROR";

export interface PriceSnapshot {
  asset: PerpAsset;
  price: number;
  source: "JUPITER" | "PYTH";
  updatedAt: number;
}

export interface LoanPosition {
  id: string;
  owner: string;
  collateralAsset: CollateralAsset;
  collateralAmount: number;
  borrowAsset: BorrowAsset;
  openedAt: number;
  status: "ACTIVE" | "REPAID";
  termDays: number;
  encryptedState: string;
  encryptedHealthState: string;
}

export interface LoanSettlement {
  totalRepaid: number;
  interestPaid: number;
  settledAt: number;
}
