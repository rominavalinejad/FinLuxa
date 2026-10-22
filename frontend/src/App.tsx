import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/Home/HomePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import TransactionsPage from "./pages/Transactions/TransactionsPage";
import ComingSoon from "./pages/placeholders/ComingSoon";
import { NAV_ITEMS } from "./layout/navItems";

// Pages that have their own implementation (everything else renders the ComingSoon placeholder).
const IMPLEMENTED_PATHS = new Set(["/", "/settings", "/transactions"]);

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        {NAV_ITEMS.filter((item) => !IMPLEMENTED_PATHS.has(item.path)).map((item) => (
          <Route key={item.path} path={item.path} element={<ComingSoon title={item.label} />} />
        ))}
        <Route path="/budget" element={<ComingSoon title="Budget" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
