/** A calendar month. `month` is 1-12. */
export interface Period {
  year: number;
  month: number;
}

export interface BalancePoint {
  label: string; // x-axis label, format decided when the chart is built
  balance: number;
}

export interface BalanceSummary {
  /** Balance at the start of the selected month. */
  startingBalance: number;
  /** startingBalance + netFlow */
  currentBalance: number;
  netFlow: number;
  /** "Balance over time" line chart series. */
  trend: BalancePoint[];
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  amount: number;
  /** Share of total spending in the selected month, 0-100. */
  percent: number;
}

export interface MonthlyOverviewPoint {
  period: Period;
  income: number;
  expense: number;
  /** income - expense */
  netFlow: number;
}

export interface CashFlowSummary {
  income: number;
  expense: number;
  netFlow: number;
}

export interface BudgetItem {
  categoryId: string;
  name: string;
  budget: number;
  spent: number;
  /** spent / budget * 100 (per-category budget, not the total budget). */
  percentUsed: number;
}

/**
 * Everything the Home page needs for one selected period.
 * NOTE: Saving Goal is intentionally absent — its logic is under review.
 */
export interface HomeData {
  period: Period;
  balance: BalanceSummary;
  spendingByCategory: CategorySpending[];
  /** Always 6 entries: the current calendar month and the 5 before it. */
  monthlyOverview: MonthlyOverviewPoint[];
  cashFlow: CashFlowSummary;
  budgetOverview: BudgetItem[];
}
