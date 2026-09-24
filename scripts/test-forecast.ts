/*
  Cash-flow forecast tests.
  Run: npm run test:forecast

  This is the number a freelancer would plan their rent around, so the things
  worth guarding are the ones that would quietly change it: money landing in
  the wrong month, money counted twice, money disappearing entirely, and paid
  work being forecast as though it were still coming.
*/

import {
  buildForecast,
  DEFAULT_TERMS_DAYS,
  expectedPaymentDate,
  STAGE_LIKELIHOOD,
} from "@/lib/forecast/model";
import type { Project, ProjectStatus } from "@/types/project";

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
    name: "Job",
    client: "Client",
    status: "in_progress",
    deadline: "2026-10-01",
    hoursLogged: 0,
    hourlyRate: 0,
    invoiceTotal: 1000,
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

console.log("\nCASH-FLOW FORECAST\n" + "─".repeat(64));

// --- Payment lands after the deadline, not on it --------------------------
{
  const due = expectedPaymentDate(project({ deadline: "2026-10-01" }));
  assert(
    `deadline + ${DEFAULT_TERMS_DAYS} days`,
    due?.toISOString().slice(0, 10) === "2026-10-31",
    String(due?.toISOString().slice(0, 10)),
  );
  assert(
    "custom terms are honoured",
    expectedPaymentDate(project({ deadline: "2026-10-01" }), 0)
      ?.toISOString()
      .slice(0, 10) === "2026-10-01",
  );
  assert(
    "an unparseable deadline returns null rather than throwing",
    expectedPaymentDate(project({ deadline: "not-a-date" })) === null,
  );
}

// --- Money lands in the month it is expected, not the month it is due -----
{
  // Due 1 Oct with 30-day terms is 31 Oct — still October. Getting this
  // wrong in the test first is the reason the assertion spells it out.
  const f = buildForecast([project({ deadline: "2026-10-01" })], { now: NOW });
  const sep = f.months.find((m) => m.key === "2026-09");
  const oct = f.months.find((m) => m.key === "2026-10");
  assert("nothing lands in the month of the deadline itself", sep?.scheduled === 0, String(sep?.scheduled));
  assert("the full amount lands in the payment month", oct?.scheduled === 1000, String(oct?.scheduled));

  // A deadline late in a month pushes payment into the next one.
  const g = buildForecast([project({ deadline: "2026-10-20" })], { now: NOW });
  assert(
    "a late-month deadline rolls into the following month",
    g.months.find((m) => m.key === "2026-11")?.scheduled === 1000,
  );
}

// --- A project's own terms beat the account default ----------------------
// The whole reason payment_terms_days is nullable rather than defaulted in
// the database: most projects follow the account, and the client who always
// pays on 60 says so on the project.
{
  const own = expectedPaymentDate(
    project({ deadline: "2026-10-01", paymentTermsDays: 60 }),
    30,
  );
  assert(
    "a project's own terms win over the fallback",
    own?.toISOString().slice(0, 10) === "2026-11-30",
    String(own?.toISOString().slice(0, 10)),
  );

  const inherited = expectedPaymentDate(
    project({ deadline: "2026-10-01", paymentTermsDays: null }),
    15,
  );
  assert(
    "null terms inherit the account default",
    inherited?.toISOString().slice(0, 10) === "2026-10-16",
    String(inherited?.toISOString().slice(0, 10)),
  );

  const immediate = expectedPaymentDate(
    project({ deadline: "2026-10-01", paymentTermsDays: 0 }),
    30,
  );
  assert(
    "zero terms mean paid on the deadline, not the default",
    immediate?.toISOString().slice(0, 10) === "2026-10-01",
    String(immediate?.toISOString().slice(0, 10)),
  );

  // Terms move money between months, which is the point of recording them.
  const slow = buildForecast(
    [project({ deadline: "2026-10-01", paymentTermsDays: 60 })],
    { now: NOW },
  );
  assert(
    "longer terms push the money into a later month",
    slow.months.find((m) => m.key === "2026-11")?.scheduled === 1000,
    JSON.stringify(slow.months.map((m) => [m.key, m.scheduled])),
  );
}

// --- The regime reaches the forecast -------------------------------------
{
  const g = buildForecast(
    [project({ deadline: "2026-10-01", invoiceTotal: 10000, clientTaxType: "persona_moral" })],
    { now: NOW, regime: "general" },
  );
  const r = buildForecast(
    [project({ deadline: "2026-10-01", invoiceTotal: 10000, clientTaxType: "persona_moral" })],
    { now: NOW, regime: "resico" },
  );
  assert("régimen general forecasts 9,533.33", g.totals.scheduled === 9533.33, String(g.totals.scheduled));
  assert("RESICO forecasts 10,408.33", r.totals.scheduled === 10408.33, String(r.totals.scheduled));
  assert("a RESICO freelancer forecasts 875 more", Math.abs(r.totals.scheduled - g.totals.scheduled - 875) < 0.01);
}

// --- Paid work is not a forecast -----------------------------------------
{
  const f = buildForecast(
    [project({ isPaid: true, paidAt: "2026-09-10", deadline: "2026-10-01" })],
    { now: NOW },
  );
  assert("paid projects are excluded entirely", f.totals.scheduled === 0);
  assert("and are not counted as late", f.late.count === 0);
}

// --- Money already overdue is separated, not silently dropped ------------
{
  // Deadline in July, so payment was expected in August — before NOW.
  const f = buildForecast([project({ deadline: "2026-07-01", status: "overdue" })], {
    now: NOW,
  });
  assert("late money is bucketed as late", f.late.scheduled === 1000, String(f.late.scheduled));
  assert("late money is counted", f.late.count === 1);
  assert("late money is not in the monthly totals", f.totals.scheduled === 0);
}

