import { chevronDownIcon } from "../../../assets";
import {
  DATE_PRESETS,
  type DatePreset,
  type TransactionFilters,
  categoryKey,
} from "../../../lib/transactionFilters";
import type { TransactionCategory } from "../../../types/transactions";
import { PlusIcon, SearchIcon } from "../icons";

const PILL_SHADOW = "shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.15)]";

interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  /** Pill width from Figma. */
  widthClass: string;
  onChange: (value: string) => void;
}

/** Figma filter pill (38px tall, white, shadow). Native <select> for now: the open state is not designed. */
function FilterSelect({ label, value, options, widthClass, onChange }: FilterSelectProps) {
  return (
    <div className={`relative h-[38px] shrink-0 rounded-full bg-white ${PILL_SHADOW} ${widthClass}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="size-full cursor-pointer appearance-none truncate rounded-full bg-transparent pl-[13px] pr-[32px] text-[9px] font-medium leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <img
        src={chevronDownIcon}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[13px] top-1/2 h-[7px] w-[13px] -translate-y-1/2"
      />
    </div>
  );
}

interface FilterBarProps {
  filters: TransactionFilters;
  /** Categories already narrowed to the selected Type. */
  categories: TransactionCategory[];
  onChange: (patch: Partial<TransactionFilters>) => void;
  /** The Add button only exists while the Add panel is closed (Notion). */
  onAdd?: () => void;
}

/** Figma search bar (38px) + Type / Category / Date pills; "Add New" at the end when the panel is closed. */
export default function FilterBar({ filters, categories, onChange, onAdd }: FilterBarProps) {
  const typeOptions = [
    { value: "all", label: "All Type" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" },
  ];
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((category) => ({ value: categoryKey(category), label: category.name })),
  ];

  return (
    <div>
      <div className="flex items-center gap-[12px]">
        <label className={`relative h-[38px] min-w-0 flex-1 rounded-full bg-white ${PILL_SHADOW}`}>
          <SearchIcon className="absolute left-[23px] top-1/2 size-[20px] -translate-y-1/2 text-muted" />
          <input
            type="search"
            aria-label="Search transactions by title"
            placeholder="Search Transactions..."
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            className="size-full rounded-full bg-transparent pl-[64px] pr-[20px] text-[12px] font-normal leading-[normal] outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand"
          />
        </label>
        <FilterSelect
          label="Type"
          value={filters.type}
          options={typeOptions}
          widthClass="w-[85px]"
          onChange={(type) => onChange({ type: type as TransactionFilters["type"] })}
        />
        <FilterSelect
          label="Category"
          value={filters.categoryKey}
          options={categoryOptions}
          widthClass="w-[110px]"
          onChange={(key) => onChange({ categoryKey: key })}
        />
        <FilterSelect
          label="Date"
          value={filters.datePreset}
          options={DATE_PRESETS}
          widthClass="w-[83px]"
          onChange={(preset) => onChange({ datePreset: preset as DatePreset })}
        />
        {onAdd && (
          // Not in Figma (only the open-panel state is designed): a dark pill that matches the panel's button.
          <button
            type="button"
            onClick={onAdd}
            className="flex h-[38px] shrink-0 items-center gap-[6px] rounded-full bg-sidebar px-[16px] text-[10px] font-semibold leading-[normal] text-white outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <PlusIcon className="size-[12px]" />
            Add New
          </button>
        )}
      </div>

      {/* Custom range inputs: not in Figma, shown only while "Custom range" is selected. */}
      {filters.datePreset === "custom" && (
        <div className="mt-[10px] flex items-center justify-end gap-[8px] text-[10px] font-normal leading-[normal]">
          <label className="flex items-center gap-[6px]">
            From
            <input
              type="date"
              value={filters.customFrom}
              max={filters.customTo || undefined}
              onChange={(event) => onChange({ customFrom: event.target.value })}
              className="h-[28px] rounded-full bg-white px-[10px] text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
          <label className="flex items-center gap-[6px]">
            To
            <input
              type="date"
              value={filters.customTo}
              min={filters.customFrom || undefined}
              onChange={(event) => onChange({ customTo: event.target.value })}
              className="h-[28px] rounded-full bg-white px-[10px] text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </label>
        </div>
      )}
    </div>
  );
}
