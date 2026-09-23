/*
  Withholding tests.
  Run: npm run test:withholding

  This arithmetic decides what the product tells someone they will actually be
  paid. Getting it wrong by a centavo makes the figure disagree with the CFDI;
  getting it wrong by a rate makes it disagree with reality. Both are worth
  pinning down, so the canonical worked example is asserted literally.
*/

import {
  computeWithholding,
  IVA_RATE,
  IVA_RETENIDO_RATE,
  ISR_RETENIDO_RATE,
} from "@/lib/tax/withholding";

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

console.log("\nWITHHOLDING (RETENCIONES)\n" + "─".repeat(64));

// --- The worked example, asserted exactly ---------------------------------
// 10,000 billed to a company is the example every Mexican accountant uses.
// If these four numbers are right, the rates and the rounding are right.
{
  const w = computeWithholding(10000, "persona_moral");
  assert("10,000 → IVA is 1,600", w.iva === 1600, String(w.iva));
  assert("10,000 → invoiced is 11,600", w.invoiced === 11600, String(w.invoiced));
  assert("10,000 → IVA retenido is 1,066.67", w.ivaRetenido === 1066.67, String(w.ivaRetenido));
  assert("10,000 → ISR retenido is 1,000", w.isrRetenido === 1000, String(w.isrRetenido));
  assert("10,000 → withheld total is 2,066.67", w.withheldTotal === 2066.67, String(w.withheldTotal));
  assert("10,000 → net received is 9,533.33", w.net === 9533.33, String(w.net));
  assert("10,000 → applies", w.applies === true);
}

// --- Who it applies to ----------------------------------------------------
// The whole reason the payer's type is stored per project.
{
  const fisica = computeWithholding(10000, "persona_fisica");
  assert("persona física withholds nothing", fisica.withheldTotal === 0);
  assert("persona física nets the full invoice", fisica.net === fisica.invoiced);
  assert("persona física reports applies false", fisica.applies === false);

  // Unknown must behave like "no withholding", never like "probably a company".
  // Guessing here would quietly tell someone they earned less than they did.
  const unknown = computeWithholding(10000, null);
  assert("unknown tax type withholds nothing", unknown.withheldTotal === 0);
  assert("unknown nets the full invoice", unknown.net === unknown.invoiced);
  assert(
    "unknown matches persona física exactly",
    unknown.net === fisica.net && unknown.invoiced === fisica.invoiced,
  );
}

// --- Internal consistency, at many values ---------------------------------
{
  const values = [0.01, 1, 99.99, 1234.56, 4837.5, 10000, 250000, 9999999.99];
  let netOk = true;
  let orderOk = true;
  let centavoOk = true;

  for (const v of values) {
    const w = computeWithholding(v, "persona_moral");
    if (Math.abs(w.invoiced - w.withheldTotal - w.net) > 0.005) netOk = false;
    // A withheld total above the IVA charged would mean paying to work.
    if (w.net > w.invoiced || w.net < 0) orderOk = false;
    for (const n of [w.iva, w.invoiced, w.ivaRetenido, w.isrRetenido, w.net]) {
      if (Math.round(n * 100) !== Number((n * 100).toFixed(0))) centavoOk = false;
    }
  }
  assert("net always equals invoiced minus withheld", netOk);
  assert("net is never negative and never exceeds the invoice", orderOk);
  assert("every component is a whole number of centavos", centavoOk);
}

// --- Rates are what the law says ------------------------------------------
assert("IVA is 16%", IVA_RATE === 0.16);
assert("ISR retenido is 10%", ISR_RETENIDO_RATE === 0.1);
assert(
  "IVA retenido is two-thirds of the IVA",
  Math.abs(IVA_RETENIDO_RATE - (2 / 3) * 0.16) < 1e-12,
);
assert(
  "IVA retenido is about 10.67% of subtotal",
  Math.abs(IVA_RETENIDO_RATE - 0.106667) < 1e-5,
);

// --- Garbage in, zero out, never a crash ----------------------------------
// This runs against user-entered project values on a page that must render.
for (const bad of [0, -1, -0.01, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
  const w = computeWithholding(bad as number, "persona_moral");
  assert(`${String(bad)} produces a zeroed result rather than throwing`, w.net === 0 && w.invoiced === 0);
}

// --- The net is meaningfully smaller --------------------------------------
// A regression here would mean withholding silently stopped being applied.
{
  const w = computeWithholding(10000, "persona_moral");
  const shortfall = w.invoiced - w.net;
  assert("withholding is ~17.8% of the invoiced total", Math.abs(shortfall / w.invoiced - 0.1782) < 0.001, String(shortfall / w.invoiced));
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
