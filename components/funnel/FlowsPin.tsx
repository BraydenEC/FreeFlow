"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
  /demo, straight after the worries sort: "NOW IT ALL flows." pinned to the
  screen while you scroll through it. "NOW IT ALL" tightens into place, and
  "flows." fills with the accent colour from left to right, like ink. Under
  prefers-reduced-motion it is simply shown finished.
*/

// Ink on the left, grey on the right: sliding the background from 100% to
// 0% moves the edge across the word from left to right.
const INK =
  "linear-gradient(90deg, var(--job) 0%, var(--job) 50%, #2a2a2a 60%, #2a2a2a 100%)";

export default function FlowsPin() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !lineRef.current || !wordRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wordRef.current.style.backgroundPosition = "0% 0";
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true } });
    tl.fromTo(
      lineRef.current,
      { scale: 1.25, letterSpacing: "0.02em", opacity: 0.2 },
      { scale: 1, letterSpacing: "-0.045em", opacity: 1, ease: "none" },
    ).fromTo(wordRef.current, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", ease: "none" }, "<");
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} aria-label="Now it all flows" className="relative z-[2] h-[220vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden text-center">
        <p className="m-0 leading-[0.9]">
          <span
            ref={lineRef}
            className="block text-[clamp(48px,10vw,176px)] font-black tracking-[-0.045em] uppercase"
          >
            Now it all
          </span>
          <span
            ref={wordRef}
            className="block bg-clip-text px-[0.1em] font-[family-name:var(--font-display-serif)] text-[clamp(64px,13vw,230px)] leading-none tracking-[-0.02em] text-transparent italic"
            style={{ backgroundImage: INK, backgroundSize: "250% 100%", backgroundPosition: "100% 0" }}
          >
            flows.
          </span>
        </p>
      </div>
    </section>
  );
}
