import { useEffect, useState } from "react";
import { fetchHomeData } from "../api/home";
import { usePeriod } from "../context/PeriodContext";
import type { HomeData } from "../types/home";

interface State {
  data: HomeData | null;
  loading: boolean;
  error: string | null;
}

export function useHomeData(): State {
  const { period } = usePeriod();
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchHomeData(period)
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err: Error) => !cancelled && setState({ data: null, loading: false, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, [period]);

  return state;
}
