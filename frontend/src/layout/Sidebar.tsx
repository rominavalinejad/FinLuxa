import { NavLink } from "react-router-dom";
import { logo, sidebarLeaf } from "../assets";
import MaskIcon from "../components/MaskIcon";
import { NAV_ITEMS } from "./navItems";

/** Figma "Sidebar" (67:4): 272px wide, full height. All sizes are Figma pixels. */
export default function Sidebar() {
  return (
    <aside
      className="sticky top-0 h-screen w-[272px] shrink-0 overflow-hidden bg-sidebar text-white"
      aria-label="Main navigation"
    >
      {/* Brand block: logo + name + tagline (navigation starts 151px from the top) */}
      <div className="relative h-[151px]">
        <img src={logo} alt="" className="absolute left-[32px] top-[44px] h-[57px] w-[49px]" />
        <div className="absolute left-[87.9px] top-[53px] text-[25px] font-semibold leading-[normal]">FinLuxa</div>
        <div className="absolute left-[87.9px] top-[89px] text-[10px] font-light leading-[normal]">
          Smarter Money, Simpler Life
        </div>
      </div>

      {/* Items are 39px tall boxes, 60px apart. The green pill (238px wide) follows the mouse (hover / focus);
          icon + title turn green only for the clicked (active) page. */}
      <nav className="flex flex-col gap-[21px] pl-[17px]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex h-[39px] w-[238px] items-center rounded-[7.26px] pl-[26px] text-[15px] font-semibold leading-[normal] outline-none transition-colors hover:bg-nav-active focus-visible:bg-nav-active ${
                isActive ? "bg-nav-active text-brand" : "text-white"
              }`
            }
          >
            <MaskIcon src={item.icon} width={item.iconSize.width} height={item.iconSize.height} />
            <span style={{ marginLeft: item.gap }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/*
        Bottom decoration (all pages). Offsets are measured from the Settings screenshot
        (1080px wide -> x1.333 to Figma pixels), so they are approximate (about +-2px).
        The leaf is anchored to the bottom edge so it follows the sidebar height.
      */}
      <img
        src={sidebarLeaf}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[33px] left-0 h-[172px] w-[200px] max-w-none"
      />
      {/* Same font, size and weight as the brand tagline above */}
      <p className="absolute bottom-[32px] left-[75px] text-[10px] font-light leading-[normal]">
        Better decisions.
        <br />A brighter financial future.
      </p>
    </aside>
  );
}
