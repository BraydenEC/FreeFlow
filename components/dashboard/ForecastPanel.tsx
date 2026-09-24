import { formatCurrencyWhole } from "@/lib/format";
import {
  buildForecast,
  DEFAULT_HORIZON_MONTHS,
  STAGE_LIKELIHOOD,
} from "@/lib/forecast/model";
import type { CurrencyCode } from "@/lib/currency";
import type { TaxRegime } from "@/lib/tax/withholding";
import type { Project } from "@/types/project";

/*
  What is coming, and when.

  The rest of the dashboard answers what happened and what is late. This is
  the only thing on the page that looks forward, which is the question a
  freelancer actually plans around.

  Two numbers per month, deliberately. "Scheduled" is the honest sum of what
  is due. "Likely" weights it by how far each project has got, because a
  signed contract is less certain than an issued invoice. Showing only the
  weighted figure would quietly discount someone's income; showing only the
  raw one would promise money that has not been earned yet.

  The bars are drawn from the same vocabulary as the progress bars in the
  projects table rather than from a charting library — one visual language,
  and still no fourth dependency.
*/

const STAGE_ORDER = [
  "invoice_sent",
  "awaiting_review",
  "in_progress",
  "contracted",
  "overdue",
] as const;

const STAGE_LABEL: Record<string, string> = {
  contracted: "Contract signed",
  in_progress: "In progress",
  awaiting_review: "Awaiting review",
  invoice_sent: "Invoiced",
  overdue: "Overdue",
};

function monthLabel(startsAt: number): string {
  return new Date(startsAt).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

export default function ForecastPanel({
  projects,
  now,
  currency,
  regime,
  termsDays,
}: {
  projects: Project[];
  now: Date;
  currency: CurrencyCode;
  regime: TaxRegime;
  termsDays: number;
}) {
  const f = buildForecast(projects, {
    now,
    horizonMonths: DEFAULT_HORIZON_MONTHS,
    regime,
    termsDays,
  });

  // Nothing unpaid anywhere means nothing to forecast. A row of empty months
  // is a chart of zero, which tells a new user nothing except that the
  // product has a chart.
  if (f.totals.count === 0 && f.late.count === 0 && f.beyondHorizon.count === 0) {
    return null;
  }

  const peak = Math.max(...f.months.map((m) => m.scheduled), 1);

  return (
    <section
      aria-labelledby="forecast-heading"
      className="border-hairline bg-surface rounded-lg border"
    >
      <div className="border-hairline flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <h2
          id="forecast-heading"
          className="text-[11px] font-medium tracking-[0.12em] uppercase"
        >
          Expected income
        </h2>
        <span className="text-ink-faint text-xs">
          next {f.assumptions.horizonMonths} months
        </span>
      </div>

      {/* ---------- Headline ---------- */}
      <div className="border-hairline grid grid-cols-2 gap-px border-b sm:grid-cols-3">
        <div className="px-5 py-4">
          <p className="text-ink-faint text-[11px]">Scheduled</p>
          <p className="numeric text-ink mt-1 text-xl font-semibold">
            {formatCurrencyWhole(f.totals.scheduled, currency)}
          </p>
          <p className="text-ink-faint mt-0.5 text-[11px]">
            {f.totals.count} {f.totals.count === 1 ? "project" : "projects"}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-ink-faint text-[11px]">Likely</p>
          <p className="numeric text-ink mt-1 text-xl font-semibold">
            {formatCurrencyWhole(f.totals.likely, currency)}
          </p>
          <p className="text-ink-faint mt-0.5 text-[11px]">weighted by stage</p>
        </div>
        {f.late.count > 0 && (
          <div className="px-5 py-4">
            <p className="text-ink-faint text-[11px]">Already late</p>
            <p className="numeric text-status-overdue mt-1 text-xl font-semibold">
              {formatCurrencyWhole(f.late.scheduled, currency)}
            </p>
            <p className="text-ink-faint mt-0.5 text-[11px]">
              {f.late.count} past its expected date
            </p>
          </div>
        )}
      </div>

      {/* ---------- By month ---------- */}
      <ul className="flex flex-col">
        {f.months.map((m) => {
          const width = Math.round((m.scheduled / peak) * 100);
          const likelyWidth = Math.round((m.likely / peak) * 100);
          return (
            <li
              key={m.key}
              className="border-hairline flex items-center gap-4 border-b px-5 py-2.5 last:border-b-0"
            >
              <span className="text-ink-muted w-10 shrink-0 text-xs">
                {monthLabel(m.startsAt)}
              </span>

              <div className="bg-raised relative h-2 min-w-0 flex-1 overflow-hidden rounded-full">
                {/* Scheduled sits behind; likely is drawn over it, so the gap
                    between them is visible rather than described. */}
                <div
                  className="bg-ink-faint absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${width}%` }}
                />
                <div
                  className="bg-ink absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${likelyWidth}%` }}
                />
              </div>

              <span className="numeric text-ink w-20 shrink-0 text-right text-xs font-medium">
                {m.scheduled > 0 ? formatCurrencyWhole(m.scheduled, currency) : "—"}
              </span>
              <span className="text-ink-faint hidden w-24 shrink-0 truncate text-right text-[11px] sm:block">
                {m.count > 0
                  ? STAGE_ORDER.filter((s) => m.byStage[s])
                      .map((s) => STAGE_LABEL[s])
                      .slice(0, 1)
                      .join("")
                  : ""}
                {m.count > 1 ? ` +${m.count - 1}` : ""}
              </span>
            </li>
          );
        })}
      </ul>

      {/* ---------- What this assumed ---------- */}
      <div className="border-hairline border-t px-5 py-3">
        <p className="text-ink-faint text-[11px]">
          Assumes payment {f.assumptions.termsDays} days after each deadline
          unless a project sets its own.
          Net of withholding where a client tax type is recorded.
          {f.beyondHorizon.count > 0 && (
            <>
              {" "}
              {formatCurrencyWhole(f.beyondHorizon.scheduled, currency)} falls beyond{" "}
              {f.assumptions.horizonMonths} months and is not shown.
            </>
          )}
        </p>
        <p className="text-ink-faint mt-1 text-[11px]">
          &ldquo;Likely&rdquo; weights each project by stage —{" "}
          {STAGE_ORDER.filter((s) => s !== "overdue")
            .map((s) => `${STAGE_LABEL[s]} ${Math.round(STAGE_LIKELIHOOD[s] * 100)}%`)
            .join(", ")}
          . <strong>These are estimates, not measurements.</strong> Nothing has
          completed yet to learn them from.
        </p>
      </div>
    </section>
  );
}
