"use client";

import { useEffect, useRef } from "react";
import { JOBS, JOB_ORDER } from "@/lib/funnel/jobs";
import { clockFor } from "@/lib/funnel/clock";
import { moodFor } from "@/lib/funnel/mood";
import { JobProvider, useJob } from "@/components/funnel/JobContext";
import StickyCta from "@/components/funnel/StickyCta";

/*
  /demo: FreeFlow's one landing page and marketing funnel, told as one night
  from 11:47 pm to 8:00 am. Also what a signed-out visitor sees at /.

  AIDA, in chapters: the night's worries (attention), every worry finding its
  place (interest), the founder's story and the proof that people were
  listened to (desire), a game, then morning and the call to act.

  Scrolling drives the story clock and the page's mood: red-edged tension
  during the night, calm, then morning light. Those are written straight to
  CSS variables and the clock's text on each animation frame, so scrolling
  never re-renders the chapters. Works with no database and no AI key.
*/

function JobPicker() {
  const { job, setJob } = useJob();
  return (
    <div>
      <p className="text-ink-muted mb-2 text-sm">What do you do?</p>
      <div role="group" aria-label="Your kind of work" className="flex items-center gap-2.5">
        {JOB_ORDER.map((j) => (
          <button
            key={j}
            type="button"
            aria-pressed={job === j}
            aria-label={JOBS[j].label}
            title={JOBS[j].label}
            onClick={(e) => setJob(j, e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY })}
            className={`focus-visible:ring-ink flex size-10 items-center justify-center rounded-full border-2 focus-visible:ring-2 focus-visible:outline-none motion-safe:transition-transform motion-safe:hover:scale-110 ${
              job === j ? "scale-110 border-white" : "border-transparent"
            }`}
          >
            <span aria-hidden className="size-[22px] rounded-full" style={{ background: `var(${JOBS[j].accentVar})` }} />
          </button>
        ))}
        <span className="text-ink-muted ml-1 min-w-24 text-xs capitalize">{JOBS[job].label}</span>
      </div>
    </div>
  );
}

function Funnel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / span));
      const { stress, morning } = moodFor(progress);
      root.style.setProperty("--stress", stress.toFixed(3));
      root.style.setProperty("--morning", morning.toFixed(3));
      if (clockRef.current) clockRef.current.textContent = clockFor(progress);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative" style={{ "--stress": 1, "--morning": 0 } as React.CSSProperties}>
      {/* Night: red at the edges, fading as the worries are sorted. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(248,113,113,0.32)_100%)]"
        style={{ opacity: "var(--stress)" }}
      />
      {/* Morning: warm light rising from the bottom. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,rgba(252,211,77,0.22),transparent_65%)]"
        style={{ opacity: "var(--morning)" }}
      />

      <div className="border-hairline sticky top-0 z-20 border-b bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <p className="text-ink-muted numeric text-sm">
            Tuesday, <span ref={clockRef}>{clockFor(0)}</span>
          </p>
          <StickyCta />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pt-8">
          <JobPicker />
        </div>
        <section id="night" aria-label="Chapter 1: the night" className="min-h-[70vh] py-10" />
        <section id="walkthrough" aria-label="Chapter 2: every worry has a place" className="min-h-[60vh] py-10" />
        <section id="story" aria-label="Chapter 3: the story" className="min-h-[60vh] py-10" />
        <section id="proof" aria-label="Chapter 4: you said, we changed" className="min-h-[40vh] py-10" />
        <section id="game" aria-label="Chapter 5: now you try" className="min-h-[60vh] py-10" />
        <section id="morning" aria-label="Chapter 6: morning" className="min-h-[60vh] py-10" />
      </div>
    </div>
  );
}

export default function DemoFunnel() {
  return (
    <JobProvider>
      <Funnel />
    </JobProvider>
  );
}
