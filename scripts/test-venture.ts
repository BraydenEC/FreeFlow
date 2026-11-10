/*
  Venture content tests.
  Run: npm run test:venture

  The /demo, /dashboard and /docs pages all read one set of static content
  modules, so the rules worth pinning are the ones a public page would break
  silently: every "You said → we changed" entry traces to a real file, the
  journey and roadmap keep the order the spec fixed, and no price slips in.
*/

import { existsSync } from "node:fs";
import { CHANGES, PRICE_PATTERN } from "@/lib/venture/changes";
import { ROADMAP, ROADMAP_IDS } from "@/lib/venture/roadmap";
import { JOURNEY } from "@/lib/venture/journey";
import { TIMELINE } from "@/lib/venture/timeline";
import { PROMPTS } from "@/lib/venture/prompts";
import { BUGS, TESTER_REQUESTS } from "@/lib/venture/testing";

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

// "You said → we changed": real, sourced, honest.
assert(
  "every change cites a file that exists",
  CHANGES.every((c) => existsSync(c.source)),
  CHANGES.filter((c) => !existsSync(c.source)).map((c) => c.source).join(", "),
);
// The pricing advice is recorded in the Week 6 source notes (the Week 2
// transcript holds his business context, not the advice itself).
assert(
  "first change is the pricing advice, cited to the Week 6 source notes",
  CHANGES[0]?.source === "docs/week6/SOURCE_NOTES.md" && CHANGES[0]?.id === "pricing-free-first",
);
assert("change ids are unique", new Set(CHANGES.map((c) => c.id)).size === CHANGES.length);
assert(
  "every change has an ISO date",
  CHANGES.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.date)),
);

// The journey (agent map).
assert(
  "journey has seven steps in build order",
  JOURNEY.map((s) => s.name).join("|") ===
    "Dashboard|Paste a brief|Research|Pricing|Marketing|Help desk|One venture",
);
assert(
  "journey steps are numbered 1 to 7",
  JOURNEY.map((s) => s.n).join() === "1,2,3,4,5,6,7",
);
assert(
  "every journey step says what powers it",
  JOURNEY.every((s) => s.poweredBy.trim().length > 0),
);

// The V2 roadmap.
assert("roadmap ids are unique", new Set(ROADMAP_IDS).size === ROADMAP.length);
assert(
  "roadmap ids list matches the items in order",
  ROADMAP_IDS.join() === ROADMAP.map((r) => r.id).join(),
);
assert(
  "roadmap next bucket starts with the simpler forecast",
  ROADMAP.filter((r) => r.bucket === "next")[0]?.id === "simpler-forecast",
);
assert("leaderboard is a later item", ROADMAP.find((r) => r.id === "leaderboard")?.bucket === "later");
assert(
  "roadmap holds exactly the spec's V2 list",
  ROADMAP.map((r) => `${r.bucket}:${r.id}`).join() ===
    [
      "next:simpler-forecast",
      "next:one-time-launch",
      "next:tester-requests",
      "later:more-countries",
      "later:more-languages",
      "later:more-currencies",
      "later:cfdi",
      "later:leaderboard",
      "someday:proof-of-work",
      "someday:studio-accounts",
    ].join(),
);

// Timeline and prompt library.
assert("timeline covers weeks 0 to 6", TIMELINE.map((w) => w.week).join() === "0,1,2,3,4,5,6");
assert(
  "at least one prompt per week 1-5",
  [1, 2, 3, 4, 5].every((w) => PROMPTS.some((p) => p.week === w)),
);

// Testing summary starts empty: nothing is claimed before testers exist.
assert("no bugs recorded before Week 6 testing", BUGS.length === 0);
assert("no tester requests recorded before Week 6 testing", TESTER_REQUESTS.length === 0);

// Guardrails across all venture content.
const allText = JSON.stringify({ CHANGES, ROADMAP, JOURNEY, TIMELINE, PROMPTS });
assert("no prices in venture content", !PRICE_PATTERN.test(allText));
assert("price pattern catches a dollar amount", PRICE_PATTERN.test("only $9 a month"));
assert("price pattern catches a monthly rate", PRICE_PATTERN.test("199 MXN /mo"));
assert("price pattern ignores plain numbers", !PRICE_PATTERN.test("seven steps, 1,538 tests"));

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
