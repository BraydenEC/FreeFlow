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
  question?: Question;
};

/* ---------------------------------------------------------------------------
   Jobs, changes and questions
   --------------------------------------------------------------------------- */

/** Invented clients. Nobody real is named in the game. */
export const CLIENTS = [
  "Café Lumbre",
  "Kiko Shoes",
  "Norte Studio",
  "Ana & Luis",
  "Río Films",
  "Casa Verde",
  "Luna Yoga",
  "Voz Media",
  "Teatro Sur",
  "Bloom",
] as const;

/** In-game money, not prices. Unique among the jobs in play. */
export const AMOUNTS = [300, 450, 650, 800, 950, 1200] as const;
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export const MAX_JOBS = 4;
export const MESSAGE_MS = 3600;
export const FEEDBACK_MS = 1800;

/*
  What each spawned column brings. Two new jobs before the first gate, then a
  repeating mix of new jobs, a deadline change and gates, never a new job
  right before a gate (it would be replaced by the question too soon).
*/
export const GATE_PATTERN = [
  "normal", "intro", "normal", "intro", "normal", "gate",
  "intro", "normal", "change", "normal", "gate", "normal", "intro", "normal", "gate",
] as const;
export type StepKind = (typeof GATE_PATTERN)[number];

export function stepKind(i: number): StepKind {
  if (i < GATE_PATTERN.length) return GATE_PATTERN[i];
  const loop = GATE_PATTERN.length - 6;
  return GATE_PATTERN[6 + ((i - 6) % loop)];
}

export type Job = {
  id: number;
  project: string;
  client: string;
  /** Index into DAYS. */
  due: number;
  amount: number;
  moved: boolean;
  /** tMs of the last question about this job, or -1. */
  askedAt: number;
  /** tMs of its deadline change, or -1. */
  changedAt: number;
};

export type Question = { text: string; correct: string; options: string[]; jobId: number; kind: "due" | "amount" };

export type Message = { kind: "job" | "change" | "question"; label: string; text: string };

export type Feedback = { kind: "right" | "wrong" | "hit" | "delivered"; text: string; untilMs: number };

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
  /** Jobs in play, oldest first, at most MAX_JOBS. */
  jobs: Job[];
  /** Jobs created so far (picks the next project and client). */
  made: number;
  /** Events spawned but not shown yet, waiting for the message strip. */
  pending: ("intro" | "change")[];
  message: Message | null;
  /** When the message expires; null means "until its gate is passed". */
  messageUntilMs: number | null;
  feedback: Feedback | null;
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
    jobs: [],
    made: 0,
    pending: [],
    message: null,
    messageUntilMs: null,
    feedback: null,
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
    jobs: s.jobs.map((j) => ({ ...j })),
    pending: [...s.pending],
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

function say(d: Draft, kind: Feedback["kind"], text: string) {
  d.feedback = { kind, text, untilMs: d.tMs + FEEDBACK_MS };
}

/** Costs a heart unless blinking. Returns whether it did. */
function hit(d: Draft, why?: string): boolean {
  if (d.invulnMs > 0) return false;
  d.hearts -= 1;
  d.invulnMs = TUNING.invulnMs;
  if (why) say(d, "hit", why);
  if (d.hearts <= 0) {
    d.hearts = 0;
    d.phase = "over";
  }
  return true;
}

const lower = (p: string) => p.toLowerCase();

