import type { AiInsightsData } from "../types/aiInsights";
import { USE_MOCK, apiGet } from "./client";
import { getMockAiInsights } from "./mock/aiInsightsMock";

/**
 * Single entry point for AI Insights data.
 * The real endpoint does not exist yet in api/main.py (Brain will compute the insights),
 * so the path below is a placeholder and only the mock mode works for now.
 */
export async function fetchAiInsights(): Promise<AiInsightsData> {
  if (USE_MOCK) return getMockAiInsights();
  return apiGet<AiInsightsData>("/ai-insights");
}
