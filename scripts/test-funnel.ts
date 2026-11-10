/*
  /demo funnel content and logic tests.
  Run: npm run test:funnel

  The funnel is marketing copy, so the rules worth pinning are the ones a
  marketing page breaks quietly: it names a feature that isn't built, it
  shows a price, or a job's colour isn't actually in the brand system.
*/

import { readFileSync } from "node:fs";
import { JOBS, JOB_ORDER, DEFAULT_JOB } from "@/lib/funnel/jobs";
import { WALKTHROUGH } from "@/lib/funnel/walkthrough";
import { COPY } from "@/lib/funnel/copy";
import { PRICE_PATTERN } from "@/lib/venture/changes";
import { FEATURE_GROUPS } from "@/lib/product/features";
import { clockFor, storyMinutes } from "@/lib/funnel/clock";
import { moodFor } from "@/lib/funnel/mood";

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

const BUILT_NAMES = new Set(
  FEATURE_GROUPS.flatMap((g) => g.features)
    .filter((f) => f.status === "built")
    .map((f) => f.name),
);

// Jobs and the picker.
assert(
  "five jobs incl. video editor",
  JOB_ORDER.join() === "designer,photographer,video-editor,writer,developer",
);
assert("default job is designer", DEFAULT_JOB === "designer");
assert(
  "each job has at least 8 worries and 6 game projects",
  JOB_ORDER.every((j) => JOBS[j].worries.length >= 8 && JOBS[j].gameProjects.length >= 6),
);
assert(
  "worry ids are unique within each job",
  JOB_ORDER.every((j) => new Set(JOBS[j].worries.map((w) => w.id)).size === JOBS[j].worries.length),
);
const css = readFileSync("app/globals.css", "utf8");
assert(
  "every accent token is defined in globals.css",
  JOB_ORDER.every((j) => css.includes(JOBS[j].accentVar + ":")),
  JOB_ORDER.filter((j) => !css.includes(JOBS[j].accentVar + ":")).join(", "),
);

// The walkthrough names only what is built.
const unbuilt = WALKTHROUGH.filter((s) => !BUILT_NAMES.has(s.featureName));
assert(
  "walkthrough only names built features",
  unbuilt.length === 0,
  unbuilt.map((s) => s.featureName).join(", "),
);
assert("walkthrough covers all three areas", new Set(WALKTHROUGH.map((s) => s.area)).size === 3);

// Copy.
assert(
  "night headline names the job's label",
  COPY.nightHeadline("video-editor") === "I'm a freelance video editor, and it's all in my head.",
);
assert(
  "retired landing headlines are kept for reuse",
  COPY.RETIRED_LANDING_HEADLINES.includes("You find out you were not paid by remembering"),
);

// The story clock: one night, 11:47 pm to 8:00 am, driven by scroll.
assert("clock starts at 11:47 pm", clockFor(0) === "11:47 pm");
assert("clock ends at 8:00 am", clockFor(1) === "8:00 am");
assert("clock clamps below the start", clockFor(-1) === "11:47 pm");
assert("clock clamps past the end", clockFor(2) === "8:00 am");
assert("clock passes midnight", clockFor(0.03) === "12:02 am", clockFor(0.03));
assert(
  "story time only moves forward",
  [0, 0.25, 0.5, 1].map(storyMinutes).every((m, i, a) => i === 0 || m > a[i - 1]),
);

// Mood: tense during the night, calm after, morning light at the end.
assert("stress is highest in chapter 1", moodFor(0.1).stress > moodFor(0.5).stress);
assert("stress has gone by mid-story", moodFor(0.5).stress === 0);
assert("no morning light mid-story", moodFor(0.5).morning === 0);
assert("full morning at the end", moodFor(1).morning === 1);
assert("mood values stay between 0 and 1", [-1, 0, 0.3, 0.9, 2].every((p) => {
  const m = moodFor(p);
  return m.stress >= 0 && m.stress <= 1 && m.morning >= 0 && m.morning <= 1;
}));

// No prices anywhere in funnel content.
const allText = JSON.stringify({
  JOBS,
  WALKTHROUGH,
  COPY: { ...COPY, nightHeadline: JOB_ORDER.map((j) => COPY.nightHeadline(j)) },
});
assert("no prices in funnel content", !PRICE_PATTERN.test(allText), allText.match(PRICE_PATTERN)?.[0]);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
