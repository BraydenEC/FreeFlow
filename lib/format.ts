import { DEFAULT_CURRENCY, formatMoney, type CurrencyCode } from "@/lib/currency";
import type { Project } from "@/types/project";

/*
  Formatting helpers.

  Two hazards this file exists to contain:

  1. HYDRATION MISMATCH. Intl formatters follow the runtime's locale, and
     `new Date()` differs between the server render and the client render.
     If those disagree, React logs a hydration error — red console noise
     during a recorded demo. Every formatter here pins locale to "en-US" and
     takes `now` as an argument rather than reading the clock, so the same
     input always produces the same output on both sides.

  2. OFF-BY-ONE DAYS. `new Date("2026-08-20")` parses as UTC midnight; if the
     viewer is west of UTC, formatting it locally renders "Aug 19". Deadlines
     are calendar dates, not instants, so everything below parses and formats
     in UTC explicitly.
*/

const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const monthDayYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const MS_PER_DAY = 86_400_000;

/**
 * "$4,837.50" — used in the table, where amounts are compared down a column.
 *
 * The currency is passed in rather than read from a module-level default, for
 * the same reason `now` is passed to every component that measures a
 * deadline: one request must render one currency everywhere, and a value read
 * from ambient state can differ between two parts of the same page.
 */
export function formatCurrency(amount: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatMoney(amount, code);
}

/** "$3,450" — used on the summary cards, where cents are visual noise. */
export function formatCurrencyWhole(amount: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  return formatMoney(amount, code, { whole: true });
}

/** Parse a "YYYY-MM-DD" calendar date into a UTC-midnight Date. */
export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Render an ISO date as "Oct 25", or "Jan 1, 2020" outside the current year (M12). */
export function formatMonthDay(iso: string, now: Date = new Date()): string {
  const d = parseIsoDate(iso);
  return (d.getUTCFullYear() === now.getUTCFullYear() ? monthDay : monthDayYear).format(d);
}

/**
 * Whole days from `now` until `iso`. Negative means the date has passed.
 * Both sides are floored to UTC midnight so the result is a calendar-day
 * count, not an hours-elapsed division that flips based on time of day.
 */
export function daysUntil(iso: string, now: Date): number {
  const target = parseIsoDate(iso).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / MS_PER_DAY);
}

/**
 * Human-readable deadline proximity: "in 3 days", "tomorrow", "2 days overdue".
 * The handoff asks for "Oct 25 (in 3 days)" — this produces the parenthetical.
 */
export function formatRelativeDeadline(iso: string, now: Date): string {
  const days = daysUntil(iso, now);

  if (days === 0) return "due today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `in ${days} days`;
}

/*
  M1 (user testing): a project showed "9d late" in red while the forecast
  expected its money in December. Both were right about different dates. Once
  an invoice is sent, what matters is the payment date, deadline plus payment
  terms, which is the date the forecast already uses. Work not yet invoiced is
  still late at its deadline.

  The default must equal DEFAULT_TERMS_DAYS in lib/forecast/model.ts (that
  module imports this one, so it can't be imported here); a test pins them.
*/
const TERMS_FALLBACK = 30;

type Timing = Pick<Project, "deadline" | "isPaid"> & Partial<Pick<Project, "status" | "paymentTermsDays">>;

/** The date an invoiced project's money is expected: deadline + its terms. */
export function paymentDue(project: Timing, termsDays: number = TERMS_FALLBACK): string {
  const terms =
    project.paymentTermsDays !== null && project.paymentTermsDays !== undefined && Number.isFinite(project.paymentTermsDays)
      ? project.paymentTermsDays
      : termsDays;
  const d = parseIsoDate(project.deadline);
  d.setUTCDate(d.getUTCDate() + terms);
  return d.toISOString().slice(0, 10);
}

/** Whether a project is late, by how many days, and late for what. */
export function lateness(
  project: Timing,
  now: Date,
  termsDays: number = TERMS_FALLBACK,
): { late: boolean; days: number; kind: "payment" | "deadline" } {
  if (project.isPaid) return { late: false, days: 0, kind: "deadline" };
  if (project.status === "invoice_sent") {
    const days = -daysUntil(paymentDue(project, termsDays), now);
    return { late: days > 0, days: Math.max(0, days), kind: "payment" };
  }
  const days = -daysUntil(project.deadline, now);
  return { late: project.status === "overdue" || days > 0, days: Math.max(0, days), kind: "deadline" };
}

/**
 * What the Due Date column says under the date, and in what colour.
 *
 * A paid project has nothing left to be late for, so it gets no wording and no
 * colour at all, whatever its deadline. An invoiced project speaks about its
 * payment date (M1); anything else about its deadline.
 */
export function deadlineNote(
  project: Timing,
  now: Date,
  termsDays: number = TERMS_FALLBACK,
): { text: string | null; tone: "late" | "soon" | "plain" } {
  if (project.isPaid) return { text: null, tone: "plain" };

  if (project.status === "invoice_sent") {
    const due = paymentDue(project, termsDays);
    const days = daysUntil(due, now);
    if (days < 0) return { text: `payment ${-days} day${days === -1 ? "" : "s"} late`, tone: "late" };
    return { text: `payment due ${formatMonthDay(due, now)}`, tone: days <= 3 ? "soon" : "plain" };
  }

  const days = daysUntil(project.deadline, now);
  return {
    text: formatRelativeDeadline(project.deadline, now),
    tone: days < 0 ? "late" : days <= 3 ? "soon" : "plain",
  };
}

/**
 * A project's financial value: the fixed fee when one exists, otherwise
 * hours × rate. Centralized because the summary cards and the table must
 * never disagree about what a project is worth.
 */
export function projectValue(project: Project): number {
  return project.invoiceTotal ?? project.hoursLogged * project.hourlyRate;
}
