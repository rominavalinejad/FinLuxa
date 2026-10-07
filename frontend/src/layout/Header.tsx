import { chevronDownIcon, dateIcon, heartIcon, notificationButton } from "../assets";
import { usePeriod } from "../context/PeriodContext";
import { formatPeriod, greetingPeriod, monthName } from "../lib/date";

// TODO: replace with the signed-in user's name once authentication exists (Figma demo name).
const PLACEHOLDER_NAME = "Romina";

/**
 * Figma "Header": greeting (left) + Date / Notification / Profile (right).
 * Per Notion, the three controls are visual demos only for now — no popups or actions.
 * NOTE: the subtitle size, the control gaps and the Profile pill were measured from a Figma
 * screenshot (not read from the file), so they are approximate until Figma can be re-read.
 */
export default function Header() {
  const { period } = usePeriod();
  const greeting = greetingPeriod() === "morning" ? "Good Morning" : "Good Evening";
  const initial = PLACEHOLDER_NAME.charAt(0).toUpperCase();

  return (
    <header className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-[6px]">
          <h1 className="text-[25px] font-semibold leading-normal">
            {greeting} {PLACEHOLDER_NAME}
          </h1>
          <img src={heartIcon} alt="" className="h-[20px] w-[22px]" />
        </div>
        <p className="mt-[5.74px] text-[15px] font-normal leading-normal">
          Here’s your financial overview for {monthName(period)} {period.year}.
        </p>
      </div>

      <div className="-mt-[1px] flex items-start gap-[11.5px]">
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

        {/* Profile Menu: avatar with the user's initial + name + chevron (built in code so the name is dynamic) */}
        <button
          type="button"
          aria-label="Profile"
          className="flex h-[43.129px] min-w-[136.6px] items-center rounded-full bg-white pl-[11.2px] pr-[14.8px] shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.15)]"
        >
          <span className="flex size-[27.5px] shrink-0 items-center justify-center rounded-full bg-netflow text-[12.773px] font-semibold leading-none text-white">
            {initial}
          </span>
          <span className="ml-[9.2px] flex-1 whitespace-nowrap text-left text-[12.773px] font-semibold leading-normal">
            {PLACEHOLDER_NAME}
          </span>
          <span className="relative ml-[8px] block h-[6.723px] w-[13.108px] shrink-0">
            <span className="absolute inset-[-15.49%_-7.95%_-22.2%_-7.95%]">
              <img src={chevronDownIcon} alt="" className="block size-full max-w-none" />
            </span>
          </span>
        </button>
      </div>
    </header>
  );
}
