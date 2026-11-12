"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STORY } from "@/lib/funnel/story";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";

/*
  /demo, 1 am: quiet. The founder's story in the first person, in a large
  serif, the mission and promise in white. Below it, behind the last lines,
  a loose line in the accent colour draws itself as the story scrolls into
  view (already drawn under prefers-reduced-motion). Signed "— Brayden",
  then the P.S. Reading to the end is recorded once as "story_complete".
*/

const LINE =
  "M20 150 C 90 40, 150 40, 140 120 S 120 200, 190 140 S 260 60, 300 120 S 330 170, 360 110 S 420 70, 440 130 S 500 170, 540 100 S 610 60, 680 90";

export default function ChapterStory() {
  const { trackJob } = useJob();
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const endRef = useRef<HTMLParagraphElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || tracked.current) return;
        tracked.current = true;
        track("story_complete", trackJob);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trackJob]);

  useEffect(() => {
    const path = pathRef.current;
    const section = sectionRef.current;
    if (!path || !section) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.strokeDashoffset = "0";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.fromTo(
      path,
      { strokeDashoffset: length },
      { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: section, start: "top 40%", end: "center 30%", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const [psLabel, psEmail] = STORY.ps.split(": ");

  return (
    <section
      ref={sectionRef}
      id="story"
      aria-labelledby="story-title"
      className="relative z-[2] grid min-h-[120vh] place-items-center px-[6vw] py-[12vh]"
    >
      <div className="relative max-w-[820px]">
        <h2 id="story-title" className="sr-only">
          Why I built FreeFlow
        </h2>
        <div className="font-[family-name:var(--font-display-serif)] text-[clamp(22px,2.6vw,36px)] leading-[1.4] text-[#d9d7d1]">
          {STORY.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="relative z-[1] mb-[0.6em]">
              {p}
            </p>
          ))}
          <p className="relative z-[1] mb-[0.6em] text-white">
            {STORY.mission} {STORY.promise}
          </p>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 700 220"
          className="pointer-events-none relative z-0 -mt-[2.1em] -mb-[1.2em] block h-auto w-full overflow-visible opacity-55 mix-blend-screen"
        >
          <path ref={pathRef} d={LINE} fill="none" stroke="var(--job)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p ref={endRef} className="text-ink-muted relative z-[1] mt-[1.4em] text-[13px] tracking-[0.12em] uppercase">
          — Brayden
        </p>
        <p className="text-ink-muted relative z-[1] mt-4 text-sm">
          {psLabel}:{" "}
          <a href={`mailto:${psEmail}`} className="text-white underline-offset-4 hover:underline">
            {psEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
