/*
  The /demo chapter 5 game: a 60-second freelance clicker.

  Click to do the work; every finished project becomes an invoice. Collect
  invoices before they go overdue, because overdue invoices lose value. Spend
  what you collect on upgrades, each one a real FreeFlow feature. Score is
  everything collected; cash is what's left to spend.

  Pure by design: every function returns a new state and never mutates its
  input, so the React component only renders and the rules are testable in
  plain node (scripts/test-game.ts). Once the round is over, every function
  returns the same state object unchanged.
*/

export type UpgradeId = "brief" | "alert" | "contract" | "terms";

export type Invoice = { id: number; full: number; value: number; ageMs: number };

export type GameState = {
  started: boolean;
  over: boolean;
  remainingMs: number;
  progress: number;
  projectIndex: number;
  invoices: Invoice[];
  collected: number;
  cash: number;
  lost: number;
  owned: Record<UpgradeId, boolean>;
  nextId: number;
};

export const BALANCE = {
  roundMs: 60_000,
  /** Percent of a project each click completes; 100 finishes it. */
  workPerClick: 10,
  briefMultiplier: 2,
  invoiceMin: 250,
  invoiceMax: 700,
  yellowAtMs: 4_000,
  overdueAtMs: 7_000,
  /** Share of an invoice's full value lost per second once overdue. */
  decayPerSec: 0.08,
  alertDecayPerSec: 0.04,
  /** An overdue invoice never falls below this share of its full value. */
  floor: 0.15,
  contractFloor: 0.7,
  termsCollectAtMs: 5_000,
  /** Longest gap one tick may cover, so a hidden tab can't end the round. */
  maxTickMs: 250,
  costs: { brief: 500, alert: 800, contract: 1100, terms: 1600 } as Record<UpgradeId, number>,
};

export function newGame(): GameState {
  return {
    started: false,
    over: false,
    remainingMs: BALANCE.roundMs,
    progress: 0,
    projectIndex: 0,
    invoices: [],
    collected: 0,
    cash: 0,
    lost: 0,
    owned: { brief: false, alert: false, contract: false, terms: false },
    nextId: 1,
  };
}

export function work(s: GameState, rng: () => number): GameState {
  if (s.over) return s;
  const step = BALANCE.workPerClick * (s.owned.brief ? BALANCE.briefMultiplier : 1);
  const progress = s.progress + step;
  if (progress < 100) return { ...s, started: true, progress };
  const full = Math.round(BALANCE.invoiceMin + rng() * (BALANCE.invoiceMax - BALANCE.invoiceMin));
  return {
    ...s,
    started: true,
    progress: 0,
    projectIndex: s.projectIndex + 1,
    invoices: [...s.invoices, { id: s.nextId, full, value: full, ageMs: 0 }],
    nextId: s.nextId + 1,
  };
}

export function collect(s: GameState, id: number): GameState {
  if (s.over) return s;
  const inv = s.invoices.find((i) => i.id === id);
  if (!inv) return s;
  const amount = Math.round(inv.value);
  return {
    ...s,
    started: true,
    invoices: s.invoices.filter((i) => i.id !== id),
    collected: s.collected + amount,
    cash: s.cash + amount,
  };
}

export function buy(s: GameState, u: UpgradeId): GameState {
  if (s.over || s.owned[u] || s.cash < BALANCE.costs[u]) return s;
  return {
    ...s,
    started: true,
    cash: s.cash - BALANCE.costs[u],
    owned: { ...s.owned, [u]: true },
  };
}

export function tick(s: GameState, dtMs: number): GameState {
  if (!s.started || s.over) return s;
  const dt = Math.min(Math.max(dtMs, 0), BALANCE.maxTickMs);
  const rate = s.owned.alert ? BALANCE.alertDecayPerSec : BALANCE.decayPerSec;
  const floorShare = s.owned.contract ? BALANCE.contractFloor : BALANCE.floor;

  let collected = s.collected;
  let cash = s.cash;
  let lost = s.lost;
  const invoices: Invoice[] = [];

  for (const inv of s.invoices) {
    const ageAfter = inv.ageMs + dt;
    if (s.owned.terms && ageAfter >= BALANCE.termsCollectAtMs) {
      const amount = Math.round(inv.value);
      collected += amount;
      cash += amount;
      continue;
    }
    // Only the part of this tick spent past the overdue mark decays.
    const overdueMs = Math.max(0, ageAfter - Math.max(inv.ageMs, BALANCE.overdueAtMs));
    const floor = inv.full * floorShare;
    const value = Math.max(floor, inv.value - inv.full * rate * (overdueMs / 1000));
    lost += Math.max(0, inv.value - value);
    invoices.push({ ...inv, ageMs: ageAfter, value });
  }

  const remainingMs = Math.max(0, s.remainingMs - dt);
  return { ...s, remainingMs, over: remainingMs === 0, invoices, collected, cash, lost };
}

export function invoiceStage(inv: Invoice): "fresh" | "yellow" | "overdue" {
  if (inv.ageMs >= BALANCE.overdueAtMs) return "overdue";
  if (inv.ageMs >= BALANCE.yellowAtMs) return "yellow";
  return "fresh";
}
