/*
  Donation configuration tests.
  Run: npm run test:support

  The donate button is a link to somebody's money. The two failures worth
  guarding are a malformed URL that renders as a relative path and 404s inside
  the app, and a scheme that is not https — which for a payment link would
  mean sending someone to enter card details over a channel that is not
  encrypted, or to a javascript: handler.
*/

import { getDonateUrl, isDonationConfigured, SUGGESTED_AMOUNTS, WHAT_IT_FUNDS, WHAT_IT_DOES_NOT_BUY } from "@/lib/support";

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

function withEnv(value: string | undefined, fn: () => void) {
  const prev = process.env.NEXT_PUBLIC_DONATE_URL;
  if (value === undefined) delete process.env.NEXT_PUBLIC_DONATE_URL;
  else process.env.NEXT_PUBLIC_DONATE_URL = value;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_DONATE_URL;
    else process.env.NEXT_PUBLIC_DONATE_URL = prev;
  }
}

console.log("\nDONATION CONFIG\n" + "─".repeat(64));

// --- Absent is a supported state, not an error ----------------------------
// Same discipline as the Anthropic key: a missing variable must degrade, not
// break the build or leave a dead button on the page.
withEnv(undefined, () => {
  assert("unset URL returns null", getDonateUrl() === null);
  assert("unset URL reports unconfigured", isDonationConfigured() === false);
});
withEnv("", () => {
  assert("empty URL returns null", getDonateUrl() === null);
});
withEnv("   ", () => {
  assert("whitespace-only URL returns null", getDonateUrl() === null);
});

// --- Only https is accepted ----------------------------------------------
const rejected = [
  ["no scheme", "buy.stripe.com/abc123"],
  ["www prefix only", "www.stripe.com/abc"],
  ["plain http", "http://buy.stripe.com/abc123"],
  ["javascript handler", "javascript:alert(1)"],
  ["data url", "data:text/html,<script>alert(1)</script>"],
  ["relative path", "/donate"],
  ["protocol relative", "//buy.stripe.com/abc"],
  ["spaces inside", "https://buy.stripe.com/a b c"],
];
for (const [name, url] of rejected) {
  withEnv(url, () => {
    assert(`rejects ${name}`, getDonateUrl() === null, url);
  });
}

// --- A real link is accepted and returned untouched -----------------------
withEnv("https://buy.stripe.com/test_abc123", () => {
  assert("accepts an https payment link", getDonateUrl() === "https://buy.stripe.com/test_abc123");
  assert("reports configured", isDonationConfigured() === true);
});
withEnv("  https://buy.stripe.com/test_abc123  ", () => {
  assert("trims surrounding whitespace", getDonateUrl() === "https://buy.stripe.com/test_abc123");
});
withEnv("https://buy.stripe.com/abc?utm=x", () => {
  assert("keeps an existing query string", getDonateUrl() === "https://buy.stripe.com/abc?utm=x");
});

// --- The copy on the page ------------------------------------------------
assert("there are suggested amounts", SUGGESTED_AMOUNTS.length >= 3);
assert(
  "every amount is positive and whole",
  SUGGESTED_AMOUNTS.every((a) => a.usd > 0 && Number.isInteger(a.usd)),
);
assert(
  "amounts ascend",
  SUGGESTED_AMOUNTS.every((a, i) => i === 0 || a.usd > SUGGESTED_AMOUNTS[i - 1].usd),
);
assert(
  "every amount says what it covers",
  SUGGESTED_AMOUNTS.every((a) => a.covers.trim().length > 0 && a.label.trim().length > 0),
);
assert("the page states what donations fund", WHAT_IT_FUNDS.length > 0);
// This one is the point. A donation page that only lists benefits is selling
// a subscription and calling it a gift.
assert("the page states what donations do NOT buy", WHAT_IT_DOES_NOT_BUY.length > 0);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
