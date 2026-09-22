import { formatCurrencyWhole } from "@/lib/format";
import type { DashboardMetrics } from "@/types/project";

/*
  The three cash-flow figures. Every value is derived from the live dataset
  (see deriveMetrics) so the cards can never disagree with the table below.

  The tinted icon wells are gone. They were decoration that carried no
  information — the label already says what the number is — and in a
  monochrome interface a coloured square is the loudest thing on the page
  pointing at the least important part of it. What is left is the hierarchy
  that matters: label, number, context.
*/

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="border-hairline bg-surface rounded-lg border p-5">
      <p className="text-ink-muted text-[13px]">{label}</p>
      <p className="numeric mt-2 text-3xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="text-ink-faint mt-1.5 text-xs">{hint}</p>
    </div>
  );
}

export default function SummaryCards({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  return (
    <section aria-label="Cash flow summary">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          label="Unpaid Invoices"
          value={formatCurrencyWhole(metrics.unpaidInvoices)}
          hint="Billed and awaiting payment"
        />
        <Card
          label="This Month's Earnings"
          value={formatCurrencyWhole(metrics.monthEarnings)}
          hint="Payments received this month"
        />
        <Card
          label="Active Projects"
          value={String(metrics.activeProjects)}
          hint="Not yet invoiced"
        />
      </div>
    </section>
  );
}
