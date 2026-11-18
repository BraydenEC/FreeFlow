/*
  The /demo chapter 5 game: Answer gates.

  You fly a little freelancer through your work week. Columns of stacks scroll
  in with one opening each, and every column passed is one working day. A tap
  is an upward kick; gravity does the rest. Hitting a stack or the floor costs
  a heart, then a short blink of invulnerability. Zero hearts ends the run.
  Score is days flown plus 3 per right answer.

  Pure and seeded by design: every function returns a new state and never
  mutates its input, randomness comes only from the mulberry32 state carried
  in `rng`, and the world is a fixed 480 × 480 so a phone and a desktop play
  the same game. The component only draws, reads input and drives the clock
  (components/funnel/Game.tsx); the rules are testable in plain node
  (scripts/test-game.ts). Once the run is over, every function returns the
  same state object unchanged.
*/

export const WORLD = { w: 480, h: 480 } as const;

export const TUNING = {
  gravity: 1450,
  flapVy: -410,
  speedStart: 150,
  speedMax: 205,
  /** px/s added per second of play, up to speedMax. */
  speedRamp: 1.4,
  colW: 62,
  gapStart: 168,
  gapMin: 132,
  /** px the normal gap shrinks per column spawned. */
  gapShrink: 1.2,
  gateGap: 108,
  spacing: 285,
  gateSpacing: 360,
  spacingPadS: 0.2,
  hitSlack: 6,
  playerX: 125,
  hearts: 3,
  invulnMs: 1200,
  /** Longest gap one step may cover, so a hidden tab can't skip ahead. */
  maxTickMs: 50,
  /** A gap's edges stay at least this far from the top and bottom. */
  margin: 70,
  coinChance: 0.55,
  coinValues: [100, 150, 200, 250, 300, 350],
  /** Share of normal columns drawn as overdue stacks. Cosmetic only. */
  overdueChance: 0.3,
  firstSpawnMs: 400,
} as const;

export const STYLE_IDS = ["invoices", "calendar", "spikes", "inbox"] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export type Gap = { top: number; h: number; label?: string };

export type Column = {
  id: number;
  x: number;
  kind: "normal" | "gate";
  gaps: Gap[];
  overdue: boolean;
  passed: boolean;
};

export type Coin = { id: number; x: number; y: number; value: number; taken: boolean };

export type GameState = {
  phase: "ready" | "playing" | "over";
  tMs: number;
  y: number;
  vy: number;
  speed: number;
  cols: Column[];
  coins: Coin[];
  spawnInMs: number;
  /** Columns spawned so far. */
  index: number;
  nextId: number;
  days: number;
  hearts: number;
  invulnMs: number;
  right: number;
  asked: number;
  collected: number;
  /** mulberry32 state. */
  rng: number;
  ramp: boolean;
  projects: readonly string[];
};

export function newGame(opts: { seed: number; projects: readonly string[]; ramp?: boolean }): GameState {
  return {
    phase: "ready",
    tMs: 0,
    y: WORLD.h / 2,
    vy: 0,
    speed: TUNING.speedStart,
    cols: [],
    coins: [],
    spawnInMs: TUNING.firstSpawnMs,
    index: 0,
    nextId: 1,
    days: 0,
    hearts: TUNING.hearts,
    invulnMs: 0,
    right: 0,
    asked: 0,
    collected: 0,
    rng: opts.seed | 0,
    ramp: opts.ramp ?? true,
    projects: opts.projects,
  };
}

