/*
  Currency tests.
  Run: npm run test:currency

  Formatting money is the kind of thing that looks obviously correct and is
  regionally wrong. 1.234,56 and 1,234.56 are the same number to different
  readers, Chilean pesos have no cents, and a preferences object a user can
  edit can contain anything at all.
*/

import {
  CURRENCIES,
  CURRENCY_CODES,
  DEFAULT_CURRENCY,
  formatMoney,
  isCurrencyCode,
  type CurrencyCode,
} from "@/lib/currency";
import { formatCurrency, formatCurrencyWhole } from "@/lib/format";

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

/* Digits only, so assertions do not depend on which space or symbol a locale
   chooses — the separators are what is being checked, not the glyph. */
function digits(s: string): string {
  return s.replace(/[^\d.,]/g, "");
}

console.log("\nCURRENCY\n" + "─".repeat(64));

// --- Every declared currency actually works -------------------------------
for (const code of CURRENCY_CODES) {
  const out = formatMoney(1234.5, code);
  assert(`${code} formats without throwing`, out.length > 0 && /\d/.test(out), out);
  assert(`${code} has a label and a locale`, Boolean(CURRENCIES[code]?.label && CURRENCIES[code]?.locale));
}

// --- Separators follow the region, not the developer ----------------------
{
  // en-US: 1,234.50   ·   pt-BR and es-CO: 1.234,50
  assert("USD uses a period for decimals", digits(formatMoney(1234.5, "USD")) === "1,234.50", formatMoney(1234.5, "USD"));
  assert(
    "BRL uses a comma for decimals",
    digits(formatMoney(1234.5, "BRL")) === "1.234,50",
    formatMoney(1234.5, "BRL"),
  );
  // Colombian pesos have no centavos in practice and Intl knows it, so COP
  // behaves like CLP rather than like BRL. Asserted because it was assumed
  // wrong first.
  assert(
    "COP uses a period for thousands and prints no centavos",
    digits(formatMoney(1234.5, "COP")) === "1.235",
    formatMoney(1234.5, "COP"),
  );
}

// --- Currencies without cents must not be given any ----------------------
{
  const clp = formatMoney(1234, "CLP");
  assert("CLP prints no decimal part", !/[.,]\d\d$/.test(digits(clp)), clp);
  const usd = formatMoney(1234, "USD");
  assert("USD still prints cents", /\.\d\d$/.test(digits(usd)), usd);
}

// --- Distinct symbols, so the number is never ambiguous -------------------
{
  const symbols = new Set(CURRENCY_CODES.map((c) => formatMoney(1, c).replace(/[\d.,\s]/g, "")));
  assert("currencies do not all render the same symbol", symbols.size > 3, [...symbols].join(" "));
  // MXN, USD, CAD, CLP, UYU and ARS all render a bare "$" in their own
  // locale, and that is correct — the reader chose the currency. The place it
  // becomes ambiguous is a file somebody else opens, which is why the CSV
  // names the currency in its headers instead. Asserted there, not here.
  assert(
    "the dollar-sign currencies are knowingly identical in symbol",
    formatMoney(1, "MXN") === formatMoney(1, "USD"),
  );
}

// --- Garbage cannot break a page -----------------------------------------
// This reads from a preferences object the user can edit by hand.
for (const bad of ["DOLLARS", "", "usd", "XXX", null, undefined, 42, {}]) {
  const out = formatMoney(100, bad as unknown as CurrencyCode);
  assert(`${JSON.stringify(bad)} falls back rather than throwing`, out.length > 0 && /\d/.test(out), out);
}
assert("an unknown code falls back to the default", formatMoney(100, "XXX" as CurrencyCode) === formatMoney(100, DEFAULT_CURRENCY));

// --- Non-finite amounts ---------------------------------------------------
for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
  const out = formatMoney(bad, "USD");
  assert(`${String(bad)} renders as zero rather than "NaN"`, !/nan|∞/i.test(out), out);
}

// --- The type guard -------------------------------------------------------
assert("isCurrencyCode accepts a real code", isCurrencyCode("MXN"));
assert("isCurrencyCode rejects a lowercase code", !isCurrencyCode("mxn"));
assert("isCurrencyCode rejects a non-string", !isCurrencyCode(42));

// --- The wrappers pass the currency through -------------------------------
// The whole point of the refactor: these used to be hardcoded to USD.
{
  assert(
    "formatCurrency honours the currency argument",
    formatCurrency(1000, "BRL") === formatMoney(1000, "BRL"),
  );
  assert(
    "formatCurrencyWhole honours the currency argument",
    formatCurrencyWhole(1000, "MXN") === formatMoney(1000, "MXN", { whole: true }),
  );
  assert(
    "formatCurrency still defaults to USD when not told",
    formatCurrency(1000) === formatMoney(1000, DEFAULT_CURRENCY),
  );
  assert(
    "the whole variant drops the cents",
    !/\d[.,]\d\d\b/.test(digits(formatCurrencyWhole(1234.56, "USD"))),
    formatCurrencyWhole(1234.56, "USD"),
  );
}

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
