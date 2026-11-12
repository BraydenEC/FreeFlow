"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { choicePrefix, worriesFor } from "@/lib/funnel/choice";
import { FIELD_CARDS, counterFor, fieldBand, rowHeight, sortedColumns, sortedTarget } from "@/lib/funnel/field";
import { track } from "@/lib/funnel/track";
import type { Worry } from "@/lib/funnel/jobs";
import { useJob } from "@/components/funnel/JobContext";
import JobWord from "@/components/funnel/JobWord";

/*
  /demo's first screen, 11:47 pm: "I'm a freelancer, and it's all in my head."

  The visitor's worries drift as note cards under the headline (a canvas,
  decorative: the same worries are in a list for screen readers). The
  pointer or a finger is a current that pushes them. Scrolling through the
  sort space below pulls them into rows near the top: ✓, the worry, and what
  FreeFlow did with it. Each worry is on the field twice; the copies merge
  into one row. "On your mind" counts down from 18 as they sort. Keyboard
  users get "Sort it for me" when they tab to it.

  Under prefers-reduced-motion there is no canvas and no sort space: the
  sorted rows are simply shown under the headline. The canvas stops drawing
  once it has faded out or the tab is hidden.
*/

type Card = { w: Worry; k: number; first: boolean; x: number; y: number; vx: number; vy: number; a: number };

