import { useMemo, useState } from "react";
import { balanceWalletIcon, cashFlowIcon } from "../../assets";
import { usePeriod } from "../../context/PeriodContext";
import { useTransactions } from "../../hooks/useTransactions";
import { currencySymbol } from "../../lib/money";
import {
  DEFAULT_FILTERS,
  PAGE_SIZE,
  type TransactionFilters,
  applyFilters,
  summarize,
} from "../../lib/transactionFilters";
import AddTransactionPanel from "./cards/AddTransactionPanel";
import FilterBar from "./cards/FilterBar";
import SummaryCard from "./cards/SummaryCard";
import TransactionsTable from "./cards/TransactionsTable";

// DEMO: the Compare logic (options, baseline, zero handling) will be defined later, so the cards show fixed numbers.
const DEMO_COMPARE = { income: 12, expense: 15, netFlow: 20 };

/**
 * Figma Transactions frame: three summary cards, search + filters, the table, and the
 * "Add New Transaction" panel on the right (270px, 27px gap). The cards follow the app-wide month
 * (Home's Date selector); the table follows its own Type / Category / Date filters and Title search.
 */
export default function TransactionsPage() {
  const { data, currency, loading, error, addTransaction } = useTransactions();
  const { period } = usePeriod();
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  // Open by default, like the Figma frame.
  const [panelOpen, setPanelOpen] = useState(true);

  const transactions = data?.transactions;
  const categories = data?.categories;
  const symbol = currencySymbol(currency);

  const summary = useMemo(() => summarize(transactions ?? [], period), [transactions, period]);
  const filtered = useMemo(() => applyFilters(transactions ?? [], filters), [transactions, filters]);
  const categoriesForType = useMemo(
    () => (categories ?? []).filter((category) => filters.type === "all" || category.type === filters.type),
    [categories, filters.type],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilters(patch: Partial<TransactionFilters>) {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      // A selected category that does not belong to the new Type is dropped.
      if (patch.type && next.categoryKey !== "all" && patch.type !== "all" && !next.categoryKey.startsWith(`${patch.type}:`)) {
        next.categoryKey = "all";
      }
      return next;
    });
    setPage(1);
  }

  if (error) return <p role="alert">{error}</p>;
  if (loading && !data) return <p>Loading…</p>;
  if (!data) return null;

  return (
    <div className="flex items-start gap-[27px]">
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-3 gap-[20px]">
          <SummaryCard title="Total Income" value={summary.income} percent={DEMO_COMPARE.income} tone="brand" icon={balanceWalletIcon} />
          <SummaryCard title="Total Expenses" value={summary.expense} percent={DEMO_COMPARE.expense} tone="expense" icon={balanceWalletIcon} />
          <SummaryCard title="Net Flow" value={summary.netFlow} percent={DEMO_COMPARE.netFlow} tone="netflow" icon={cashFlowIcon} />
        </div>

        <div className="mt-[22px]">
          <FilterBar
            filters={filters}
            categories={categoriesForType}
            onChange={updateFilters}
            onAdd={panelOpen ? undefined : () => setPanelOpen(true)}
          />
        </div>

        <div className="mt-[23px]">
          <TransactionsTable
            rows={rows}
            total={filtered.length}
            page={currentPage}
            pageCount={pageCount}
            currencySymbol={symbol}
            onPageChange={setPage}
          />
        </div>
      </div>

      {panelOpen && (
        <AddTransactionPanel
          categories={data.categories}
          currencySymbol={symbol}
          onSubmit={addTransaction}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </div>
  );
}
