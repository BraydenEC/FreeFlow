/*
  New-project validation tests.
  Run: npm run test:projects

  The form is the only way a user creates data, so its schema is the only
  thing standing between a typo and a row the dashboard cannot render. Every
  case below is something a real form submission could contain: blank fields,
  a pasted currency string, a negative rate, a date the picker never produces.

  The rules mirror the CHECK constraints in supabase/schema.sql. If one drifts
  from the other, one of these fails.
*/

import { withRealDeadline } from "@/lib/core/schema";
import { extractionToProject } from "@/lib/core/to-project";
import { getMockProjects } from "@/lib/mock-data";
import { deriveMetrics } from "@/lib/projects/metrics";
import { fieldShownFor, NewProjectSchema, toRow, toUpdateRow } from "@/lib/projects/schema";
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

const base = {
  name: "Website Redesign",
  client: "TechSolutions",
  status: "in_progress" as const,
  deadline: "2026-10-01",
  billing: "hourly" as const,
  hours_logged: "10",
  hourly_rate: "75",
};

function accepts(name: string, input: unknown) {
  const r = NewProjectSchema.safeParse(input);
  assert(name, r.success, r.success ? "" : r.error.issues[0]?.message);
  return r;
}

function rejects(name: string, input: unknown, field?: string) {
  const r = NewProjectSchema.safeParse(input);
  const ok = !r.success && (!field || r.error.issues.some((i) => i.path[0] === field));
  assert(name, ok, r.success ? "accepted but should not be" : "");
}

console.log("\nNEW PROJECT VALIDATION\n" + "─".repeat(64));

// --- Happy paths -----------------------------------------------------------
const hourly = accepts("hourly project with hours and rate", base);
const fixed = accepts("fixed-fee project with a total", {
  ...base,
  billing: "fixed",
  invoice_total: "4200",
});

// --- Billing model exclusivity --------------------------------------------
// The table stores one nullable column for both models. Which column gets
// written is decided in toRow, and nowhere else.
if (hourly.success) {
  const row = toRow(hourly.data);
  assert("hourly clears invoice_total", row.invoice_total === null);
  assert("hourly keeps rate", row.hourly_rate === 75);
}
if (fixed.success) {
  const row = toRow(fixed.data);
  assert("fixed sets invoice_total", row.invoice_total === 4200);
}
assert(
  "new projects are never born paid",
  hourly.success && toRow(hourly.data).is_paid === false && toRow(hourly.data).paid_at === null,
);

rejects("fixed fee with no total", { ...base, billing: "fixed", invoice_total: "" }, "invoice_total");
rejects("fixed fee of zero", { ...base, billing: "fixed", invoice_total: "0" }, "invoice_total");
rejects("hourly with no rate", { ...base, hourly_rate: "0" }, "hourly_rate");

// --- Required text ---------------------------------------------------------
rejects("blank name", { ...base, name: "" }, "name");
rejects("whitespace-only name", { ...base, name: "   " }, "name");
rejects("blank client", { ...base, client: "" }, "client");
rejects("name over 120 chars", { ...base, name: "x".repeat(121) }, "name");
accepts("name is trimmed, not rejected", { ...base, name: "  Redesign  " });
assert(
  "trimming actually happens",
  NewProjectSchema.safeParse({ ...base, name: "  Redesign  " }).data?.name === "Redesign",
);

// --- Numbers ---------------------------------------------------------------
rejects("negative hours", { ...base, hours_logged: "-1" }, "hours_logged");
rejects("negative rate", { ...base, hourly_rate: "-75" }, "hourly_rate");
rejects("non-numeric rate", { ...base, hourly_rate: "seventy five" }, "hourly_rate");
rejects("pasted currency string", { ...base, hourly_rate: "$75.00" }, "hourly_rate");
rejects("rate above the numeric(8,2) ceiling", { ...base, hourly_rate: "1000000" }, "hourly_rate");
accepts("decimal hours", { ...base, hours_logged: "10.25" });
assert(
  "numeric strings are coerced to numbers",
  NewProjectSchema.safeParse({ ...base, hours_logged: "10.25" }).data?.hours_logged === 10.25,
);

