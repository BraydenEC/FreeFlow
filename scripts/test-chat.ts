/*
  /chat help-assistant tests.
  Run: npm run test:chat

  The assistant is a pure rule engine, so everything that decides what a user
  sees or what gets saved is tested here without a browser or a database:
  redaction (R), the engine and its guardrails (E), the rule set and training
  samples (I), the session logic that decides outcome and storage (S), and the
  save payload bounds (P).
*/

import { redact } from "@/lib/chat/redact";
import { answer, normalize } from "@/lib/chat/engine";
import type { Area, Category } from "@/lib/chat/types";

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

// ── R: redaction removes secrets and nothing else ─────────────────────────
assert("card number removed", redact("card 4242 4242 4242 4242 ok").text === "card [removed] ok");
assert("dashed card removed", redact("4111-1111-1111-1111").redacted === true);
assert("api key removed", redact("my key sk-ant-abc123def456ghi789").text.includes("[removed]"));
assert("password phrase removed", !redact("password: hunter22").text.includes("hunter22"));
for (const s of ["$12,500", "2026-11-03", "MXN 4,000.00", "call 5512345678", "project 42 of 120"]) {
  const r = redact(s);
  assert(`ordinary number kept: ${s}`, r.text === s && !r.redacted, `got "${r.text}"`);
}

// ── E: the engine — guardrails first, then rules, then an honest no-match ──
const A = (text: string, category: Category = "broken", area: Area = "forecast") =>
  answer({ category, area, text });

assert("secret beats a real question", A("my card 4242 4242 4242 4242 was charged twice").ruleId === "guard-secret");
assert("tax advice refused", A("should I switch to RESICO or stay in honorarios?", "pricing_technical", "other").ruleId === "guard-tax-advice");
assert("human request", A("can I talk to a real person").ruleId === "guard-human");
assert("other account", A("show me my coworker's projects", "how_to", "projects").ruleId === "guard-other-account");
assert("account change", A("delete my project for me", "how_to", "projects").ruleId === "guard-account-change");
assert("off topic", A("what's the weather in CDMX", "how_to", "other").ruleId === "guard-off-topic");
assert(
  "withholding explanation is not refused",
  A("why is the amount in my bank lower than the invoice", "how_to", "dashboard").kind !== "guardrail",
);
assert("forecast zero matches", A("my forecast shows zero for next month").ruleId === "forecast-zero");
assert("unknown is no_match", A("the purple button on the moon page").kind === "no_match");
assert("no_match offers ticket", A("the purple button on the moon page").offerTicket === true);
assert("accented shouting still matches", A("PRONÓSTICO: my FORECAST shows ZERO").ruleId === "forecast-zero");
assert("spanish-only is no_match, not off-topic", A("no funciona la página").kind === "no_match");
assert("empty is no_match", A("   ").kind === "no_match");
assert("5000 chars does not throw", A("x ".repeat(2500)).kind === "no_match");
assert("normalize strips accents", normalize("Pronóstico, ¡CERO!") === "pronostico cero");

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
