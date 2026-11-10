/*
  /demo chapter 5 game engine tests.
  Run: npm run test:game

  The engine is pure: every function takes a state and returns a new one. The
  rules pinned here are the ones a player would notice breaking: the clock
  waits for the first click, upgrades spend cash but never score, overdue
  invoices lose value down to a floor and no further, a hidden tab can't end
  the round in one tick, and nothing moves once the round is over.
*/

import {
  BALANCE,
  newGame,
  work,
  collect,
  buy,
  tick,
  invoiceStage,
  type GameState,
  type UpgradeId,
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

const rng = () => 0.5; // → invoice of 250 + 0.5 × 450 = 475

const g0 = newGame();
assert("timer does not run before first action", tick(g0, 1000).remainingMs === BALANCE.roundMs);
let g = work(g0, rng);
assert("first action starts the round", g.started);
for (let i = 0; i < 9; i++) g = work(g, rng);
assert("ten clicks finish a project into one invoice", g.invoices.length === 1 && g.progress === 0);
assert("finishing a project moves to the next one", g.projectIndex === 1);
assert("functions never mutate their input", g0.started === false && g0.invoices.length === 0);
const id = g.invoices[0].id;
const c = collect(g, id);
assert("collecting adds to score and cash", c.collected === 475 && c.cash === 475);
assert("collecting removes the invoice", c.invoices.length === 0);
assert("collecting an unknown invoice changes nothing", collect(c, 999) === c);
assert("buying needs cash", buy(c, "terms").owned.terms === false);
const b = buy({ ...c, cash: 600 }, "brief");
assert("buying spends cash, not score", b.cash === 100 && b.collected === c.collected);
assert("an owned upgrade can't be bought twice", buy({ ...b, cash: 600 }, "brief").cash === 600);
assert("brief doubles work per click", work(b, rng).progress === 20);
assert(
  "stages follow age",
  invoiceStage({ ...g.invoices[0], ageMs: 0 }) === "fresh" &&
    invoiceStage({ ...g.invoices[0], ageMs: 4500 }) === "yellow" &&
    invoiceStage({ ...g.invoices[0], ageMs: 7500 }) === "overdue",
);
assert(
  "tick clamps a huge gap",
  tick(g, 600_000).remainingMs === g.remainingMs - BALANCE.maxTickMs,
);

// One fresh 475 invoice in a started round; advance in 250 ms ticks.
const one = (owned: Partial<Record<UpgradeId, boolean>> = {}): GameState => ({
  ...g,
  invoices: [{ id: 1, full: 475, value: 475, ageMs: 0 }],
  owned: { ...g.owned, ...owned },
});
const run = (s: GameState, ticks: number): GameState => {
  for (let i = 0; i < ticks; i++) s = tick(s, 250);
  return s;
};
const close = (a: number, b: number) => Math.abs(a - b) < 0.01;

assert("no decay before overdue", close(run(one(), 28).invoices[0].value, 475));
assert(
  "overdue decays to the floor, never below",
  close(run(one(), 108).invoices[0].value, 475 * BALANCE.floor),
);
assert("lost counts what decayed", close(run(one(), 108).lost, 475 - 475 * BALANCE.floor));
assert(
  "contract keeps a 70% floor",
  close(run(one({ contract: true }), 108).invoices[0].value, 475 * BALANCE.contractFloor),
);
assert(
  "2 s overdue: normal decay",
  close(run(one(), 36).invoices[0].value, 475 - 475 * BALANCE.decayPerSec * 2),
);
assert(
  "2 s overdue: alert halves decay",
  close(run(one({ alert: true }), 36).invoices[0].value, 475 - 475 * BALANCE.alertDecayPerSec * 2),
);
const auto = run(one({ terms: true }), 20);
assert(
  "terms auto-collects at 5 s, before overdue",
  auto.invoices.length === 0 && auto.collected === g.collected + 475,
);
assert("terms does not collect early", run(one({ terms: true }), 19).invoices.length === 1);

const end = run(g, 240);
assert("round ends at zero", end.over && end.remainingMs === 0);
assert(
  "input after the end changes nothing",
  work(end, rng) === end && collect(end, 1) === end && buy(end, "brief") === end && tick(end, 250) === end,
);

console.log("─".repeat(64));
console.log(`  ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
