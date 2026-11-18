/*
  /demo chapter 5 game engine tests: Answer gates.
  Run: npm run test:game

  The engine is pure and seeded: every function takes a state and returns a
  new one, and the same seed always flies the same course. The rules pinned
  here are the ones a player would notice breaking: nothing moves before the
  first flap, a hidden tab can't skip ahead, the floor and the stacks cost a
  heart (but not while blinking), zero hearts ends the run, and nothing moves
  once it's over.
*/

import { JOBS } from "@/lib/funnel/jobs";
import {
  GATE_PATTERN,
  TUNING,
  WORLD,
  flap,
  newGame,
  score,
  step,
  stepKind,
  whereText,
  type Column,
  type GameState,
  type Job,
  type Message,
  type Question,
} from "@/lib/game/engine";

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

const P = JOBS.designer.gameProjects;
const FRAME = 16;

/** The column the player is about to meet (or is inside). */
const nextCol = (s: GameState): Column | undefined =>
  s.cols.find((c) => c.x + TUNING.colW > TUNING.playerX - 12);

/** Where an autopilot aims inside a column: the first opening by default. */
type Aim = (c: Column) => number;
const firstGap: Aim = (c) => c.gaps[0].top + c.gaps[0].h / 2;

/** Aim for the right opening at a gate (or a wrong one when `wrong`), else the gap. */
const answer = (wrong: boolean): Aim => (c) => {
  if (c.kind !== "gate" || !c.question) return firstGap(c);
  const q = c.question;
  const g = c.gaps.find((x) => (wrong ? x.label !== q.correct : x.label === q.correct))!;
  return g.top + g.h / 2;
};

/** One frame of a simple autopilot: flap while below the target. */
function pilot(s: GameState, aim: Aim = answer(false)): GameState {
  const c = nextCol(s);
  const target = (c ? aim(c) : WORLD.h / 2) + 12;
  const t = s.y > target && s.vy > -60 ? flap(s) : s;
  return step(t, FRAME);
}

function fly(seed: number, ms: number, opts: { ramp?: boolean } = {}, aim?: Aim, watch?: (s: GameState) => void) {
  let s = flap(newGame({ seed, projects: P, ...opts }));
  for (let t = 0; t < ms && s.phase === "playing"; t += FRAME) {
    s = pilot(s, aim);
    watch?.(s);
  }
  return s;
}

// ── Before the first flap ───────────────────────────────────────────────────
const g0 = newGame({ seed: 1, projects: P });
assert("nothing moves before the first flap", step(g0, 500) === g0);
const g1 = flap(g0);
assert("first flap starts the run and kicks upward", g1.phase === "playing" && g1.vy === TUNING.flapVy);
assert("flap never mutates its input", g0.phase === "ready" && g0.vy === 0);
assert("a long frame is clamped", step(g1, 60_000).tMs === TUNING.maxTickMs);

// ── Ceiling and floor ───────────────────────────────────────────────────────
{
  let s = g1;
  for (let i = 0; i < 40; i++) s = step(flap(s), FRAME);
  assert("the ceiling clamps", s.y >= 0);
}
let fall = g1;
for (let i = 0; i < 200 && fall.hearts === TUNING.hearts; i++) fall = step(fall, FRAME);
assert("hitting the floor costs one heart and bounces back up", fall.hearts === TUNING.hearts - 1 && fall.vy < 0);
assert("a hit gives invulnerability", fall.invulnMs > 0);
for (let i = 0; i < 20_000 && fall.phase === "playing"; i++) fall = step(fall, FRAME);
assert("zero hearts ends the run", fall.phase === "over" && fall.hearts === 0);
assert("nothing changes once over", step(fall, FRAME) === fall && flap(fall) === fall);

// ── Columns ─────────────────────────────────────────────────────────────────
const course = (seed: number) => {
  const s = fly(seed, 20_000);
  return { days: s.days, cols: s.cols.map((c) => [c.kind, Math.round(c.gaps[0].top)]) };
};
assert("same seed, same course", JSON.stringify(course(1)) === JSON.stringify(course(1)));
assert("different seeds, different courses", JSON.stringify(course(1)) !== JSON.stringify(course(2)));

const seen: Column[] = [];
const auto = fly(1, 20_000, {}, undefined, (s) => s.cols.forEach((c) => !seen.some((x) => x.id === c.id) && seen.push(c)));
assert("an autopilot passes columns and counts days", auto.days >= 5, `days ${auto.days}`);
assert("the autopilot keeps its hearts", auto.hearts === TUNING.hearts, `hearts ${auto.hearts}`);

