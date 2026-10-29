import { useCallback, useEffect, useState } from "react";
import { fetchAiInsights } from "../api/aiInsights";
import { fetchSettings } from "../api/settings";
import type { AiInsightsData } from "../types/aiInsights";

interface State {
  data: AiInsightsData | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_CURRENCY = "IRR";

export function useAiInsights() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  const [refreshing, setRefreshing] = useState(false);
  /** ISO 4217 code from Settings > Preferences. */
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    let cancelled = false;
    fetchAiInsights()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err: Error) => !cancelled && setState({ data: null, loading: false, error: err.message }));
    // A failing settings request must not break the page: keep the default currency.
    fetchSettings()
      .then((settings) => !cancelled && setCurrency(settings.preferences.currency))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  /** "Refresh Insights": runs the analysis again. Keeps the old data on screen if it fails. */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchAiInsights();
      setState({ data, loading: false, error: null });
    } catch {
      // keep the previous insights
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { ...state, currency, refreshing, refresh };
}
