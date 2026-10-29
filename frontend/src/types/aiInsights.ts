/** Data contract of the AI Insights page (to be mirrored by FastAPI + Brain later). */

export interface HealthSummary {
  /** 0-100. The formula will live in Brain; the mock returns a fixed value. */
  score: number;
  transactionCount: number;
  savingsRatePercent: number;
}

export type Diagnostic =
  | { kind: "budgetAdherence"; onTrack: number; total: number }
  | { kind: "topCategory"; categoryName: string; amount: number; sharePercent: number };

export type Strategy =
  | {
      kind: "foodOutliers";
      id: string;
      categoryName: string;
      amount: number;
      changePercent: number;
      monthlyRecovery: number;
    }
  | {
      kind: "recurring";
      id: string;
      items: { title: string; amount: number }[];
      monthsObserved: number;
      monthlyTotal: number;
    }
  | {
      kind: "surplus";
      id: string;
      netFlow: number;
      commitPercent: number;
      depositAmount: number;
      goalName: string;
      monthsAhead: number;
    };

/** Amounts of the selected month; savings = income - needs - wants. */
export interface SpendingMix {
  income: number;
  needs: number;
  wants: number;
}

/** Monthly figures the simulator starts from. */
export interface SimulatorBase {
  startingBalance: number;
  monthlyIncome: number;
  /** Everything that is not discretionary. */
  monthlyFixed: number;
  discretionaryBase: number;
}

export type Anomaly =
  | {
      kind: "unusual";
      id: string;
      occurredAt: string;
      categoryName: string;
      transactionTitle: string;
      amount: number;
      typicalAmount: number;
    }
  | { kind: "spike"; id: string; occurredAt: string; categoryName: string; changePercent: number; averageAmount: number }
  | { kind: "improvement"; id: string; occurredAt: string; categoryName: string; changePercent: number };

export interface AiInsightsData {
  /** ISO date-time of the last analysis. */
  generatedAt: string;
  health: HealthSummary;
  diagnostics: Diagnostic[];
  strategies: Strategy[];
  mix: SpendingMix;
  simulator: SimulatorBase;
  anomalies: Anomaly[];
  checksActive: number;
}
