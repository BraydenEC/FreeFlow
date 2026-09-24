/*
  Pipeline progress tests.
  Run: npm run test:progress

  This drives a percentage printed on the dashboard, so the rules that decide
  it are worth pinning down. The one that matters most is precedence: a paid
  project reads 100% whatever its status column says, because a stale status
  on a paid project is exactly when a wrong number would mislead.
*/

import { projectProgress } from "@/lib/progress";
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

function project(over: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Test",
    client: "Client",
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

console.log("\nPIPELINE PROGRESS\n" + "─".repeat(64));

// --- Each stage maps to its own percentage --------------------------------
const expected: [ProjectStatus, number, string][] = [
  ["contracted", 10, "Contract Signed"],
  ["in_progress", 30, "In Progress"],
  ["awaiting_review", 55, "Awaiting Review"],
  ["invoice_sent", 80, "Invoice Sent"],
  ["overdue", 80, "Overdue"],
];

for (const [status, percent, label] of expected) {
  const r = projectProgress(project({ status }));
  assert(`${status} → ${percent}%`, r.percent === percent, `got ${r.percent}`);
  assert(`${status} → "${label}"`, r.label === label, `got "${r.label}"`);
  assert(`${status} is not complete`, r.complete === false);
}

// --- Payment wins over status ---------------------------------------------
// The whole reason isPaid is checked first. Every status, once paid, is done.
for (const [status] of expected) {
  const r = projectProgress(project({ status, isPaid: true, paidAt: "2026-09-01" }));
  assert(`paid ${status} → 100%`, r.percent === 100, `got ${r.percent}`);
  assert(`paid ${status} → "Paid"`, r.label === "Paid", `got "${r.label}"`);
  assert(`paid ${status} is complete`, r.complete === true);
}

// --- Invariants the bar depends on ----------------------------------------
const all = [
  ...expected.map(([status]) => projectProgress(project({ status }))),
  projectProgress(project({ isPaid: true, paidAt: "2026-09-01" })),
];
assert("every percent is 0-100", all.every((r) => r.percent >= 0 && r.percent <= 100));
assert("every percent is an integer", all.every((r) => Number.isInteger(r.percent)));
assert("every label is non-empty", all.every((r) => r.label.length > 0));
assert(
  "complete is true only at 100%",
  all.every((r) => r.complete === (r.percent === 100)),
);

// --- Overdue and Invoice Sent are the same stage ---------------------------
// Deliberate: lateness is urgency, not progress. If this ever diverges it
// should be a decision, not an accident.
// The pipeline only moves forward, so its percentages must too. This is the
// assertion that catches a future stage being inserted with a careless number.
const ladder = expected.map(([, percent]) => percent);
assert(
  "percentages never decrease along the pipeline",
  ladder.every((v, i) => i === 0 || v >= ladder[i - 1]),
  ladder.join(" "),
);
assert("contract signed is the earliest stage", ladder[0] === 10);

assert(
  "overdue and invoice_sent share a percentage",
  projectProgress(project({ status: "overdue" })).percent ===
    projectProgress(project({ status: "invoice_sent" })).percent,
);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
