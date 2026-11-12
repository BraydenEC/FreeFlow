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
import { STORY } from "@/lib/funnel/story";
import { CHOICE_ORDER, DEFAULT_CHOICE, isChoice, jobForChoice, contentJob, choiceWord, choicePrefix, choiceName, choiceAccentVar, worriesFor, type Choice } from "@/lib/funnel/choice";
import { NEUTRAL_WORRIES } from "@/lib/funnel/jobs";
import { MAX_LIVE, startSort, spawn, fileWorry, handleRest, canOfferRest, stressLevel } from "@/lib/funnel/sorting";

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
assert("the end band says Start free", COPY.startFree === "Start free" && COPY.startFreeTail === "now →");

// Choices: a neutral start, the five jobs, and Brayden's own.
const ALL_CHOICES: Choice[] = ["freelancer", ...CHOICE_ORDER];
assert("the page starts neutral", DEFAULT_CHOICE === "freelancer");
assert("neutral reads I'm a freelancer", choicePrefix("freelancer") + choiceWord("freelancer") === "I'm a freelancer");
assert("a job reads I'm a freelance <job>", choicePrefix("designer") + choiceWord("designer") === "I'm a freelance designer");
assert("Brayden's own shows video editor", choiceWord("brayden") === "video editor" && choiceName("brayden") === "Brayden's own");
assert("six swatches, Brayden's own last", CHOICE_ORDER.length === 6 && CHOICE_ORDER.at(-1) === "brayden" && !CHOICE_ORDER.includes("freelancer" as never));
assert("neutral sends no job", jobForChoice("freelancer") === null);
assert("Brayden's own counts as video editor", jobForChoice("brayden") === "video-editor");
assert("a job sends itself", jobForChoice("writer") === "writer");
assert("neutral content falls back to the default job", contentJob("freelancer") === DEFAULT_JOB && contentJob("brayden") === "video-editor");
assert("neutral has nine unique worries", worriesFor("freelancer").length === 9 && new Set(worriesFor("freelancer").map((w) => w.id)).size === 9);
assert("Brayden's own uses the video editor's worries", worriesFor("brayden") === JOBS["video-editor"].worries);
assert("isChoice rejects strangers", !isChoice("nope") && !isChoice(null) && isChoice("brayden") && isChoice("freelancer"));
const cssText = readFileSync("app/globals.css", "utf8");
assert(
  "every choice's accent is defined in globals.css",
  ALL_CHOICES.every((c) => cssText.includes(choiceAccentVar(c) + ":")),
  ALL_CHOICES.filter((c) => !cssText.includes(choiceAccentVar(c) + ":")).join(", "),
);
assert("the neutral accent is warm grey", /--color-job-neutral:\s*#c9c6bf/.test(cssText));
assert("Brayden's own is grey", /--color-job-brayden:\s*#a3a3a3/.test(cssText));
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

// Chapter 1: sorting the night's worries.
let ss = startSort("designer");
assert("a sort starts with nothing on your mind", ss.live.length === 0 && ss.filed.length === 0 && !ss.calm);
for (let i = 0; i < 20; i++) ss = spawn(ss);
assert("spawning caps at nine worries", ss.live.length === MAX_LIVE && MAX_LIVE === 9);
assert("live worries are unique", new Set(ss.live.map((w) => w.id)).size === ss.live.length);
assert("stress is full at nine", stressLevel(ss) === 1);
const firstId = ss.live[0].id;
const afterFile = fileWorry(ss, firstId);
assert("filing moves exactly one worry", afterFile.live.length === ss.live.length - 1 && afterFile.filed.length === 1 && afterFile.filed[0].id === firstId);
assert("filing an unknown worry changes nothing", fileWorry(ss, "nope") === ss);
const three = fileWorry(fileWorry(afterFile, afterFile.live[0].id), afterFile.live[1].id);
assert("rest is not offered before three", !canOfferRest(fileWorry(afterFile, afterFile.live[0].id)));
assert("rest is offered at three", canOfferRest(three));
const rested = handleRest(three);
assert("rest files everything and calms the night", rested.live.length === 0 && rested.calm && stressLevel(rested) === 0);
assert("rest is not offered once calm", !canOfferRest(rested));
assert("spawn after calm is a no-op", spawn(rested) === rested);
let cycle = startSort("writer");
const total = JOBS.writer.worries.length;
for (let i = 0; i < total; i++) cycle = fileWorry(spawn(cycle), spawn(cycle).live.at(-1)!.id);
for (let i = 0; i < 3; i++) cycle = spawn(cycle);
assert("the queue refills from the job's worries when it runs out", cycle.live.length > 0);

// Chapter 3: the founder's story, from his own words.
assert("the story opens with video editing", /video editing/i.test(STORY.paragraphs[0] ?? ""));
assert("the story states no price", !PRICE_PATTERN.test(JSON.stringify(STORY)));
assert("the mission is about ease", STORY.mission.includes("ease"));
assert("the P.S. gives the public contact", STORY.ps.includes("braydenemeryc@gmail.com"));
assert("every walkthrough step has a labelled sample", WALKTHROUGH.every((s) => s.sample.trim().length > 0));

// No prices anywhere in funnel content.
const allText = JSON.stringify({
  JOBS,
  WALKTHROUGH,
  NEUTRAL_WORRIES,
  COPY,
});
assert("no prices in funnel content", !PRICE_PATTERN.test(allText), allText.match(PRICE_PATTERN)?.[0]);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
