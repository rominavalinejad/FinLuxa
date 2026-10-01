import { lastSixMonths } from "../../lib/date";
import type { HomeData, Period } from "../../types/home";

// Demo numbers taken from the Figma Home frame / Notion examples.
const INCOME = 50_000_000;
const EXPENSE = 26_500_000;
const NET_FLOW = INCOME - EXPENSE; // 23,500,000
const STARTING_BALANCE = 20_000_000; // mock only — real definition still pending

const SPENDING = [
  { categoryId: "housing", name: "Housing", amount: 10_000_000 },
  { categoryId: "food", name: "Food", amount: 5_000_000 },
  { categoryId: "transport", name: "Transport", amount: 3_000_000 },
  { categoryId: "entertainment", name: "Entertainment", amount: 2_500_000 },
  { categoryId: "other", name: "Other", amount: 6_000_000 },
];

const BUDGETS: Record<string, number> = {
  housing: 12_000_000,
  food: 6_000_000,
  transport: 4_000_000,
  entertainment: 3_000_000,
  other: 8_000_000,
};

const MONTHLY_MOCK: [number, number][] = [
  [30_000_000, 22_000_000],
  [42_000_000, 28_000_000],
  [38_000_000, 25_000_000],
  [40_000_000, 30_000_000],
  [48_000_000, 27_000_000],
  [INCOME, EXPENSE],
];

export function getMockHomeData(period: Period): HomeData {
  const months = lastSixMonths();
  return {
    period,
    balance: {
      startingBalance: STARTING_BALANCE,
      currentBalance: STARTING_BALANCE + NET_FLOW,
      netFlow: NET_FLOW,
      trend: [
        { label: "W1", balance: STARTING_BALANCE },
        { label: "W2", balance: STARTING_BALANCE + 6_000_000 },
        { label: "W3", balance: STARTING_BALANCE + 15_000_000 },
        { label: "W4", balance: STARTING_BALANCE + NET_FLOW },
      ],
    },
    spendingByCategory: SPENDING.map((item) => ({
      ...item,
      percent: Math.round((item.amount / EXPENSE) * 1000) / 10,
    })),
    monthlyOverview: months.map((p, i) => ({
      period: p,
      income: MONTHLY_MOCK[i][0],
      expense: MONTHLY_MOCK[i][1],
      netFlow: MONTHLY_MOCK[i][0] - MONTHLY_MOCK[i][1],
    })),
    cashFlow: { income: INCOME, expense: EXPENSE, netFlow: NET_FLOW },
    budgetOverview: SPENDING.map((item) => ({
      categoryId: item.categoryId,
      name: item.name,
      budget: BUDGETS[item.categoryId],
      spent: item.amount,
      percentUsed: Math.round((item.amount / BUDGETS[item.categoryId]) * 1000) / 10,
    }))
      .sort((a, b) => b.percentUsed - a.percentUsed) // ordering rule still pending confirmation
      .slice(0, 4),
  };
}
