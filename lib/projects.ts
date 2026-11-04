import { getMockProjects } from "@/lib/mock-data";
import { deriveMetrics } from "@/lib/projects/metrics";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getServerSupabase } from "@/lib/supabase/server";
import type {
  DashboardMetrics,
  DataSource,
  Project,
  ProjectStatus,
} from "@/types/project";

/*
  Data access + metric derivation.

  The contract, per handoff §3.3: the dashboard must look complete no matter
  what the database does. Every failure path below lands on mock data, and none
  of them surface an error to the visitor.
*/

export type DashboardData = {
  projects: Project[];
  metrics: DashboardMetrics;
  source: DataSource;
};

/** Shape PostgREST returns. Columns are snake_case; see supabase/schema.sql. */
type ProjectRow = {
  id: string;
  name: string;
  client: string;
  status: string;
  deadline: string;
  hours_logged: number | string;
  hourly_rate: number | string;
  invoice_total: number | string | null;
  is_paid: boolean;
  paid_at: string | null;
  contract_signed_on: string | null;
  contract_url: string | null;
  payment_url: string | null;
  client_tax_type: string | null;
  payment_terms_days: number | string | null;
};

const VALID_STATUSES: ProjectStatus[] = [
  "contracted",
  "in_progress",
  "awaiting_review",
  "invoice_sent",
  "overdue",
];

/*
  Defence in depth for numeric columns.

  Verified against this project's live database: PostgREST returns `numeric` as
  JSON numbers (41.5, 90.0). But `numeric` is also legitimately serialized as a
  STRING in some configurations, to avoid IEEE-754 precision loss — and string
  arithmetic would render the value column as NaN rather than failing loudly.

  Coercing costs nothing and additionally covers nulls and hand-edited rows, so
  it stays. It is a guard, not a fix for an observed bug.
*/
function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Map a database row to the app's camelCase model.
 *
 * The status CHECK constraint already restricts values at the database level,
 * but this is defensive: a row edited by hand in the Table Editor could carry
 * anything, and an unrecognized status would crash StatusBadge on a missing
 * lookup. Unknown values degrade to "in_progress" rather than taking the page
 * down.
 */
function mapRow(row: ProjectRow): Project {
  const status = VALID_STATUSES.includes(row.status as ProjectStatus)
    ? (row.status as ProjectStatus)
    : "in_progress";

  return {
    id: row.id,
    name: row.name,
    client: row.client,
    status,
    deadline: row.deadline,
    hoursLogged: toNumber(row.hours_logged),
    hourlyRate: toNumber(row.hourly_rate),
    invoiceTotal: toNullableNumber(row.invoice_total),
    isPaid: Boolean(row.is_paid),
    paidAt: row.paid_at,
    contractSignedOn: row.contract_signed_on,
    contractUrl: row.contract_url,
    paymentUrl: row.payment_url,
    // Anything the column should not hold is read as "not recorded", which
    // the withholding calculation already treats as no withholding.
    clientTaxType:
      row.client_tax_type === "persona_fisica" || row.client_tax_type === "persona_moral"
        ? row.client_tax_type
        : null,
    paymentTermsDays: toNullableNumber(row.payment_terms_days),
  };
}

/**
 * Attempt to read projects from Supabase.
 * Returns null on any failure — unconfigured, network error, query error, or
 * an empty table — so the caller has exactly one fallback branch to handle.
 */
async function fetchFromSupabase(): Promise<Project[] | null> {
  if (!isSupabaseConfigured()) {
    console.info(
      "[projects] Supabase credentials not set — rendering mock data.",
    );
    return null;
  }

  const supabase = await getServerSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, name, client, status, deadline, hours_logged, hourly_rate, invoice_total, is_paid, paid_at, contract_signed_on, contract_url, payment_url, client_tax_type, payment_terms_days",
      )
      .order("deadline", { ascending: true });

    if (error) {
      // The likeliest cause in this project is RLS: enabled with no SELECT
      // policy returns an empty result rather than an error, while a missing
      // table returns one. Both end up as mock data, but the log distinguishes
      // them when debugging.
      console.warn(
        "[projects] Supabase query failed — falling back to mock data.",
        error.message,
      );
      return null;
    }

    // Zero rows used to mean "the database is broken, show the demo". With
    // accounts it means "this user has no projects yet" — the normal state of
    // every new account — and the honest answer is an empty dashboard. Mock
    // data is reserved for the two cases above: no credentials, or a query
    // that failed.
    return ((data ?? []) as ProjectRow[]).map(mapRow);
  } catch (error) {
    // Network failure, DNS, malformed URL — anything the client throws rather
    // than returning in `error`.
    console.warn(
      "[projects] Supabase unreachable — falling back to mock data.",
      error,
    );
    return null;
  }
}

/**
 * Load the dashboard.
 *
 * `now` is injected rather than read from the clock so every derived value on
 * the page — deadlines, month boundaries, relative labels — is computed from
 * one consistent instant, and so the logic stays testable.
 */
export async function getDashboardData(now: Date): Promise<DashboardData> {
  const live = await fetchFromSupabase();
  const projects = live ?? getMockProjects(now);

  return {
    projects,
    metrics: deriveMetrics(projects, now),
    source: live ? "supabase" : "mock",
  };
}

export { deriveMetrics };
