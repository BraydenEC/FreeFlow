"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DAYS,
  STYLE_IDS,
  TUNING,
  WORLD,
  flap,
  newGame,
  score,
  step,
  whereText,
  type GameState,
  type Message,
  type StyleId,
} from "@/lib/game/engine";
import { readBest, readStyle, saveBest, saveStyle } from "@/lib/game/prefs";
import { STYLE_DRAWERS, STYLE_LABELS } from "@/components/funnel/game/styles";
import { drawCharacter, drawCoin, drawContours, drawGateFrame, drawGateLabel } from "@/components/funnel/game/draw";
import { JOBS } from "@/lib/funnel/jobs";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";
import { useCta } from "@/components/funnel/useCta";
import LaunchListForm from "@/components/funnel/LaunchListForm";

/*
  /demo chapter 5: now you try. Answer gates, a one-button flying game.

  You fly a little freelancer through your week. New jobs pop up as you go,
  clients move deadlines, and gates ask about them: you answer by flying
  through the right opening. It makes the founder story felt: keeping it all
  in your head is genuinely hard.

  The rules are pure and seeded (lib/game/engine.ts). This component only
  drives the clock, reads input and draws: the world is a fixed 480 × 480,
  scaled to fit, so a phone and a desktop play the same game. The clock stops
  while the tab is hidden, and each step is clamped, so coming back after
  minutes never skips ahead.

  The score stays in this browser: a personal best and the chosen obstacle
  style (lib/game/prefs.ts), no leaderboard and nothing sent to the server.
  Amounts are in-game money, not prices. Styles are cosmetic only.
*/

const CLOSING =
  "Flying is the fun part. Remembering is the hard part. FreeFlow keeps every deadline and amount in one place, so you don't have to.";
const MAX_CSS = 720;
const IDLE = newGame({ seed: 1, projects: [] });

type Screen = "start" | "playing" | "end";
type Hud = {
  phase: GameState["phase"];
  days: number;
  hearts: number;
  right: number;
  asked: number;
  collected: number;
  score: number;
  message: Message | null;
  feedback: { kind: string; text: string } | null;
  /** The labels of the asked gate's openings, top to bottom. */
  options: string[] | null;
};

const hudOf = (s: GameState): Hud => ({
  phase: s.phase,
  days: s.days,
  hearts: s.hearts,
  right: s.right,
  asked: s.asked,
  collected: s.collected,
  score: score(s),
  message: s.message,
  feedback: s.feedback ? { kind: s.feedback.kind, text: s.feedback.text } : null,
  options:
    s.message?.kind === "question"
      ? (s.cols.find((c) => c.question?.text === s.message?.text)?.gaps.map((g) => g.label ?? "") ?? null)
      : null,
});

const MESSAGE_STYLE: Record<Message["kind"], { border: string; label: string }> = {
  job: { border: "rgba(245,245,245,0.6)", label: "text-ink" },
  change: { border: "#6b6b6b", label: "text-ink-muted" },
  question: { border: "var(--job)", label: "text-[var(--job)]" },
};

