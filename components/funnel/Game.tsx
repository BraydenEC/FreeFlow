"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BALANCE, buy, collect, invoiceStage, newGame, tick, work, type GameState, type UpgradeId } from "@/lib/game/engine";
import { JOBS } from "@/lib/funnel/jobs";
import { COPY } from "@/lib/funnel/copy";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";
import LaunchListForm from "@/components/funnel/LaunchListForm";

/*
  /demo chapter 5: now you try. A 60-second freelance clicker.

  Do the work, collect invoices before they go overdue, and spend what you
  collect on upgrades, each one a real FreeFlow feature. The rules are pure
  (lib/game/engine.ts); this component only renders and drives the clock with
  requestAnimationFrame. The round pauses while the tab is hidden, and each
  tick is clamped, so coming back after minutes never ends it.

  The score stays in this browser: a personal best in browser storage
  (wrapped, so blocked storage only loses the best), no leaderboard and
  nothing sent to the server. Amounts are in-game money, not prices.
*/

const UPGRADES: { id: UpgradeId; name: string; desc: string; real: string }[] = [
  { id: "brief", name: "Paste a brief", desc: "Each click does twice the work.", real: "Paste a client email, get a project" },
  { id: "alert", name: "Overdue alert", desc: "Overdue invoices lose value half as fast.", real: "Overdue alert" },
  {
    id: "contract",
    name: "Contract tracking",
    desc: "Signed clients pay: overdue invoices keep at least 70% of their value.",
    real: "Contract and payment links",
  },
  { id: "terms", name: "Payment terms", desc: "Clients pay on schedule: invoices collect themselves at 5 s.", real: "Payment terms per project" },
];

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

const STAGE_STYLE = {
  fresh: "border-hairline text-white",
  yellow: "border-[var(--color-status-review)] text-[#fde68a]",
  overdue: "border-[var(--color-status-overdue)] text-[#fca5a5]",
} as const;

function readBest(): number {
  try {
    return Number(window.localStorage.getItem("ff_game_best")) || 0;
  } catch {
    return 0;
  }
}

function saveBest(n: number) {
  try {
    window.localStorage.setItem("ff_game_best", String(n));
  } catch {
    // Blocked storage: the best just isn't remembered.
  }
}

