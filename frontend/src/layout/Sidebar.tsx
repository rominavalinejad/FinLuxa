import { NavLink } from "react-router-dom";
import { logo } from "../assets";
import MaskIcon from "../components/MaskIcon";
import { NAV_ITEMS } from "./navItems";

/** Figma "Sidebar" (67:4): 303px wide, full height. All sizes are Figma pixels. */
export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-screen w-[303px] shrink-0 bg-sidebar text-white" aria-label="Main navigation">
      {/* Brand block: logo + name + tagline (navigation starts 157px from the top) */}
      <div className="relative h-[157px]">
        <img src={logo} alt="" className="absolute left-[49px] top-[44px] h-[57px] w-[49px]" />
        <div className="absolute left-[104.9px] top-[53px] text-[25px] font-semibold leading-normal">FinLuxa</div>
        <div className="absolute left-[104.9px] top-[89px] text-[10px] font-light leading-normal">
          Smarter Money, Simpler Life
        </div>
      </div>

      <nav className="flex flex-col gap-[15px] px-[34px]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex h-[39px] w-full items-center rounded-[7.26px] pl-[27.5px] text-[15px] font-semibold leading-normal ${
                isActive ? "bg-nav-active text-brand" : "text-white"
              }`
            }
          >
            <span className="flex w-[24px] justify-center">
              <MaskIcon src={item.icon} width={item.iconSize.width} height={item.iconSize.height} />
            </span>
            <span className="ml-[19.5px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
