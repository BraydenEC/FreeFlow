import type { ClientTaxType } from "@/lib/tax/withholding";

/**
 * The five actionable states a project can be in.
 *
 * "contracted" was added after the Week 2 validation interview: the
 * interviewee's pipeline begins at a signed contract, not at the first hour
 * of work, and he credits that signature with never having been stood up.
 */
export type ProjectStatus =
  | "contracted"
  | "in_progress"
  | "awaiting_review"
  | "invoice_sent"
  | "overdue";

export type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  /** ISO calendar date, "YYYY-MM-DD". Deliberately not a Date — see lib/format.ts. */
  deadline: string;
  hoursLogged: number;
  hourlyRate: number;
  /**
   * Fixed-fee total. When null, the project bills hourly and its value is
   * hoursLogged × hourlyRate. Supporting both billing models with one
   * nullable column avoids a second table for this sprint.
   */
  invoiceTotal: number | null;
  isPaid: boolean;
  /** ISO date the invoice was paid, or null. Drives "This Month's Earnings". */
  paidAt: string | null;
  /** ISO date the contract was signed, or null if never recorded. */
  contractSignedOn: string | null;
  /** Link to the signed contract — the artifact behind an escalation. */
  contractUrl: string | null;
  /** Link to the Stripe invoice or payment page that settles this project. */
  paymentUrl: string | null;
  /**
   * Who is paying. Drives withholding: a persona moral withholds part of the
   * IVA and ISR before paying, a persona física does not. Null means it was
   * never recorded, and the calculation treats that as no withholding rather
   * than guessing.
   */
  clientTaxType: ClientTaxType | null;
};

/** The three cash-flow figures shown above the table. */
export type DashboardMetrics = {
  unpaidInvoices: number;
  monthEarnings: number;
  activeProjects: number;
};

/** Which source the page rendered from — surfaced for debugging and demo narration. */
export type DataSource = "supabase" | "mock";
