/*
  Projects filter tests.
  Run: npm run test:project-filter

  Three axes that must compose as an intersection. That claim is exactly the
  kind that gets verified by reading the code rather than running it, which is
  why Week 2 pulled the research filter out into its own file, and why this
  one starts the same way.

  The case worth guarding hardest: a hand-edited URL must never filter
  everything out. An empty table reads as "you have no projects", and telling
  somebody they have no work because they mistyped a query string is a lie the
  product would tell confidently.
*/

import {
  EMPTY_FILTER,
  filterFromParams,
  filterProjects,
  isFilterActive,
  isPaymentFilter,
  isStatusFilter,
  matchesProjectFilter,
  PAYMENT_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/projects/filter";
import type { Project } from "@/types/project";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? "  —  " + detail : ""}`);
  }
}

const NOW = new Date("2026-09-24T12:00:00Z");

function project(over: Partial<Project> = {}): Project {
  return {
    id: Math.random().toString(36).slice(2),
    name: "Website Redesign",
    client: "TechSolutions",
    status: "in_progress",
    deadline: "2026-10-01",
    hoursLogged: 10,
    hourlyRate: 75,
    invoiceTotal: null,
    isPaid: false,
    paidAt: null,
    contractSignedOn: null,
    contractUrl: null,
    paymentUrl: null,
    clientTaxType: null,
    paymentTermsDays: null,
    ...over,
  };
}

const f = (over: Partial<typeof EMPTY_FILTER> = {}) => ({ ...EMPTY_FILTER, ...over });
const match = (p: Project, state: Partial<typeof EMPTY_FILTER>) =>
  matchesProjectFilter(p, f(state), NOW);

console.log("\nPROJECT FILTER\n" + "─".repeat(64));

// --- An empty filter matches everything ----------------------------------
assert("an empty filter keeps every project", match(project(), {}));
assert("an empty filter is not 'active'", !isFilterActive(EMPTY_FILTER));
assert("a query makes it active", isFilterActive(f({ query: "a" })));
assert("whitespace alone does not make it active", !isFilterActive(f({ query: "   " })));
assert("a status makes it active", isFilterActive(f({ status: "overdue" })));
assert("a payment state makes it active", isFilterActive(f({ payment: "paid" })));

// --- Search ---------------------------------------------------------------
assert("matches the project name", match(project(), { query: "redesign" }));
assert("matches the client", match(project(), { query: "techsolutions" }));
assert("is case insensitive", match(project(), { query: "REDESIGN" }));
assert("ignores surrounding whitespace", match(project(), { query: "  redesign  " }));
assert("matches a partial word", match(project(), { query: "desig" }));
assert("matches the status label, not just the code", match(project(), { query: "in progress" }));
assert("does not match an unrelated word", !match(project(), { query: "zzz" }));

// Finding a project by the number you remember rather than the name.
assert(
  "matches the amount",
  match(project({ invoiceTotal: 4837.5 }), { query: "4837" }),
);

// --- Status ---------------------------------------------------------------
assert("status filters to its own stage", match(project({ status: "overdue" }), { status: "overdue" }));
assert("status excludes other stages", !match(project({ status: "in_progress" }), { status: "overdue" }));
assert("'all' keeps every stage", match(project({ status: "contracted" }), { status: "all" }));

// --- Payment --------------------------------------------------------------
{
  const paid = project({ isPaid: true, paidAt: "2026-09-01" });
  const unpaid = project();
  assert("paid keeps paid", match(paid, { payment: "paid" }));
  assert("paid excludes unpaid", !match(unpaid, { payment: "paid" }));
  assert("unpaid keeps unpaid", match(unpaid, { payment: "unpaid" }));
  assert("unpaid excludes paid", !match(paid, { payment: "unpaid" }));
}

// --- "Late" means unpaid AND overdue, which status alone cannot say -------
{
  const lateByStatus = project({ status: "overdue" });
  const lateByDate = project({ deadline: "2026-08-01" });
  const paidButOld = project({ status: "overdue", isPaid: true, paidAt: "2026-09-01" });
  const future = project({ deadline: "2026-12-01" });

  assert("late catches an overdue status", match(lateByStatus, { payment: "overdue" }));
  assert("late catches a passed deadline", match(lateByDate, { payment: "overdue" }));
  assert("late excludes anything already paid", !match(paidButOld, { payment: "overdue" }));
  assert("late excludes a future deadline", !match(future, { payment: "overdue" }));
}

// --- The axes compose as an intersection ---------------------------------
// The claim this file exists to check rather than assert.
{
  const projects = [
    project({ name: "Alpha", status: "overdue", isPaid: false }),
    project({ name: "Beta", status: "overdue", isPaid: true, paidAt: "2026-09-01" }),
    project({ name: "Gamma", status: "in_progress", isPaid: false }),
    project({ name: "Alpha Two", status: "in_progress", isPaid: true, paidAt: "2026-09-01" }),
  ];

  const byStatus = filterProjects(projects, f({ status: "overdue" }), NOW);
  assert("status alone gives two", byStatus.length === 2, String(byStatus.length));

  const byStatusAndPayment = filterProjects(
    projects,
    f({ status: "overdue", payment: "unpaid" }),
    NOW,
  );
  assert("status and payment intersect to one", byStatusAndPayment.length === 1);
  assert("and it is the right one", byStatusAndPayment[0]?.name === "Alpha");

  const allThree = filterProjects(
    projects,
    f({ query: "alpha", status: "in_progress", payment: "paid" }),
    NOW,
  );
  assert("all three intersect to one", allThree.length === 1, String(allThree.length));
  assert("and it is the right one", allThree[0]?.name === "Alpha Two");

  const impossible = filterProjects(
    projects,
    f({ query: "alpha", status: "contracted" }),
    NOW,
  );
  assert("an impossible combination gives nothing, not everything", impossible.length === 0);
}

// --- A hand-edited URL must never empty the table ------------------------
{
  assert("unknown status falls back to all", filterFromParams({ status: "nonsense" }).status === "all");
  assert("unknown payment falls back to all", filterFromParams({ payment: "nonsense" }).payment === "all");
  assert("missing params give the empty filter", !isFilterActive(filterFromParams({})));
  assert(
    "a garbage URL still shows every project",
    filterProjects(
      [project(), project()],
      filterFromParams({ status: "../etc/passwd", payment: "true", q: undefined }),
      NOW,
    ).length === 2,
  );
  assert(
    "an absurdly long query is truncated rather than rejected",
    filterFromParams({ q: "x".repeat(5000) }).query.length === 200,
  );
  assert("a non-string query is ignored", filterFromParams({ q: 42 as unknown as string }).query === "");
}

// --- The option lists the UI renders --------------------------------------
{
  assert("every status option is a valid filter", STATUS_OPTIONS.every((o) => isStatusFilter(o.value)));
  assert("every payment option is a valid filter", PAYMENT_OPTIONS.every((o) => isPaymentFilter(o.value)));
  assert("status options lead with 'all'", STATUS_OPTIONS[0].value === "all");
  assert("payment options lead with 'all'", PAYMENT_OPTIONS[0].value === "all");
  assert("every option has a label", [...STATUS_OPTIONS, ...PAYMENT_OPTIONS].every((o) => o.label.trim().length > 0));
  assert("isStatusFilter rejects nonsense", !isStatusFilter("banana"));
  assert("isPaymentFilter rejects nonsense", !isPaymentFilter(7));
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
