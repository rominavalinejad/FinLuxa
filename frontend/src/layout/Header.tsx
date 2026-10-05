import { chevronDownIcon, dateIcon, heartIcon, notificationButton, profileMenu } from "../assets";
import { usePeriod } from "../context/PeriodContext";
import { formatPeriod, greetingPeriod, monthName } from "../lib/date";

// TODO: replace with the account's username once authentication exists.
const PLACEHOLDER_USERNAME = "USER1";

/**
 * Figma "Header" (69:6): greeting (left) + Date / Notification / Profile (right).
 * Per Notion, the three controls are visual demos only for now — no popups or actions.
 * All sizes are Figma pixels.
 */
export default function Header() {
  const { period } = usePeriod();
  const greeting = greetingPeriod() === "morning" ? "Good Morning" : "Good Evening";

  return (
    <header className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-[6px]">
          <h1 className="text-[25px] font-semibold leading-normal">
            {greeting} {PLACEHOLDER_USERNAME}
          </h1>
          <img src={heartIcon} alt="" className="h-[20px] w-[22px]" />
        </div>
        <p className="mt-[5.74px] text-[10px] font-normal leading-normal">
          Here’s your financial overview for {monthName(period)} {period.year}.
        </p>
      </div>

      <div className="-mt-[1px] flex items-start gap-[4.73px]">
        {/* Date Selector: 197.89 x 43.09 */}
        <button
          type="button"
          aria-label="Date selector"
          className="relative h-[43.087px] w-[197.892px] rounded-[21.561px] bg-white shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.15)]"
        >
          <img src={dateIcon} alt="" className="absolute left-[15.754px] top-[8.558px] h-[25.279px] w-[24.165px]" />
          <span className="absolute left-[50.47px] top-[14.73px] whitespace-nowrap text-[12.773px] font-semibold leading-normal">
            {formatPeriod(period)}
          </span>
          <span className="absolute left-[169.96px] top-[18.59px] block h-[6.723px] w-[13.108px]">
            <span className="absolute inset-[-15.49%_-7.95%_-22.2%_-7.95%]">
              <img src={chevronDownIcon} alt="" className="block size-full max-w-none" />
            </span>
          </span>
        </button>

        {/* Notification Button: 42.24 x 42.24 (the unread dot is part of the exported SVG) */}
        <button type="button" aria-label="Notifications" className="relative mt-[0.89px] block size-[42.235px]">
          <span className="absolute inset-[-5.18%_-16.8%_-14.41%_-2.79%]">
            <img src={notificationButton} alt="" className="block size-full max-w-none" />
          </span>
        </button>

        {/* Profile Menu: 81.23 x 43.13 */}
        <button type="button" aria-label="Profile" className="relative block h-[43.129px] w-[81.234px]">
          <span className="absolute inset-[-5.07%_-8.74%_-14.11%_-1.45%]">
            <img src={profileMenu} alt="" className="block size-full max-w-none" />
          </span>
        </button>
      </div>
    </header>
  );
}