export default function HeroField() {
  const { choice, trackJob } = useJob();
  const [calm, setCalm] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const state = useRef<{ order: number; forced: number; sortedTracked: boolean; apply: (o: number) => void }>({
    order: 0,
    forced: 0,
    sortedTracked: false,
    apply: () => {},
  });
  const trackJobRef = useRef(trackJob);

  useEffect(() => {
    trackJobRef.current = trackJob;
  }, [trackJob]);

  const worries = worriesFor(choice);

  useEffect(() => {
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (calm) return;
    const canvas = canvasRef.current;
    const sortEl = sortRef.current;
    if (!canvas || !sortEl) return;
    const cx = canvas.getContext("2d");
    if (!cx) return;
    const list = worriesFor(choice);
    gsap.registerPlugin(ScrollTrigger);

    let w = 0;
    let h = 0;
    const size = () => {
      const d = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * d;
      canvas.height = h * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();

    const band = () => fieldBand(controlsRef.current?.getBoundingClientRect().bottom ?? h * 0.4, h);
    const s = state.current;
    s.order = 0;
    s.forced = 0;
    const [bt, bb] = band();
    const cards: Card[] = Array.from({ length: FIELD_CARDS }, (_, i) => ({
      w: list[i % list.length],
      k: i % list.length,
      first: i < list.length,
      x: Math.random() * w,
      y: bt + Math.random() * (bb - bt),
      vx: (Math.random() - 0.5) * 1.4,
      vy: (Math.random() - 0.5) * 1.4,
      a: Math.random() * 6,
    }));

    const m = { x: -999, y: -999, px: -999, py: -999 };
    const onPointer = (e: PointerEvent) => {
      m.px = m.x;
      m.py = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
    };

    const setOrder = (o: number) => {
      s.order = Math.max(o, s.forced);
      if (countRef.current) countRef.current.textContent = String(counterFor(s.order));
      if (s.order >= 0.98 && !s.sortedTracked) {
        s.sortedTracked = true;
        track("night_sorted", trackJobRef.current);
      }
    };
    s.apply = setOrder;
    setOrder(0);
    const trigger = ScrollTrigger.create({
      trigger: sortEl,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (st) => setOrder(st.progress),
    });

    const font = getComputedStyle(document.body).fontFamily;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const sortBottom = sortEl.getBoundingClientRect().bottom;
      const fade = Math.min(1, Math.max(0, (h * 0.7 - sortBottom) / (h * 0.5)));
      canvas.style.opacity = String(1 - fade);
      const scrolled = (heroRef.current?.getBoundingClientRect().top ?? 0) < -40;
      if (meterRef.current) meterRef.current.style.opacity = String(!scrolled && s.order < 0.02 ? 0 : 1 - fade);
      if (fade < 1) {
        const order = s.order;
        const sorted = order > 0.9;
        const cols = sortedColumns(w);
        const acc = getComputedStyle(canvas).getPropertyValue("--job").trim() || "#c9c6bf";
        const [top, bottom] = band();
        cx.clearRect(0, 0, w, h);
        for (const p of cards) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 150 && order < 0.9) {
            const f = 1 - d / 150;
            p.vx += (m.x - m.px) * 0.045 * f + (dx / d) * 0.7 * f;
            p.vy += (m.y - m.py) * 0.045 * f + (dy / d) * 0.7 * f;
          }
          p.a += 0.02;
          p.vx += Math.cos(p.a) * 0.035 * (1 - order);
          p.vy += Math.sin(p.a * 1.3) * 0.035 * (1 - order);
          const t = sortedTarget(p.k, w);
          p.vx += (t.x - p.x) * 0.006 * order;
          p.vy += (t.y - p.y) * 0.006 * order;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.x += p.vx;
          p.y += p.vy;
          if (order > 0.9) {
            // Nearly sorted: settle into the row instead of drifting in.
            p.x += (t.x - p.x) * 0.12;
            p.y += (t.y - p.y) * 0.12;
          }
          if (order < 0.5) {
            if (p.x < -140) p.x = w + 60;
            if (p.x > w + 160) p.x = -120;
            if (p.y < top - 20) p.vy += 0.6;
            if (p.y > bottom + 20) p.vy -= 0.6;
          }
          const red = p.w.tone === "red";
          if (!sorted) {
            cx.save();
            cx.globalAlpha = p.first ? 1 : Math.max(0, 1 - order * 1.3);
            cx.translate(p.x, p.y);
            cx.rotate((1 - order) * Math.sin(p.a) * 0.09);
            cx.font = `600 15px ${font}`;
            const tw = cx.measureText(p.w.chaos).width;
            cx.fillStyle = "rgba(11,11,11,.85)";
            cx.strokeStyle = red ? "rgba(248,113,113,.7)" : "#2c2c2c";
            cx.lineWidth = 1;
            cx.beginPath();
            cx.roundRect(-10, -19, tw + 20, 28, 8);
            cx.fill();
            cx.stroke();
            cx.fillStyle = red ? "#fca5a5" : "#cfcdc7";
            cx.fillText(p.w.chaos, 0, 0);
            cx.restore();
            const sp = Math.hypot(p.vx, p.vy);
            if (sp > 2.4) {
              cx.strokeStyle = "rgba(248,113,113,.28)";
              cx.beginPath();
              cx.moveTo(p.x - p.vx * 9, p.y - p.vy * 9);
              cx.lineTo(p.x, p.y);
              cx.stroke();
            }
          } else if (p.first) {
            cx.font = `500 14px ${font}`;
            cx.fillStyle = acc;
            cx.fillText("✓", p.x, p.y);
            cx.fillStyle = "#e9e7e1";
            cx.fillText(p.w.chaos, p.x + 18, p.y);
            const tw = cx.measureText(p.w.chaos).width;
            cx.fillStyle = acc;
            cx.font = `500 12px ${font}`;
            if (cols === 1) cx.fillText(p.w.status, p.x + 18, p.y + rowHeight(1) - 26);
            else cx.fillText(p.w.status, p.x + 18 + tw + 10, p.y);
          }
        }
      }
      if (!document.hidden) frame = requestAnimationFrame(draw);
    };
    const onVisibility = () => {
      if (!document.hidden && !frame) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", size);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      trigger.kill();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", size);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [calm, choice]);

  const sortForMe = () => {
    const s = state.current;
    // Bring the visitor to where the rows live, clear of the headline.
    const sortEl = sortRef.current;
    if (sortEl) {
      const end = sortEl.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
      window.scrollTo({ top: Math.max(0, end), behavior: "smooth" });
    }
    const tween = { v: s.forced };
    gsap.to(tween, {
      v: 1,
      duration: 1.6,
      ease: "power2.inOut",
      onUpdate: () => {
        s.forced = tween.v;
        s.apply(s.order);
      },
    });
  };

  return (
    <>
      <section
        ref={heroRef}
        id="night"
        aria-labelledby="night-title"
        className={`relative z-[2] flex touch-pan-y touch-pinch-zoom flex-col px-[5vw] ${calm ? "min-h-[100svh] pt-[12vh] pb-16" : "h-[100svh] pt-[12vh]"}`}
      >
        <p className="text-ink-muted text-[11px] font-semibold tracking-[0.12em] uppercase">FreeFlow · one night</p>
        <h1
          id="night-title"
          className="mt-[2vh] text-[clamp(40px,7.6vw,132px)] leading-[0.88] font-black tracking-[-0.045em] uppercase"
        >
          {choicePrefix(choice)}
          <span className="whitespace-nowrap">
            <JobWord />,
          </span>
          <br />
          and it&apos;s all
          <br />
          in my{" "}
          <em className="font-[family-name:var(--font-display-serif)] font-normal text-[var(--job)] normal-case">head.</em>
        </h1>
        <div ref={controlsRef} className="mt-[3vh] flex flex-wrap items-center gap-3.5">
          {calm ? (
            <p className="text-ink-muted text-[13px]">Here is all of it, with a place for each.</p>
          ) : (
            <p className="text-ink-muted text-[13px] opacity-80">Move through the mess. Then scroll.</p>
          )}
          {!calm && (
            <button
              type="button"
              onClick={sortForMe}
              className="absolute -left-[9999px] border border-[#333] bg-black/50 px-3 py-2 text-[13px] font-semibold focus:static focus:left-auto"
            >
              Sort it for me
            </button>
          )}
        </div>
        <ul className={calm ? "mt-8 flex max-w-5xl flex-col gap-2 text-sm sm:grid sm:grid-cols-2" : "sr-only"}>
          {worries.map((w) => (
            <li key={w.id} className="flex flex-wrap gap-x-2">
              <span aria-hidden className="text-[var(--job)]">
                ✓
              </span>
              <span className="text-[#e9e7e1]">{w.chaos}</span>
              <span className="text-xs text-[var(--job)]">
                <span className="sr-only"> — </span>
                {w.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {!calm && (
        <>
          <div ref={sortRef} aria-hidden className="h-[130vh] touch-pan-y touch-pinch-zoom" />
          <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[1] h-screen w-screen" />
          <div
            ref={meterRef}
            aria-hidden
            className="text-ink-muted pointer-events-none fixed right-[4vw] bottom-[5vh] z-30 text-right text-[11px] font-semibold tracking-[0.1em] uppercase opacity-0 motion-safe:transition-opacity motion-safe:duration-500"
          >
            on your mind
            <b ref={countRef} className="numeric block text-[44px] tracking-[-0.03em] text-[var(--ink,#f2f0ea)] normal-case">
              {FIELD_CARDS}
            </b>
          </div>
        </>
      )}
    </>
  );
}
