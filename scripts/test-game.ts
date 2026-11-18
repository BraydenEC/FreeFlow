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
  TUNING,
  WORLD,
  flap,
  newGame,
  score,
  step,
  whereText,
  type Column,
  type GameState,
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

/** One frame of a simple autopilot: flap while below the target. */
function pilot(s: GameState, aim: Aim = firstGap): GameState {
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

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
