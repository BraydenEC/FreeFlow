import { parseIsoDate, projectValue } from "@/lib/format";
import { computeWithholding } from "@/lib/tax/withholding";
import type { Project, ProjectStatus } from "@/types/project";

/*
  Cash-flow forecast.

  Everything else in this product looks backwards or at today: what am I owed,
  what did I earn this month, what is late. None of it answers the question a
  freelancer actually loses sleep over, which is whether there will be enough
  money in March.

  WHAT THIS COMPUTES
  For every unpaid project, when the money is likely to land and how much of
  it survives withholding. Grouped by calendar month.

  THE ONE ASSUMPTION THAT MATTERS
  A project has a deadline, not a payment date. The gap between them is
  payment terms, and the product does not yet record them per client, so a
  single default is applied: money arrives DEFAULT_TERMS_DAYS after the
  deadline. That is a guess, it is stated on the page, and it is the first
  thing that should become a real per-client field.

  THE SECOND ASSUMPTION, AND WHY IT IS SHOWN SEPARATELY
  Not every scheduled peso arrives. A signed contract can fall through; an
  issued invoice rarely does. So each stage carries a likelihood, and the
  forecast reports two numbers per month:

    scheduled   the honest sum of what is due, unweighted
    likely      the same sum weighted by stage

  Both are shown. A single blended number would hide which one you are
  reading, and a forecast that quietly discounts your income without saying so
  is the same failure as one that inflates it.

  THE WEIGHTS ARE GUESSES AND THE PAGE SAYS SO
  STAGE_LIKELIHOOD below is not derived from anything. There is no completion
  data yet — the product is new and no cohort of projects has finished. The
  numbers are judgement, labelled as judgement, and the honest upgrade later
  is to compute them from the user's own history rather than to refine the
  guess.
*/

/** Days after the deadline that payment is assumed to arrive. */
export const DEFAULT_TERMS_DAYS = 30;

/** How many months of forecast to produce by default. */
export const DEFAULT_HORIZON_MONTHS = 6;

/**
 * Likelihood that a project at each stage actually pays.
 *
 * ESTIMATED. No source, no data — see the note above. Exported so the UI can
 * show them rather than hide them.
 */
export const STAGE_LIKELIHOOD: Record<ProjectStatus, number> = {
  contracted: 0.75,
  in_progress: 0.9,
  awaiting_review: 0.95,
  invoice_sent: 0.97,
  // Late money is less certain than money that is merely outstanding. It is
  // not hopeless — most late invoices are paid — but it is not 0.97 either.
  overdue: 0.85,
};

export type ForecastMonth = {
  /** "2026-10" — sortable and unambiguous. */
  key: string;
  /** Milliseconds at UTC midnight on the first of the month, for formatting. */
  startsAt: number;
  /** Honest sum of net amounts due this month. */
  scheduled: number;
  /** The same sum, weighted by stage likelihood. */
  likely: number;
  /** How many projects contribute. */
  count: number;
  /** Net per stage, so a month's composition is visible rather than implied. */
  byStage: Partial<Record<ProjectStatus, number>>;
};

export type Forecast = {
  months: ForecastMonth[];
  /** Money whose expected payment date has already passed. */
  late: { scheduled: number; likely: number; count: number };
  /** Totals across the horizon, excluding late money. */
  totals: { scheduled: number; likely: number; count: number };
  /** Projects due beyond the horizon, so the page can say they exist. */
  beyondHorizon: { scheduled: number; count: number };
  assumptions: { termsDays: number; horizonMonths: number };
};

