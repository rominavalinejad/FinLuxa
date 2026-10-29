import { useAiInsights } from "../../hooks/useAiInsights";
import { currencySymbol } from "../../lib/money";
import AnomalyStreamCard from "./cards/AnomalyStreamCard";
import HealthHeroCard from "./cards/HealthHeroCard";
import SimulatorCard from "./cards/SimulatorCard";
import SpendingMixCard from "./cards/SpendingMixCard";
import StrategiesSection from "./cards/StrategiesSection";

/**
 * Figma-less page (built from the AI Insight screenshot, adjusted with the owner's decisions).
 * Full content width (1002px) so it lines up with the Header; first block starts 24px under it, like Settings.
 * Vertical rhythm: 28px between sections, 20px between side-by-side cards.
 * Everything here is mock data for now (see api/mock/aiInsightsMock.ts).
 */
export default function AiInsightsPage() {
  const { data, currency, loading, error, refreshing, refresh } = useAiInsights();

  if (error) return <p role="alert">{error}</p>;
  if (loading && !data) return <p>Loading…</p>;
  if (!data) return null;

  const symbol = currencySymbol(currency);

  return (
    <div className="flex flex-col gap-[28px] pt-[24px]">
      <HealthHeroCard
        health={data.health}
        diagnostics={data.diagnostics}
        recommendationCount={data.strategies.length}
        generatedAt={data.generatedAt}
        symbol={symbol}
        refreshing={refreshing}
        onRefresh={refresh}
      />
      <StrategiesSection strategies={data.strategies} symbol={symbol} />
      <SpendingMixCard mix={data.mix} symbol={symbol} />
      <div className="grid grid-cols-[1.4fr_1fr] items-stretch gap-[20px]">
        <SimulatorCard base={data.simulator} symbol={symbol} />
        <AnomalyStreamCard anomalies={data.anomalies} checksActive={data.checksActive} symbol={symbol} />
      </div>
    </div>
  );
}