// --- Status ----------------------------------------------------------------
for (const s of ["in_progress", "awaiting_review", "invoice_sent", "overdue"]) {
  accepts(`status ${s}`, { ...base, status: s });
}
rejects("status outside the four the UI has badges for", { ...base, status: "archived" }, "status");

// --- Deadline --------------------------------------------------------------
rejects("US-format date", { ...base, deadline: "10/01/2026" }, "deadline");
rejects("date with no day", { ...base, deadline: "2026-10" }, "deadline");
rejects("month 13", { ...base, deadline: "2026-13-01" }, "deadline");
// Regression: JavaScript rolls "2026-02-31" over to 3 March and calls it
// valid. A deadline silently moved three days is a quiet wrong answer.
rejects("31 February as a deadline", { ...base, deadline: "2026-02-31" }, "deadline");
rejects("31 April as a deadline", { ...base, deadline: "2026-04-31" }, "deadline");
rejects("29 February in a non-leap year", { ...base, deadline: "2026-02-29" }, "deadline");
accepts("29 February in a leap year", { ...base, deadline: "2028-02-29" });
rejects("blank deadline", { ...base, deadline: "" }, "deadline");
accepts("a date in the past", { ...base, deadline: "2020-01-01" });

// --- Shape -----------------------------------------------------------------
rejects("null body", null);
rejects("array body", []);
rejects("empty object", {});

// --- Contract and payment links -------------------------------------------
// Added after the Week 2 validation interview. Empty means "not recorded" and
// must survive; a pasted link without a scheme must not, because it would
// render as a relative path and 404 inside the app.
accepts("no contract or links at all", base);
accepts("empty strings for all three", {
  ...base,
  contract_signed_on: "",
  contract_url: "",
  payment_url: "",
});
accepts("a full contract record", {
  ...base,
  contract_signed_on: "2026-09-01",
  contract_url: "https://example.com/contract.pdf",
  payment_url: "https://invoice.stripe.com/i/abc123",
});
rejects("contract link with no scheme", { ...base, contract_url: "www.example.com/c.pdf" }, "contract_url");
rejects("payment link with no scheme", { ...base, payment_url: "invoice.stripe.com/i/abc" }, "payment_url");
rejects("javascript: contract link", { ...base, contract_url: "javascript:alert(1)" }, "contract_url");
rejects("US-format contract date", { ...base, contract_signed_on: "09/01/2026" }, "contract_signed_on");
rejects("impossible contract date", { ...base, contract_signed_on: "2026-02-31" }, "contract_signed_on");
accepts("contract signed status", { ...base, status: "contracted" });

// Empty string must reach the database as null, not "".
const withEmpties = NewProjectSchema.safeParse({
  ...base,
  contract_signed_on: "",
  contract_url: "",
  payment_url: "",
});
if (withEmpties.success) {
  const row = toRow(withEmpties.data);
  assert("empty contract date becomes null", row.contract_signed_on === null);
  assert("empty contract link becomes null", row.contract_url === null);
  assert("empty payment link becomes null", row.payment_url === null);
}

// --- Editing must not touch payment state ---------------------------------
// toRow sets is_paid false and paid_at null, which is correct for a new
// project and destructive for an edit. Reusing it to edit a paid project
// would silently un-pay it and pull the money back out of This Month's
// Earnings. toUpdateRow exists to prevent exactly that.
const edit = NewProjectSchema.safeParse(base);
if (edit.success) {
  const row = toUpdateRow(edit.data);
  assert("an edit never writes is_paid", !("is_paid" in row));
  assert("an edit never writes paid_at", !("paid_at" in row));
  assert("an edit still writes the name", row.name === base.name);
  assert("an edit still writes the deadline", row.deadline === base.deadline);
  assert(
    "an edit still resolves the billing model",
    "invoice_total" in row && "hourly_rate" in row,
  );
  // The insert mapping must keep doing the opposite.
  const insert = toRow(edit.data);
  assert("a create does write is_paid false", insert.is_paid === false);
  assert("a create does write paid_at null", insert.paid_at === null);
}

