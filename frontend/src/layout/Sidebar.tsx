import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 p-6" aria-label="Main navigation">
      {/* Logo, name and tagline: asset + copy to be taken from Figma. */}
      <div className="mb-8">
        <div className="font-semibold">FinLuxa</div>
        <div className="text-sm opacity-70">{/* tagline from Figma */}</div>
      </div>
      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `rounded px-3 py-2 ${isActive ? "font-semibold" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
