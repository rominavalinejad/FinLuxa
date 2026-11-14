export type HelpTopic = "start" | "transactions" | "budgets" | "insights" | "settings";

export const HELP_TOPICS: { id: HelpTopic; label: string }[] = [
  { id: "start", label: "Getting started" },
  { id: "transactions", label: "Transactions" },
  { id: "budgets", label: "Budgets" },
  { id: "insights", label: "AI Insights" },
  { id: "settings", label: "Settings" },
];

export interface FaqItem {
  id: string;
  topic: HelpTopic;
  question: string;
  answer: string;
}

/*
 * Every answer describes what the app does today (checked against the current pages).
 * When a feature changes or ships (editing transactions, applying language / theme app-wide,
 * AI suggestion actions), update the matching answer here — this file is the only place to edit.
 */
export const FAQ: FaqItem[] = [
  // Getting started
  {
    id: "what-is-finluxa",
    topic: "start",
    question: "What is FinLuxa?",
    answer:
      "FinLuxa is a personal finance app. You record your income and expenses, set monthly budgets, and FinLuxa turns that into balance and spending charts and suggestions for saving more.",
  },
  {
    id: "home-overview",
    topic: "start",
    question: "What do I see on the Home page?",
    answer:
      "Your current balance and how it changed since the start of the month, your cash flow (income, expense and net flow), spending by category, your budgets, and a six-month overview.",
  },
  {
    id: "net-flow",
    topic: "start",
    question: "What is Net Flow?",
    answer:
      "Net Flow is your income minus your expenses for the month. A positive number means you kept money; a negative number means you spent more than you earned.",
  },
  {
    id: "starting-balance",
    topic: "start",
    question: "What is the Starting Balance?",
    answer:
      "It is your balance at the beginning of the selected month: everything you earned minus everything you spent in the months before it. Your current balance is the Starting Balance plus the month’s Net Flow.",
  },

  // Transactions
  {
    id: "add-transaction",
    topic: "transactions",
    question: "How do I add a transaction?",
    answer:
      "Open Transactions and use the Add New Transaction panel. Choose Income or Expense, then fill in the title, amount, date and category. The note is optional. Press Add Transaction to save it. If the panel is closed, press Add New above the table.",
  },
  {
    id: "find-transaction",
    topic: "transactions",
    question: "How do I find a specific transaction?",
    answer:
      "Type part of the title in the search bar, and narrow the list with the Type, Category and Date filters. The filters work together, so each one you add shortens the list further.",
  },
  {
    id: "category-missing",
    topic: "transactions",
    question: "Why can’t I see my category in the list?",
    answer:
      "Income and expense categories are separate lists. The category menu shows only the categories that match the type you selected, so switch between Income and Expense to see the other list.",
  },
  {
    id: "edit-delete",
    topic: "transactions",
    question: "Can I edit or delete a transaction?",
    answer:
      "Not yet. The three-dot menu on each row is a preview, and editing or deleting is not available at the moment. Check your entry before you save it.",
  },

  // Budgets
  {
    id: "how-budgets-work",
    topic: "budgets",
    question: "How do budgets work?",
    answer:
      "A budget is a monthly spending limit for one expense category. Budget Overview on Home shows how much of each limit you have used, with the categories closest to their limit first.",
  },
  {
    id: "budget-percent",
    topic: "budgets",
    question: "What does the percentage next to a budget mean?",
    answer:
      "It is the amount you spent in that category divided by the category’s budget. At 100% you have used the whole limit for the month.",
  },

  // AI Insights
  {
    id: "health-index",
    topic: "insights",
    question: "What is the Health Index?",
    answer:
      "A score from 0 to 100 that sums up how your month is going. It appears together with your savings rate and the number of budgets that are on track.",
  },
  {
    id: "spending-mix",
    topic: "insights",
    question: "What is the 50/30/20 mix?",
    answer:
      "A common guideline that splits income into 50% needs, 30% wants and 20% savings. Spending Mix shows your own split, and the AI Optimized Mix view shows the guideline next to it.",
  },
  {
    id: "simulator",
    topic: "insights",
    question: "What does the Projected Balance Simulator do?",
    answer:
      "Move the two sliders to see how spending less on discretionary items, or earning more or less, would change your balance over the next 12 months. It is a straight-line projection from your current numbers, not a forecast.",
  },
  {
    id: "suggestions-apply",
    topic: "insights",
    question: "Do the suggested strategies change my data?",
    answer:
      "No. For now the strategy buttons are a preview: they mark the suggestion as done for this visit, and nothing in your budgets or goals changes.",
  },

  // Settings
  {
    id: "edit-profile",
    topic: "settings",
    question: "How do I change my name, email or photo?",
    answer:
      "Go to Settings, press Edit Profile, make your changes, then press Edit Profile again to save. Member Since cannot be changed.",
  },
  {
    id: "currency",
    topic: "settings",
    question: "What does the currency setting do?",
    answer:
      "It changes the currency symbol shown after your amounts. It does not convert your numbers from one currency to another.",
  },
  {
    id: "language-theme",
    topic: "settings",
    question: "Can I change the language or switch to dark mode?",
    answer:
      "You can choose a language and an appearance (Light, Dark or System) in Settings, under Preferences. Applying them across the whole app is still in progress, so you may not see every page change yet.",
  },
];

/** Case-insensitive: every word of the query must appear in the question or the answer. */
export function filterFaq(items: FaqItem[], query: string, topic: HelpTopic | "all"): FaqItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    if (topic !== "all" && item.topic !== topic) return false;
    const haystack = `${item.question} ${item.answer}`.toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}
