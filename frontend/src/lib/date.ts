import type { Period } from "../types/home";

export function currentPeriod(now: Date = new Date()): Period {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** e.g. { year: 2026, month: 9 } -> "September 2026" */
export function formatPeriod({ year, month }: Period): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
}

export function monthName({ year, month }: Period): string {
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(year, month - 1, 1));
}

/** The current month plus the 5 months before it, oldest first (current month last). */
export function lastSixMonths(now: Date = new Date()): Period[] {
  const { year, month } = currentPeriod(now);
  const result: Period[] = [];
  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(year, month - 1 - offset, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return result;
}

export type GreetingPeriod = "morning" | "evening";

/**
 * PENDING CONFIRMATION: Notion only defines "Good Morning" / "Good Evening".
 * Current assumption: browser-local time, before 12:00 = morning, otherwise evening.
 */
export function greetingPeriod(now: Date = new Date()): GreetingPeriod {
  return now.getHours() < 12 ? "morning" : "evening";
}