export default function Game() {
  const { job } = useJob();
  const [s, setS] = useState<GameState>(newGame);
  const [visible, setVisible] = useState(true);
  const [best, setBest] = useState(0);
  const last = useRef<number | null>(null);

  // Pause while the tab is hidden.
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = s.started && !s.over && visible;

  useEffect(() => {
    if (!running) {
      last.current = null;
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      const dt = last.current === null ? 0 : now - last.current;
      last.current = now;
      if (dt > 0) setS((prev) => tick(prev, dt));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // A round just ended: record it once and keep the personal best.
  useEffect(() => {
    if (!s.over) return;
    track("round_played", job);
    const previous = readBest();
    if (s.collected > previous) saveBest(s.collected);
    setBest(Math.max(previous, s.collected)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [s.over, s.collected, job]);

  const projects = JOBS[job].gameProjects;
  const project = projects[s.projectIndex % projects.length];
  const seconds = Math.ceil(s.remainingMs / 1000);

  return (
    <section id="game" aria-labelledby="game-title" className="py-16">
      <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Chapter 5</p>
      <h2 id="game-title" className="mt-2 text-3xl font-semibold tracking-tight">
        Now you try.
      </h2>
      <p className="text-ink-muted mt-2 max-w-2xl">
        60 seconds. Do the work, then collect the invoices before they go overdue. Spend what you collect on upgrades.
        The timer starts on your first click.
      </p>

      <div className="border-hairline mt-6 rounded-2xl border p-4 sm:p-5">
        <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            ["Time left", `${seconds}s`],
            ["Collected", money(s.collected)],
            ["Cash to spend", money(s.cash)],
            ["Lost to late payers", money(s.lost)],
          ].map(([k, v]) => (
            <div key={k} className="border-hairline rounded-lg border px-3 py-2">
              <dt className="text-ink-muted text-[11px]">{k}</dt>
              <dd className="numeric text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        {s.over ? (
          <div className="mt-6 flex flex-col gap-4" aria-live="polite">
            <p className="text-xl font-semibold">
              You collected {money(s.collected)}. FreeFlow does the chasing for you.
            </p>
            <p className="text-ink-muted text-sm">Your best: {money(best)}</p>
            <div className="flex flex-wrap items-start gap-3">
              <Link
                href="/signup"
                onClick={() => track("try_free_click", job)}
                className="focus-visible:ring-ink rounded-lg bg-[var(--job)] px-4 py-2.5 text-[15px] font-bold text-black focus-visible:ring-2 focus-visible:outline-none"
              >
                {COPY.tryFree}
              </Link>
              <button
                type="button"
                onClick={() => setS(newGame())}
                className="border-hairline focus-visible:ring-ink rounded-lg border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                Play again
              </button>
            </div>
            <LaunchListForm source="game_end" />
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <button
                type="button"
                onClick={() => setS((prev) => work(prev, Math.random))}
                className="border-hairline focus-visible:ring-ink relative w-full overflow-hidden rounded-xl border bg-[#111] px-4 py-5 text-left focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--job)] opacity-20 motion-safe:transition-[width]"
                  style={{ width: `${s.progress}%` }}
                />
                <span className="relative block text-sm font-semibold">Do the work: {project}</span>
                <span className="text-ink-muted relative block text-xs">
                  {s.progress}% done · each finished project becomes an invoice
                </span>
              </button>

              <p className="text-ink-faint mt-4 mb-2 text-[11px] tracking-[0.08em] uppercase">Invoices · tap to collect</p>
              <ul className="flex min-h-12 flex-wrap gap-2" aria-live="polite">
                {s.invoices.length === 0 && <li className="text-ink-faint text-sm">None yet.</li>}
                {s.invoices.map((inv) => {
                  const stage = invoiceStage(inv);
                  return (
                    <li key={inv.id}>
                      <button
                        type="button"
                        onClick={() => setS((prev) => collect(prev, inv.id))}
                        aria-label={`Collect ${stage} invoice for ${money(inv.value)}`}
                        className={`focus-visible:ring-ink numeric rounded-lg border bg-black px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none ${STAGE_STYLE[stage]} ${stage === "overdue" ? "motion-safe:animate-pulse" : ""}`}
                      >
                        {money(inv.value)}
                        {stage === "overdue" && <span className="ml-1 text-[10px]">overdue</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <ul className="flex flex-col gap-2">
              {UPGRADES.map((u) => {
                const owned = s.owned[u.id];
                const cost = BALANCE.costs[u.id];
                return (
                  <li key={u.id} className={`border-hairline rounded-xl border p-3 ${owned ? "border-[var(--color-status-sent)]/50" : ""}`}>
                    <button
                      type="button"
                      onClick={() => setS((prev) => buy(prev, u.id))}
                      disabled={owned || s.cash < cost}
                      className="focus-visible:ring-ink flex w-full items-start justify-between gap-3 rounded text-left disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span>
                        <span className="block text-sm font-semibold">{u.name}</span>
                        <span className="text-ink-muted block text-xs">{u.desc}</span>
                      </span>
                      <span className={`numeric shrink-0 text-xs ${owned ? "text-[var(--color-status-sent)]" : "text-ink-muted"}`}>
                        {owned ? "owned" : money(cost)}
                      </span>
                    </button>
                    <Link href="/product" className="text-ink-faint hover:text-ink mt-1.5 inline-block text-[10px] tracking-[0.06em] uppercase">
                      This is real in FreeFlow · {u.real}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {s.started && !s.over && !visible && <p className="text-ink-muted mt-3 text-xs">Paused while you were away.</p>}
      </div>
    </section>
  );
}
