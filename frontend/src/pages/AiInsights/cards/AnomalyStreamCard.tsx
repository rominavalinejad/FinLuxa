import { Link } from "react-router-dom";
import { formatMoney } from "../../../lib/money";
import type { Anomaly } from "../../../types/aiInsights";
import { AlertCircleIcon, ArrowRightIcon, BotIcon, CheckIcon } from "../icons";

// Same date format as the Transactions table.
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const KINDS = {
  unusual: { dot: "#d22225", title: "Unusual Expense" },
  spike: { dot: "#ea7a25", title: "Category Spike" },
  improvement: { dot: "#1bb77b", title: "Improvement" },
} as const;

function describe(anomaly: Anomaly, symbol: string) {
  switch (anomaly.kind) {
    case "unusual":
      return (
        <>
          {anomaly.transactionTitle} cost <b className="font-semibold text-ink">{formatMoney(anomaly.amount, symbol)}</b>, about{" "}
          <b className="font-semibold text-expense">{(anomaly.amount / anomaly.typicalAmount).toFixed(1)}×</b> your usual {anomaly.categoryName} expense (
          {formatMoney(anomaly.typicalAmount, symbol)}).
        </>
      );
    case "spike":
      return (
        <>
          {anomaly.categoryName} spending is <b className="font-semibold text-[#ea7a25]">+{anomaly.changePercent}%</b> above your 3-month average of{" "}
          {formatMoney(anomaly.averageAmount, symbol)}.
        </>
      );
    case "improvement":
      return (
        <>
          You spent <b className="font-semibold text-brand">{anomaly.changePercent}% less</b> on {anomaly.categoryName} than last month.
        </>
      );
  }
}

function footerLink(anomaly: Anomaly) {
  const className =
    "inline-flex items-center gap-[4px] text-[9px] font-semibold leading-[normal] text-link outline-none focus-visible:ring-2 focus-visible:ring-brand";
  if (anomaly.kind === "unusual") {
    return (
      <Link to="/transactions" className={className}>
        View transaction <ArrowRightIcon className="size-[9px]" />
      </Link>
    );
  }
  if (anomaly.kind === "spike") {
    return (
      <Link to="/transactions" className={className}>
        Review {anomaly.categoryName} transactions <ArrowRightIcon className="size-[9px]" />
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center gap-[4px] text-[9px] font-semibold leading-[normal] text-brand">
      <CheckIcon className="size-[10px]" /> Keep it up
    </span>
  );
}

interface AnomalyStreamCardProps {
  anomalies: Anomaly[];
  checksActive: number;
  symbol: string;
}

/** Anomaly Stream: the latest unusual, rising and improving spending patterns. */
export default function AnomalyStreamCard({ anomalies, checksActive, symbol }: AnomalyStreamCardProps) {
  return (
    <section className="flex flex-col rounded-[20.746px] bg-white px-[24px] pb-[20px] pt-[22px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <header className="flex items-center justify-between gap-[12px]">
        <div className="flex items-center gap-[12px]">
          <span className="flex size-[27.571px] shrink-0 items-center justify-center rounded-[3.523px] bg-expense/15 text-expense">
            <AlertCircleIcon className="size-[15px]" />
          </span>
          <h2 className="text-[15px] font-semibold leading-[normal]">Anomaly Stream</h2>
        </div>
        <span className="rounded-full bg-muted/15 px-[9px] py-[3px] text-[8px] font-semibold leading-[normal] text-muted">Last 30 days</span>
      </header>

      <ul className="mt-[18px] flex flex-col gap-[12px]">
        {anomalies.map((anomaly) => {
          const kind = KINDS[anomaly.kind];
          return (
            <li key={anomaly.id} className="rounded-[12px] bg-page px-[16px] py-[14px]">
              <div className="flex items-center justify-between gap-[8px]">
                <p className="flex items-center gap-[7px] text-[10px] font-semibold leading-[normal]">
                  <i className="block size-[6px] rounded-full" style={{ backgroundColor: kind.dot }} />
                  {kind.title}
                </p>
                <time dateTime={anomaly.occurredAt} className="text-[8px] font-normal leading-[normal] text-muted">
                  {dateFormat.format(new Date(anomaly.occurredAt))}
                </time>
              </div>
              <p className="mt-[8px] text-[10px] font-normal leading-[1.6] text-muted">{describe(anomaly, symbol)}</p>
              <div className="mt-[10px] flex items-center justify-between gap-[8px]">
                {footerLink(anomaly)}
                <span className="rounded-full bg-white px-[9px] py-[2px] text-[8px] font-normal leading-[normal] text-muted">{anomaly.categoryName}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-auto flex items-center gap-[8px] rounded-[10px] bg-[#eaf7f3] px-[14px] py-[10px] text-[9px] font-normal leading-[normal]">
        <BotIcon className="size-[13px] shrink-0 text-brand" />
        {checksActive} insight checks active
      </p>
    </section>
  );
}