function money(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * When a project's money is expected to land.
 *
 * Deadline plus payment terms. Returns null for a project with an
 * unparseable deadline rather than throwing — this runs over user-entered
 * rows on a page that has to render.
 */
export function expectedPaymentDate(
  project: Project,
  termsDays: number = DEFAULT_TERMS_DAYS,
): Date | null {
  const deadline = parseIsoDate(project.deadline);
  if (Number.isNaN(deadline.getTime())) return null;
  return new Date(deadline.getTime() + termsDays * 24 * 60 * 60 * 1000);
}

/**
 * What one project is expected to put in the bank.
 *
 * Where Mexican withholding applies this is the net of it — the payer keeps
 * part of the IVA and ISR and remits them directly, so less arrives than was
 * invoiced.
 *
 * Where it does not apply, this is simply the project value. It deliberately
 * does NOT add IVA. computeWithholding always models a Mexican invoice and
 * therefore always adds 16%, which is right for that calculation and wrong
 * here: a freelancer in the United States charging 1,000 receives 1,000, not
 * 1,160, and a forecast that inflated every non-Mexican user's income by 16%
 * would be the single most damaging number in the product.
 *
 * IVA is also not income even where it exists. It is collected on behalf of
 * the tax authority and passed on, so a forecast of what you will earn should
 * not count it.
 */
export function expectedNet(project: Project): number {
  const value = projectValue(project);
  const w = computeWithholding(value, project.clientTaxType);
  return w.applies ? w.net : value;
}

export function buildForecast(
  projects: Project[],
  options: {
    now: Date;
    termsDays?: number;
    horizonMonths?: number;
  },
): Forecast {
  const termsDays = options.termsDays ?? DEFAULT_TERMS_DAYS;
  const horizonMonths = options.horizonMonths ?? DEFAULT_HORIZON_MONTHS;
  const now = options.now;

  // The horizon starts at the beginning of the current month, so money due
  // later this month is not dropped for arriving "in the past".
  const firstMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

  const months: ForecastMonth[] = [];
  const index = new Map<string, ForecastMonth>();
  for (let i = 0; i < horizonMonths; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1));
    const m: ForecastMonth = {
      key: monthKey(d),
      startsAt: d.getTime(),
      scheduled: 0,
      likely: 0,
      count: 0,
      byStage: {},
    };
    months.push(m);
    index.set(m.key, m);
  }

  const lastMonthStart = months[months.length - 1]?.startsAt ?? firstMonth;
  const horizonEnd = Date.UTC(
    new Date(lastMonthStart).getUTCFullYear(),
    new Date(lastMonthStart).getUTCMonth() + 1,
    1,
  );

  const late = { scheduled: 0, likely: 0, count: 0 };
  const beyondHorizon = { scheduled: 0, count: 0 };

  for (const p of projects) {
    // Paid work is not a forecast. It already happened.
    if (p.isPaid) continue;

    const due = expectedPaymentDate(p, termsDays);
    if (!due) continue;

    const net = expectedNet(p);
    if (net <= 0) continue;

    const weight = STAGE_LIKELIHOOD[p.status] ?? 0.9;
    const weighted = net * weight;

    if (due.getTime() < now.getTime()) {
      late.scheduled = money(late.scheduled + net);
      late.likely = money(late.likely + weighted);
      late.count += 1;
      continue;
    }

    if (due.getTime() >= horizonEnd) {
      beyondHorizon.scheduled = money(beyondHorizon.scheduled + net);
      beyondHorizon.count += 1;
      continue;
    }

    const m = index.get(monthKey(due));
    if (!m) {
      // Defensive: a date inside the horizon whose key is missing would
      // otherwise vanish silently, and money that disappears from a forecast
      // is worse than money in the wrong bucket.
      beyondHorizon.scheduled = money(beyondHorizon.scheduled + net);
      beyondHorizon.count += 1;
      continue;
    }

    m.scheduled = money(m.scheduled + net);
    m.likely = money(m.likely + weighted);
    m.count += 1;
    m.byStage[p.status] = money((m.byStage[p.status] ?? 0) + net);
  }

  const totals = months.reduce(
    (acc, m) => ({
      scheduled: money(acc.scheduled + m.scheduled),
      likely: money(acc.likely + m.likely),
      count: acc.count + m.count,
    }),
    { scheduled: 0, likely: 0, count: 0 },
  );

  return {
    months,
    late,
    totals,
    beyondHorizon,
    assumptions: { termsDays, horizonMonths },
  };
}
