import { formatAmount } from "../../../lib/format";
import { formatPeriod } from "../../../lib/date";
import type { MonthlyOverviewPoint } from "../../../types/home";
import CardShell from "./CardShell";

export default function MonthlyOverviewCard({ data }: { data: MonthlyOverviewPoint[] }) {
  return (
    <CardShell title="Monthly Overview" area="monthly">
      {/* TODO: Bar (Income, Expense) + Line (Net Flow) combo chart; dynamic Y axis starting at 0 */}
      <ul>
        {data.map((point) => (
          <li key={`${point.period.year}-${point.period.month}`}>
            {formatPeriod(point.period)}: +{formatAmount(point.income)} / −{formatAmount(point.expense)} = {formatAmount(point.netFlow)}
          </li>
        ))}
      </ul>
    </CardShell>
  );
}
