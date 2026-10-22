import { useState, type ReactNode } from "react";
import { chevronDownIcon } from "../../../assets";
import { CalendarIcon } from "../../../components/icons";
import { categoryKey, parseLocalDate } from "../../../lib/transactionFilters";
import type { NewTransaction, TransactionCategory, TransactionType } from "../../../types/transactions";
import { ArrowDownIcon, ArrowUpIcon, BookmarkIcon, CloseIcon, PlusCircleIcon, PlusSquareIcon } from "../icons";

const pad = (value: number) => String(value).padStart(2, "0");

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const dateLabelFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "1234567.5" -> "1,234,567.5" (digits and one dot only, at most 2 decimals). */
function formatAmountInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [integer, ...rest] = cleaned.split(".");
  const grouped = integer.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return rest.length > 0 ? `${grouped}.${rest.join("").slice(0, 2)}` : grouped;
}

const INPUT_BASE =
  "h-[36px] w-full rounded-[7px] border border-[#e9ecf1] bg-white px-[14px] text-[10px] font-normal leading-[normal] outline-none placeholder:text-[9px] placeholder:text-muted/50 focus:border-brand";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-[24px]">
      <p className="mb-[11px] text-[10px] font-semibold leading-[12px]">{label}</p>
      {children}
    </div>
  );
}

type Overlay = null | "added" | "discard";

interface AddTransactionPanelProps {
  categories: TransactionCategory[];
  currencySymbol: string;
  /** Throws on failure; the panel shows the message and keeps the form. */
  onSubmit: (input: NewTransaction) => Promise<void>;
  onClose: () => void;
}

/**
 * Figma "Add New Transaction" panel: 270 x 708. After a successful save it asks "Add another / Close";
 * closing a half-filled form asks for confirmation first (both decided by the owner).
 * The time of the transaction is taken from the moment of submitting, so there is no time field.
 */