/** One mulberry32 draw: [value in 0..1, next state]. */
export function nextRand(state: number): [number, number] {
  const next = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

export function flap(s: GameState): GameState {
  if (s.phase === "over") return s;
  return { ...s, phase: "playing", vy: TUNING.flapVy };
}

export function score(s: GameState): number {
  return s.days + 3 * s.right;
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** Where a run of `days` ended: "Monday morning", "Wednesday of week 2". */
export function whereText(days: number): string {
  if (days <= 0) return "Monday morning";
  return `${DAY_NAMES[days % 5]} of week ${Math.floor(days / 5) + 1}`;
}

/** A working copy that one step may change freely before it is returned. */
type Draft = GameState & { random: () => number };

function draft(s: GameState): Draft {
  const d = {
    ...s,
    cols: s.cols.map((c) => ({ ...c, gaps: c.gaps.map((g) => ({ ...g })) })),
    coins: s.coins.map((c) => ({ ...c })),
  } as Draft;
  d.random = () => {
    const [v, n] = nextRand(d.rng);
    d.rng = n;
    return v;
  };
  return d;
}

function finish(d: Draft): GameState {
  const { random: _random, ...s } = d;
  return s;
}

function hit(d: Draft) {
  if (d.invulnMs > 0) return;
  d.hearts -= 1;
  d.invulnMs = TUNING.invulnMs;
  if (d.hearts <= 0) {
    d.hearts = 0;
    d.phase = "over";
  }
}

function spawnNormal(d: Draft) {
  const gap = Math.max(TUNING.gapMin, TUNING.gapStart - d.index * TUNING.gapShrink);
  const centre = TUNING.margin + gap / 2 + d.random() * (WORLD.h - 2 * TUNING.margin - gap);
  const x = WORLD.w + 10;
  d.cols.push({
    id: d.nextId++,
    x,
    kind: "normal",
    gaps: [{ top: centre - gap / 2, h: gap }],
    overdue: d.random() < TUNING.overdueChance,
    passed: false,
  });
  if (d.random() < TUNING.coinChance) {
    const values = TUNING.coinValues;
    d.coins.push({
      id: d.nextId++,
      x: x + TUNING.colW / 2,
      y: centre + (d.random() - 0.5) * gap * 0.4,
      value: values[Math.floor(d.random() * values.length)],
      taken: false,
    });
  }
}

function spawn(d: Draft) {
  spawnNormal(d);
  d.index += 1;
  d.spawnInMs = (TUNING.spacing / d.speed + TUNING.spacingPadS) * 1000;
}

export function step(s: GameState, dtMs: number): GameState {
  if (s.phase !== "playing") return s;
  const dt = Math.min(Math.max(dtMs, 0), TUNING.maxTickMs);
  if (dt === 0) return s;
  const d = draft(s);
  const sec = dt / 1000;

  d.tMs += dt;
  d.invulnMs = Math.max(0, d.invulnMs - dt);
  d.speed = d.ramp ? Math.min(TUNING.speedMax, TUNING.speedStart + (TUNING.speedRamp * d.tMs) / 1000) : TUNING.speedStart;

  d.vy += TUNING.gravity * sec;
  d.y += d.vy * sec;
  if (d.y < 12) {
    d.y = 12;
    d.vy = 0;
  }
  if (d.y > WORLD.h - 10) {
    hit(d);
    d.y = WORLD.h - 10;
    d.vy = TUNING.flapVy;
  }

  d.spawnInMs -= dt;
  if (d.spawnInMs <= 0) spawn(d);

  const dx = d.speed * sec;
  for (const c of d.cols) c.x -= dx;
  for (const c of d.coins) c.x -= dx;

  const left = TUNING.playerX - 12;
  const right = TUNING.playerX + 12;
  for (const c of d.cols) {
    const inX = right > c.x && left < c.x + TUNING.colW;
    const inGap = c.gaps.some((g) => d.y - TUNING.hitSlack > g.top && d.y + TUNING.hitSlack < g.top + g.h);
    if (inX && !inGap) hit(d);
    if (!c.passed && c.x + TUNING.colW < left) {
      c.passed = true;
      d.days += 1;
    }
  }
  for (const c of d.coins) {
    if (!c.taken && Math.hypot(c.x - TUNING.playerX, c.y - d.y) < 22) {
      c.taken = true;
      d.collected += c.value;
    }
  }

  d.cols = d.cols.filter((c) => c.x > -TUNING.colW - 10);
  d.coins = d.coins.filter((c) => c.x > -20 && !c.taken);
  return finish(d);
}
