"use client";

import Link from "next/link";
import { COPY } from "@/lib/funnel/copy";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";
import LaunchListForm from "@/components/funnel/LaunchListForm";

/*
  /demo's ending, 8:00 am: one thing to do. A full-width band between
  hairlines, "START FREE · now →", that fills with the accent colour from
  below on hover or focus. Free while it grows, and no price, because there
  isn't one yet. The launch list sits quietly underneath.
*/

export default function EndBand() {
  const { trackJob } = useJob();
  return (
    <section id="morning" aria-labelledby="morning-title" className="relative z-[2] flex flex-col gap-[3vh] pt-[16vh]">
      <div className="px-[6vw]">
        <p className="text-ink-muted text-[11px] font-semibold tracking-[0.12em] uppercase">8:00 am · good morning</p>
        <h2 id="morning-title" className="text-ink-muted mt-[1vh] text-[13px] font-medium">
          {COPY.freeWhileItGrows}
        </h2>
      </div>
      <Link
        href="/signup"
        onClick={() => track("try_free_click", trackJob)}
        className="group relative flex items-center justify-between gap-[4vw] overflow-hidden border-y border-[#333] px-[6vw] py-[4vh] text-[#f2f0ea] focus-visible:outline-none"
      >
        <span
          aria-hidden
          className="absolute inset-0 translate-y-[101%] bg-[var(--job)] group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.7,0,0.2,1)]"
        />
        <span className="relative text-[clamp(44px,9vw,160px)] leading-[0.9] font-black tracking-[-0.05em] uppercase group-hover:text-black group-focus-visible:text-black motion-safe:transition-colors motion-safe:duration-400">
          {COPY.startFree}
        </span>
        <span className="relative font-[family-name:var(--font-display-serif)] text-[clamp(40px,7vw,120px)] whitespace-nowrap text-[var(--job)] italic group-hover:-translate-x-[1vw] group-hover:text-black group-focus-visible:text-black motion-safe:transition-[color,transform] motion-safe:duration-400">
          {COPY.startFreeTail}
        </span>
      </Link>
      <div className="mx-auto w-full max-w-5xl px-4 pt-[6vh] sm:px-6">
        <LaunchListForm source="morning" />
      </div>
    </section>
  );
}
