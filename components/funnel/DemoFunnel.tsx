"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { clockFor } from "@/lib/funnel/clock";
import { moodFor } from "@/lib/funnel/mood";
import { JobProvider } from "@/components/funnel/JobContext";
import { serif } from "@/components/funnel/fonts";
import Contours from "@/components/funnel/Contours";
import HeroField from "@/components/funnel/HeroField";
import FlowsPin from "@/components/funnel/FlowsPin";
import ChapterWalkthrough from "@/components/funnel/ChapterWalkthrough";
import ChapterStory from "@/components/funnel/ChapterStory";
import ChapterProof from "@/components/funnel/ChapterProof";
import Game from "@/components/funnel/Game";
import EndBand from "@/components/funnel/EndBand";
import FunnelFooter from "@/components/funnel/FunnelFooter";
import StickyCta from "@/components/funnel/StickyCta";

/*
  /demo: FreeFlow's one landing page, told as one night from 11:47 pm to
  8:00 am. Also what a signed-out visitor sees at /.

  The night's worries drift and sort (HeroField), "NOW IT ALL flows.", how
  each worry finds its place (walkthrough), the founder's story, proof that
  people were listened to, the game, then morning: START FREE.

  Behind it all, contour lines calm as you scroll; the story clock and the
  morning light follow the scroll too, written straight to the DOM so
  scrolling never re-renders the chapters. Smooth scrolling (Lenis, driving
  GSAP's ScrollTrigger) is skipped under prefers-reduced-motion and torn
  down when the page is left. Works with no database and no AI key.
*/

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
      root.style.setProperty("--morning", moodFor(progress).morning.toFixed(3));
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.085 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${serif.variable} relative overflow-x-clip text-[#f2f0ea]`}
      style={{ "--morning": 0 } as React.CSSProperties}
    >
      <Contours rootRef={rootRef} />
      {/* Morning: warm light rising from the bottom. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(252,211,77,0.28),transparent_60%)]"
        style={{ opacity: "var(--morning)" }}
      />

      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#0a0a0acc] to-transparent">
        <div className="flex items-center justify-between gap-3 px-[4vw] py-3.5">
          <p className="text-ink-muted numeric text-xs font-semibold tracking-[0.1em] uppercase">
            Tuesday · <span ref={clockRef}>{clockFor(0)}</span>
          </p>
          <StickyCta />
        </div>
      </div>

      <HeroField />
      <FlowsPin />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <ChapterWalkthrough />
      </div>
      <ChapterStory />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <ChapterProof />
        <Game />
      </div>
      <EndBand />
      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <FunnelFooter />
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
