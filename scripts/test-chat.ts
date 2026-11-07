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
import { canSendMore, canWrite, firstMessage, shouldOfferTicket, needsTranscript, outcomeFor, replay } from "@/lib/chat/session";
import { featureSummary } from "@/lib/product/features";
import { MAX_MESSAGES, type Area, type Category, type EngineReply } from "@/lib/chat/types";
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
assert("spanish-only is not refused as off-topic", A("no funciona la página").kind !== "guardrail");
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
  assert(`${r.id} has keywords`, r.keywords.length + (r.phrases?.length ?? 0) + (r.exact?.length ?? 0) > 0);
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
assert("password reset uses the real link text", ans("password-reset").includes("Forgot your password?"));
assert("privacy: transcripts only when it matters", /full conversation is kept only/i.test(ans("data-privacy")));
assert(
  "feedback must be filed as a ticket",
  !SessionRequestSchema.safeParse({ ...valid, category: "feedback", fileTicket: false }).success &&
    SessionRequestSchema.safeParse({ ...valid, category: "feedback", fileTicket: true }).success,
);

// Coverage pass: answers must match what the app lets people do
assert("brief fields can't be edited, so don't tell people to", !/before (you )?sav/i.test(ans("brief-wrong-field")) && !/fill it in yourself/i.test(ans("brief-unsure")));
assert("relative dates: no correcting before saving", !/before saving/i.test(ans("relative-dates")));
assert("saving a brief does not create a project", /doesn't create a project/i.test(ans("brief-saved-where")));
assert("reset needs signing out first: the page redirects signed-in users", /sign out/i.test(ans("password-reset")));
assert("guard-secret also says to sign out first", /sign out/i.test(GUARD_RULES.find((g) => g.id === "guard-secret")?.answer ?? ""));
assert("delete starts from the real Edit button", ans("project-delete").includes("Edit") && ans("project-delete").includes("Yes, delete"));
assert("create uses the real button names", ans("project-create-edit").includes("+ New project") && ans("project-create-edit").includes("Add project"));
assert("unpaid card counts only invoiced work", /Invoice sent/.test(ans("dashboard-numbers")));
assert("worked example adds up", ans("tax-worked-example").includes("11,600") && ans("tax-worked-example").includes("9,533.33") && ans("tax-worked-example").includes("10,408.33"));
assert("reset to defaults warns about currency", /currency/i.test(ans("layout-prefs")));
assert("every tier is named", ["Solo", "Project", "Pro", "Studio"].every((n) => ans("pricing-tiers").includes(n)));

assert("finding the regime field isn't tax advice", A("where do I set my tax regime", "how_to", "account").ruleId === "tax-regime");
assert("choosing a regime still is", A("should I switch to resico", "how_to", "account").ruleId === "guard-tax-advice" && A("do I qualify for resico", "how_to", "account").ruleId === "guard-tax-advice");

// Coverage pass: how the engine reaches an answer
assert("whole-message greeting wins", A("hello", "pricing_technical", "research").ruleId === "chat-greeting");
assert("greeting words inside a question don't hijack it", A("hi my forecast shows zero for next month").ruleId === "forecast-zero");
assert("thanks inside a question doesn't hijack it", A("thanks, but my forecast shows zero").ruleId === "forecast-zero");
assert("generic help loses to a specific rule", A("csv download isn't working", "broken", "dashboard").ruleId === "csv-export");
assert("generic help offers a ticket", A("the page is blank", "broken", "dashboard").offerTicket === true);
assert("out-of-scope match needs real evidence", A("something about next month", "how_to", "research").kind === "no_match");
assert("guards still run first", A("hi password: abc123").ruleId === "guard-secret");

assert("area overviews stay in their area", A("what is this page", "how_to", "other").kind === "no_match");
assert("a fault beats an overview", A("the dashboard is blank", "broken", "dashboard").ruleId === "app-error");
assert("overviews always offer the ticket", CONTENT_RULES.filter((r) => r.id.startsWith("overview-")).every((r) => r.generic && r.offerTicket));

assert("a strong word is one the rule also lists", CONTENT_RULES.every((r) => (r.strong ?? []).every((k) => r.keywords.includes(k))));
assert("one strong word answers inside the chosen section", A("churn?", "how_to", "pricing").ruleId === "pricing-simulator");
assert("one strong word is not enough outside it", A("churn?", "how_to", "dashboard").kind === "no_match");
assert("the marketing page doesn't claim 'my business' outside its area", A("can i use it for my business", "how_to", "other").ruleId !== "marketing-own-business");

// Fact-check of the coverage pass: every line here failed against the first draft
for (const q of ["how much have i been paid", "how much is this project worth", "can i cancel a project", "how to pay a contractor"]) {
  assert(`pricing doesn't claim: ${q}`, A(q, "how_to", "other").ruleId !== "pricing-free");
}
assert("cancelling an account is account deletion", A("can i cancel my account", "how_to", "account").ruleId === "account-delete");
assert("a rate on a project isn't pricing advice", A("how do i change my rate on a project", "how_to", "projects").ruleId === "project-create-edit" && A("my rate is wrong", "broken", "projects").ruleId === "project-create-edit");
assert("still no advice on what to charge", A("what should i charge", "how_to", "other").ruleId === "rates-advice");
for (const q of ["this app keeps crashing", "this app is broken", "this app is so slow"]) {
  assert(`a fault isn't a tour: ${q}`, A(q, "broken", "other").ruleId === "app-error");
}
assert("moving a deadline isn't layout", A("how do i move the deadline", "how_to", "dashboard").ruleId === "project-create-edit");
assert("this assistant is me, not a co-worker", A("what can this assistant do", "how_to", "other").ruleId === "help-capabilities");
assert("a drive link isn't sign-in", A("can i paste a google drive link", "how_to", "projects").ruleId === "contract-links");
assert("rate on a brief still reaches the brief rule", A("the rate is wrong", "broken", "brief").ruleId === "brief-wrong-field");
const SIGNED_IN_BOUNCES = new Set(["/login", "/signup", "/verify-email", "/forgot-password"]);
for (const r of allRules) for (const l of r.links ?? []) {
  assert(`${r.id} doesn't link where a signed-in user is bounced: ${l.href}`, !SIGNED_IN_BOUNCES.has(l.href));
}
assert("csv tax columns are conditional", /If any project has a client type/.test(ans("export-contents")) && /Not recorded/.test(ans("export-contents")) && !/16% IVA/.test(ans("export-contents")));
assert("cards aren't net of withholding", /Unpaid Invoices and This Month's Earnings/.test(ans("withholding-explained")));
assert("no-deadline projects can't exist", !/no deadline/i.test(ans("forecast-zero")) && /no hours logged/.test(ans("forecast-zero")));
assert("the panel needs value, not just an unpaid project", /worth more than 0/.test(ans("widgets-missing")));
assert("privacy says first messages are kept", /first message/.test(ans("data-privacy")) && /turn down/.test(ans("data-privacy")));
assert("the owner can see rows: no 'only you'", !/for you alone/.test(ans("brief-privacy")) && !/only visible to your account/.test(ans("legal-pages")));
assert("mexico section is verified, not reported", /marked Verified/.test(ans("research-mexico")));
assert("empty account: the form is already open", !/\+ New project/.test(ans("dashboard-empty")) && !/\+ New project/.test(ans("getting-started")));
assert("failed generation falls back quietly", /without an error/.test(ans("marketing-generate")) && !/around a minute/.test(ans("marketing-generate")));
assert("rate limit wording is Supabase's", !/Too many emails/.test(ans("email-delay")));
assert("the ticket screen is no preview", !/preview/.test(ans("ticket-help")) && ans("ticket-help").includes("Submit ticket"));
const secret = GUARD_RULES.find((g) => g.id === "guard-secret")?.answer ?? "";
assert("the guide never asks, the sign-in form does", /this guide will never ask/.test(secret) && /tried to remove/.test(secret));
assert("tabs have different names on desktop", /Intake section/.test(ans("research-intake")) && /Benchmarks section/.test(ans("research-mexico")));
assert("research pricing isn't all sourced", /three/.test(ans("research-page")));
assert("clear only shows with a filter on", !/First choose Clear/.test(ans("project-missing")));
assert("export disappears when a filter matches nothing", /matches nothing/.test(ans("csv-export")));
assert("the visible filter label", ans("project-archive").includes("Paid and unpaid"));
assert("arpu divides by studio members too", /freelancer or studio member/.test(ans("pricing-simulator")));
assert("amount labels now follow the account", !/always shows/.test(ans("currency-usd-label")) && !/say USD/.test(ans("currency-usd-label")));

assert("a wrong client on a project isn't a brief problem", A("i entered the wrong client", "broken", "projects").ruleId !== "brief-wrong-field");
assert("a greyed-out project button isn't Generate live", A("the save changes button is greyed out", "broken", "projects").ruleId !== "marketing-generate");

// App fixes: answers follow what the app now does
assert("a brief becomes a project through Create project", ans("brief-saved-where").includes("Create project") && ans("brief-wrong-field").includes("Create project") && ans("brief-unsure").includes("Create project") && ans("relative-dates").includes("Create project") && ans("brief-value").includes("Create project"));
assert("core no longer shows dollars regardless", !/always display in dollars/.test(ans("brief-value")));
assert("active projects leaves out paid work", /unpaid/.test(ans("dashboard-numbers").split("Active Projects")[1] ?? "") && !/including ones already marked paid/.test(ans("dashboard-numbers")));

// Grader demo accounts are seeded on purpose; the outage explanation must not cover them
assert("sample projects on a demo account aren't an outage", ans("sample-data").includes("Sample:"));

// Walkthrough, 2026-11-06: what the right answer has to say
assert("a wrong date goes straight to Edit, not to adding a project", /^[^.]*Edit/.test(ans("project-date-fix")) && ans("project-date-fix").includes("Save changes") && ans("project-date-fix").includes("Deadline") && !ans("project-date-fix").includes("+ New project"));
assert("a date fix mentions the Overdue status, which doesn't change by itself", /Overdue/.test(ans("project-date-fix")));
assert("cfdi is only for people in Mexico", /If you're in Mexico/.test(ans("invoice-create")) && /not built/.test(ans("invoice-create")));
assert("0 unpaid: the fix is the project's status", /Invoice sent or Overdue/.test(ans("dashboard-numbers")) && /set (that|its|the) project's status to Invoice sent/i.test(ans("dashboard-numbers")));
assert("too complicated: Mark paid and the panels are real", ans("too-complicated").includes("Mark paid") && ans("too-complicated").includes("Settings"));
assert("too complicated offers the ticket", CONTENT_RULES.find((r) => r.id === "too-complicated")?.offerTicket === true);
assert("encryption: says what is known", /row-level security/i.test(ans("data-encryption")) && /owner can read/i.test(ans("data-encryption")) && /Supabase/.test(ans("data-encryption")));
assert("encryption: claims nothing the repo can't show", !/\b(AES|TLS|SSL|256|end-to-end|at rest|in transit)\b/i.test(ans("data-encryption")) && /can't confirm/.test(ans("data-encryption")));
assert("encryption offers the ticket", CONTENT_RULES.find((r) => r.id === "data-encryption")?.offerTicket === true);
assert("the phone menu still doesn't take every cut-off complaint", A("the table is cut off on my phone", "broken", "dashboard").ruleId === "mobile");
assert("not finding settings without a phone is still settings", A("i can't find settings", "how_to", "account").ruleId === "settings-location");
assert("a wrong paid date is still a ticket, not the edit form", A("the paid date is wrong", "broken", "projects").ruleId === "payment-undo");
assert("what's in the csv still describes the file", A("what's in the csv for my accountant", "how_to", "dashboard").ruleId === "export-contents");
assert("owes me still reaches the tour", A("how do i track who owes me money", "how_to", "other").ruleId === "getting-started");
assert("charged now is still pricing-free", A("am i being charged", "pricing_technical", "pricing").ruleId === "pricing-free");

// Review of the walkthrough fixes: billing and status questions aren't about currency
for (const text of ["how do i bill one client for two projects", "i have one project in progress and another in review", "some are finished and others in progress"]) {
  assert(`no currency answer for: ${text}`, answer({ category: "how_to", area: "projects", text }).ruleId !== "currency-multiple");
}

// Security review of Task 5: redaction can lengthen text past the column limit
const nearLimit = "x".repeat(1990) + " password:a";
assert("first message stays within 2000 after redaction", firstMessage(replay("broken", "other", [nearLimit])).length <= 2000);
assert("first message is the redacted user text", firstMessage(replay("broken", "other", ["password: abc123"])).includes("[removed]"));

// Review of Task 6: the page's ticket offer and message cap
const solved: EngineReply = { kind: "rule", ruleId: "forecast-zero", answer: "", links: [], offerTicket: false };
assert("thumbs-down offers the ticket inline", shouldOfferTicket(solved, false));
assert("a solved, unrated answer does not push the ticket", !shouldOfferTicket(solved, undefined));
assert("thumbs-up does not push the ticket", !shouldOfferTicket(solved, true));
assert("no-match offers the ticket", shouldOfferTicket({ ...solved, kind: "no_match", ruleId: null, offerTicket: true }, undefined));
assert("input open below the cap", canSendMore(MAX_MESSAGES - 1));
assert("input closed at the cap", !canSendMore(MAX_MESSAGES));
assert("schema accepts exactly the cap", SessionRequestSchema.safeParse({ ...valid, messages: Array(MAX_MESSAGES).fill("hi") }).success);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
