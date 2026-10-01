import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        <Header />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
