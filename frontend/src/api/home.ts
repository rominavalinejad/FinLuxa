import type { HomeData, Period } from "../types/home";
import { USE_MOCK, apiGet } from "./client";
import { getMockHomeData } from "./mock/homeMock";

/**
 * Single entry point for Home data.
 * The real endpoint does not exist yet in API/main.py — the path below is a
 * placeholder to be agreed on when the backend work starts.
 */
export async function fetchHomeData(period: Period): Promise<HomeData> {
  if (USE_MOCK) return getMockHomeData(period);
  return apiGet<HomeData>(`/home?year=${period.year}&month=${period.month}`);
}