const long: Column[] = [];
fly(3, 90_000, {}, undefined, (s) => s.cols.forEach((c) => !long.some((x) => x.id === c.id) && long.push(c)));
const normals = long.filter((c) => c.kind === "normal");
assert("the first gap starts at gapStart", Math.round(normals[0].gaps[0].h) === TUNING.gapStart);
assert("normal gaps shrink but never below gapMin", normals.every((c) => c.gaps[0].h >= TUNING.gapMin - 1e-9) && normals.some((c) => c.gaps[0].h === TUNING.gapMin), `cols ${normals.length}`);
assert(
  "every gap stays at least margin from the edges",
  normals.every((c) => c.gaps[0].top >= TUNING.margin - 1e-9 && c.gaps[0].top + c.gaps[0].h <= WORLD.h - TUNING.margin + 1e-9),
);
assert("some stacks are overdue and most aren't", normals.some((c) => c.overdue) && normals.filter((c) => c.overdue).length < normals.length / 2);

// ── Hits and invulnerability (built states) ─────────────────────────────────
const wall: Column = { id: 999, x: TUNING.playerX - 20, kind: "normal", gaps: [{ top: 0, h: 10 }], overdue: false, passed: false };
const atWall: GameState = { ...g1, y: WORLD.h / 2, vy: 0, cols: [wall] };
assert("a stack costs one heart", step(atWall, 1).hearts === TUNING.hearts - 1);
assert("a stack hit while blinking costs nothing", step({ ...atWall, invulnMs: 1000 }, 1).hearts === TUNING.hearts);

// ── Coins ───────────────────────────────────────────────────────────────────
const withCoin: GameState = { ...g1, coins: [{ id: 77, x: TUNING.playerX, y: g1.y, value: 200, taken: false }] };
const took = step(withCoin, 1);
assert("touching a coin adds it to collected", took.collected === 200 && !took.coins.some((c) => c.id === 77));
assert("taking a coin never mutates the old state", withCoin.collected === 0 && withCoin.coins.length === 1);

// ── Speed ───────────────────────────────────────────────────────────────────
assert("speed ramps to the cap", step({ ...g1, tMs: 100_000 }, 1).speed === TUNING.speedMax);
const calm = flap(newGame({ seed: 1, projects: P, ramp: false }));
assert("without ramp the speed stays put", step({ ...calm, tMs: 100_000 }, 1).speed === TUNING.speedStart);

// ── Score and words ─────────────────────────────────────────────────────────
assert("score is days + 3 per right answer", score({ ...g1, days: 7, right: 2 }) === 13);
assert("whereText", whereText(0) === "Monday morning" && whereText(7) === "Wednesday of week 2", whereText(7));

// ── Jobs, changes and answer gates ──────────────────────────────────────────
assert(
  "pattern starts with two new jobs before the first gate",
  GATE_PATTERN.slice(0, 6).filter((k) => k === "intro").length === 2 && stepKind(5) === "gate",
);
assert("pattern cycles from index 6", stepKind(15) === GATE_PATTERN[6] && stepKind(24) === GATE_PATTERN[6]);

type Watch = {
  firstJobMsg?: Message;
  firstJob?: Job;
  maxJobs: number;
  amountsUnique: boolean;
  delivered: { text: string; goneId: number }[];
  replacedQuestion: boolean;
  unannouncedQuestion: boolean;
  questions: Question[];
  movedId?: number;
  afterChange?: Question;
  gatesPassed: number;
};

function watchRun(seed: number, ms: number, aim: Aim) {
  const w: Watch = { maxJobs: 0, amountsUnique: true, delivered: [], replacedQuestion: false, unannouncedQuestion: false, questions: [], gatesPassed: 0 };
  let prev = flap(newGame({ seed, projects: P }));
  const seenGates = new Set<number>();
  const passedGates = new Set<number>();
  for (let t = 0; t < ms && prev.phase === "playing"; t += FRAME) {
    const s = pilot(prev, aim);
    if (!w.firstJobMsg && s.message?.kind === "job") {
      w.firstJobMsg = s.message;
      w.firstJob = s.jobs[s.jobs.length - 1];
    }
    w.maxJobs = Math.max(w.maxJobs, s.jobs.length);
    const amounts = s.jobs.map((j) => j.amount);
    if (new Set(amounts).size !== amounts.length) w.amountsUnique = false;
    if (s.feedback?.kind === "delivered" && s.feedback !== prev.feedback) {
      const gone = prev.jobs.find((j) => !s.jobs.some((k) => k.id === j.id));
      if (gone) w.delivered.push({ text: s.feedback.text, goneId: gone.id });
    }
    if (prev.message?.kind === "question" && s.message?.text !== prev.message.text) {
      const pending = s.cols.some((c) => c.kind === "gate" && !c.passed && c.question?.text === prev.message!.text);
      if (pending) w.replacedQuestion = true;
    }
    if (w.movedId === undefined && s.message?.kind === "change" && prev.message?.kind !== "change") {
      w.movedId = s.jobs.find((j) => j.moved && !prev.jobs.find((p) => p.id === j.id)?.moved)?.id;
    }
    for (const c of s.cols) {
      if (c.kind === "gate" && c.question && !seenGates.has(c.id)) {
        seenGates.add(c.id);
        w.questions.push(c.question);
        if (!s.jobs.some((j) => j.id === c.question!.jobId)) w.unannouncedQuestion = true;
        if (w.movedId !== undefined && !w.afterChange) w.afterChange = c.question;
      }
      if (c.kind === "gate" && c.passed && !passedGates.has(c.id)) {
        passedGates.add(c.id);
        w.gatesPassed++;
      }
    }
    prev = s;
  }
  return { w, s: prev };
}

