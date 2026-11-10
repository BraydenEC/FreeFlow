"use client";

import { JOBS, JOB_ORDER } from "@/lib/funnel/jobs";
import { useJob } from "@/components/funnel/JobContext";

/*
  "What do you do?": five round swatches, one per job. Picking one re-colours
  /demo and swaps its examples. A keyboard press (detail 0) changes the colour
  without the wave, since there is no click point to spread from.
*/

export default function JobPicker() {
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
