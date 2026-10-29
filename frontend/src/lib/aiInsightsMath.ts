import type { SimulatorBase, SpendingMix } from "../types/aiInsights";

export type HealthTier = { tier: string; headline: string };

export function healthTier(score: number): HealthTier {
  if (score >= 80) return { tier: "Top Tier", headline: "Excellent Financial Health" };
  if (score >= 60) return { tier: "Solid", headline: "Good Financial Health" };
  return { tier: "Needs Attention", headline: "Your Finances Need Attention" };
}

export interface MixPercents {
  needs: number;
  wants: number;
  savings: number;
}

/** Whole percentages of income that always add up to 100. */
export function mixPercents(mix: SpendingMix): MixPercents {
  if (mix.income <= 0) return { needs: 0, wants: 0, savings: 0 };
  const needs = Math.round((mix.needs / mix.income) * 100);
  const wants = Math.round((mix.wants / mix.income) * 100);
  return { needs, wants, savings: Math.max(0, 100 - needs - wants) };
}

/** The 50/30/20 guideline used for the "AI Optimized Mix". */
export const OPTIMIZED_MIX: MixPercents = { needs: 50, wants: 30, savings: 20 };

export interface ProjectionPoint {
  label: string;
  baseline: number;
  projected: number;
}

export const SIMULATOR_MONTHS = 12;

/**
 * Straight-line balance projection (client-side, no randomness).
 * discretionaryPercent: -60..+100 relative to the current discretionary spend.
 * incomeChangePercent: -20..+20 relative to the current monthly income.
 */
export function projectBalance(
  base: SimulatorBase,
  discretionaryPercent: number,
  incomeChangePercent: number,
  now: Date = new Date(),
): ProjectionPoint[] {
  const baselineNet = base.monthlyIncome - base.monthlyFixed - base.discretionaryBase;
  const income = base.monthlyIncome * (1 + incomeChangePercent / 100);
  const discretionary = base.discretionaryBase * (1 + discretionaryPercent / 100);
  const projectedNet = income - base.monthlyFixed - discretionary;
  const monthName = new Intl.DateTimeFormat("en-US", { month: "short" });

  return Array.from({ length: SIMULATOR_MONTHS + 1 }, (_, step) => ({
    label: step === 0 ? "Now" : monthName.format(new Date(now.getFullYear(), now.getMonth() + step, 1)),
    baseline: Math.round(base.startingBalance + step * baselineNet),
    projected: Math.round(base.startingBalance + step * projectedNet),
  }));
}

/** What trimming `trimPercent` of the discretionary spend adds to the balance over the whole projection. */
export function trimGain(base: SimulatorBase, trimPercent: number) {
  const monthly = (base.discretionaryBase * trimPercent) / 100;
  return {
    limit: Math.round(base.discretionaryBase - monthly),
    gain: Math.round(monthly * SIMULATOR_MONTHS),
  };
}
