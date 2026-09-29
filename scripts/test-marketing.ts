/*
  Marketing content-engine tests.
  Run: npm run test:marketing

  Two things carry the marketing feature: the content is complete and valid, and
  it degrades to seed content instead of crashing when the model output is
  missing or garbage. These tests run the exact generators/validators the page
  and the generate route use.

  A/B 1 / A/B 2 cover the headline test mechanism. SW 1 / SW 2 cover the
  generator and its degenerate-input behaviour. SW 3 (save route requires a
  user) is asserted separately once the route exists.
*/

import { SEED_CONTENT } from "@/lib/marketing/content";
import {
  buildCalendar,
  contentSummary,
  validateContentSet,
} from "@/lib/marketing/generate";
import { pickHeadlineWinner } from "@/lib/marketing/ab";
import {
  CAMPAIGN_DAYS,
  REQUIRED_POSTS,
  REQUIRED_SCRIPTS,
  type ContentSet,
} from "@/lib/marketing/types";

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

// ── SW 1: the seed content is complete and valid ──────────────────────────
const errors = validateContentSet(SEED_CONTENT);
assert("seed content passes validation with no errors", errors.length === 0, errors.join("; "));
assert(`seed has at least ${REQUIRED_POSTS} posts`, SEED_CONTENT.posts.length >= REQUIRED_POSTS);
assert(`seed has at least ${REQUIRED_SCRIPTS} scripts`, SEED_CONTENT.scripts.length >= REQUIRED_SCRIPTS);
assert(`calendar is exactly ${CAMPAIGN_DAYS} days`, SEED_CONTENT.calendar.length === CAMPAIGN_DAYS);
assert(
  "every calendar slot references a real asset",
  SEED_CONTENT.calendar.every((c) => {
    const ids = new Set([
      ...SEED_CONTENT.posts.map((p) => p.id),
      ...SEED_CONTENT.scripts.map((s) => s.id),
    ]);
    return c.assetRef !== "" && ids.has(c.assetRef);
  }),
);
assert(
  "no post has an empty field",
  SEED_CONTENT.posts.every((p) => p.hook && p.body && p.cta),
);
assert(
  "every script has hook, body and CTA",
  SEED_CONTENT.scripts.every((s) => s.hook && s.body && s.cta && s.durationSec > 0),
);
assert("seed content is labelled heuristic", SEED_CONTENT.provenance === "heuristic");

// contentSummary agrees with the raw counts
const summary = contentSummary(SEED_CONTENT);
assert("summary reports the content valid", summary.valid === true);
assert("summary post count matches", summary.posts === SEED_CONTENT.posts.length);

// ── SW 2: degenerate input yields a valid skeleton, never a crash ─────────
const emptyCalendar = buildCalendar([], []);
assert("empty input still yields a 14-day calendar", emptyCalendar.length === CAMPAIGN_DAYS);
assert(
  "empty-input calendar days are 1..14 with no gaps",
  new Set(emptyCalendar.map((c) => c.day)).size === CAMPAIGN_DAYS,
);

const brokenSet: ContentSet = {
  provenance: "model",
  posts: [{ id: "x", channel: "x", hook: "", body: "", cta: "" }],
  scripts: [],
  calendar: [],
  headlines: [],
};
const brokenErrors = validateContentSet(brokenSet);
assert("a broken model set is rejected with errors", brokenErrors.length > 0);
assert(
  "broken set flags too few posts, missing scripts, empty fields and bad calendar",
  brokenErrors.some((e) => e.includes("posts")) &&
    brokenErrors.some((e) => e.includes("scripts")) &&
    brokenErrors.some((e) => e.includes("empty field")) &&
    brokenErrors.some((e) => e.includes("calendar")),
  brokenErrors.join("; "),
);

// ── A/B 1: the tester records a chosen winner ─────────────────────────────
const pair = SEED_CONTENT.headlines.filter((h) => h.test === "value-prop");
assert("a value-prop A/B pair exists", pair.length >= 2);
const chosen = pickHeadlineWinner(SEED_CONTENT.headlines, "value-prop", "hl-a2");
assert("choosing hl-a2 returns hl-a2 as winner", chosen?.id === "hl-a2");
assert("winner belongs to the chosen test", chosen?.test === "value-prop");

// ── A/B 2: a second pair, and switching the winner updates the choice ──────
const audiencePair = SEED_CONTENT.headlines.filter((h) => h.test === "audience");
assert("a second (audience) A/B pair exists", audiencePair.length >= 2);
let winner = pickHeadlineWinner(SEED_CONTENT.headlines, "audience", "hl-b1");
assert("initial audience winner is hl-b1", winner?.id === "hl-b1");
winner = pickHeadlineWinner(SEED_CONTENT.headlines, "audience", "hl-b2");
assert("switching updates the winner to hl-b2", winner?.id === "hl-b2");
assert(
  "an unknown winner id falls back to the first variant, never null",
  pickHeadlineWinner(SEED_CONTENT.headlines, "audience", "nope")?.test === "audience",
);
assert(
  "an unknown test returns null rather than a wrong-pair headline",
  pickHeadlineWinner(SEED_CONTENT.headlines, "does-not-exist", "hl-b1") === null,
);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