// --- Active Projects: one project, one bucket -------------------------------
{
  const row = (over: Partial<Project>): Project => ({
    id: "p", name: "n", client: "c", status: "in_progress", deadline: "2026-11-30",
    hoursLogged: 0, hourlyRate: 0, invoiceTotal: 100, isPaid: false, paidAt: null,
    contractSignedOn: null, contractUrl: null, paymentUrl: null, clientTaxType: null,
    paymentTermsDays: null, ...over,
  });
  const now = new Date("2026-11-04T12:00:00Z");
  const m = deriveMetrics(
    [
      row({ status: "contracted" }),
      row({ status: "in_progress" }),
      row({ status: "awaiting_review" }),
      row({ status: "invoice_sent" }),
      row({ status: "overdue" }),
      row({ status: "in_progress", isPaid: true, paidAt: "2026-11-02" }),
    ],
    now,
  );
  assert("active counts only unpaid work not yet invoiced", m.activeProjects === 3, String(m.activeProjects));
  assert("unpaid invoices still counts invoiced and overdue", m.unpaidInvoices === 200, String(m.unpaidInvoices));
  assert("earnings still counts the paid one", m.monthEarnings === 100, String(m.monthEarnings));
}

// --- A saved brief becomes a project through the same form ------------------
{
  const full = extractionToProject({
    project_name: "Northwind Redesign",
    client: "Northwind Co",
    hourly_rate: 85,
    hours_logged: 22,
    deadline: "2026-11-14",
    status: "in_progress",
  });
  assert("a brief with a rate is an hourly project", full.billing === "hourly");
  assert("every extracted field carries over", full.name === "Northwind Redesign" && full.client === "Northwind Co" && full.deadline === "2026-11-14" && String(full.hourly_rate) === "85" && String(full.hours_logged) === "22" && full.status === "in_progress");
  assert("a complete brief passes the project schema", NewProjectSchema.safeParse(full).success);

  const sparse = extractionToProject({
    project_name: "Logo",
    client: null,
    hourly_rate: null,
    hours_logged: null,
    deadline: null,
    status: "in_progress",
  });
  assert("no rate opens on the form's fixed fee", sparse.billing === "fixed");
  assert("nothing is invented for missing fields", sparse.client === "" && sparse.deadline === "" && String(sparse.invoice_total) === "");
  assert("no contract date is assumed", sparse.contract_signed_on === "");
  const refused = NewProjectSchema.safeParse(sparse);
  assert("a sparse brief is refused until the gaps are filled", !refused.success);

  const odd = extractionToProject({ project_name: "x", client: "y", hourly_rate: 1, hours_logged: 1, deadline: "2026-11-14", status: "something_else" });
  assert("an unknown saved status falls back", odd.status === "in_progress");
}

// --- A date the card can't render must not reach it --------------------------
{
  const f = (deadline: string | null) =>
    withRealDeadline({ project_name: "x", client: null, hourly_rate: null, hours_logged: null, deadline, status: "in_progress", confidence_note: "" }).deadline;
  assert("a real deadline survives", f("2026-11-14") === "2026-11-14");
  assert("words instead of a date become not found", f("next friday") === null);
  assert("an impossible date becomes not found", f("2026-02-31") === null);
  assert("no deadline stays no deadline", f(null) === null);
}

// --- An error on a hidden field still has to be shown -----------------------
{
  assert("fixed fee hides hours and rate", !fieldShownFor("fixed", "hours_logged") && !fieldShownFor("fixed", "hourly_rate"));
  assert("hourly hides the fixed total", !fieldShownFor("hourly", "invoice_total"));
  assert("the matching fields are shown", fieldShownFor("fixed", "invoice_total") && fieldShownFor("hourly", "hourly_rate") && fieldShownFor("hourly", "hours_logged"));
  assert("every other field is always shown", fieldShownFor("fixed", "name") && fieldShownFor("hourly", "deadline"));
}

// --- The seed data the acceptance criteria quote ----------------------------
assert("seed data shows 4 active projects", deriveMetrics(getMockProjects(new Date("2026-11-04T12:00:00Z")), new Date("2026-11-04T12:00:00Z")).activeProjects === 4);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
