import { useLocation } from "react-router-dom";
import { chevronDownIcon, dateIcon, heartIcon, notificationButton } from "../assets";
import { usePeriod } from "../context/PeriodContext";
import { formatPeriod, greetingPeriod } from "../lib/date";
import { getHeaderContent } from "./pageHeaders";
import ProfileMenu from "./ProfileMenu";

// TODO: replace with the signed-in user's name once authentication exists (Figma demo name).
const PLACEHOLDER_NAME = "Romina";

/**
 * Figma "Header" (69:6): 1002 x 55. Title block (left) + Date / Notification / Profile (right).
 * The title block and the Date selector depend on the route (see pageHeaders.ts).
 * Per Notion, the three controls are visual demos only for now — no popups or actions.
 * Sizes and offsets are Figma pixels (read from the file's layer geometry).
 */
export default function Header() {
  const { period } = usePeriod();
  const { pathname } = useLocation();
  const greeting = greetingPeriod() === "morning" ? "Good Morning" : "Good Evening";
  const content = getHeaderContent(pathname, { greeting, userName: PLACEHOLDER_NAME, period });

  return (
    <header className="flex items-start justify-between">
      <div className="pt-[1px]">
        <div className="flex items-center gap-[6px]">
          <h1 className="text-[25px] font-semibold leading-[normal]">{content.title}</h1>
          {content.showHeart && <img src={heartIcon} alt="" className="h-[20px] w-[22px]" />}
        </div>
        <p className="mt-[5.74px] text-[15px] font-normal leading-[normal]">{content.subtitle}</p>
      </div>

      <div className="flex items-start gap-[12px]">
        {/* Date Selector: 197.89 x 43.09 */}
        {content.showDateSelector && (
          <button
            type="button"
            aria-label="Date selector"
            className="relative h-[43.087px] w-[197.892px] rounded-[21.561px] bg-white shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.15)]"
          >
            <img src={dateIcon} alt="" className="absolute left-[15.754px] top-[8.558px] h-[25.279px] w-[24.165px]" />
            <span className="absolute left-[50.47px] top-[14.73px] whitespace-nowrap text-[12.773px] font-semibold leading-[normal]">
              {formatPeriod(period)}
            </span>
            <span className="absolute left-[169.96px] top-[18.59px] block h-[6.723px] w-[13.108px]">
              <span className="absolute inset-[-15.49%_-7.95%_-22.2%_-7.95%]">
                <img src={chevronDownIcon} alt="" className="block size-full max-w-none" />
              </span>
            </span>
          </button>
        )}

        {/* Compare (Transactions): same pill as the Date Selector, ~237 wide.
            DEMO ONLY: it only compares the three summary cards of the Transactions page; options and logic come later.
            It does not touch PeriodContext. */}
        {content.showCompare && (
          <button
            type="button"
            aria-label="Compare to last month (demo)"
            className="relative h-[43.087px] w-[237px] rounded-[21.561px] bg-white shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.15)]"
          >
            <img src={dateIcon} alt="" className="absolute left-[15.754px] top-[8.558px] h-[25.279px] w-[24.165px]" />
            <span className="absolute left-[50.47px] top-[14.73px] whitespace-nowrap text-[12.773px] font-semibold leading-[normal]">
              Compare to Last Month
            </span>
            <span className="absolute left-[209px] top-[18.59px] block h-[6.723px] w-[13.108px]">
              <span className="absolute inset-[-15.49%_-7.95%_-22.2%_-7.95%]">
                <img src={chevronDownIcon} alt="" className="block size-full max-w-none" />
              </span>
            </span>
          </button>
        )}

        {/* Notification Button: 42.24 x 42.24, 1px lower (the unread dot is part of the exported SVG) */}
        <button type="button" aria-label="Notifications" className="relative mt-[1px] block size-[42.235px]">
          <span className="absolute inset-[-5.18%_-16.8%_-14.41%_-2.79%]">
            <img src={notificationButton} alt="" className="block size-full max-w-none" />
          </span>
        </button>

        {/* Profile Menu: 136 x 43 + popup (see ProfileMenu.tsx) */}
        <ProfileMenu name={PLACEHOLDER_NAME} />
      </div>
    </header>
  );
}
