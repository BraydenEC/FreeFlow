/*
  Rate limiter tests.
  Run: npm run test:ratelimit

  The limiter guards a paid API from abuse, so the things worth proving are the
  ones a bill depends on: it blocks past the limit, it lets requests through
  again once the window slides, and distinct clients never share a bucket.
*/

import { rateLimit, clientKey, _resetRateLimit } from "@/lib/ratelimit";

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

const OPTS = { limit: 3, windowMs: 1000 };
const T0 = 1_000_000;

_resetRateLimit();

// allows up to the limit
assert("1st request allowed", rateLimit("a", { ...OPTS, now: T0 }).ok);
assert("2nd request allowed", rateLimit("a", { ...OPTS, now: T0 + 10 }).ok);
const third = rateLimit("a", { ...OPTS, now: T0 + 20 });
assert("3rd request allowed (at limit)", third.ok);
assert("remaining is zero at the limit", third.remaining === 0);

// blocks past the limit
const fourth = rateLimit("a", { ...OPTS, now: T0 + 30 });
assert("4th request blocked", !fourth.ok);
assert("blocked response reports a positive retryAfter", fourth.retryAfterMs > 0);
assert(
  "retryAfter never exceeds the window",
  fourth.retryAfterMs <= OPTS.windowMs,
  String(fourth.retryAfterMs),
);

// window slides: once the oldest hit ages out, a request is allowed again
assert(
  "still blocked just before the window passes",
  !rateLimit("a", { ...OPTS, now: T0 + 999 }).ok,
);
assert(
  "allowed again after the first hit ages out",
  rateLimit("a", { ...OPTS, now: T0 + 1001 }).ok,
);

// distinct keys are independent
_resetRateLimit();
assert("client A first hit allowed", rateLimit("scope:1.1.1.1", { ...OPTS, now: T0 }).ok);
assert("client A second allowed", rateLimit("scope:1.1.1.1", { ...OPTS, now: T0 }).ok);
assert("client A third allowed", rateLimit("scope:1.1.1.1", { ...OPTS, now: T0 }).ok);
assert("client A fourth blocked", !rateLimit("scope:1.1.1.1", { ...OPTS, now: T0 }).ok);
assert(
  "a different client is unaffected by A hitting its limit",
  rateLimit("scope:2.2.2.2", { ...OPTS, now: T0 }).ok,
);

// clientKey derives a per-IP, per-scope bucket from the proxy header
const req = new Request("https://x/api", {
  headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" },
});
assert(
  "clientKey uses the first x-forwarded-for IP and the scope",
  clientKey(req, "generate") === "generate:9.9.9.9",
  clientKey(req, "generate"),
);
const noIp = new Request("https://x/api");
assert(
  "clientKey falls back to a shared 'unknown' bucket (fails safe)",
  clientKey(noIp, "generate") === "generate:unknown",
);
assert(
  "the same IP under a different scope is a separate bucket",
  clientKey(req, "extract") !== clientKey(req, "generate"),
);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
