import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * Figma Home frame (1440 x 900, sidebar 272px): the content block (1001.8px wide) is centred in the
 * area to the right of the sidebar (about 83px on each side), 53px from the top; the first card row
 * starts 136px from the top (35px below the header).
 */
export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-page">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-[56px] pt-[53px]">
        <div className="mx-auto w-[1001.82px]">
          <Header />
          <main className="mt-[35px] min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
