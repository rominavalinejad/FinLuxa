import { useState } from "react";
import { mixPercents, OPTIMIZED_MIX, type MixPercents } from "../../../lib/aiInsightsMath";
import { formatMoney } from "../../../lib/money";
import type { SpendingMix } from "../../../types/aiInsights";
import { ScaleIcon } from "../icons";

const SEGMENTS: { key: keyof MixPercents; label: string; color: string }[] = [
  { key: "needs", label: "Needs", color: "#1bb77b" },
  { key: "wants", label: "Wants", color: "#6d42e0" },
  { key: "savings", label: "Savings", color: "#f59e0b" },
];

type View = "current" | "optimized";

/** Spending Mix: Needs / Wants / Savings share of income, compared with the 50/30/20 guideline. */
export default function SpendingMixCard({ mix, symbol }: { mix: SpendingMix; symbol: string }) {
  const [view, setView] = useState<View>("current");
  const percents = view === "current" ? mixPercents(mix) : OPTIMIZED_MIX;
  const amounts = { needs: mix.needs, wants: mix.wants, savings: Math.max(0, mix.income - mix.needs - mix.wants) };

  return (
    <section className="rounded-[20.746px] bg-white px-[28px] pb-[24px] pt-[22px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <header className="flex items-start justify-between gap-[16px]">
        <div className="flex items-start gap-[12px]">
          <span className="flex size-[27.571px] shrink-0 items-center justify-center rounded-[3.523px] bg-muted/20 text-ink">
            <ScaleIcon className="size-[15px]" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold leading-[normal]">Spending Mix</h2>
            <p className="mt-[3px] text-[10px] font-normal leading-[normal] text-muted">
              {view === "current"
                ? "How your income is split this month between needs, wants and savings."
                : "The 50/30/20 guideline: 50% needs, 30% wants, 20% savings."}
            </p>
          </div>
        </div>
        <div role="radiogroup" aria-label="Mix view" className="flex shrink-0 gap-[6px]">
          {(
            [
              { value: "current", label: "Current Mix" },
              { value: "optimized", label: "AI Optimized Mix" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={view === option.value}
              onClick={() => setView(option.value)}
              className={`h-[24px] rounded-full px-[12px] text-[8px] font-semibold leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                view === option.value ? "bg-sidebar text-white" : "bg-muted/15 text-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-[22px] flex h-[11px] gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
        {SEGMENTS.map((segment) => (
          <span
            key={segment.key}
            className="block h-full transition-[flex-grow] duration-300"
            style={{ flexGrow: percents[segment.key], flexBasis: 0, backgroundColor: segment.color }}
          />
        ))}
      </div>

      <ul className="mt-[18px] grid grid-cols-3 gap-[14px]">
        {SEGMENTS.map((segment) => (
          <li key={segment.key} className="flex h-[48px] items-center gap-[10px] rounded-[10px] bg-page px-[16px]">
            <span className="size-[8px] shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-normal leading-[normal]">{segment.label}</p>
              {view === "current" && (
                <p className="mt-[1px] truncate text-[8px] font-normal leading-[normal] text-muted">{formatMoney(amounts[segment.key], symbol)}</p>
              )}
            </div>
            <span className="text-[15px] font-semibold leading-[normal]">{percents[segment.key]}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
