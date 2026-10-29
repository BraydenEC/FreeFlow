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
import { GUARD_RULES } from "@/lib/chat/guards";
import { CONTENT_RULES } from "@/lib/chat/rules";
import { SAMPLES } from "@/lib/chat/samples";
import { SessionRequestSchema } from "@/lib/chat/schema";
import { canWrite, firstMessage, needsTranscript, outcomeFor, replay } from "@/lib/chat/session";
import { featureSummary } from "@/lib/product/features";
import type { Area, Category } from "@/lib/chat/types";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
// Review of Task 2: false positives a support chat would hit every day
for (const s of [
  "project 123e4567-e89b-12d3-a456-426614174000",
  "my-project-2026-final-proposal-for-the-client-x",
  "Invoice 1001 1002 1003 1004",
  "2026-10-29 2026-10-30",
  "call +52 1 55 1234 5678",
  "The password is required",
]) {
  const r = redact(s);
  assert(`not a secret: ${s}`, r.text === s && !r.redacted, `got "${r.text}"`);
}
// ...and secrets it let through or mangled
for (const [s, leak] of [
  ["Password is 'my secret pass'", "secret pass"],
  ['password: "two words"', "words"],
  ["password is: abc", "abc"],
  ["mi contraseña es abc123", "abc123"],
  ["key AKIAIOSFODNN7EXAMPLE", "AKIAIOSFODNN7EXAMPLE"],
  ["Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl", "eyJhbGci"],
  ["SK-ANT-ABC123DEF456GHI", "ABC123"],
  ["CLABE 012180001234567891", "012180001234567891"],
] as const) {
  assert(`secret removed: ${s}`, !redact(s).text.includes(leak), `got "${redact(s).text}"`);
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

// Review of Task 3: guards that missed (Spanish, AI, phrasing) or over-fired
for (const [text, id] of [
  ["que regimen me conviene", "guard-tax-advice"],
  ["debo cambiar a RESICO", "guard-tax-advice"],
  ["¿puedo cambiar mi régimen fiscal?", "guard-tax-advice"],
  ["cuanto ISR debo pagar", "guard-tax-advice"],
  ["necesito ayuda con mi declaracion", "guard-tax-advice"],
  ["do I owe IVA on this", "guard-tax-advice"],
  ["hablar con una persona", "guard-human"],
  ["quiero hablar con un humano", "guard-human"],
  ["eres un robot", "guard-human"],
  ["are you AI", "guard-human"],
  ["is this a bot", "guard-human"],
  ["am I talking to a robot", "guard-human"],
  ["how do I contact support", "guard-human"],
] as const) {
  const got = A(text, "pricing_technical", "other").ruleId;
  assert(`guard fires: "${text}" → ${id}`, got === id, `got ${got}`);
}
for (const text of [
  "how do I change my honorarios rate",
  "my client threatened a lawsuit",
  "can other users see my projects",
  "is my data shared with other users",
  "does it work when raining",
  "the temperature of the forecast",
  "capital of my project",
]) {
  const got = A(text, "pricing_technical", "other");
  assert(`no guard on: "${text}"`, got.kind !== "guardrail", `got ${got.ruleId}`);
}

// ── I: the rule set is honest and internally consistent ───────────────────
function collectRoutes(dir: string, base = ""): Set<string> {
  const out = new Set<string>();
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "api" || name.startsWith("_")) continue;
      const seg = /^\(.*\)$/.test(name) ? "" : `/${name}`;
      for (const r of collectRoutes(full, base + seg)) out.add(r);
    } else if (name === "page.tsx") {
      out.add(base || "/");
    }
  }
  return out;
}
const routes = collectRoutes("app");
routes.add("/chat");
const allRules = [...CONTENT_RULES, ...GUARD_RULES];
const ids = allRules.map((r) => r.id);
assert("rule ids unique", new Set(ids).size === ids.length);
for (const r of allRules) for (const l of r.links ?? []) {
  assert(`${r.id} links to a real route: ${l.href}`, routes.has(l.href));
}
const PLANNED_TERMS = [/cfdi/i, /materialidad/i, /\bseats?\b/i, /cross-person/i, /per-person profitability/i];
assert("planned list matches features.ts", featureSummary().planned === 5);
for (const r of CONTENT_RULES) {
  if (PLANNED_TERMS.some((t) => t.test(r.answer))) {
    assert(`${r.id} says planned features are not built`, /not built/i.test(r.answer));
  }
  assert(`${r.id} has keywords`, r.keywords.length + (r.phrases?.length ?? 0) > 0);
}
for (const s of SAMPLES) {
  const got = answer(s).ruleId ?? "no_match";
  assert(`sample → ${s.expect}: "${s.text}"`, got === s.expect, `got ${got}`);
}

