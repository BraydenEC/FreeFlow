"use client";

import { useEffect, useRef, useState } from "react";
import { COPY } from "@/lib/funnel/copy";
import {
  canOfferRest,
  fileWorry,
  handleRest,
  spawn,
  startSort,
  stressLevel,
  type SortState,
} from "@/lib/funnel/sorting";
import { track } from "@/lib/funnel/track";
import type { JobId } from "@/lib/funnel/jobs";
import { useJob } from "@/components/funnel/JobContext";
import JobPicker from "@/components/funnel/JobPicker";

/*
  /demo chapter 1, 11:47 pm: "it's all in my head." (Attention.)

  Worries for the visitor's job pop onto "your mind" every 1.7 s while the
  chapter is on screen. Each is a real button: click, tap or press Enter to
  file it into FreeFlow, or drag it into the FreeFlow panel. Notes near the
  mouse shake. After three, FreeFlow offers to handle the rest; everything
  files itself, the red fades and the headline turns calm.

  Under prefers-reduced-motion there is no drift, shake or fly: worries file
  instantly. The sorting rules are pure (lib/funnel/sorting.ts).
*/

const SPAWN_MS = 1700;
const NEAR_PX = 90;

type Fly = { key: number; text: string; from: DOMRect; to: DOMRect };

function FlyNote({ fly, onDone }: { fly: Fly; onDone: () => void }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGo(true));
    const t = setTimeout(onDone, 560);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [onDone]);
  const dx = fly.to.left + 16 - fly.from.left;
  const dy = fly.to.top + 44 - fly.from.top;
  return (
    <div
      aria-hidden
      className="border-hairline pointer-events-none fixed z-30 rounded-lg border bg-[#0b0b0b] px-3 py-2 text-[13px] whitespace-nowrap text-[#d4d4d4] transition-all duration-500 ease-[cubic-bezier(.5,0,.2,1)]"
      style={{
        left: fly.from.left,
        top: fly.from.top,
        transform: go ? `translate(${dx}px, ${dy}px) scale(0.6)` : "none",
        opacity: go ? 0 : 1,
      }}
    >
      {fly.text}
    </div>
  );
}