export default function Game() {
  const { job, trackJob, choice } = useJob();
  const cta = useCta();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roomRef = useRef<HTMLDivElement>(null);
  const playAgainRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const game = useRef<GameState | null>(null);
  const size = useRef<{ css: number; dpr: number }>({ css: WORLD.w, dpr: 1 });
  const accent = useRef("#c9c6bf");
  const reduced = useRef(false);
  const styleRef = useRef<StyleId>("invoices");
  const lastHud = useRef("");
  // One round_played per run, even if the job is changed after it ends.
  const countedRound = useRef(false);

  const [screen, setScreen] = useState<Screen>("start");
  const [hud, setHud] = useState<Hud>(() => hudOf(IDLE));
  const [style, setStyle] = useState<StyleId>("invoices");
  const [best, setBest] = useState(0);
  const [visible, setVisible] = useState(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { css, dpr } = size.current;
    const k = (css / WORLD.w) * dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    const s = game.current ?? IDLE;
    const color = accent.current;
    const wall = STYLE_DRAWERS[styleRef.current];
    drawContours(ctx, WORLD.w, WORLD.h, s.tMs, reduced.current);
    for (const c of s.cols) {
      if (c.kind === "gate") drawGateFrame(ctx, c.x, TUNING.colW, WORLD.h, color);
      let y = 0;
      c.gaps.forEach((g, i) => {
        wall(ctx, c.x, y, TUNING.colW, g.top - y, i === 0 ? "bottom" : "both", c.overdue);
        y = g.top + g.h;
      });
      wall(ctx, c.x, y, TUNING.colW, WORLD.h - y, "top", c.overdue);
      if (c.kind === "gate") {
        for (const g of c.gaps) if (g.label) drawGateLabel(ctx, c.x + TUNING.colW / 2, g.top + g.h / 2, g.label, color);
      }
    }
    for (const coin of s.coins) drawCoin(ctx, coin.x, coin.y);
    const blinking = s.invulnMs > 0 && (reduced.current || Math.floor(s.invulnMs / 100) % 2 === 0);
    drawCharacter(ctx, TUNING.playerX, s.y, s.vy, color, s.tMs, { still: reduced.current, dim: blinking });
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    const roomEl = roomRef.current;
    if (!canvas || !frame || !roomEl) return;
    // Square, as wide as the column allows, but never taller than the window
    // can show alongside the message strip.
    // The full-width wrapper inside the card's padding is the room we have.
    const room = roomEl.clientWidth;
    const css = Math.floor(Math.min(room, MAX_CSS, Math.max(300, window.innerHeight - 190)));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    frame.style.width = `${css}px`;
    canvas.style.width = `${css}px`;
    canvas.style.height = `${css}px`;
    canvas.width = Math.round(css * dpr);
    canvas.height = Math.round(css * dpr);
    size.current = { css, dpr };
    draw();
  }, [draw]);

  // Once on mount: what this browser remembers, and the motion preference.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onMotion = () => {
      reduced.current = mq.matches;
    };
    mq.addEventListener("change", onMotion);
    styleRef.current = readStyle();
    setStyle(styleRef.current);
    setBest(readBest());
    resize();
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(() => resize());
    if (roomRef.current) ro.observe(roomRef.current);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", onMotion);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [resize]);

  // The character wears the page's current colour, even mid-run.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    accent.current = getComputedStyle(canvas).getPropertyValue("--job").trim() || "#c9c6bf";
    draw();
  }, [choice, draw]);

  // The clock: one step per frame while playing and visible.
  useEffect(() => {
    if (screen !== "playing" || !visible) return;
    let raf = 0;
    let last: number | null = null;
    const loop = (now: number) => {
      const dt = last === null ? 0 : now - last;
      last = now;
      if (game.current && dt > 0) game.current = step(game.current, dt);
      draw();
      if (game.current) {
        const next = hudOf(game.current);
        const key = JSON.stringify(next);
        if (key !== lastHud.current) {
          lastHud.current = key;
          setHud(next);
        }
        if (game.current.phase === "over") return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen, visible, draw]);

  // A run just ended: count it once and keep the personal best.
  useEffect(() => {
    if (hud.phase !== "over" || countedRound.current) return;
    countedRound.current = true;
    track("round_played", trackJob);
    const total = hud.score;
    const previous = readBest();
    if (total > previous) saveBest(total);
    setBest(Math.max(previous, total));
  }, [hud.phase, hud.score, trackJob]);

  // Keyboard players land on Play again, so Space plays again.
  useEffect(() => {
    if (screen === "end") playAgainRef.current?.focus({ preventScroll: true });
  }, [screen]);

  // …then show the end screen after a beat.
  useEffect(() => {
    if (hud.phase !== "over") return;
    const t = window.setTimeout(() => setScreen("end"), 600);
    return () => window.clearTimeout(t);
  }, [hud.phase]);

  function start() {
    // Projects are fixed for the run: changing the job mid-run only recolours.
    game.current = flap(newGame({ seed: Date.now() | 0, projects: JOBS[job].gameProjects, ramp: !reduced.current }));
    countedRound.current = false;
    lastHud.current = "";
    setHud(hudOf(game.current));
    setScreen("playing");
    canvasRef.current?.focus({ preventScroll: true });
  }

  function press() {
    if (screen === "playing" && game.current) game.current = flap(game.current);
    else if (screen === "start") start();
  }

  function pickStyle(id: StyleId) {
    styleRef.current = id;
    setStyle(id);
    saveStyle(id);
    draw();
  }

  const msg = screen === "playing" ? hud.message : null;

  const styleSwitch = (
    <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Obstacle style">
      <span className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Obstacles</span>
      {STYLE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={style === id}
          onClick={() => pickStyle(id)}
          className={`focus-visible:ring-ink rounded-full border px-3 py-1 text-xs focus-visible:ring-2 focus-visible:outline-none ${
            style === id ? "border-[var(--job)] text-ink" : "border-hairline text-ink-muted hover:text-ink"
          }`}
        >
          {STYLE_LABELS[id]}
        </button>
      ))}
    </div>
  );

  return (
    <section id="game" aria-labelledby="game-title" className="py-16">
      <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Your turn</p>
      <h2 id="game-title" className="mt-2 text-3xl font-semibold tracking-tight">
        Now you try.
      </h2>
      <p className="text-ink-muted mt-2 max-w-2xl">
        Fly your week. New jobs pop up as you go, and gates ask about them: answer by flying through the right
        opening. Tap, click or press space to climb.
      </p>

      <div className="border-hairline mx-auto mt-6 max-w-[752px] rounded-2xl border p-3 sm:p-4">
        <div
          aria-live="polite"
          className="mb-3 flex min-h-[64px] flex-col justify-center rounded-xl border px-3 py-2 text-center text-[14.5px] leading-snug"
          style={{ borderColor: msg ? MESSAGE_STYLE[msg.kind].border : "var(--color-hairline, #262626)" }}
        >
          {msg ? (
            <>
              <span className={`text-[10.5px] tracking-[0.12em] uppercase ${MESSAGE_STYLE[msg.kind].label}`}>{msg.label}</span>
              <span>{msg.text}</span>
              {msg.kind === "question" && hud.options && (
                <span className="sr-only">Openings, top to bottom: {hud.options.join(", ")}.</span>
              )}
            </>
          ) : (
            <span className="text-ink-faint text-sm">
              {screen === "playing" ? " " : "New jobs, changes and questions show up here."}
            </span>
          )}
        </div>

        <div ref={roomRef} className="w-full">
        <div ref={frameRef} className="relative mx-auto">
          <canvas
            ref={canvasRef}
            tabIndex={0}
            role="application"
            aria-label="Answer gates game. Press space or tap to climb."
            onPointerDown={(e) => {
              if (screen !== "playing") return;
              e.preventDefault();
              press();
            }}
            onKeyDown={(e) => {
              if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
                e.preventDefault();
                if (!e.repeat) press();
              }
            }}
            className="focus-visible:ring-ink mx-auto block touch-none rounded-xl bg-[#050505] focus-visible:ring-2 focus-visible:outline-none"
          />

          {screen === "playing" && (
            <div className="numeric pointer-events-none absolute inset-x-3 top-2 flex justify-between text-sm font-semibold [text-shadow:0_1px_6px_#000]">
              <span>
                Week {Math.floor(hud.days / 5) + 1} · {DAYS[hud.days % 5]}
              </span>
              <span role="img" aria-label={`${hud.hearts} hearts left`}>
                <span aria-hidden>{"♥".repeat(hud.hearts)}</span>
                <span aria-hidden className="text-ink-faint">
                  {"♡".repeat(TUNING.hearts - hud.hearts)}
                </span>
              </span>
              <span>
                <span className="text-[var(--job)]">✓ {hud.right}</span> · ${hud.collected.toLocaleString("en-US")}
              </span>
            </div>
          )}

          {screen === "start" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/80 p-4 text-center"
              onClick={(e) => {
                // A click, not a pointerdown: a finger scrolling past doesn't start a run.
                if (!(e.target as HTMLElement).closest("button")) start();
              }}
            >
              <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Fly and remember</p>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">Answer gates.</p>
              <p className="text-ink-muted max-w-sm text-sm">
                Jobs pop up while you fly. Remember them: the gates ask. Three hearts.
              </p>
              <button
                type="button"
                onClick={start}
                className="focus-visible:ring-ink rounded-lg bg-[var(--job)] px-5 py-2.5 text-[15px] font-bold text-black focus-visible:ring-2 focus-visible:outline-none"
              >
                Start
              </button>
              {styleSwitch}
              {best > 0 && <p className="text-ink-faint text-xs">Your best score: {best}</p>}
            </div>
          )}

          {screen === "end" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 overflow-y-auto rounded-xl bg-black/85 p-4 text-center">
              <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
                Score {hud.score} · best {best}
              </p>
              <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {hud.asked === 0 ? "Buried before the first question" : `${hud.right} of ${hud.asked} from memory`}
              </p>
              <p className="text-ink-muted text-sm">
                Flew to {whereText(hud.days)} · ${hud.collected.toLocaleString("en-US")} collected
              </p>
              <p className="text-ink-muted max-w-md text-sm">{CLOSING}</p>
              <div className="mt-1 flex flex-wrap justify-center gap-3">
                <Link
                  href={cta.href}
                  onClick={() => !cta.signedIn && track("try_free_click", trackJob)}
                  className="focus-visible:ring-ink rounded-lg bg-[var(--job)] px-4 py-2.5 text-[15px] font-bold text-black focus-visible:ring-2 focus-visible:outline-none"
                >
                  {cta.label}
                </Link>
                <button
                  ref={playAgainRef}
                  type="button"
                  onClick={start}
                  className="border-hairline focus-visible:ring-ink rounded-lg border px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  Play again
                </button>
              </div>
            </div>
          )}
        </div>

        </div>

        <p aria-live="polite" className={`mt-2 min-h-5 text-center text-sm font-semibold ${hud.feedback?.kind === "right" ? "text-[var(--job)]" : "text-ink-muted"}`}>
          {screen === "playing" ? hud.feedback?.text : ""}
        </p>

        {screen === "end" && <div className="mt-2">{styleSwitch}</div>}
      </div>

      {screen === "end" && (
        <div className="mx-auto mt-6 max-w-[752px]">
          <LaunchListForm source="game_end" />
        </div>
      )}
    </section>
  );
}
