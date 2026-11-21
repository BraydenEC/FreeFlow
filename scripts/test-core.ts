/*
  Brief extraction tests (H5, H6 in docs/user-testing/USER_TESTING_HANDOFF.md).
  Run: npm run test:core

  Every user tester pasted a brief that stated a budget, and every one came
  back as "rate not found". These pin the fallback extractor and the mapping
  into the project form, using the testers' own wording.
*/

import { heuristicExtract } from "@/lib/core/heuristic";
import { CoreExtractionSchema, extractionValue } from "@/lib/core/schema";
import { extractionToProject } from "@/lib/core/to-project";
import { readDraft, writeDraft, type DraftStore } from "@/lib/core/draft";
import { NewProjectSchema } from "@/lib/projects/schema";

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

const today = new Date(Date.UTC(2026, 10, 18));
const x = (brief: string) => heuristicExtract(brief, today);

// ── H5: budgets, currency, client type ─────────────────────────────────────
const budgets: [string, number, string | null][] = [
  ["Logo for our bakery, budget 800 usd, need it by Dec 5", 800, "USD"],
  ["Our budget is $350 for the flyer.", 350, null],
  ["Landing page, $1,800 flat, due Nov 30", 1800, null],
  ["Rediseño de menú, 8,500 MXN, para el 10 de diciembre", 8500, "MXN"],
  ["Video corporativo por $18,500 MXN, somos persona moral", 18500, "MXN"],
  ["Fixed fee of €2,400 for the brand book", 2400, "EUR"],
];
for (const [brief, total, currency] of budgets) {
  const f = x(brief);
  assert(`budget read: ${brief}`, f.fixed_total === total, String(f.fixed_total));
  assert(`currency read: ${brief}`, f.currency === currency, String(f.currency));
  assert(`a budget is not taken as an hourly rate: ${brief}`, f.hourly_rate === null, String(f.hourly_rate));
  assert(`the result still fits the schema: ${brief}`, CoreExtractionSchema.safeParse(f).success);
}
assert("an hourly brief has no fixed total", x("We agreed $85/hr, about 22 hours so far").fixed_total === null);
assert("an hourly brief keeps its rate", x("We agreed $85/hr, about 22 hours so far").hourly_rate === 85);
assert("pesos are MXN", x("presupuesto de 12,000 pesos").currency === "MXN");
assert("a bare number is not a budget", x("Call me at 5 pm about the site").fixed_total === null);

for (const [brief, type] of [
  ["Somos persona moral, factura a nombre de la empresa", "company"],
  ["Acme SA de CV needs a website", "company"],
  ["Bright Labs LLC, budget $900", "company"],
  ["Soy persona física, sin retenciones", "individual"],
  ["Hi, I need a logo", null],
] as const) {
  assert(`client type read: ${brief}`, x(brief).client_type === type, String(x(brief).client_type));
}
assert("the note no longer calls a stated budget missing", !/hourly rate/.test(x("Our budget is $350 for the flyer.").confidence_note));

assert("a fixed total is the extraction's value", extractionValue({ ...x("Our budget is $350"), hourly_rate: null }) === 350);

{
  const p = extractionToProject({ ...x("Video corporativo por $18,500 MXN, somos persona moral. Client: Lupita Films. Due Dec 10"), client: "Lupita Films" });
  assert("a budget opens the form on a fixed fee", p.billing === "fixed");
  assert("the fixed total is filled in", String(p.invoice_total) === "18500", String(p.invoice_total));
  assert("persona moral becomes a company client", p.client_tax_type === "persona_moral");
  assert("a budget brief with a client and date passes the project schema", NewProjectSchema.safeParse(p).success, JSON.stringify(NewProjectSchema.safeParse(p).error?.issues?.[0]));
  const ind = extractionToProject({ ...x("Soy persona física"), client: "Ana" });
  assert("persona física becomes an individual client", ind.client_tax_type === "persona_fisica");
  const old = extractionToProject({ project_name: "Logo", client: "Acme", hourly_rate: null, hours_logged: null, deadline: "2026-12-01", status: "in_progress" });
  assert("a saved extraction from before H5 still maps", old.billing === "fixed" && String(old.invoice_total) === "" && old.client_tax_type === "");
}

// ── H6: the brief and its result survive a reload ──────────────────────────
{
  const mem = new Map<string, string>();
  const store: DraftStore = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
  assert("no draft reads as empty", readDraft(store) === null);
  const result = { fields: x("Our budget is $350"), extractor: "heuristic" as const };
  writeDraft(store, { brief: "Our budget is $350", result });
  const back = readDraft(store);
  assert("a draft comes back after a reload", back?.brief === "Our budget is $350" && back?.result?.fields.fixed_total === 350);
  writeDraft(store, null);
  assert("clearing the draft removes it", readDraft(store) === null);
  mem.set("freeflow:core-draft", "{not json");
  assert("a corrupt draft reads as empty, never throws", readDraft(store) === null);
  const broken: DraftStore = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } };
  assert("blocked storage reads as empty", readDraft(broken) === null);
  let threw = false;
  try { writeDraft(broken, { brief: "x", result: null }); } catch { threw = true; }
  assert("blocked storage never throws on write", !threw);
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
