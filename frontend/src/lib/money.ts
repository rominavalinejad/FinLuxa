import type { TransactionType } from "../types/transactions";
import { CURRENCIES } from "./currencies";
import { formatAmount } from "./format";

/** Symbol of the currency chosen in Settings (falls back to the ISO code). */
export function currencySymbol(code: string): string {
  return CURRENCIES.find((currency) => currency.code === code)?.symbol ?? code;
}

/** "+ 25,000,000 ﷼" / "- 50,000 ﷼": the currency always comes after the number. */
export function formatSignedAmount(amount: number, type: TransactionType, symbol: string): string {
  const sign = type === "income" ? "+" : "-";
  return `${sign} ${formatAmount(amount)} ${symbol}`;
}