const good = watchRun(1, 120_000, answer(false));
const good7 = watchRun(7, 120_000, answer(false));
const { w } = good;
assert(
  "a new job is announced with its amount and due day",
  !!w.firstJobMsg && w.firstJobMsg.label === "New job" && /^.+ for .+ · \$\d+ · due (Mon|Tue|Wed|Thu|Fri)$/.test(w.firstJobMsg.text),
  w.firstJobMsg?.text,
);
assert("job names come from the visitor's projects", !!w.firstJob && P.includes(w.firstJob.project));
assert("never more than 4 jobs in play", w.maxJobs <= 4 && good7.w.maxJobs <= 4 && w.maxJobs === 4, `max ${w.maxJobs}`);
assert(
  "a fifth job delivers the oldest",
  w.delivered.length > 0 && w.delivered.every((d) => d.text.startsWith("Delivered · ")),
  JSON.stringify(w.delivered[0]),
);
assert("amounts are unique among jobs in play", w.amountsUnique && good7.w.amountsUnique);
assert(
  "a question is never replaced before its gate is passed",
  !w.replacedQuestion && !good7.w.replacedQuestion,
);
assert("questions only ask about jobs in play", !w.unannouncedQuestion && !good7.w.unannouncedQuestion);
assert(
  "a moved job is asked about next, by its due day",
  w.movedId !== undefined && w.afterChange?.jobId === w.movedId && w.afterChange?.kind === "due",
  JSON.stringify(w.afterChange),
);
const allQs = [...w.questions, ...good7.w.questions];
assert(
  "questions have 3 different options including the answer",
  allQs.length >= 4 && allQs.every((q) => q.options.length === 3 && new Set(q.options).size === 3 && q.options.includes(q.correct)),
);
assert("the autopilot that answers right keeps its hearts", good.s.hearts === TUNING.hearts && good.s.right >= 3, `hearts ${good.s.hearts} right ${good.s.right}`);
assert("every gate passed counts as asked", good.s.asked === w.gatesPassed && good.s.right === good.s.asked, `asked ${good.s.asked} passed ${w.gatesPassed}`);

// The first gate, answered right and then wrong.
function firstGate(aim: Aim) {
  let s = flap(newGame({ seed: 1, projects: P }));
  let q: Question | undefined;
  for (let t = 0; t < 60_000 && s.phase === "playing" && s.asked === 0; t += FRAME) {
    s = pilot(s, aim);
    q ??= s.cols.find((c) => c.kind === "gate")?.question;
  }
  return { s, q: q! };
}
const rightRun = firstGate(answer(false));
assert("flying through the right opening scores", rightRun.s.right === 1 && rightRun.s.hearts === TUNING.hearts && rightRun.s.feedback?.text === `Right: ${rightRun.q.correct}`);
const wrongRun = firstGate(answer(true));
assert(
  "a wrong opening costs a heart and shows the answer",
  wrongRun.s.right === 0 && wrongRun.s.hearts === TUNING.hearts - 1 && wrongRun.s.feedback?.text === `Wrong. It was ${wrongRun.q.correct}`,
  `${wrongRun.s.hearts} ${wrongRun.s.feedback?.text}`,
);
assert("the question clears once its gate is passed", rightRun.s.message?.kind !== "question" || rightRun.s.message.text !== rightRun.q.text);

// A gate step with nobody announced yet becomes a normal column.
const early: GameState = { ...g1, index: 5, spawnInMs: 0, jobs: [], pending: [] };
const afterEarly = step(early, 1);
assert("a gate with no jobs in play becomes a normal column", afterEarly.cols.at(-1)?.kind === "normal");

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
