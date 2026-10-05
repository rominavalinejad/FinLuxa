import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * Page paddings from the Figma Home frame (1440 x 900):
 * content starts 68px right of the sidebar and 53px from the top, with 67.2px on the right;
 * the first card row starts 136px from the top (35px below the header).
 */
export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-[56px] pl-[68px] pr-[67.2px] pt-[53px]">
        <Header />
        <main className="mt-[35px] min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