// ── S: session logic decides outcome and what gets stored ─────────────────
const t = replay("broken", "forecast", ["my forecast shows zero", "the purple moon button"]);
assert("replay alternates", t.length === 4 && t[1].role === "bot");
assert("no_match outranks answered", outcomeFor(t, false) === "no_match");
assert("ticket outranks all", outcomeFor(t, true) === "ticket");
assert("guardrail-only session", outcomeFor(replay("how_to", "other", ["can I talk to a human"]), false) === "guardrail");
assert(
  "a content answer beats a guard for outcome",
  outcomeFor(replay("broken", "forecast", ["my forecast shows zero", "are you a bot"]), false) === "answered",
);
assert("thumbs-down keeps transcript", needsTranscript("answered", [{ ruleId: "forecast-zero", up: false }]));
assert("clean answer keeps summary only", !needsTranscript("answered", [{ ruleId: "forecast-zero", up: true }]));
assert("guardrail keeps transcript", needsTranscript("guardrail", []));
assert(
  "filed ticket is frozen",
  canWrite({ ticket_status: "open" }) === false && canWrite({ ticket_status: null }) && canWrite(null),
);
assert("replay redacts", replay("broken", "other", ["password: abc123"])[0].text.includes("[removed]"));
const fb = replay("feedback", "dashboard", ["the colours are too dark"]);
assert("feedback skips matching", fb.length === 1 && fb[0].role === "user");

// ── P: the save payload is bounded and never carries ticket_status ────────
const valid = {
  id: "8f14e45f-ceea-4e6a-9a5b-3c2f1d0e9a71",
  category: "broken",
  area: "forecast",
  messages: ["my forecast shows zero"],
  ratings: [{ ruleId: "forecast-zero", up: true }],
  fileTicket: false,
};
assert("valid payload parses", SessionRequestSchema.safeParse(valid).success);
assert("2001-char message rejected", !SessionRequestSchema.safeParse({ ...valid, messages: ["x".repeat(2001)] }).success);
assert("41 messages rejected", !SessionRequestSchema.safeParse({ ...valid, messages: Array(41).fill("hi") }).success);
assert("empty message rejected", !SessionRequestSchema.safeParse({ ...valid, messages: [""] }).success);
assert("no messages rejected", !SessionRequestSchema.safeParse({ ...valid, messages: [] }).success);
assert("ticket_status key rejected", !SessionRequestSchema.safeParse({ ...valid, ticket_status: "resolved" }).success);
assert("unknown area rejected", !SessionRequestSchema.safeParse({ ...valid, area: "billing" }).success);
assert("non-uuid id rejected", !SessionRequestSchema.safeParse({ ...valid, id: "abc" }).success);

// Fact-check of Task 4: answers must say what the code does
const ans = (id: string) => CONTENT_RULES.find((r) => r.id === id)?.answer ?? "";
assert("relative dates: only the model reads 'next Friday'", /pattern matching/i.test(ans("relative-dates")));
assert("overdue: pinning depends on the setting", ans("overdue-alert").includes("Pin overdue to the top"));
assert("overdue: an Overdue status must be changed too", /status/i.test(ans("overdue-alert")));
assert("forecast: terms fall back to the Settings default", /settings/i.test(ans("forecast-zero")));
assert("forecast: projects with no deadline are skipped", /no deadline/i.test(ans("forecast-zero")));
assert("password reset uses the real link text", ans("password-reset").includes("Forgot your password?"));
assert("privacy: transcripts only when it matters", /summary/i.test(ans("data-privacy")));
assert(
  "feedback must be filed as a ticket",
  !SessionRequestSchema.safeParse({ ...valid, category: "feedback", fileTicket: false }).success &&
    SessionRequestSchema.safeParse({ ...valid, category: "feedback", fileTicket: true }).success,
);

// Security review of Task 5: redaction can lengthen text past the column limit
const nearLimit = "x".repeat(1990) + " password:a";
assert("first message stays within 2000 after redaction", firstMessage(replay("broken", "other", [nearLimit])).length <= 2000);
assert("first message is the redacted user text", firstMessage(replay("broken", "other", ["password: abc123"])).includes("[removed]"));

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
