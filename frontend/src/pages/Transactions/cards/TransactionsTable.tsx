import { SquarePenIcon } from "../../../components/icons";
import { formatSignedAmount } from "../../../lib/money";
import { PAGE_SIZE } from "../../../lib/transactionFilters";
import type { Transaction } from "../../../types/transactions";
import { getCategoryStyle } from "../../Home/cards/categoryStyle";
import { ChevronRightIcon } from "../icons";

// Column widths measured from the Figma frame (card is 705 wide, text starts 29px in), written as fr
// proportions: with the Add panel open (676px of columns) 1fr = 1px, i.e. exactly the Figma layout,
// and when the panel is closed the same proportions stretch over the full card width.
const GRID =
  "grid grid-cols-[minmax(0,114fr)_minmax(0,129fr)_minmax(0,128fr)_minmax(0,132fr)_minmax(0,116fr)_minmax(0,57fr)] items-center pl-[29px]";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

interface TransactionsTableProps {
  /** Rows of the current page only. */
  rows: Transaction[];
  total: number;
  page: number;
  pageCount: number;
  currencySymbol: string;
  onPageChange: (page: number) => void;
}

/** Up to 4 page buttons around the current page (Figma shows "1 2 3 4 >"). */
function visiblePages(page: number, pageCount: number): number[] {
  const size = Math.min(4, pageCount);
  const start = Math.min(Math.max(page - 1, 1), pageCount - size + 1);
  return Array.from({ length: size }, (_, index) => start + index);
}

function RowActions({ hasNote }: { hasNote: boolean }) {
  // Visual only: the three dots (edit / delete) will be designed when their logic is explained.
  return (
    <div className="flex items-center gap-[8px]">
      <span aria-hidden="true" className="flex flex-col gap-[2.5px]">
        <i className="block size-[3px] rounded-full bg-ink" />
        <i className="block size-[3px] rounded-full bg-ink" />
        <i className="block size-[3px] rounded-full bg-ink" />
      </span>
      {hasNote && <SquarePenIcon aria-label="Has a note" className="size-[14px] text-muted" />}
    </div>
  );
}

/** Figma transactions table card (705 wide). Header 53px, rows 57px, footer 59px. */
export default function TransactionsTable({
  rows,
  total,
  page,
  pageCount,
  currencySymbol,
  onPageChange,
}: TransactionsTableProps) {
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastShown = (page - 1) * PAGE_SIZE + rows.length;

  return (
    <section className="rounded-[20.746px] bg-white shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <div className={`${GRID} h-[53px] border-b-2 border-[#e6e8ec] text-[10px] font-semibold leading-[normal]`}>
        <span>Title</span>
        <span>Category</span>
        <span>Type</span>
        <span>Amount</span>
        <span>Date</span>
        <span>Note</span>
      </div>

      {rows.length === 0 ? (
        <p className="flex h-[171px] items-center justify-center border-b border-[#eef0f3] text-[10px] text-muted">
          No transactions match your filters.
        </p>
      ) : (
        rows.map((item) => {
          const style = getCategoryStyle(item.categoryId);
          const at = new Date(item.occurredAt);
          const isIncome = item.type === "income";
          return (
            <div key={item.id} className={`${GRID} h-[57px] border-b border-[#eef0f3] text-[10px] font-normal leading-[normal]`}>
              <span className="truncate pr-[8px]">{item.title}</span>

              <span className="flex items-center gap-[6px] pr-[8px]">
                <span
                  aria-hidden="true"
                  className="flex size-[22px] shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${style.color}33` }}
                >
                  {style.icon && <img src={style.icon} alt="" className="max-h-[70%] max-w-[70%]" />}
                </span>
                <span className="truncate">{item.categoryName}</span>
              </span>

              <span>
                <span
                  className={`inline-flex h-[17px] items-center rounded-full px-[8px] text-[10px] ${
                    isIncome ? "bg-brand/20 text-brand" : "bg-expense/20 text-expense"
                  }`}
                >
                  {isIncome ? "Income" : "Expense"}
                </span>
              </span>

              <span className={`whitespace-nowrap font-semibold ${isIncome ? "text-brand" : "text-expense"}`}>
                {formatSignedAmount(item.amount, item.type, currencySymbol)}
              </span>

              <span className="leading-[1.25]">
                {dateFormat.format(at)}
                <br />
                {timeFormat.format(at)}
              </span>

              <RowActions hasNote={Boolean(item.note)} />
            </div>
          );
        })
      )}

      <div className="flex h-[59px] items-center justify-between pl-[29px] pr-[33px]">
        <p className="whitespace-nowrap text-[8px] font-normal leading-[normal] text-muted">
          {total === 0 ? "No transactions" : `Showing ${firstShown}–${lastShown} of ${total}`}
        </p>
        {pageCount > 1 && (
          <nav aria-label="Pagination" className="flex items-center gap-[8px]">
            {visiblePages(page, pageCount).map((number) => (
              <button
                key={number}
                type="button"
                aria-current={number === page ? "page" : undefined}
                onClick={() => onPageChange(number)}
                className={`flex size-[18px] items-center justify-center rounded-[4px] border text-[8px] font-semibold leading-none outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  number === page ? "border-sidebar bg-sidebar text-white" : "border-muted/40 bg-white text-ink"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
              className="flex size-[18px] items-center justify-center rounded-[4px] border border-muted/40 bg-white text-muted outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40"
            >
              <ChevronRightIcon className="size-[10px]" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
