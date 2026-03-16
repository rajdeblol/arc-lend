import { LoanPosition, LoanSettlement, PnlResult, PositionMeta } from "@/types";

const POSITIONS_KEY = "arclend.positions";
const PNL_KEY = "arclend.pnl";
const LOANS_KEY = "private-lend.loans";
const SETTLEMENTS_KEY = "private-lend.settlements";

export function loadPositions(): PositionMeta[] {
  if (typeof window === "undefined") {
    return [];
  }
  const value = window.localStorage.getItem(POSITIONS_KEY);
  if (!value) {
    return [];
  }
  try {
    return JSON.parse(value) as PositionMeta[];
  } catch {
    return [];
  }
}

export function savePositions(positions: PositionMeta[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(POSITIONS_KEY, JSON.stringify(positions));
}

export function loadPnl(): Record<string, PnlResult> {
  if (typeof window === "undefined") {
    return {};
  }
  const value = window.localStorage.getItem(PNL_KEY);
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value) as Record<string, PnlResult>;
  } catch {
    return {};
  }
}

export function savePnl(pnl: Record<string, PnlResult>): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PNL_KEY, JSON.stringify(pnl));
}

export function loadLoans(): LoanPosition[] {
  if (typeof window === "undefined") {
    return [];
  }
  const value = window.localStorage.getItem(LOANS_KEY);
  if (!value) {
    return [];
  }
  try {
    return JSON.parse(value) as LoanPosition[];
  } catch {
    return [];
  }
}

export function saveLoans(loans: LoanPosition[]): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOANS_KEY, JSON.stringify(loans));
}

export function loadSettlements(): Record<string, LoanSettlement> {
  if (typeof window === "undefined") {
    return {};
  }
  const value = window.localStorage.getItem(SETTLEMENTS_KEY);
  if (!value) {
    return {};
  }
  try {
    return JSON.parse(value) as Record<string, LoanSettlement>;
  } catch {
    return {};
  }
}

export function saveSettlements(records: Record<string, LoanSettlement>): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SETTLEMENTS_KEY, JSON.stringify(records));
}
