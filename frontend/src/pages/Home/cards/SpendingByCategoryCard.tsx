import { formatAmount, formatPercent } from "../../../lib/format";
import type { CategorySpending } from "../../../types/home";
import CardShell from "./CardShell";

export default function SpendingByCategoryCard({ data }: { data: CategorySpending[] }) {
  return (
    <CardShell title="Spending by Category" area="spending">
      {/* TODO: donut chart (left) */}
      <ul>
        {data.map((item) => (
          <li key={item.categoryId}>
            {item.name} — {formatAmount(item.amount)} ({formatPercent(item.percent)})
          </li>
        ))}
      </ul>
    </CardShell>
  );
}
