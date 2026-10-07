import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";
import HomePage from "./pages/Home/HomePage";
import ComingSoon from "./pages/placeholders/ComingSoon";
import { NAV_ITEMS } from "./layout/navItems";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        {NAV_ITEMS.filter((item) => item.path !== "/").map((item) => (
          <Route key={item.path} path={item.path} element={<ComingSoon title={item.label} />} />
        ))}
        <Route path="/budget" element={<ComingSoon title="Budget" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
