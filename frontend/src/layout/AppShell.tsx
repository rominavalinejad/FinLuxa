import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * Page paddings from the Figma Home frame:
 * content starts 46px right of the sidebar, 31px from the top, 45.2px from the right edge;
 * the first card row starts ~157px from the top (59px below the header).
 */
export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-[44px] pl-[46px] pr-[45.2px] pt-[31px]">
        <Header />
        <main className="mt-[59px] min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
