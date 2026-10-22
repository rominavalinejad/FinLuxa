import { currentPeriod } from "../../lib/date";
import type { Transaction, TransactionCategory, TransactionType } from "../../types/transactions";

// Category ids reuse the keys of pages/Home/cards/categoryStyle.ts where one exists.
// Colours / icons for the others (salary, freelance, health, education) are decided later.
export const MOCK_CATEGORIES: TransactionCategory[] = [
  { id: "salary", name: "Salary", type: "income" },
  { id: "freelance", name: "Freelance", type: "income" },
  { id: "housing", name: "Housing", type: "expense" },
  { id: "food", name: "Food", type: "expense" },
  { id: "transport", name: "Transportation", type: "expense" },
  { id: "entertainment", name: "Entertainment", type: "expense" },
  { id: "health", name: "Health", type: "expense" },
  { id: "education", name: "Education", type: "expense" },
];

const categoryName = (type: TransactionType, id: string) =>
  MOCK_CATEGORIES.find((category) => category.type === type && category.id === id)?.name ?? id;

/** Demo rows: the 7 rows of the Figma frame in the current month, plus 7 in the previous month (2 pages). */
export function getMockTransactions(): Transaction[] {
  const { year, month } = currentPeriod();
  const at = (monthOffset: number, day: number, hour: number, minute: number) =>
    new Date(year, month - 1 + monthOffset, day, hour, minute).toISOString();

  const make = (
    id: string,
    title: string,
    type: TransactionType,
    amount: number,
    categoryId: string,
    occurredAt: string,
    note: string | null = null,
  ): Transaction => ({ id, title, type, amount, categoryId, categoryName: categoryName(type, categoryId), occurredAt, note });

  return [
    // Current month (same rows as the Figma frame)
    make("t1", "Monthly Salary", "income", 25_000_000, "salary", at(0, 14, 10, 42), "October salary"),
    make("t2", "Rent", "expense", 10_000_000, "housing", at(0, 12, 13, 5)),
    make("t3", "Grocery Shopping", "expense", 50_000, "food", at(0, 12, 11, 15), "Weekly groceries"),
    make("t4", "Metro & Bus", "expense", 130_000, "transport", at(0, 11, 19, 0), "Monthly card top-up"),
    make("t5", "Gym Membership", "expense", 7_500_000, "health", at(0, 8, 17, 35)),
    make("t6", "Restaurants", "expense", 950_000, "food", at(0, 6, 21, 20)),
    make("t7", "Freelance Project", "income", 33_000_000, "freelance", at(0, 5, 10, 55)),
    // Previous month
    make("t8", "Monthly Salary", "income", 25_000_000, "salary", at(-1, 14, 10, 30)),
    make("t9", "Rent", "expense", 10_000_000, "housing", at(-1, 12, 13, 0)),
    make("t10", "Grocery Shopping", "expense", 1_200_000, "food", at(-1, 9, 18, 10), "Monthly stock-up"),
    make("t11", "Metro & Bus", "expense", 160_000, "transport", at(-1, 8, 8, 20)),
    make("t12", "Online Course", "expense", 3_000_000, "education", at(-1, 6, 20, 45), "Design course"),
    make("t13", "Cinema", "expense", 400_000, "entertainment", at(-1, 4, 22, 5)),
    make("t14", "Freelance Project", "income", 12_000_000, "freelance", at(-1, 3, 15, 25)),
  ];
}
