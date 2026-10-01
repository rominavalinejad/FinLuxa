import { usePeriod } from "../context/PeriodContext";
import { formatPeriod, greetingPeriod, monthName } from "../lib/date";

// TODO: replace with the account's username once authentication exists.
const PLACEHOLDER_USERNAME = "USER1";

/**
 * Header skeleton: greeting (left) + Profile / Notification / Date cards (right).
 * Per Notion, the three cards are visual demos only for now — no popups or actions.
 */
export default function Header() {
  const { period } = usePeriod();
  const greeting = greetingPeriod() === "morning" ? "Good Morning" : "Good Evening";

  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {greeting} {PLACEHOLDER_USERNAME}
        </h1>
        <p className="opacity-70">
          Here’s your financial overview for {monthName(period)} {period.year}.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Date selector">
          {formatPeriod(period)}
        </button>
        <button type="button" aria-label="Notifications">
          Notifications
        </button>
        <button type="button" aria-label="Profile">
          Profile
        </button>
      </div>
    </header>
  );
}
