import { formatAmount, formatPercent } from "../../../lib/format";
import type { BudgetItem } from "../../../types/home";
import CardShell from "./CardShell";

export default function BudgetOverviewCard({ data }: { data: BudgetItem[] }) {
  return (
    <CardShell title="Budget Overview" area="budget">
      {/* TODO: "View all" link and progress bars */}
      <ul>
        {data.map((item) => (
          <li key={item.categoryId}>
            {item.name}: {formatAmount(item.spent)} / {formatAmount(item.budget)} ({formatPercent(item.percentUsed)})
          </li>
        ))}
      </ul>
    </CardShell>
  );
}
