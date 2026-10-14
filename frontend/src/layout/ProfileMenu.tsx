import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { chevronDownIcon, navSettingsIcon } from "../assets";
import { HeadsetIcon, LogOutIcon, UserIcon } from "../components/icons";
import MaskIcon from "../components/MaskIcon";

type MenuKey = "profile" | "settings" | "help" | "signout";

interface MenuItem {
  key: MenuKey;
  label: string;
  icon: ReactNode;
  /** Route to open. Items without one are visual demos for now (Notion: designed later). */
  to?: string;
}

// Icons other than the gear are PLACEHOLDERS until the Figma icons are exported.
const ICON = "size-[20px]";
const ITEMS: MenuItem[] = [
  { key: "profile", label: "Profile", icon: <UserIcon className={ICON} fill="currentColor" /> },
  { key: "settings", label: "Settings", icon: <MaskIcon src={navSettingsIcon} width={20} height={20} />, to: "/settings" },
  { key: "help", label: "Help Center", icon: <HeadsetIcon className={ICON} /> },
  { key: "signout", label: "Sign Out", icon: <LogOutIcon className={ICON} /> },
];

/** How long the clicked item stays visibly purple before Settings opens (so the click is seen). */
const NAVIGATE_DELAY_MS = 200;

/** Width of the Sidebar: the blur covers everything to its right, never the Sidebar itself. */
const SIDEBAR_WIDTH = 272;

// One purple "navigator" only: it follows the mouse (hover / keyboard focus). Title and icon turn purple
// only for the item that was clicked.
const ITEM_BASE =
  "flex h-[39px] w-full items-center gap-[19px] rounded-[7.26px] pl-[21px] text-left text-[15px] font-semibold leading-[normal] outline-none transition-colors hover:bg-netflow/20 focus-visible:bg-netflow/20";

/**
 * Figma "Profile Menu" (46:27, 136 x 43) + its popup ("Home Page with Profile Pop Up").
 * Notion "Profile PopUp": the popup opens downwards under the profile button, the page content blurs at
 * the same time (Sidebar stays sharp). A single purple navigator follows the mouse; the clicked item's
 * title and icon turn purple. Settings shows that state briefly, then opens /settings; Profile,
 * Help Center and Sign Out are demos only.
 * NOTE: the blur is a CSS approximation of the Figma Glass effect (tint #0C254B at 20% + backdrop blur);
 * refraction / dispersion / splay have no CSS equivalent.
 */
export default function ProfileMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<MenuKey | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const navigate = useNavigate();
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function toggle() {
    if (!open) setActive(null);
    setOpen((value) => !value);
  }

  function select(item: MenuItem) {
    setActive(item.key);
    const to = item.to;
    if (!to) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      navigate(to);
      setOpen(false);
    }, NAVIGATE_DELAY_MS);
  }

  const renderItem = (item: MenuItem) => (
    <button
      key={item.key}
      type="button"
      role="menuitem"
      onClick={() => select(item)}
      className={`${ITEM_BASE} ${active === item.key ? "text-netflow" : "text-ink"}`}
    >
      {item.icon}
      {item.label}
    </button>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Profile"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="relative block h-[43px] w-[136px] rounded-full bg-white shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.15)]"
      >
        <span className="absolute left-[12px] top-[8px] flex size-[26px] items-center justify-center rounded-full bg-netflow text-[12.773px] font-semibold leading-none text-white">
          {initial}
        </span>
        <span className="absolute left-[48px] top-[13px] max-w-[54px] truncate text-left text-[12.773px] font-semibold leading-[normal]">
          {name}
        </span>
        <span className="absolute left-[106.63px] top-[18.6px] block h-[6.723px] w-[13.108px]">
          <span className="absolute inset-[-15.49%_-7.95%_-22.2%_-7.95%]">
            <img src={chevronDownIcon} alt="" className="block size-full max-w-none" />
          </span>
        </span>
      </button>

      {open && (
        <>
          {/* Blur layer: click anywhere on it to close */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            style={{ left: SIDEBAR_WIDTH }}
            className="fixed inset-y-0 right-0 z-40 animate-fade-in bg-[#0C254B]/20 backdrop-blur-[10px] motion-reduce:animate-none"
          />
          {/* Popup: 283 x 229, right edge aligned with the button, 21px below it */}
          <div
            role="menu"
            aria-label="Profile menu"
            className="absolute right-0 top-[calc(100%+21px)] z-50 flex w-[283px] origin-top animate-popup-in flex-col gap-[12px] rounded-[20px] bg-white px-[23px] py-[12px] shadow-[2.9px_1.91px_6.78px_0_rgba(0,0,0,0.15)] motion-reduce:animate-none"
          >
            {ITEMS.slice(0, 3).map(renderItem)}
            <div aria-hidden="true" className="-mx-[23px] h-px bg-muted/20" />
            {ITEMS.slice(3).map(renderItem)}
          </div>
        </>
      )}
    </div>
  );
}
