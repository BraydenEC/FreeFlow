import Link from "next/link";
import { daysUntil, formatCurrency, formatMonthDay, projectValue } from "@/lib/format";
import type { Project } from "@/types/project";

/*
  The one conditional widget.

  Renders only when something is actually overdue, and when pinned it is
  forced above everything else. The point is that the dashboard rearranges
  itself around what needs attention today rather than showing the same
  layout regardless — which is what "choose what shows up and when" means in
  practice.

  Deliberately small: name, client, value, how late. A freelancer opening the
  page needs to know what to chase, not read a table.
*/

export default function OverdueAlert({
  projects,
  now,
}: {
  projects: Project[];
  now: Date;
}) {
  const overdue = projects
    .filter((p) => p.status === "overdue" || daysUntil(p.deadline, now) < 0)
    .filter((p) => !p.isPaid)
    .sort((a, b) => daysUntil(a.deadline, now) - daysUntil(b.deadline, now));

  if (overdue.length === 0) return null;

  const total = overdue.reduce((s, p) => s + projectValue(p), 0);

  return (
    <section
      aria-labelledby="overdue-heading"
      className="rounded-xl border border-status-overdue bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-status-overdue/30 px-5 py-3 sm:px-6">
        <h2 id="overdue-heading" className="text-[15px] font-semibold text-status-overdue">
          {overdue.length} overdue · {formatCurrency(total)} outstanding
        </h2>
        <Link
          href="/"
          className="text-ink-faint hover:text-ink text-xs underline underline-offset-2"
        >
          full table ↓
        </Link>
      </div>
      <ul>
        {overdue.map((p) => {
          const late = Math.abs(daysUntil(p.deadline, now));
          return (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 border-t border-hairline px-5 py-2.5 first:border-t-0 sm:px-6"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-ink-muted truncate text-xs">{p.client}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="numeric text-sm">{formatCurrency(projectValue(p))}</p>
                <p className="numeric text-xs text-status-overdue">
                  {formatMonthDay(p.deadline)} · {late}d late
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
