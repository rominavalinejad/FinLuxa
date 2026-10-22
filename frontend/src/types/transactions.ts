export type TransactionType = "income" | "expense";

export interface TransactionCategory {
  /** Plain id. Income and expense categories live in separate tables, so ids can collide across types. */
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  title: string;
  type: TransactionType;
  /** Always positive; the sign shown in the table comes from `type`. */
  amount: number;
  categoryId: string;
  categoryName: string;
  /** ISO date-time. The time part is the moment the user submitted the form (DB: DATETIME). */
  occurredAt: string;
  note: string | null;
}

/** What the "Add New Transaction" panel sends. `date` is "YYYY-MM-DD"; the time is added when saving. */
export interface NewTransaction {
  title: string;
  type: TransactionType;
  amount: number;
  date: string;
  categoryId: string;
  note: string | null;
}

export interface TransactionsData {
  transactions: Transaction[];
  categories: TransactionCategory[];
}
