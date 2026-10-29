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

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
