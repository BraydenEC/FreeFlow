import { daysUntil, projectValue } from "@/lib/format";
import type { Project, ProjectStatus } from "@/types/project";

/*
  Filtering the projects table.

  Fine at six projects, painful at sixty — which is where a freelancer using
  this for a year lands. The predicate lives here rather than inside the table
  so it can be executed directly by a test, the same reason the research
  filter was pulled out in Week 2.

  Three independent axes that compose as an intersection: free text, pipeline
  status, and payment state. "Composes as an intersection" is exactly the kind
  of claim that gets verified by reading the code instead of running it, so it
  is asserted explicitly below rather than assumed.
*/

export type StatusFilter = ProjectStatus | "all";
export type PaymentFilter = "all" | "paid" | "unpaid" | "overdue";

export type ProjectFilterState = {
  query: string;
  status: StatusFilter;
  payment: PaymentFilter;
};

export const EMPTY_FILTER: ProjectFilterState = {
  query: "",
  status: "all",
  payment: "all",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  contracted: "Contract signed",
  in_progress: "In progress",
  awaiting_review: "Awaiting review",
  invoice_sent: "Invoice sent",
  overdue: "Overdue",
};

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Any stage" },
  { value: "contracted", label: STATUS_LABEL.contracted },
  { value: "in_progress", label: STATUS_LABEL.in_progress },
  { value: "awaiting_review", label: STATUS_LABEL.awaiting_review },
  { value: "invoice_sent", label: STATUS_LABEL.invoice_sent },
  { value: "overdue", label: STATUS_LABEL.overdue },
];

export const PAYMENT_OPTIONS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Paid and unpaid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Late" },
];

export function isStatusFilter(v: unknown): v is StatusFilter {
  return STATUS_OPTIONS.some((o) => o.value === v);
}

export function isPaymentFilter(v: unknown): v is PaymentFilter {
  return PAYMENT_OPTIONS.some((o) => o.value === v);
}

/**
 * Read a filter out of URL search params.
 *
 * Anything unrecognised falls back to "all" rather than filtering everything
 * out. A hand-edited URL should show too much, never nothing — an empty table
 * reads as "you have no projects", which would be a lie.
 */
export function filterFromParams(params: {
  q?: string;
  status?: string;
  payment?: string;
}): ProjectFilterState {
  return {
    query: typeof params.q === "string" ? params.q.slice(0, 200) : "",
    status: isStatusFilter(params.status) ? params.status : "all",
    payment: isPaymentFilter(params.payment) ? params.payment : "all",
  };
}

export function isFilterActive(state: ProjectFilterState): boolean {
  return (
    state.query.trim() !== "" || state.status !== "all" || state.payment !== "all"
  );
}

export function matchesProjectFilter(
  project: Project,
  state: ProjectFilterState,
  now: Date,
): boolean {
  if (state.status !== "all" && project.status !== state.status) return false;

  if (state.payment === "paid" && !project.isPaid) return false;
  if (state.payment === "unpaid" && project.isPaid) return false;
  if (state.payment === "overdue") {
    // "Late" means money that has not arrived and should have. A paid project
    // is never late however old its deadline, which is the distinction the
    // status column alone cannot make.
    if (project.isPaid) return false;
    const late = project.status === "overdue" || daysUntil(project.deadline, now) < 0;
    if (!late) return false;
  }

  const q = state.query.trim().toLowerCase();
  if (!q) return true;

  // Searching the amount as well as the words: "4837" finds the project a
  // freelancer remembers by its number rather than its name.
  return (
    project.name.toLowerCase().includes(q) ||
    project.client.toLowerCase().includes(q) ||
    STATUS_LABEL[project.status].toLowerCase().includes(q) ||
    String(projectValue(project)).includes(q)
  );
}

export function filterProjects(
  projects: Project[],
  state: ProjectFilterState,
  now: Date,
): Project[] {
  return projects.filter((p) => matchesProjectFilter(p, state, now));
}
