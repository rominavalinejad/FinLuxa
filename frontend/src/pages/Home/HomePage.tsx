import { useHomeData } from "../../hooks/useHomeData";
import AIInsightCard from "./cards/AIInsightCard";
import BudgetOverviewCard from "./cards/BudgetOverviewCard";
import CashFlowCard from "./cards/CashFlowCard";
import CurrentBalanceCard from "./cards/CurrentBalanceCard";
import MonthlyOverviewCard from "./cards/MonthlyOverviewCard";
import SavingGoalCard from "./cards/SavingGoalCard";
import SmallStepsCard from "./cards/SmallStepsCard";
import SpendingByCategoryCard from "./cards/SpendingByCategoryCard";

export default function HomePage() {
  const { data, loading, error } = useHomeData();

  if (error) return <p role="alert">{error}</p>;
  if (loading && !data) return <p>Loading…</p>;
  if (!data) return null;

  return (
    <div className="home-grid">
      <CurrentBalanceCard data={data.balance} />
      <CashFlowCard data={data.cashFlow} />
      <BudgetOverviewCard data={data.budgetOverview} />
      <SpendingByCategoryCard data={data.spendingByCategory} />
      <SavingGoalCard />
      <AIInsightCard />
      <MonthlyOverviewCard data={data.monthlyOverview} />
      <SmallStepsCard />
    </div>
  );
}
