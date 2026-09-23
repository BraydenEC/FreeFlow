import { formatCurrencyWhole } from "@/lib/format";
import type { DashboardMetrics } from "@/types/project";

/*
  The three cash-flow figures. Every value here is derived from the live
  dataset (see deriveMetrics) so the cards can never disagree with the table
  underneath them.
*/

const iconProps = {
  className: "h-[18px] w-[18px]",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

function Card({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="border-hairline bg-surface rounded-xl border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          {icon}
        </span>
      </div>
      <p className="numeric mt-4 text-3xl font-semibold tracking-tight">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          label="Unpaid Invoices"
          value={formatCurrencyWhole(metrics.unpaidInvoices)}
          hint="Billed and awaiting payment"
          accent="bg-rose-400/10 text-rose-300"
          icon={
            <svg {...iconProps}>
              <path d="M6 3h12v18l-3-2-3 2-3-2-3 2Z" />
              <path d="M9.5 8.5h5M9.5 12.5h5" />
            </svg>
          }
        />
        <Card
          label="This Month's Earnings"
          value={formatCurrencyWhole(metrics.monthEarnings)}
          hint="Payments received this month"
          accent="bg-emerald-400/10 text-emerald-300"
          icon={
            <svg {...iconProps}>
              <path d="M4 16.5 9 11l3.5 3.5L20 7" />
              <path d="M15 7h5v5" />
            </svg>
          }
        />
        <Card
          label="Active Projects"
          value={String(metrics.activeProjects)}
          hint="Not yet invoiced"
          accent="bg-accent/10 text-accent-soft"
          icon={
            <svg {...iconProps}>
              <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h9A1.5 1.5 0 0 1 21 10v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5Z" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
