// Static assets exported from Figma by `npm run assets:figma` (see scripts/fetch-figma-assets.mjs).
//
// Assets are looked up with a glob instead of fixed imports, so a file that has not been
// exported yet (or failed to export) shows up as an empty image plus a console warning
// instead of crashing the whole app.
const urls = import.meta.glob<string>("./**/*.{svg,png}", { eager: true, query: "?url", import: "default" });

const MISSING = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

function asset(path: string): string {
  const url = urls[path];
  if (!url) {
    console.warn(`[assets] Missing "${path}". Run: npm run assets:figma`);
    return MISSING;
  }
  return url;
}

export const logo = asset("./finluxa-logo.svg");
export const navHomeIcon = asset("./icons/nav-home.svg");
export const navTransactionsIcon = asset("./icons/nav-transactions.svg");
export const navAnalyticsIcon = asset("./icons/nav-analytics.svg");
export const navAiInsightsIcon = asset("./icons/nav-ai-insights.svg");
export const navSettingsIcon = asset("./icons/nav-settings.svg");
export const navHelpIcon = asset("./icons/nav-help.svg");
export const heartIcon = asset("./icons/heart.svg");
export const dateIcon = asset("./icons/date.svg");
export const chevronDownIcon = asset("./icons/chevron-down.svg");
export const profileMenu = asset("./icons/profile-menu.svg");
export const notificationButton = asset("./icons/notification-button.svg");

// Current Balance card
export const balanceCardBg = asset("./cards/current-balance/card.svg");
export const balanceWalletIcon = asset("./cards/current-balance/wallet.svg");
export const balanceStartingBg = asset("./cards/current-balance/starting-balance-bg.svg");
export const balanceStartingIcon = asset("./cards/current-balance/starting-balance-icon.svg");
export const balanceTrendUpIcon = asset("./cards/current-balance/trend-up.svg");
export const balanceChevronRight = asset("./cards/current-balance/chevron-right.svg");

// Cash Flow card
export const cashFlowCardBg = asset("./cards/cash-flow/card.svg");
export const cashFlowDivider = asset("./cards/cash-flow/divider.svg");
export const cashFlowIcon = asset("./cards/cash-flow/icon.svg");
export const cashFlowIncomeBg = asset("./cards/cash-flow/income-bg.svg");
export const cashFlowIncomeIcon = asset("./cards/cash-flow/income-icon.svg");
export const cashFlowExpenseBg = asset("./cards/cash-flow/expense-bg.svg");
export const cashFlowExpenseIcon = asset("./cards/cash-flow/expense-icon.svg");
export const cashFlowNetBg = asset("./cards/cash-flow/net-flow-bg.svg");
export const cashFlowNetIcon = asset("./cards/cash-flow/net-flow-icon.svg");

// Budget Overview card
export const budgetCardBg = asset("./cards/budget/card.svg");
export const budgetOverviewIcon = asset("./cards/budget/icon.svg");
export const budgetFoodIcon = asset("./cards/budget/food.svg");
export const budgetHousingIcon = asset("./cards/budget/housing.svg");
export const budgetTransportIcon = asset("./cards/budget/transport.svg");
export const budgetEntertainmentIcon = asset("./cards/budget/entertainment.svg");

// Spending by Category card
export const spendingCardBg = asset("./cards/spending/card.svg");
export const spendingIconBg = asset("./cards/spending/icon-bg.svg");
export const spendingIcon = asset("./cards/spending/icon.svg");

// Saving Goal card
export const savingCardBg = asset("./cards/saving-goal/card.svg");
export const savingIconBg = asset("./cards/saving-goal/icon-bg.svg");
export const savingIcon = asset("./cards/saving-goal/icon.svg");
export const savingMore = asset("./cards/saving-goal/more.svg");
export const savingStatusCard = asset("./cards/saving-goal/status-card.svg");
export const savingLightIcon = asset("./cards/saving-goal/light-icon.svg");

// AI Insight card
export const aiCardBg = asset("./cards/ai-insight/card.svg");
export const aiIcon = asset("./cards/ai-insight/icon.svg");
export const aiIllustration = asset("./cards/ai-insight/illustration.svg");
export const aiButtonBg = asset("./cards/ai-insight/button-bg.svg");
export const aiArrowRight = asset("./cards/ai-insight/arrow-right.svg");

// Monthly Overview card
export const monthlyCardBg = asset("./cards/monthly-overview/card.svg");
export const monthlyIcon = asset("./cards/monthly-overview/icon.svg");

// Small steps card
export const smallStepsCardBg = asset("./cards/small-steps/card.svg");
export const smallStepsIllustration = asset("./cards/small-steps/illustration.svg");
export const smallStepsButtonBg = asset("./cards/small-steps/button-bg.svg");
export const smallStepsArrowRight = asset("./cards/small-steps/arrow-right.svg");