function Night({ job }: { job: JobId }) {
  const [s, setS] = useState<SortState>(() => spawn(spawn(startSort(job))));
  const [calmMotion, setCalmMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [fly, setFly] = useState<Fly | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mindRef = useRef<HTMLDivElement>(null);
  const ffRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const flyCount = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCalmMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Worries only arrive while the chapter is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || s.calm) return;
    const t = setInterval(() => setS((prev) => spawn(prev)), SPAWN_MS);
    return () => clearInterval(t);
  }, [inView, s.calm]);

  const file = (id: string, el?: HTMLElement | null) => {
    const w = s.live.find((x) => x.id === id);
    if (!w) return;
    if (!calmMotion && el && ffRef.current) {
      flyCount.current += 1;
      setFly({ key: flyCount.current, text: w.chaos, from: el.getBoundingClientRect(), to: ffRef.current.getBoundingClientRect() });
    }
    setS((prev) => fileWorry(prev, id));
  };

  const rest = () => {
    setS((prev) => handleRest(prev));
    track("night_sorted", job);
  };

  // Notes near the mouse get nervous.
  const onMindMove = (e: React.PointerEvent) => {
    if (calmMotion || e.pointerType !== "mouse" || !mindRef.current) return;
    for (const note of mindRef.current.querySelectorAll<HTMLElement>("[data-note]")) {
      // A note being dragged is never nervous: the shake would fight the drag.
      if (note.dataset.drag !== undefined) continue;
      const r = note.getBoundingClientRect();
      const near = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < NEAR_PX;
      if (near) note.dataset.nervous = "";
      else delete note.dataset.nervous;
    }
  };

  const onDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    // A drop that filed its worry removes the button before its click fires,
    // so a stale suppression is cleared on every new press.
    suppressClick.current = false;
    drag.current = { id, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) > 5) {
      d.moved = true;
      e.currentTarget.dataset.drag = "";
      delete e.currentTarget.dataset.nervous;
    }
    if (d.moved) e.currentTarget.style.translate = `${dx}px ${dy}px`;
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    suppressClick.current = true;
    const el = e.currentTarget;
    const r = ffRef.current?.getBoundingClientRect();
    const inside = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    el.style.translate = "";
    delete el.dataset.drag;
    if (inside) setS((prev) => fileWorry(prev, d.id));
  };

  const stress = stressLevel(s);

  return (
    <section ref={sectionRef} id="night" aria-labelledby="night-title" className="py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <h1 id="night-title" className="text-[clamp(28px,4.6vw,50px)] leading-[1.06] font-semibold tracking-[-0.035em]">
            {s.calm ? COPY.calmHeadline : COPY.nightHeadline(job)}
          </h1>
          <p className="text-ink-muted mt-3 text-base">{COPY.RETIRED_LANDING_HEADLINES[2]}.</p>
        </div>
        <JobPicker />
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3.5 md:grid-cols-[1.35fr_1fr]">
        <div
          ref={mindRef}
          onPointerMove={onMindMove}
          className="border-hairline relative h-[380px] overflow-hidden rounded-2xl border sm:h-[420px]"
          style={{ boxShadow: `inset 0 0 ${Math.round(60 * stress)}px rgba(248,113,113,${(0.35 * stress).toFixed(2)})` }}
        >
          <p className="text-ink-faint absolute top-3 left-3.5 z-10 text-[11px] tracking-[0.08em] uppercase">On your mind</p>
          <p aria-live="polite" className="numeric absolute top-2.5 right-3.5 z-10 text-xs text-[var(--color-status-overdue)]">
            {s.live.length} {s.live.length === 1 ? "thing" : "things"}
          </p>
          {s.calm ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
              <p className="text-lg font-semibold">Quiet.</p>
              <p className="text-ink-muted text-sm">Everything has a place.</p>
            </div>
          ) : (
            s.live.map((w) => {
              const n = Number(w.id.split("#")[1]) || 0;
              const tone =
                w.tone === "red"
                  ? "border-[#f87171] text-[#fca5a5]"
                  : w.tone === "yellow"
                    ? "border-[#fcd34d] text-[#fde68a]"
                    : "border-hairline text-[#d4d4d4]";
              return (
                <button
                  key={w.id}
                  type="button"
                  data-note=""
                  onPointerDown={(e) => onDown(e, w.id)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onClick={(e) => {
                    // e.detail is 0 for Enter or Space, which is never the tail of a drag.
                    if (suppressClick.current && e.detail !== 0) {
                      suppressClick.current = false;
                      return;
                    }
                    file(w.id, e.currentTarget);
                  }}
                  aria-label={`File “${w.chaos}” into FreeFlow`}
                  className={`focus-visible:ring-ink absolute z-[1] cursor-grab touch-none rounded-lg border bg-[#0b0b0b] px-3 py-2 text-left text-[13px] max-w-44 shadow-[0_6px_24px_rgba(0,0,0,0.6)] select-none focus-visible:ring-2 focus-visible:outline-none data-[drag]:z-20 data-[drag]:cursor-grabbing data-[drag]:animate-none! motion-safe:animate-[drift_var(--d)_ease-in-out_infinite_alternate] motion-safe:data-[nervous]:animate-[shake_0.18s_linear_infinite] ${tone}`}
                  style={
                    {
                      // Clamped so a note (at most 11 rem wide) never runs off a phone-width panel.
                      left: `min(${4 + ((n * 37) % 62)}%, calc(100% - 11.5rem))`,
                      top: `${14 + ((n * 53) % 68)}%`,
                      "--d": `${3 + (n % 4)}s`,
                      "--dx": `${(n % 2 ? 1 : -1) * (6 + (n % 5))}px`,
                      "--dy": `${(n % 3 ? -1 : 1) * (5 + (n % 4))}px`,
                      "--r": `${(n % 2 ? 1 : -1) * (1 + (n % 3))}deg`,
                    } as React.CSSProperties
                  }
                >
                  {w.chaos}
                  {w.sub && <small className="text-ink-faint mt-0.5 block text-[10px]">{w.sub}</small>}
                </button>
              );
            })
          )}
        </div>

        <div
          ref={ffRef}
          className="border-hairline relative h-[300px] overflow-hidden rounded-2xl border px-3.5 pt-10 pb-3.5 sm:h-[420px]"
        >
          <p className="text-ink-faint absolute top-3 left-3.5 text-[11px] tracking-[0.08em] uppercase">FreeFlow</p>
          {s.filed.length === 0 ? (
            <p className="text-ink-faint mt-24 text-center text-sm leading-relaxed">
              Drag a worry here.
              <br />
              Or just tap it.
            </p>
          ) : (
            <ul className="flex flex-col">
              {s.filed
                .slice()
                .reverse()
                .map((w) => (
                  <li
                    key={w.id}
                    className="border-hairline flex justify-between gap-2.5 border-b px-1 py-2 text-[13px] motion-safe:animate-[slide-in_0.45s_cubic-bezier(.2,.9,.2,1)]"
                  >
                    <span className="min-w-0 truncate">
                      <span aria-hidden className="mr-1.5 text-[var(--job)]">
                        ✓
                      </span>
                      {w.filedAs}
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[var(--job)]">{w.status}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4 flex min-h-12 flex-wrap items-center gap-3.5" aria-live="polite">
        {s.calm ? (
          <p className="text-ink-muted text-sm">Go to sleep. Scroll on to see where each worry went.</p>
        ) : canOfferRest(s) ? (
          <>
            <p className="text-sm">{COPY.cantKeepUp}</p>
            <button
              type="button"
              onClick={rest}
              className="focus-visible:ring-ink rounded-lg bg-[var(--job)] px-4 py-2.5 text-[15px] font-bold text-black focus-visible:ring-2 focus-visible:outline-none"
            >
              {COPY.restButton}
            </button>
          </>
        ) : (
          <p className="text-ink-muted text-sm">They keep coming. Sort a few.</p>
        )}
      </div>

      {fly && <FlyNote key={fly.key} fly={fly} onDone={() => setFly(null)} />}
    </section>
  );
}

export default function ChapterNight() {
  const { job } = useJob();
  // A new job starts a new night.
  return <Night key={job} job={job} />;
}