// --- Nothing vanishes ----------------------------------------------------
// The property that matters most: every unpaid peso is in exactly one bucket.
{
  const projects = [
    project({ deadline: "2026-07-01" }),            // late
    project({ deadline: "2026-09-15" }),            // this horizon
    project({ deadline: "2026-11-01" }),            // this horizon
    project({ deadline: "2029-01-01" }),            // beyond
    project({ isPaid: true, paidAt: "2026-09-01" }), // excluded
  ];
  const f = buildForecast(projects, { now: NOW });
  const accounted =
    f.totals.scheduled + f.late.scheduled + f.beyondHorizon.scheduled;
  assert("every unpaid project lands in exactly one bucket", accounted === 4000, String(accounted));
  assert(
    "counts add up too",
    f.totals.count + f.late.count + f.beyondHorizon.count === 4,
  );
}

// --- Weighting is applied, visible, and never exceeds the honest figure ---
{
  const f = buildForecast(
    [project({ deadline: "2026-10-01", status: "contracted" })],
    { now: NOW },
  );
  const oct = f.months.find((m) => m.key === "2026-10");
  assert("scheduled is the honest amount", oct?.scheduled === 1000, String(oct?.scheduled));
  assert(
    "likely applies the stage weight",
    Math.abs((oct?.likely ?? 0) - 1000 * STAGE_LIKELIHOOD.contracted) < 0.01,
    String(oct?.likely),
  );
  assert("likely never exceeds scheduled", (oct?.likely ?? 0) <= (oct?.scheduled ?? 0));
}

{
  // Every stage must weight below 1: a forecast that promised the full amount
  // for an unsigned project would be the flattering version of this feature.
  const stages: ProjectStatus[] = [
    "contracted",
    "in_progress",
    "awaiting_review",
    "invoice_sent",
    "overdue",
  ];
  assert(
    "every stage likelihood is between 0 and 1",
    stages.every((s) => STAGE_LIKELIHOOD[s] > 0 && STAGE_LIKELIHOOD[s] < 1),
  );
  assert(
    "a signed-but-unstarted project is the least certain",
    STAGE_LIKELIHOOD.contracted === Math.min(...stages.map((s) => STAGE_LIKELIHOOD[s])),
  );
  assert(
    "an issued invoice is the most certain",
    STAGE_LIKELIHOOD.invoice_sent === Math.max(...stages.map((s) => STAGE_LIKELIHOOD[s])),
  );
}

// --- Withholding is already applied --------------------------------------
{
  const f = buildForecast(
    [project({ deadline: "2026-10-01", invoiceTotal: 10000, clientTaxType: "persona_moral" })],
    { now: NOW },
  );
  const oct = f.months.find((m) => m.key === "2026-10");
  assert(
    "the forecast is net of retenciones, not invoiced",
    oct?.scheduled === 9533.33,
    String(oct?.scheduled),
  );
}

// --- IVA is not income, and does not exist outside Mexico ----------------
// computeWithholding always models a Mexican invoice and always adds 16%.
// Using it unconditionally inflated every project with no tax type recorded,
// which is every project belonging to a user outside Mexico.
{
  const f = buildForecast([project({ deadline: "2026-10-01", invoiceTotal: 1000 })], {
    now: NOW,
  });
  assert(
    "no tax context forecasts the project value, not value plus IVA",
    f.totals.scheduled === 1000,
    String(f.totals.scheduled),
  );

  const fisica = buildForecast(
    [project({ deadline: "2026-10-01", invoiceTotal: 1000, clientTaxType: "persona_fisica" })],
    { now: NOW },
  );
  assert(
    "persona física also forecasts the project value",
    fisica.totals.scheduled === 1000,
    String(fisica.totals.scheduled),
  );
}

// --- Shape ---------------------------------------------------------------
{
  const f = buildForecast([], { now: NOW, horizonMonths: 6 });
  assert("produces the requested number of months", f.months.length === 6);
  assert("months start at the current month", f.months[0].key === "2026-09");
  assert("months are consecutive and sorted", f.months[5].key === "2027-02", f.months[5].key);
  assert("an empty portfolio is zeros, not a crash", f.totals.scheduled === 0);
  assert("assumptions are reported back", f.assumptions.termsDays === DEFAULT_TERMS_DAYS);
}

// --- Composition is visible ----------------------------------------------
{
  const f = buildForecast(
    [
      // Both deadlines must sit in the same PAYMENT month, which is not the
      // same as the same deadline month: 1 Oct pays 31 Oct, 5 Oct pays
      // 4 Nov. Getting this wrong is what the assertion above now spells out.
      project({ deadline: "2026-10-01", status: "contracted", invoiceTotal: 500 }),
      project({ deadline: "2026-09-30", status: "invoice_sent", invoiceTotal: 700 }),
    ],
    { now: NOW },
  );
  const oct = f.months.find((m) => m.key === "2026-10");
  assert("byStage splits the month", oct?.byStage.contracted === 500 && oct?.byStage.invoice_sent === 700);
  assert("byStage sums to the month total", oct?.scheduled === 1200);
}

// --- Rubbish in, no crash ------------------------------------------------
{
  const f = buildForecast(
    [
      project({ invoiceTotal: 0 }),
      project({ invoiceTotal: -500 }),
      project({ deadline: "2026-13-45" }),
    ],
    { now: NOW },
  );
  assert("zero and negative values contribute nothing", f.totals.scheduled === 0);
  assert("an impossible date is skipped rather than thrown", f.months.length > 0);
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
