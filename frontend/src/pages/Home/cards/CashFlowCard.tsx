import { formatAmount } from "../../../lib/format";
import type { CashFlowSummary } from "../../../types/home";
import CardShell from "./CardShell";

export default function CashFlowCard({ data }: { data: CashFlowSummary }) {
  return (
    <CardShell title="Cash Flow" area="cashflow">
      <dl>
        <dt>Income</dt>
        <dd>{formatAmount(data.income)}</dd>
        <dt>Expense</dt>
        <dd>{formatAmount(data.expense)}</dd>
        <dt>Net Flow</dt>
        <dd>{formatAmount(data.netFlow)}</dd>
      </dl>
    </CardShell>
  );
}
