import { projectValue } from "@/lib/format";
import type { DashboardMetrics, Project } from "@/types/project";

/**
 * Derive the three cash-flow figures from whichever dataset is live.
 *
 * The handoff hardcodes these as dummy values (§2.2) while also fetching real
 * rows (§3). Hardcoding would let the cards contradict the table directly
 * beneath them — obvious on camera during the demo. Deriving them keeps the
 * two in agreement no matter which data source is active.
 */
export function deriveMetrics(
  projects: Project[],
  now: Date,
): DashboardMetrics {
  const currentMonth = now.getUTCMonth();
  const currentYear = now.getUTCFullYear();

  // Money billed to a client but not yet received. Work still in progress
  // isn't counted — nothing has been invoiced yet, so it isn't owed.
  const unpaidInvoices = projects
    .filter(
      (p) =>
        !p.isPaid && (p.status === "invoice_sent" || p.status === "overdue"),
    )
    .reduce((sum, p) => sum + projectValue(p), 0);

  // Cash actually collected this calendar month.
  const monthEarnings = projects
    .filter((p) => {
      if (!p.isPaid || !p.paidAt) return false;
      const paid = new Date(`${p.paidAt}T00:00:00Z`);
      if (Number.isNaN(paid.getTime())) return false;
      return (
        paid.getUTCMonth() === currentMonth &&
        paid.getUTCFullYear() === currentYear
      );
    })
    .reduce((sum, p) => sum + projectValue(p), 0);

  // Unpaid work not yet invoiced. Overdue sits with Invoice sent because
  // unpaidInvoices above already counts it as billed, and a project should be
  // in one bucket, not two.
  const activeProjects = projects.filter(
    (p) => !p.isPaid && p.status !== "invoice_sent" && p.status !== "overdue",
  ).length;

  return { unpaidInvoices, monthEarnings, activeProjects };
}
