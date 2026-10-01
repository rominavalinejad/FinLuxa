import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { currentPeriod } from "../lib/date";
import type { Period } from "../types/home";

interface PeriodContextValue {
  /** The month/year chosen in the Header's Date selector. */
  period: Period;
  setPeriod: (period: Period) => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<Period>(() => currentPeriod());
  const value = useMemo(() => ({ period, setPeriod }), [period]);
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
}

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error("usePeriod must be used inside <PeriodProvider>");
  return ctx;
}
