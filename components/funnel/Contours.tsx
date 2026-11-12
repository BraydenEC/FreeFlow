"use client";

import { useEffect, useRef } from "react";
import { moodFor } from "@/lib/funnel/mood";

/*
  The /demo background: fifteen faint contour lines behind the whole page,
  tangled at the top (the night's stress) and calming into slow waves as you
  scroll. How tangled they are follows the page's mood (moodFor().stress).
  Under prefers-reduced-motion they are drawn once, calm and still. Drawing
  pauses while the tab is hidden.
*/

const LINES = 15;

function pathFor(i: number, chaos: number, t: number): string {
  const y0 = 30 + i * 60;
  let d = "";
  for (let x = -40; x <= 1480; x += 12) {
    const n =
      Math.sin(x * 0.009 + i * 1.7 + t * 0.15) * 30 +
      Math.sin(x * 0.043 + i * 3.1 + t * 0.4) * chaos * 44 +
      Math.sin(x * 0.11 + i) * chaos * 18;
    d += `${x < 0 ? "M" : "L"}${x} ${(y0 + n).toFixed(1)} `;
  }
  return d;
}

export default function Contours({ rootRef }: { rootRef: React.RefObject<HTMLElement | null> }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = Array.from(svg.querySelectorAll("path"));
    const draw = (chaos: number, t: number) => paths.forEach((p, i) => p.setAttribute("d", pathFor(i, chaos, t)));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0, 0);
      return;
    }

    let frame = 0;
    let t = 0;
    const tick = () => {
      t += 0.016;
      const root = rootRef.current;
      let progress = 0;
      if (root) {
        const rect = root.getBoundingClientRect();
        progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - window.innerHeight)));
      }
      draw(moodFor(progress).stress, t);
      frame = requestAnimationFrame(tick);
    };
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [rootRef]);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none fixed inset-0 z-0 size-full"
    >
      {Array.from({ length: LINES }, (_, i) => (
        <path key={i} fill="none" stroke="#262626" strokeWidth={1} />
      ))}
    </svg>
  );
}
