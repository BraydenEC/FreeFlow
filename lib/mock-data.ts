import type { Project } from "@/types/project";

/*
  Mock dataset — the fallback when Supabase is unreachable, unconfigured, or
  empty, per handoff §3.3.

  Deadlines are computed RELATIVE TO TODAY rather than hardcoded. The source
  mockup used fixed 2023 dates; rendered now, every row would read as years
  overdue and the "in 3 days" copy would be nonsense. Generating from `now`
  means the dashboard looks correct whenever it is opened or graded.

  The figures are tuned so the three derived summary metrics land exactly on
  the values named in the handoff spec:

    Unpaid Invoices ......... $3,450  (Brand Identity Refresh, overdue)
    This Month's Earnings ... $4,200  (Marketing Site Launch, paid)
    Active Projects ......... 5       (everything not yet invoiced)

  All four status variants appear, so the badge styling is fully exercised
  without needing to edit data to demo it.
*/

/** ISO calendar date `days` away from `now`, computed in UTC. */
function isoOffset(now: Date, days: number): string {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days),
  );
  return d.toISOString().slice(0, 10);
}

/**
 * A recent date guaranteed to fall inside the current calendar month, so the
 * "This Month's Earnings" metric always has something to count. Walking back
 * a few days would cross into last month early in the month, which would
 * silently zero the card on the 1st through the 5th.
 */
function isoPaidThisMonth(now: Date): string {
  const daysIntoMonth = now.getUTCDate() - 1;
  return isoOffset(now, -Math.min(5, daysIntoMonth));
}

export function getMockProjects(now: Date): Project[] {
  return [
    {
      id: "mock-1",
      name: "Website Redesign",
      client: "TechSolutions",
      status: "in_progress",
      deadline: isoOffset(now, 3),
      hoursLogged: 64.5,
      hourlyRate: 75,
      invoiceTotal: null,
      isPaid: false,
      paidAt: null,
      contractSignedOn: null,
      contractUrl: null,
      paymentUrl: null,
      clientTaxType: "persona_moral" as const,
      paymentTermsDays: null,
    },
    {
      id: "mock-2",
      name: "Mobile App Development",
      client: "Nova Corp",
      status: "in_progress",
      deadline: isoOffset(now, 12),
      hoursLogged: 52,
      hourlyRate: 120,
      invoiceTotal: null,
      isPaid: false,
      paidAt: null,
      contractSignedOn: null,
      contractUrl: null,
      paymentUrl: null,
      clientTaxType: "persona_moral" as const,
      paymentTermsDays: null,
    },
    {
      id: "mock-3",
      name: "API Integration",
      client: "Vertex Labs",
      status: "in_progress",
      deadline: isoOffset(now, 9),
      hoursLogged: 26,
      hourlyRate: 95,
      invoiceTotal: null,
      isPaid: false,
      paidAt: null,
      contractSignedOn: null,
      contractUrl: null,
      paymentUrl: null,
      clientTaxType: "persona_moral" as const,
      paymentTermsDays: null,
    },
    {
      id: "mock-4",
      name: "Logo & Style Guide",
      client: "GreenTree",
      status: "awaiting_review",
      deadline: isoOffset(now, 21),
      hoursLogged: 11,
      hourlyRate: 100,
      invoiceTotal: null,
      isPaid: false,
      paidAt: null,
      contractSignedOn: null,
      contractUrl: null,
      paymentUrl: null,
      clientTaxType: "persona_moral" as const,
      paymentTermsDays: null,
    },
    {
      id: "mock-5",
      name: "Brand Identity Refresh",
      client: "Solstice Inc",
      status: "overdue",
      deadline: isoOffset(now, -2),
      hoursLogged: 46,
      hourlyRate: 75,
      invoiceTotal: null,
      isPaid: false,
      paidAt: null,
      contractSignedOn: null,
      contractUrl: null,
      paymentUrl: null,
      clientTaxType: "persona_moral" as const,
      paymentTermsDays: null,
    },
    {
      // Fixed-fee engagement: invoiceTotal deliberately differs from
      // hours × rate ($3,735), exercising the projectValue() precedence rule.
      id: "mock-6",
      name: "Marketing Site Launch",
      client: "Halcyon Studio",
      status: "invoice_sent",
      deadline: isoOffset(now, -14),
      hoursLogged: 41.5,
      hourlyRate: 90,
      invoiceTotal: 4200,
      isPaid: true,
      paidAt: isoPaidThisMonth(now),
      contractSignedOn: null,
      contractUrl: null,
      paymentUrl: null,
      clientTaxType: "persona_moral" as const,
      paymentTermsDays: null,
    },
  ];
}
