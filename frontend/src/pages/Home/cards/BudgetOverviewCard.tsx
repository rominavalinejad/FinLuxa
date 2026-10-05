import { budgetCardBg, budgetOverviewIcon } from "../../../assets";
import { formatAmount } from "../../../lib/format";
import type { BudgetItem } from "../../../types/home";
import { getCategoryStyle } from "./categoryStyle";

// Row geometry from Figma (offsets relative to the card). A row starts at its round icon.
const FIRST_ROW_TOP = 60.88;
const ROW_PITCH = 66.46;
const MAX_ROWS = 4;

/** 100 -> "100%", 75 -> "75%", 83.33 -> "83.3%" (Figma drops trailing zeros). */
function percentLabel(value: number): string {
  return `${Number(value.toFixed(1))}%`;
}

/** Figma "Budget Overview Card" (58:95): 254.31 x 333.37. */
export default function BudgetOverviewCard({ data }: { data: BudgetItem[] }) {
  return (
    <section className="area-budget relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-[-1.44%_-3.74%_-2.56%_-1.5%]">
        <img src={budgetCardBg} alt="" className="block size-full max-w-none" />
      </span>

      {/* Header */}
      <span className="absolute left-[16.54px] top-[14.53px] block size-[27.571px] rounded-[3.523px] bg-netflow" />
      <img
        src={budgetOverviewIcon}
        alt=""
        className="absolute left-[20.526px] top-[19.448px] h-[17.733px] w-[19.587px]"
      />
      <h2 className="absolute left-[55.85px] top-[21px] whitespace-nowrap text-[15px] font-semibold leading-normal">
        Budget Overview
      </h2>
      {/* PENDING: destination of "View all" */}
      <button
        type="button"
        className="absolute left-[205.36px] top-[24px] whitespace-nowrap text-[10px] font-normal leading-normal text-link"
      >
        View all
      </button>

      {/* Budget list */}
      {data.slice(0, MAX_ROWS).map((item, index) => {
        const style = getCategoryStyle(item.categoryId);
        const fill = Math.min(Math.max(item.percentUsed, 0), 100);
        return (
          <div
            key={item.categoryId}
            className="absolute inset-x-0 h-[47.688px]"
            style={{ top: FIRST_ROW_TOP + index * ROW_PITCH }}
          >
            {style.icon ? (
              <img src={style.icon} alt="" className="absolute left-[16.54px] top-0 size-[47.688px]" />
            ) : (
              <span className="absolute left-[16.54px] top-0 block size-[47.688px] rounded-full bg-muted/20" />
            )}
            <p className="absolute left-[79.39px] top-[-0.41px] whitespace-nowrap text-[10px] font-normal leading-normal text-muted">
              {item.name}
            </p>
            <p className="absolute left-[79.39px] top-[17.45px] whitespace-nowrap text-[10px] font-semibold leading-normal">
              {formatAmount(item.spent)}
            </p>
            <p className="absolute left-[140.15px] top-[21.5px] whitespace-nowrap text-[5px] font-normal leading-normal text-muted">
              /{formatAmount(item.budget)}
            </p>
            <p className="absolute right-[17.9px] top-[16.4px] whitespace-nowrap text-right text-[10px] font-semibold leading-normal">
              {percentLabel(item.percentUsed)}
            </p>
            <div className="absolute left-[79.39px] top-[33.64px] h-[14.046px] w-[158.414px] rounded-[10.859px] bg-muted/20">
              <div
                className="h-full rounded-[10.859px]"
                style={{ width: `${fill}%`, backgroundColor: style.color }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}
