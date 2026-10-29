import { currentPeriod } from "../../lib/date";
import type { AiInsightsData } from "../../types/aiInsights";

// Numbers match the Home mock (income 50M, expense 26.5M, net flow 23.5M, Food 5M, 18% / 750,000 insight).
export function getMockAiInsights(): AiInsightsData {
  const { year, month } = currentPeriod();
  const at = (day: number, hour: number, minute: number) =>
    new Date(year, month - 1, day, hour, minute).toISOString();

  const INCOME = 50_000_000;
  const EXPENSE = 26_500_000;
  const NET_FLOW = INCOME - EXPENSE;
  const FOOD = 5_000_000;

  return {
    generatedAt: new Date().toISOString(),
    health: { score: 86, transactionCount: 142, savingsRatePercent: Math.round((NET_FLOW / INCOME) * 100) },
    diagnostics: [
      { kind: "budgetAdherence", onTrack: 5, total: 5 },
      { kind: "topCategory", categoryName: "Housing", amount: 10_000_000, sharePercent: 37.7 },
    ],
    strategies: [
      {
        kind: "foodOutliers",
        id: "food-outliers",
        categoryName: "Food",
        amount: FOOD,
        changePercent: 18,
        monthlyRecovery: 750_000,
      },
      {
        kind: "recurring",
        id: "recurring",
        items: [
          { title: "Rent", amount: 10_000_000 },
          { title: "Metro & Bus", amount: 130_000 },
          { title: "Gym Membership", amount: 7_500_000 },
        ],
        monthsObserved: 2,
        monthlyTotal: 17_630_000,
      },
      {
        kind: "surplus",
        id: "surplus",
        netFlow: NET_FLOW,
        commitPercent: 65,
        depositAmount: Math.round((NET_FLOW * 65) / 100),
        goalName: "2026 Emergency Fund",
        monthsAhead: 2,
      },
    ],
    // Needs = Housing + Food + Transport; Wants = Entertainment + Other.
    mix: { income: INCOME, needs: 10_000_000 + FOOD + 3_000_000, wants: 2_500_000 + 6_000_000 },
    simulator: {
      startingBalance: 20_000_000 + NET_FLOW,
      monthlyIncome: INCOME,
      monthlyFixed: EXPENSE - FOOD,
      discretionaryBase: FOOD,
    },
    anomalies: [
      {
        kind: "unusual",
        id: "a1",
        occurredAt: at(8, 17, 35),
        categoryName: "Health",
        transactionTitle: "Gym Membership",
        amount: 7_500_000,
        typicalAmount: 2_500_000,
      },
      { kind: "spike", id: "a2", occurredAt: at(6, 21, 20), categoryName: "Food", changePercent: 18, averageAmount: 4_237_000 },
      { kind: "improvement", id: "a3", occurredAt: at(4, 9, 0), categoryName: "Transport", changePercent: 22 },
    ],
    checksActive: 8,
  };
}
