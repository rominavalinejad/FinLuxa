import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../../../lib/money";
import type { Strategy } from "../../../types/aiInsights";
import { CloseIcon } from "../../Transactions/icons";
import { BotIcon, CheckIcon, EyeIcon, LockIcon, PiggyBankIcon, RepeatIcon, RocketIcon, TrendingUpIcon, UtensilsIcon, ZapIcon } from "../icons";

const CARD = "rounded-[20.746px] bg-white shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]";

type Tone = "orange" | "purple" | "green";

const TONES: Record<Tone, { tint: string; text: string; button: string }> = {
  orange: { tint: "bg-[#ea7a25]/15 text-[#ea7a25]", text: "text-[#ea7a25]", button: "bg-brand" },
  purple: { tint: "bg-netflow/15 text-netflow", text: "text-netflow", button: "bg-sidebar" },
  green: { tint: "bg-brand/15 text-brand", text: "text-brand", button: "bg-brand" },
};

interface StrategyCardProps {
  tone: Tone;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  badge: ReactNode;
  body: ReactNode;
  statLabel: string;
  statValue: string;
  statIcon: ReactNode;
  action: { label: string; doneLabel: string; icon: ReactNode; to?: string };
  onDismiss: () => void;
}

function StrategyCard({ tone, icon, eyebrow, title, badge, body, statLabel, statValue, statIcon, action, onDismiss }: StrategyCardProps) {
  // Actions are demos for now (no backend): they only flip to a "done" state for this visit.
  const [done, setDone] = useState(false);
  const colors = TONES[tone];
  const buttonClass = `flex h-[34px] min-w-0 flex-1 items-center justify-center gap-[7px] rounded-[7px] text-[10px] font-semibold leading-[normal] text-white outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-70 ${colors.button}`;

  return (
    <article className={`${CARD} flex flex-col px-[24px] pb-[22px] pt-[22px]`}>
      <header className="flex items-start gap-[12px]">
        <span className={`flex size-[36px] shrink-0 items-center justify-center rounded-[8px] ${colors.tint}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <p className={`text-[9px] font-semibold leading-[normal] ${colors.text}`}>{eyebrow}</p>
          <h3 className="mt-[3px] text-[15px] font-semibold leading-[1.25]">{title}</h3>
        </div>
        <span className={`shrink-0 whitespace-nowrap rounded-full px-[9px] py-[3px] text-[8px] font-semibold leading-[normal] ${colors.tint}`}>
          {badge}
        </span>
      </header>

      <p className="mt-[18px] text-[10px] font-normal leading-[1.7] text-ink/70">{body}</p>

      <div className="mt-[18px] flex h-[62px] items-center justify-between rounded-[10px] bg-page px-[14px]">
        <div>
          <p className="text-[8px] font-normal leading-[normal] text-muted">{statLabel}</p>
          <p className={`mt-[3px] text-[15px] font-semibold leading-[normal] ${colors.text}`}>{statValue}</p>
        </div>
        <span className={`flex size-[32px] items-center justify-center rounded-full ${colors.tint}`}>{statIcon}</span>
      </div>

      <div className="mt-auto flex gap-[10px] pt-[18px]">
        {action.to ? (
          <Link to={action.to} className={buttonClass}>
            {action.icon}
            {action.label}
          </Link>
        ) : (
          <button type="button" disabled={done} onClick={() => setDone(true)} className={buttonClass}>
            {done ? <CheckIcon className="size-[13px]" /> : action.icon}
            {done ? action.doneLabel : action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss suggestion"
          onClick={onDismiss}
          className="flex size-[34px] shrink-0 items-center justify-center rounded-[7px] border border-[#e9ecf1] text-muted outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <CloseIcon className="size-[13px]" />
        </button>
      </div>
    </article>
  );
}

const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

function renderStrategy(strategy: Strategy, symbol: string, onDismiss: () => void): ReactNode {
  switch (strategy.kind) {
    case "foodOutliers":
      return (
        <StrategyCard
          key={strategy.id}
          tone="orange"
          icon={<UtensilsIcon className="size-[18px]" />}
          eyebrow="Spend volatility"
          title={`${strategy.categoryName} Outliers`}
          badge={
            <span className="inline-flex items-center gap-[3px]">
              <TrendingUpIcon className="size-[9px]" />+{strategy.changePercent}%
            </span>
          }
          body={
            <>
              {strategy.categoryName} costs escalated to <b className="font-semibold text-ink">{formatMoney(strategy.amount, symbol)}</b> this
              cycle. Skipping two midweek delivery meals reclaims capital with zero lifestyle impact.
            </>
          }
          statLabel="Estimated monthly recovery"
          statValue={`+${formatMoney(strategy.monthlyRecovery, symbol)}`}
          statIcon={<PiggyBankIcon className="size-[16px]" />}
          action={{ label: "Apply Spending Cap", doneLabel: "Cap applied", icon: <LockIcon className="size-[13px]" /> }}
          onDismiss={onDismiss}
        />
      );
    case "recurring":
      return (
        <StrategyCard
          key={strategy.id}
          tone="purple"
          icon={<RepeatIcon className="size-[18px]" />}
          eyebrow="Recurring audit"
          title="Recurring Expenses"
          badge={`${strategy.items.length} Detected`}
          body={
            <>
              <b className="font-semibold text-ink">{strategy.items.length} expenses</b> repeated across the last {strategy.monthsObserved} months:{" "}
              {joinNames(strategy.items.map((item) => item.title))}.
            </>
          }
          statLabel="Monthly recurring total"
          statValue={formatMoney(strategy.monthlyTotal, symbol)}
          statIcon={<RepeatIcon className="size-[16px]" />}
          action={{ label: "Review Recurring", doneLabel: "", icon: <EyeIcon className="size-[13px]" />, to: "/transactions" }}
          onDismiss={onDismiss}
        />
      );
    case "surplus":
      return (
        <StrategyCard
          key={strategy.id}
          tone="green"
          icon={<RocketIcon className="size-[18px]" />}
          eyebrow="Goal velocity"
          title="Surplus Allocation"
          badge={`+${strategy.monthsAhead} Months Fast`}
          body={
            <>
              Net Flow surplus is <b className="font-semibold text-ink">+{formatMoney(strategy.netFlow, symbol)}</b>. Committing {strategy.commitPercent}%
              triggers early completion of your {strategy.goalName}.
            </>
          }
          statLabel="Suggested stash deposit"
          statValue={formatMoney(strategy.depositAmount, symbol)}
          statIcon={<ZapIcon className="size-[16px]" />}
          action={{ label: "Set as Goal", doneLabel: "Goal noted", icon: <RocketIcon className="size-[13px]" /> }}
          onDismiss={onDismiss}
        />
      );
  }
}

/** "Targeted Autonomous Strategies": up to three suggestion cards of equal height. */
export default function StrategiesSection({ strategies, symbol }: { strategies: Strategy[]; symbol: string }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = strategies.filter((strategy) => !dismissed.has(strategy.id));

  return (
    <section aria-label="Targeted strategies">
      <h2 className="flex items-center gap-[10px] text-[15px] font-semibold leading-[normal]">
        <span className="flex size-[27.571px] items-center justify-center rounded-[3.523px] bg-netflow/15 text-netflow">
          <BotIcon className="size-[15px]" />
        </span>
        Targeted Autonomous Strategies
      </h2>
      {visible.length === 0 ? (
        <p className="mt-[16px] rounded-[20.746px] bg-white px-[24px] py-[28px] text-center text-[10px] text-muted shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)]">
          No open suggestions. Refresh insights to run a new analysis.
        </p>
      ) : (
        <div className="mt-[16px] grid grid-cols-3 items-stretch gap-[20px]">
          {visible.map((strategy) =>
            renderStrategy(strategy, symbol, () => setDismissed((prev) => new Set(prev).add(strategy.id))),
          )}
        </div>
      )}
    </section>
  );
}
