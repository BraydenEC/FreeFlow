/*
  Pricing logic tests.

  Run: npm run test:pricing

  These execute lib/pricing/model.ts directly — the same functions the
  calculator imports, not a reimplementation. Week 2 established why that
  matters: a test written against a copy tests the copy.

  The first two cases are the required pricing-logic tests, and both target
  errors that flatter a revenue model rather than merely breaking it.
*/

import {
  annualPrice,
  blendedArpu,
  computePricing,
  effectiveMonthly,
  money,
  projectAccounts,
  retained,
} from "@/lib/pricing/model";
import { SCENARIOS } from "@/lib/pricing/scenarios";
import type { PricingInputs } from "@/types/pricing";

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = Math.abs(Number(actual) - Number(expected)) < 0.01;
  if (ok) {
    passed++;
    console.log(`  PASS  ${name}  →  ${actual}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}  →  expected ${expected}, got ${actual}`);
  }
}

function assert(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}${detail ? "  —  " + detail : ""}`);
  }
}

console.log("\nPRICING LOGIC TESTS\n" + "─".repeat(70));

/* ===================================================================
   REQUIRED TEST 1 — annual billing applies the discount
   =================================================================== */
console.log("\n1. Annual billing applies the discount");

check("$14/mo at 20% off = $134.40/yr", annualPrice(14, 0.2), 134.4);
check("no discount is plain ×12", annualPrice(14, 0), 168);
check("a free tier stays free", annualPrice(0, 0.2), 0);
check("100% discount is zero", annualPrice(14, 1), 0);

// The flattering error: forgetting the discount. Stated as an explicit
// inequality so the test fails loudly if the discount is ever dropped.
assert(
  "discounted annual is strictly less than monthly × 12",
  annualPrice(14, 0.2) < 14 * 12,
  `${annualPrice(14, 0.2)} should be under ${14 * 12}`,
);

// An annual payer's monthly-equivalent must be the discounted rate, not list.
check(
  "all-annual MRR reflects the discount",
  effectiveMonthly(14, 0.2, 1),
  11.2,
);
check("all-monthly MRR is list price", effectiveMonthly(14, 0.2, 0), 14);
check(
  "half annual is the midpoint",
  effectiveMonthly(14, 0.2, 0.5),
  12.6,
);

/* ===================================================================
   REQUIRED TEST 2 — churn compounds rather than subtracting
   =================================================================== */
console.log("\n2. Churn compounds rather than subtracting");

check("100 accounts, 5% monthly, 12 months ≈ 54", retained(100, 0.05, 12), 54.04);
check("zero churn retains everyone", retained(100, 0, 12), 100);
check("month zero is the starting base", retained(100, 0.05, 0), 100);

// The error this test exists to prevent.
const subtracted = 100 - 100 * 0.05 * 12; // 40 — wrong
assert(
  "compounded retention differs from naive subtraction",
  Math.abs(retained(100, 0.05, 12) - subtracted) > 10,
  `compounded ${money(retained(100, 0.05, 12))} vs subtracted ${subtracted}`,
);

// At high churn, subtraction goes negative and stops meaning anything.
// Compounding stays positive and asymptotic, which is what actually happens.
assert(
  "high churn stays positive rather than going negative",
  retained(100, 0.2, 12) > 0,
  `got ${retained(100, 0.2, 12)}`,
);
check("20% monthly churn leaves ~7 of 100", retained(100, 0.2, 12), 6.87);

// Churn and growth compound against each other, not netted once.
check(
  "5% churn with 5% growth is slightly below flat",
  projectAccounts(100, 0.05, 0.05, 12),
  97.04,
);
assert(
  "growth above churn grows the base",
  projectAccounts(100, 0.05, 0.1, 12) > 100,
  `got ${projectAccounts(100, 0.05, 0.1, 12)}`,
);

/* ===================================================================
   TEST 3 — blended ARPU is weighted, not an average of averages
   =================================================================== */
console.log("\n3. Blended ARPU is weighted");

check("1000 MRR over 50 accounts = 20", blendedArpu(1000, 50), 20);
check("no accounts yields zero, not NaN", blendedArpu(1000, 0), 0);

/* ===================================================================
   TEST 4 — degenerate inputs never produce NaN or negative revenue
   =================================================================== */
console.log("\n4. Degenerate inputs are handled");

const nasty: PricingInputs[] = [
  { freelancers: 0, studios: 0, seatsPerStudio: 0, freelancerPaidShare: 0, monthlyChurn: 0, monthlyGrowth: 0, annualDiscount: 0, annualShare: 0 },
  { freelancers: -50, studios: -10, seatsPerStudio: -3, freelancerPaidShare: -1, monthlyChurn: -0.5, monthlyGrowth: -2, annualDiscount: -1, annualShare: -1 },
  { freelancers: 1e9, studios: 1e9, seatsPerStudio: 1e6, freelancerPaidShare: 5, monthlyChurn: 5, monthlyGrowth: 5, annualDiscount: 5, annualShare: 5 },
  { freelancers: NaN, studios: NaN, seatsPerStudio: NaN, freelancerPaidShare: NaN, monthlyChurn: NaN, monthlyGrowth: NaN, annualDiscount: NaN, annualShare: NaN },
];

let clean = true;
for (const input of nasty) {
  const r = computePricing(input);
  const values = [r.mrr, r.arr, r.arpu, ...r.projection.map((p) => p.mrr)];
  if (values.some((v) => !Number.isFinite(v) || v < 0)) clean = false;
}
assert("no NaN and no negative revenue across 4 degenerate inputs", clean);

/* ===================================================================
   TEST 5 — the conservative scenario is genuinely worse
   =================================================================== */
console.log("\n5. Conservative is genuinely worse, not base minus a bit");

const cons = computePricing(SCENARIOS.conservative.inputs);
const base = computePricing(SCENARIOS.base.inputs);
const opt = computePricing(SCENARIOS.optimistic.inputs);

assert("conservative ARR < base ARR", cons.arr < base.arr, `${cons.arr} vs ${base.arr}`);
assert("base ARR < optimistic ARR", base.arr < opt.arr, `${base.arr} vs ${opt.arr}`);

// The point of the criterion: a pessimistic case that is only marginally worse
// is decoration. Conservative must be at most half of base.
assert(
  "conservative is at most half of base ARR",
  cons.arr <= base.arr * 0.5,
  `conservative ${cons.arr} is ${((cons.arr / base.arr) * 100).toFixed(0)}% of base ${base.arr}`,
);

// And the conservative twelve-month projection must actually decline.
const consProj = cons.projection;
assert(
  "conservative accounts decline over 12 months",
  consProj[11].freelancers < consProj[0].freelancers,
  `month 1: ${consProj[0].freelancers}, month 12: ${consProj[11].freelancers}`,
);

/* ===================================================================
   TEST 6 — the model is deterministic and reproducible
   =================================================================== */
console.log("\n6. Reproducibility — a saved scenario recomputes identically");

const a = computePricing(SCENARIOS.base.inputs);
const b = computePricing(SCENARIOS.base.inputs);
assert("same inputs give identical MRR", a.mrr === b.mrr, `${a.mrr} vs ${b.mrr}`);
assert("same inputs give identical ARR", a.arr === b.arr);
assert("ARR is exactly 12 × MRR", money(a.mrr * 12) === a.arr, `${a.mrr} × 12 vs ${a.arr}`);
assert("projection has 12 months", a.projection.length === 12);

console.log("\n" + "─".repeat(70));
console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
