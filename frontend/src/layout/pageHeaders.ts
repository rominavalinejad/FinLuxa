import { monthName } from "../lib/date";
import type { Period } from "../types/home";

export interface HeaderContent {
  title: string;
  subtitle: string;
  /** The small heart after the greeting (Home only). */
  showHeart: boolean;
  /** The month/year selector that drives PeriodContext (Home only). */
  showDateSelector: boolean;
  /** The "Compare to Last Month" button (Transactions only; demo for now). */
  showCompare: boolean;
}

interface HeaderContext {
  greeting: string;
  userName: string;
  period: Period;
}

/**
 * Title / subtitle / controls of the shared Header per route.
 * Routes without their own Figma header keep the Home header (existing behaviour).
 */
export function getHeaderContent(pathname: string, ctx: HeaderContext): HeaderContent {
  if (pathname === "/settings") {
    return {
      title: "Settings",
      subtitle: "Manage your account and preferences.",
      showHeart: false,
      showDateSelector: false,
      showCompare: false,
    };
  }
  if (pathname === "/transactions") {
    return {
      title: "Transactions",
      subtitle: "All your income and expenses in one place.",
      showHeart: false,
      showDateSelector: false,
      showCompare: true,
    };
  }
  if (pathname === "/ai-insights") {
    return {
      title: "AI Insights",
      subtitle: "Smart suggestions, spending patterns and projections based on your own transactions.",
      showHeart: false,
      showDateSelector: false,
      showCompare: false,
    };
  }
  return {
    title: `${ctx.greeting} ${ctx.userName}`,
    subtitle: `Here’s your financial overview for ${monthName(ctx.period)} ${ctx.period.year}.`,
    showHeart: true,
    showDateSelector: true,
    showCompare: false,
  };
}
