import { TIMELINE } from "@/lib/venture/timeline";

/*
  /docs timeline: one card per week, with what was built and the decision that
  mattered. Expanding a card shows the iterations and how it was tested.
  Native <details>, so it works with no JavaScript, by keyboard and on touch.
*/

export default function WeekTimeline() {
  return (
    <ol className="flex flex-col gap-3">
      {TIMELINE.map((w) => (
        <li key={w.week}>
          <details className="group border-hairline bg-surface rounded-xl border">
            <summary className="focus-visible:ring-accent flex cursor-pointer list-none items-start gap-4 rounded-xl px-5 py-4 focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
              <span className="text-ink-faint numeric w-14 shrink-0 pt-0.5 text-xs tracking-[0.06em] uppercase">
                Week {w.week}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{w.title}</span>
                <span className="text-ink-muted mt-1 block text-sm leading-relaxed">{w.built}</span>
                <span className="mt-2 block text-sm leading-relaxed">
                  <span className="text-ink-faint">Decision: </span>
                  {w.decision}
                </span>
              </span>
              <span aria-hidden className="text-ink-faint pt-0.5 text-sm group-open:rotate-90 motion-safe:transition-transform">
                ›
              </span>
            </summary>
            <div className="border-hairline border-t px-5 py-4 sm:pl-[5.5rem]">
              <h4 className="text-ink-faint text-[11px] font-medium tracking-[0.06em] uppercase">What changed</h4>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-[#e5e5e5]">
                {w.iterations.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <h4 className="text-ink-faint mt-4 text-[11px] font-medium tracking-[0.06em] uppercase">How it was tested</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#e5e5e5]">{w.tests}</p>
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}
