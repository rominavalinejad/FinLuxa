import { SparklesIcon, CheckCircleIcon, ArrowRightIcon, AlertCircleIcon } from "../icons";
import { formatPercent } from "../../../lib/format";
import { healthTier } from "../../../lib/aiInsightsMath";
import { formatMoney } from "../../../lib/money";
import type { Diagnostic, HealthSummary } from "../../../types/aiInsights";

const RING_SIZE = 138;
const RING_STROKE = 11;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

function HealthRing({ score, tier }: { score: number; tier: string }) {
  const clamped = Math.min(Math.max(score, 0), 100);
  return (
    <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" aria-hidden="true">
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} fill="none" stroke="#dbe8f7" strokeWidth={RING_STROKE} />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#1bb77b"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * RING_LENGTH} ${RING_LENGTH}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label={`Health index ${score} out of 100`}>
        <span className="text-[8px] font-normal leading-[normal] text-muted">Health Index</span>
        <p className="flex items-baseline leading-none">
          <span className="text-[38px] font-black">{score}</span>
          <span className="text-[13px] font-normal text-muted">/100</span>
        </p>
        <span className="mt-[6px] rounded-full bg-brand/15 px-[9px] py-[2px] text-[8px] font-semibold leading-[normal] text-brand">
          {tier}
        </span>
      </div>
    </div>
  );
}

function Pill({ children }: { children: string }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-[#e9ecf1] bg-white px-[10px] py-[4px] text-[8px] font-semibold leading-[normal]">
      {children}
    </span>
  );
}

interface HealthHeroCardProps {
  health: HealthSummary;
  diagnostics: Diagnostic[];
  recommendationCount: number;
  generatedAt: string;
  symbol: string;
  refreshing: boolean;
  onRefresh: () => void;
}

/** Hero of the AI Insights page: health ring + summary, active diagnostics and the refresh action. */
export default function HealthHeroCard({
  health,
  diagnostics,
  recommendationCount,
  generatedAt,
  symbol,
  refreshing,
  onRefresh,
}: HealthHeroCardProps) {
  const { tier, headline } = healthTier(health.score);
  const budget = diagnostics.find((item) => item.kind === "budgetAdherence");
  const allOnTrack = budget ? budget.onTrack === budget.total : true;

  return (
    <section className="flex items-center gap-[28px] rounded-[20.746px] bg-[linear-gradient(115deg,#ffffff_0%,#f3fbf8_50%,#dff4ee_100%)] px-[36px] py-[34px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
      <HealthRing score={health.score} tier={tier} />

      <div className="w-[236px] shrink-0">
        <h2 className="flex items-start gap-[8px] text-[18px] font-semibold leading-[1.25]">
          {headline}
          <CheckCircleIcon className="mt-[2px] size-[16px] shrink-0 text-brand" />
        </h2>
        <p className="mt-[10px] text-[10px] font-normal leading-[1.6] text-muted">
          FinLuxa Brain analyzed {health.transactionCount} transactions this month.{" "}
          {allOnTrack ? "Every budget is on track" : "Some budgets need attention"} and you kept{" "}
          {health.savingsRatePercent}% of your income.
        </p>
        <div className="mt-[14px] flex flex-wrap gap-[6px]">
          <Pill>{`Savings Rate ${health.savingsRatePercent}%`}</Pill>
          {budget && <Pill>{allOnTrack ? "Budgets on Track" : `${budget.onTrack}/${budget.total} Budgets on Track`}</Pill>}
        </div>
      </div>

      <div className="min-w-0 flex-1 self-stretch rounded-[14px] border border-white bg-white/75 px-[18px] py-[16px]">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-semibold leading-[normal]">Active Diagnostics</h3>
          <span className="rounded-full bg-netflow/15 px-[9px] py-[3px] text-[8px] font-semibold leading-[normal] text-netflow">
            {recommendationCount} Recommendations
          </span>
        </div>
        <ul className="mt-[14px] flex flex-col gap-[14px]">
          {diagnostics.map((item) => (
            <li key={item.kind} className="flex items-start gap-[10px]">
              <span className="mt-[1px] shrink-0 text-brand">
                {item.kind === "budgetAdherence" && !allOnTrack ? (
                  <AlertCircleIcon className="size-[14px] text-[#ea7a25]" />
                ) : (
                  <ArrowRightIcon className="size-[14px] -rotate-45" />
                )}
              </span>
              <div className="min-w-0">
                {item.kind === "budgetAdherence" ? (
                  <>
                    <p className="text-[10px] font-semibold leading-[normal]">
                      Budget adherence: {item.onTrack} of {item.total} categories
                    </p>
                    <p className="mt-[2px] text-[9px] font-normal leading-[1.4] text-muted">
                      {allOnTrack ? "All categories are within their monthly budget." : "Some categories passed their monthly budget."}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold leading-[normal]">Top spending category: {item.categoryName}</p>
                    <p className="mt-[2px] text-[9px] font-normal leading-[1.4] text-muted">
                      {formatMoney(item.amount, symbol)} · {formatPercent(item.sharePercent)} of total expenses
                    </p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-[168px] shrink-0 flex-col gap-[12px]">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex h-[62px] items-center justify-center gap-[10px] rounded-[12px] bg-sidebar px-[16px] text-[12px] font-semibold leading-[1.25] text-white outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
        >
          <SparklesIcon className={`size-[22px] shrink-0 ${refreshing ? "animate-pulse" : ""}`} />
          {refreshing ? "Refreshing…" : "Refresh Insights"}
        </button>
        <p className="rounded-[10px] bg-muted/10 px-[12px] py-[8px] text-[8px] font-normal leading-[1.5] text-muted">
          Last analyzed
          <br />
          <span className="font-semibold text-ink">Today, {timeFormat.format(new Date(generatedAt))}</span>
        </p>
      </div>
    </section>
  );
}
