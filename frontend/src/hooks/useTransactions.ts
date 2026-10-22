import { useCallback, useEffect, useState } from "react";
import { fetchSettings } from "../api/settings";
import { createTransaction, fetchTransactions } from "../api/transactions";
import type { NewTransaction, TransactionsData } from "../types/transactions";

interface State {
  data: TransactionsData | null;
  loading: boolean;
  error: string | null;
}

const DEFAULT_CURRENCY = "IRR";

export function useTransactions() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  /** ISO 4217 code from Settings > Preferences. */
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    let cancelled = false;
    fetchTransactions()
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

  /** Throws on failure so the Add panel can show the message and keep the form. */
  const addTransaction = useCallback(async (input: NewTransaction) => {
    const created = await createTransaction(input);
    setState((prev) =>
      prev.data ? { ...prev, data: { ...prev.data, transactions: [created, ...prev.data.transactions] } } : prev,
    );
  }, []);

  return { ...state, currency, addTransaction };
}
