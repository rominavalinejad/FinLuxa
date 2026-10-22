import type { Period } from "../types/home";
import type { Transaction, TransactionCategory, TransactionType } from "../types/transactions";

export const PAGE_SIZE = 10;

export type DatePreset = "all" | "today" | "last7" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisYear", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export interface TransactionFilters {
  /** Matches the Title only. */
  search: string;
  type: "all" | TransactionType;
  /** "all" or `${type}:${categoryId}`, see categoryKey(). */
  categoryKey: string;
  datePreset: DatePreset;
  /** "YYYY-MM-DD" or "" (only used by the custom range). */
  customFrom: string;
  customTo: string;
}

export const DEFAULT_FILTERS: TransactionFilters = {
  search: "",
  type: "all",
  categoryKey: "all",
  datePreset: "all",
  customFrom: "",
  customTo: "",
};

export const categoryKey = (category: Pick<TransactionCategory, "id" | "type">) => `${category.type}:${category.id}`;

/** "2026-10-14" -> local midnight of that day. */
export function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** [from, to) range of a date filter; null on a side means "no limit". */
export function dateRange(filters: TransactionFilters, now: Date): { from: Date | null; to: Date | null } {
  const today = startOfDay(now);
  switch (filters.datePreset) {
    case "today":
      return { from: today, to: addDays(today, 1) };
    case "last7":
      return { from: addDays(today, -6), to: addDays(today, 1) };
    case "thisMonth":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
    case "lastMonth":
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1) };
    case "thisYear":
      return { from: new Date(now.getFullYear(), 0, 1), to: new Date(now.getFullYear() + 1, 0, 1) };
    case "custom":
      return {
        from: filters.customFrom ? parseLocalDate(filters.customFrom) : null,
        to: filters.customTo ? addDays(parseLocalDate(filters.customTo), 1) : null,
      };
    default:
      return { from: null, to: null };
  }
}

/** Search + Type + Category + Date (all combined with AND), newest first. */
export function applyFilters(list: Transaction[], filters: TransactionFilters, now: Date = new Date()): Transaction[] {
  const query = filters.search.trim().toLowerCase();
  const { from, to } = dateRange(filters, now);

  return list
    .filter((item) => {
      if (query && !item.title.toLowerCase().includes(query)) return false;
      if (filters.type !== "all" && item.type !== filters.type) return false;
      if (filters.categoryKey !== "all" && categoryKey({ id: item.categoryId, type: item.type }) !== filters.categoryKey) {
        return false;
      }
      const at = new Date(item.occurredAt);
      if (from && at < from) return false;
      if (to && at >= to) return false;
      return true;
    })
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

/** Totals of the three summary cards for the app-wide month (Home's Date selector). */
export function summarize(list: Transaction[], period: Period) {
  let income = 0;
  let expense = 0;
  for (const item of list) {
    const at = new Date(item.occurredAt);
    if (at.getFullYear() !== period.year || at.getMonth() + 1 !== period.month) continue;
    if (item.type === "income") income += item.amount;
    else expense += item.amount;
  }
  return { income, expense, netFlow: income - expense };
}
