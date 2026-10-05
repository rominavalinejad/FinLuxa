import { useHomeData } from "../../hooks/useHomeData";
import AIInsightCard from "./cards/AIInsightCard";
import BudgetOverviewCard from "./cards/BudgetOverviewCard";
import CashFlowCard from "./cards/CashFlowCard";
import CurrentBalanceCard from "./cards/CurrentBalanceCard";
import MonthlyOverviewCard from "./cards/MonthlyOverviewCard";
import SavingGoalCard from "./cards/SavingGoalCard";
import SmallStepsCard from "./cards/SmallStepsCard";
import SpendingByCategoryCard from "./cards/SpendingByCategoryCard";

/**
 * Card positions follow the Figma Home frame: three columns (428.18 / 269.54 / 254.31 wide,
 * 25px apart) with their own vertical gaps, then a bottom row of two wide cards.
 */
export default function HomePage() {
  const { data, loading, error } = useHomeData();

  if (error) return <p role="alert">{error}</p>;
  if (loading && !data) return <p>Loading…</p>;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-[19.75px]">
      <div className="flex items-start gap-[25.06px]">
        <div className="flex shrink-0 flex-col gap-[17.23px]">
          <CurrentBalanceCard data={data.balance} />
          <SpendingByCategoryCard data={data.spendingByCategory} />
        </div>
        <div className="flex shrink-0 flex-col gap-[22.73px]">
          <CashFlowCard data={data.cashFlow} />
          <SavingGoalCard />
        </div>
        <div className="flex shrink-0 flex-col gap-[12.16px]">
          <BudgetOverviewCard data={data.budgetOverview} />
          <AIInsightCard />
        </div>
      </div>
      <div className="flex gap-[20.92px]">
        <MonthlyOverviewCard data={data.monthlyOverview} />
        <SmallStepsCard />
      </div>
    </div>
  );
}
