import { Link } from "react-router-dom";
import CardShell from "./CardShell";

/** Appearance only; the AI logic comes in a later phase. The button routes to the AI Insights page. */
export default function AIInsightCard() {
  return (
    <CardShell title="AI Insight" area="ai">
      <Link to="/ai-insights">See Details</Link>
    </CardShell>
  );
}
