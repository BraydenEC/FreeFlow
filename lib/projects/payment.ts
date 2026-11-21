import { isRealCalendarDate } from "@/lib/projects/schema";

/*
  Payment dates (H4 in docs/user-testing/USER_TESTING_HANDOFF.md).

  Every tester marked a project paid and then could neither undo it nor say
  when the money actually arrived. The paid date decides which month's
  earnings a payment counts toward, so it has to be the user's calendar day,
  not the server's UTC one, and it can't be in the future.
*/

/** Today's date on the user's own calendar, as YYYY-MM-DD. */
export function localToday(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/*
  `todayIso` is the server's UTC date. A user east of UTC can already be on
  tomorrow, so one day of slack is allowed; anything later is a typo.
*/
export function paidDateError(value: string, todayIso: string): string | null {
  if (!isRealCalendarDate(value)) return "Paid on must be a real date.";
  const [y, m, d] = todayIso.split("-").map(Number);
  const latest = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  if (value > latest) return "Paid on can't be in the future.";
  return null;
}

/** True when the Edit form's Paid on differs from what is stored. */
export function paidDateChanged(
  project: { isPaid: boolean; paidAt: string | null },
  formValue: string,
): boolean {
  return project.isPaid && formValue !== "" && formValue !== project.paidAt;
}
