import Link from "next/link";
import { formatCurrency, formatMonthDay, lateness, paymentDue, projectValue } from "@/lib/format";
import type { CurrencyCode } from "@/lib/currency";
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
  currency,
  termsDays,
}: {
  projects: Project[];
  now: Date;
  currency: CurrencyCode;
  termsDays: number;
}) {
  // M1: an invoice counts from its payment date, work from its deadline.
  const overdue = projects
    .filter((p) => lateness(p, now, termsDays).late)
    .sort((a, b) => lateness(b, now, termsDays).days - lateness(a, now, termsDays).days);

  if (overdue.length === 0) return null;

  const total = overdue.reduce((s, p) => s + projectValue(p), 0);

  return (
    <section
      aria-labelledby="overdue-heading"
      className="rounded-xl border border-rose-400/30 bg-rose-400/5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-400/20 px-5 py-3 sm:px-6">
        <h2 id="overdue-heading" className="text-[15px] font-semibold text-rose-200">
          {overdue.length} overdue · {formatCurrency(total, currency)} outstanding
        </h2>
        <Link
          href="#widget-projects"
          className="text-ink-faint hover:text-ink text-xs underline underline-offset-2"
        >
          full table ↓
        </Link>
      </div>
      <ul>
        {overdue.map((p) => {
          const l = lateness(p, now, termsDays);
          return (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 border-t border-rose-400/10 px-5 py-2.5 first:border-t-0 sm:px-6"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium [overflow-wrap:anywhere]">{p.name}</p>
                <p className="text-ink-muted truncate text-xs">{p.client}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="numeric text-sm">{formatCurrency(projectValue(p), currency)}</p>
                <p className="numeric text-status-overdue text-xs">
                  {l.kind === "payment" ? `payment due ${formatMonthDay(paymentDue(p, termsDays), now)}` : formatMonthDay(p.deadline, now)} · {l.days}d late
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
