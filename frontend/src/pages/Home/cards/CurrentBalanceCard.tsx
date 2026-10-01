import { formatAmount } from "../../../lib/format";
import type { BalanceSummary } from "../../../types/home";
import CardShell from "./CardShell";

export default function CurrentBalanceCard({ data }: { data: BalanceSummary }) {
  const positive = data.netFlow >= 0; // drives the green / red gradient later
  return (
    <CardShell title="Current Balance" area="balance">
      <div data-trend={positive ? "up" : "down"}>
        <div>{formatAmount(data.currentBalance)}</div>
        <div>
          {positive ? "▲" : "▼"} {formatAmount(Math.abs(data.netFlow))}
        </div>
        {/* TODO: "Balance over time" line chart */}
        <div>Starting Balance: {formatAmount(data.startingBalance)}</div>
      </div>
    </CardShell>
  );
}
