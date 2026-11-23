/*
  Venture content tests.
  Run: npm run test:venture

  The /demo, /dashboard and /docs pages all read one set of static content
  modules, so the rules worth pinning are the ones a public page would break
  silently: every "You said → we changed" entry traces to a real file, the
  journey and roadmap keep the order the spec fixed, and no price slips in.
*/

import { existsSync, readFileSync } from "node:fs";
import { CHANGES, PRICE_PATTERN } from "@/lib/venture/changes";
import { ROADMAP, ROADMAP_IDS } from "@/lib/venture/roadmap";
import { JOURNEY } from "@/lib/venture/journey";
import { TIMELINE } from "@/lib/venture/timeline";
import { PROMPTS } from "@/lib/venture/prompts";
import { ITERATION_LOG, REGRESSION, TESTER_FINDINGS, TESTER_SESSIONS } from "@/lib/venture/testing";
import { FunnelEventSchema, LaunchListSchema, VoteSchema } from "@/lib/venture/schemas";

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
  "roadmap holds the public list (the course item is gone)",
  ROADMAP.map((r) => `${r.bucket}:${r.id}`).join() ===
    [
      "next:simpler-forecast",
      "next:one-time-launch",
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
const week6 = TIMELINE.find((w) => w.week === 6)!;
assert("week 6's build log covers the front-page redesign and the game", /front page/i.test(week6.iterations.join(" ")) && /Answer gates/.test(JSON.stringify(week6)));
assert("week 6's prompts include the redesign and the game", PROMPTS.filter((p) => p.week === 6).length >= 4 && PROMPTS.some((p) => p.week === 6 && /game/i.test(p.text)));
assert(
  "at least one prompt per week 1-5",
  [1, 2, 3, 4, 5].every((w) => PROMPTS.some((p) => p.week === w)),
);

// Testing: five external testers, never named, each with at least one fix.
assert("five tester sessions", TESTER_SESSIONS.length === 5);
assert(
  "testers are identified by number only",
  TESTER_SESSIONS.every((s, i) => s.tester === `Tester ${i + 1}`),
);
assert("every tester session lists what changed", TESTER_SESSIONS.every((s) => s.issues.length > 0 && s.issues.every((x) => x.asked && x.fix)));
assert("fixed findings never exceed found", TESTER_FINDINGS.fixed <= TESTER_FINDINGS.found);
assert("regression table and iteration log are filled in", REGRESSION.checks.length > 0 && ITERATION_LOG.length > 0);

// Write-route schemas: what an anonymous visitor may send.
const VISIT = "7d0c6f5e-0b4a-4e8f-9a51-3c2b1d0e9f87";
const okEmail = LaunchListSchema.safeParse({ email: "  A@B.co ", consent: true, source: "morning" });
assert("launch list trims and lower-cases the email", okEmail.success && okEmail.data.email === "a@b.co");
assert(
  "launch list requires consent",
  !LaunchListSchema.safeParse({ email: "a@b.co", consent: false, source: "morning" }).success,
);
assert(
  "launch list rejects a 300-character email",
  !LaunchListSchema.safeParse({ email: "a".repeat(290) + "@b.co.mx.xx", consent: true, source: "morning" }).success,
);
assert(
  "launch list rejects a non-email",
  !LaunchListSchema.safeParse({ email: "not-an-email", consent: true, source: "morning" }).success,
);
assert(
  "launch list rejects an unknown source",
  !LaunchListSchema.safeParse({ email: "a@b.co", consent: true, source: "popup" }).success,
);
assert("vote accepts a roadmap item", VoteSchema.safeParse({ itemId: "cfdi", voterKey: VISIT }).success);
assert(
  "vote rejects an item not on the roadmap",
  !VoteSchema.safeParse({ itemId: "free-money", voterKey: VISIT }).success,
);
assert("vote rejects a voter key that isn't a uuid", !VoteSchema.safeParse({ itemId: "cfdi", voterKey: "me" }).success);
assert(
  "funnel accepts a known event with a job",
  FunnelEventSchema.safeParse({ event: "try_free_click", job: "video-editor", visitId: VISIT }).success,
);
assert(
  "funnel rejects an unknown event",
  !FunnelEventSchema.safeParse({ event: "purchase", visitId: VISIT }).success,
);
assert(
  "funnel rejects an unknown job",
  !FunnelEventSchema.safeParse({ event: "round_played", job: "astronaut", visitId: VISIT }).success,
);

// The database must accept every item on the page (it also still accepts the
// retired course item "tester-requests", which the vote route refuses).
const sql = readFileSync("supabase/week6_venture.sql", "utf8");
const sqlItems = sql.match(/item_id in \(([^)]*)\)/)?.[1].match(/'([^']+)'/g)?.map((x) => x.slice(1, -1)) ?? [];
assert("SQL vote check accepts every roadmap id", ROADMAP_IDS.every((id) => sqlItems.includes(id)), sqlItems.join());
assert("the only extra id the database accepts is the retired course item", sqlItems.filter((id) => !ROADMAP_IDS.includes(id)).join() === "tester-requests");

// What's new: newest first, plain, no course talk.
{
  const { WHATS_NEW } = await import("@/lib/venture/whats-new");
  assert("What's new is newest first", WHATS_NEW.every((c, i) => i === 0 || WHATS_NEW[i - 1].date >= c.date));
  assert("What's new dates are real dates", WHATS_NEW.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.date) && !Number.isNaN(Date.parse(c.date))));
  assert("What's new has no course talk", WHATS_NEW.every((c) => !/week \d|module|grader|course|tester/i.test(c.title)));
  assert("/roadmap shows the roadmap and What's new", readFileSync("app/roadmap/page.tsx", "utf8").includes("<Roadmap votes=") && readFileSync("app/roadmap/page.tsx", "utf8").includes("WHATS_NEW.map("));
}

// Guardrails across all venture content.
const allText = JSON.stringify({ CHANGES, ROADMAP, JOURNEY, TIMELINE, PROMPTS });
assert("no prices in venture content", !PRICE_PATTERN.test(allText));
assert("price pattern catches a dollar amount", PRICE_PATTERN.test("only $9 a month"));
assert("price pattern catches a monthly rate", PRICE_PATTERN.test("199 MXN /mo"));
assert("price pattern ignores plain numbers", !PRICE_PATTERN.test("seven steps, 1,538 tests"));

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
