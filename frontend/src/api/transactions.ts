import type { NewTransaction, Transaction, TransactionsData } from "../types/transactions";
import { USE_MOCK, apiGet } from "./client";
import { MOCK_CATEGORIES, getMockTransactions } from "./mock/transactionsMock";

/**
 * Single entry point for Transactions data.
 * None of these endpoints exist yet in api/main.py (step 2 of the plan: DB columns title/note,
 * date -> DATETIME, then FastAPI + Brain). In mock mode the list lives in memory for the session.
 */
const NOT_READY = "Transactions endpoints are not implemented in the backend yet.";

let mockStore: Transaction[] | null = null;
const getStore = () => (mockStore ??= getMockTransactions());

export async function fetchTransactions(): Promise<TransactionsData> {
  if (USE_MOCK) return { transactions: [...getStore()], categories: MOCK_CATEGORIES };
  return apiGet<TransactionsData>("/transactions");
}

export async function createTransaction(input: NewTransaction): Promise<Transaction> {
  if (!USE_MOCK) throw new Error(NOT_READY);

  const category = MOCK_CATEGORIES.find((item) => item.type === input.type && item.id === input.categoryId);
  if (!category) throw new Error("Select a category.");

  // The time comes from the moment of submitting (real app: set by the server).
  const [year, month, day] = input.date.split("-").map(Number);
  const now = new Date();
  const created: Transaction = {
    id: `t${Date.now()}`,
    title: input.title,
    type: input.type,
    amount: input.amount,
    categoryId: category.id,
    categoryName: category.name,
    occurredAt: new Date(year, month - 1, day, now.getHours(), now.getMinutes()).toISOString(),
    note: input.note,
  };
  getStore().unshift(created);
  return created;
}