export default function AddTransactionPanel({ categories, currencySymbol, onSubmit, onClose }: AddTransactionPanelProps) {
  const [type, setType] = useState<TransactionType>("income");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso);
  const [selectedKey, setSelectedKey] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ title?: string; amount?: string; date?: string; category?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);

  const options = categories.filter((category) => category.type === type);
  const isDirty = Boolean(title.trim() || amount || selectedKey || note.trim());

  function chooseType(next: TransactionType) {
    if (next === type) return;
    setType(next);
    setSelectedKey(""); // the category list depends on the type
  }

  function reset() {
    setTitle("");
    setAmount("");
    setDate(todayIso());
    setSelectedKey("");
    setNote("");
    setErrors({});
  }

  function requestClose() {
    if (isDirty) setOverlay("discard");
    else onClose();
  }

  async function handleSubmit() {
    const parsed = Number(amount.replace(/,/g, ""));
    const found: typeof errors = {};
    if (!title.trim()) found.title = "Title cannot be empty.";
    if (!amount || !Number.isFinite(parsed) || parsed <= 0) found.amount = "Enter an amount greater than zero.";
    if (!date) found.date = "Select a date.";
    if (!selectedKey) found.category = "Select a category.";
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const category = options.find((item) => categoryKey(item) === selectedKey);
    if (!category) {
      setErrors({ category: "Select a category." });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), type, amount: parsed, date, categoryId: category.id, note: note.trim() || null });
      setErrors({});
      setOverlay("added");
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not save the transaction." });
    } finally {
      setSubmitting(false);
    }
  }

  const isIncome = type === "income";
  const ERROR = "mt-[3px] text-[9px] leading-[normal] text-expense";

  return (
    <aside
      aria-label="Add New Transaction"
      className="relative min-h-[708px] w-[270px] shrink-0 rounded-[20.746px] bg-white px-[23px] pb-[38px] pt-[21px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <span className="flex size-[27px] items-center justify-center rounded-[6px] bg-muted/20 text-ink">
            <PlusSquareIcon className="size-[15px]" />
          </span>
          <h2 className="whitespace-nowrap text-[10px] font-semibold leading-[normal]">Add New Transaction</h2>
        </div>
        <button
          type="button"
          aria-label="Close panel"
          onClick={requestClose}
          className="flex size-[20px] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <CloseIcon className="size-[16px]" strokeWidth={3} />
        </button>
      </div>

      {/* Type */}
      <div role="radiogroup" aria-label="Transaction type" className="mt-[30px] flex gap-[14px]">
        <button
          type="button"
          role="radio"
          aria-checked={isIncome}
          onClick={() => chooseType("income")}
          className={`flex h-[48px] flex-1 items-center justify-center gap-[7px] rounded-[7px] border text-[10px] font-normal leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            isIncome ? "border-brand bg-brand text-white" : "border-[#e9ecf1] bg-white text-ink"
          }`}
        >
          <ArrowUpIcon className="size-[13px]" />
          Income
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={!isIncome}
          onClick={() => chooseType("expense")}
          className={`flex h-[48px] flex-1 items-center justify-center gap-[7px] rounded-[7px] border text-[10px] font-normal leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand ${
            !isIncome ? "border-expense bg-expense text-white" : "border-[#e9ecf1] bg-white text-ink"
          }`}
        >
          <ArrowDownIcon className="size-[13px]" />
          Expense
        </button>
      </div>

      <div className="mt-[4px]">
        <Field label="Title *">
          <input
            aria-label="Title"
            value={title}
            placeholder="eg: Monthly Salary"
            onChange={(event) => setTitle(event.target.value)}
            className={INPUT_BASE}
          />
          {errors.title && <p className={ERROR}>{errors.title}</p>}
        </Field>

        <Field label="Amount *">
          <input
            aria-label="Amount"
            inputMode="decimal"
            value={amount}
            placeholder={`10,000,000 ${currencySymbol}`}
            onChange={(event) => setAmount(formatAmountInput(event.target.value))}
            className={INPUT_BASE}
          />
          {errors.amount && <p className={ERROR}>{errors.amount}</p>}
        </Field>

        <Field label="Date *">
          {/* Custom look from Figma; the real (invisible) native date input sits on top and opens the browser picker. */}
          <div className={`relative flex items-center gap-[8px] ${INPUT_BASE} px-[13px]`}>
            <CalendarIcon className="size-[15px]" />
            <span className="flex-1 truncate">{date ? dateLabelFormat.format(parseLocalDate(date)) : "Select date"}</span>
            <img src={chevronDownIcon} alt="" aria-hidden="true" className="h-[7px] w-[13px]" />
            <input
              type="date"
              aria-label="Date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              onClick={(event) => event.currentTarget.showPicker?.()}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
          {errors.date && <p className={ERROR}>{errors.date}</p>}
        </Field>

        <Field label="Category *">
          <div className={`relative flex items-center gap-[8px] ${INPUT_BASE} px-[13px]`}>
            <BookmarkIcon className="size-[15px]" />
            <span className={`flex-1 truncate ${selectedKey ? "" : "text-ink"}`}>
              {options.find((item) => categoryKey(item) === selectedKey)?.name ?? "Select a category"}
            </span>
            <img src={chevronDownIcon} alt="" aria-hidden="true" className="h-[7px] w-[13px]" />
            <select
              aria-label="Category"
              value={selectedKey}
              onChange={(event) => setSelectedKey(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="">Select a category</option>
              {options.map((item) => (
                <option key={categoryKey(item)} value={categoryKey(item)}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          {errors.category && <p className={ERROR}>{errors.category}</p>}
        </Field>

        <Field label="Note (optional)">
          <textarea
            aria-label="Note"
            value={note}
            placeholder="Add a note (eg: paid for groceries)"
            onChange={(event) => setNote(event.target.value)}
            className={`${INPUT_BASE} h-[99px] resize-none py-[12px]`}
          />
        </Field>
      </div>

      {errors.form && (
        <p role="alert" className={`${ERROR} mt-[12px]`}>
          {errors.form}
        </p>
      )}

      <button
        type="button"
        disabled={submitting}
        onClick={handleSubmit}
        className="mt-[24px] flex h-[37px] w-full items-center justify-center gap-[7px] rounded-[7px] bg-sidebar text-[10px] font-semibold leading-[normal] text-white outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
      >
        <PlusCircleIcon className="size-[14px]" />
        Add Transaction
      </button>

      {/* Interactive confirmations (not in Figma: plain dialog on top of the panel). */}
      {overlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[20.746px] bg-white/85 px-[23px] backdrop-blur-[2px]">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={overlay === "added" ? "Transaction added" : "Discard transaction"}
            className="w-full rounded-[14px] bg-white p-[18px] text-center shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]"
          >
            <p className="text-[12px] font-semibold leading-[normal]">
              {overlay === "added" ? "Transaction added successfully" : "Discard this transaction?"}
            </p>
            <p className="mt-[4px] text-[10px] font-normal leading-[normal] text-muted">
              {overlay === "added" ? "Do you want to add another one?" : "The details you entered will be lost."}
            </p>
            <div className="mt-[16px] flex gap-[10px]">
              {overlay === "added" ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-[32px] flex-1 rounded-[7px] border border-[#e9ecf1] text-[10px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setOverlay(null);
                    }}
                    className="h-[32px] flex-1 rounded-[7px] bg-sidebar text-[10px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Add another
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setOverlay(null)}
                    className="h-[32px] flex-1 rounded-[7px] border border-[#e9ecf1] text-[10px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Keep editing
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-[32px] flex-1 rounded-[7px] bg-expense text-[10px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Discard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