function shuffle<T>(d: Draft, items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(d.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showJob(d: Draft) {
  if (d.jobs.length >= MAX_JOBS) {
    const old = d.jobs.shift()!;
    say(d, "delivered", `Delivered · ${old.project} for ${old.client}`);
  }
  const free = AMOUNTS.filter((a) => !d.jobs.some((j) => j.amount === a));
  const job: Job = {
    id: d.nextId++,
    project: d.projects[d.made % d.projects.length],
    client: CLIENTS[d.made % CLIENTS.length],
    due: Math.floor(d.random() * DAYS.length),
    amount: free[Math.floor(d.random() * free.length)],
    moved: false,
    askedAt: -1,
    changedAt: -1,
  };
  d.made += 1;
  d.jobs.push(job);
  d.message = { kind: "job", label: "New job", text: `${job.project} for ${job.client} · $${job.amount} · due ${DAYS[job.due]}` };
  d.messageUntilMs = d.tMs + MESSAGE_MS;
}

function showChange(d: Draft) {
  const still = d.jobs.filter((j) => !j.moved);
  if (!still.length) return;
  const job = still[Math.floor(d.random() * still.length)];
  let due = Math.floor(d.random() * DAYS.length);
  if (due === job.due) due = (due + 2) % DAYS.length;
  job.due = due;
  job.moved = true;
  job.changedAt = d.tMs;
  d.message = { kind: "change", label: "↻ Change", text: `${job.client}: "Can we move the ${lower(job.project)} to ${DAY_FULL[due]}? Thanks!!"` };
  d.messageUntilMs = d.tMs + MESSAGE_MS;
}

/** Shows the next waiting event once the strip is free (never over a question). */
function updateMessages(d: Draft) {
  if (d.feedback && d.tMs >= d.feedback.untilMs) d.feedback = null;
  if (d.message && d.messageUntilMs !== null && d.tMs >= d.messageUntilMs) {
    d.message = null;
    d.messageUntilMs = null;
  }
  if (d.message || !d.pending.length) return;
  const next = d.pending.shift()!;
  if (next === "intro") showJob(d);
  else showChange(d);
}

function makeQuestion(d: Draft): Question {
  const changed = d.jobs.filter((j) => j.moved && j.askedAt < j.changedAt);
  const job = changed.length ? changed[0] : [...d.jobs].sort((a, b) => a.askedAt - b.askedAt)[0];
  job.askedAt = d.tMs;
  const byDue = job.moved || d.random() < 0.6;
  const p = lower(job.project);
  if (byDue) {
    const correct = DAYS[job.due];
    const others = shuffle(d, DAYS.filter((x) => x !== correct)).slice(0, 2);
    return { text: `When is the ${p} for ${job.client} due?`, correct, options: shuffle(d, [correct, ...others]), jobId: job.id, kind: "due" };
  }
  const correct = `$${job.amount}`;
  const others = shuffle(d, AMOUNTS.filter((a) => a !== job.amount)).slice(0, 2).map((a) => `$${a}`);
  return { text: `How much is ${job.client} paying for the ${p}?`, correct, options: shuffle(d, [correct, ...others]), jobId: job.id, kind: "amount" };
}

function spawnGate(d: Draft) {
  const q = makeQuestion(d);
  const gh = TUNING.gateGap;
  const wall = (WORLD.h - 3 * gh) / 4;
  d.cols.push({
    id: d.nextId++,
    x: WORLD.w + 10,
    kind: "gate",
    gaps: q.options.map((label, i) => ({ top: wall * (i + 1) + gh * i, h: gh, label })),
    overdue: false,
    passed: false,
    question: q,
  });
  d.message = { kind: "question", label: "? Fly through the answer", text: q.text };
  d.messageUntilMs = null;
}

function passGate(d: Draft, c: Column) {
  const q = c.question!;
  const chosen = c.gaps.find((g) => d.y > g.top && d.y < g.top + g.h);
  d.asked += 1;
  if (chosen?.label === q.correct) {
    d.right += 1;
    say(d, "right", `Right: ${q.correct}`);
  } else if (chosen) {
    // A wrong answer always costs, even while blinking from an earlier hit.
    d.invulnMs = 0;
    hit(d);
    say(d, "wrong", `Wrong. It was ${q.correct}`);
  }
  if (d.message?.kind === "question" && d.message.text === q.text) {
    d.message = null;
    d.messageUntilMs = null;
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
  const kind = stepKind(d.index);
  if (kind === "gate" && d.jobs.length > 0) spawnGate(d);
  else {
    if (kind === "intro" || kind === "change") d.pending.push(kind);
    spawnNormal(d);
  }
  const nearGate = kind === "gate" || stepKind(d.index + 1) === "gate";
  d.index += 1;
  d.spawnInMs = ((nearGate ? TUNING.gateSpacing : TUNING.spacing) / d.speed + TUNING.spacingPadS) * 1000;
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
    hit(d, "Hit the floor");
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
    if (inX && !inGap) hit(d, c.kind === "gate" ? "Missed the openings" : "Hit a stack");
    if (!c.passed && c.x + TUNING.colW < left) {
      c.passed = true;
      d.days += 1;
      if (c.kind === "gate") passGate(d, c);
    }
  }
  for (const c of d.coins) {
    if (!c.taken && Math.hypot(c.x - TUNING.playerX, c.y - d.y) < 22) {
      c.taken = true;
      d.collected += c.value;
    }
  }

  updateMessages(d);
  d.cols = d.cols.filter((c) => c.x > -TUNING.colW - 10);
  d.coins = d.coins.filter((c) => c.x > -20 && !c.taken);
  return finish(d);
}
