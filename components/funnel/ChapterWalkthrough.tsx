import Link from "next/link";
import { WALKTHROUGH, type WalkthroughStep } from "@/lib/funnel/walkthrough";

/*
  /demo chapter 2, midnight: every worry has a place. (Interest.)

  Each numbered step takes one worry from the night and shows the built
  feature that answers it, with a one-line benefit and a small sample of what
  it looks like, labelled "Sample". Only built features appear here
  (lib/funnel/walkthrough.ts is tested against lib/product/features.ts).
*/

const AREAS: { id: WalkthroughStep["area"]; label: string }[] = [
  { id: "money", label: "Money" },
  { id: "paperwork", label: "Paperwork & tax" },
  { id: "organization", label: "Organization" },
];

// Steps are numbered straight through all three areas.
const ORDER = AREAS.flatMap((a) => WALKTHROUGH.filter((s) => s.area === a.id));

export default function ChapterWalkthrough() {
  return (
    <section id="walkthrough" aria-labelledby="walkthrough-title" className="py-16">
      <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Chapter 2</p>
      <h2 id="walkthrough-title" className="mt-2 text-3xl font-semibold tracking-tight">
        Every worry has a place.
      </h2>
      <p className="text-ink-muted mt-2 max-w-2xl">Here&rsquo;s where each one went, and what FreeFlow does with it.</p>

      <div className="mt-8 flex flex-col gap-10">
        {AREAS.map((area) => (
          <div key={area.id}>
            <h3 className="text-sm font-semibold text-[var(--job)]">{area.label}</h3>
            <ol className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {WALKTHROUGH.filter((s) => s.area === area.id).map((s) => {
                const n = ORDER.indexOf(s) + 1;
                return (
                  <li key={s.featureName} className="border-hairline bg-surface flex gap-4 rounded-xl border px-5 py-4">
                    <span className="numeric text-ink-faint w-5 shrink-0 pt-0.5 text-xs">{n}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-faint text-sm line-through decoration-[var(--color-status-overdue)]/60">
                        {s.worry}
                      </p>
                      <p className="mt-1 text-[15px] font-semibold">{s.featureName}</p>
                      <p className="text-ink-muted mt-1 text-sm leading-relaxed">{s.benefit}</p>
                      <div className="border-hairline mt-3 flex items-center gap-2 rounded-lg border bg-black px-3 py-2 text-xs">
                        <span className="bg-raised text-ink-faint rounded px-1.5 py-0.5 text-[10px] tracking-[0.06em] uppercase">Sample</span>
                        <span className="min-w-0 truncate text-[#d4d4d4]">{s.sample}</span>
                      </div>
                      <Link href={s.href} className="text-ink-muted hover:text-ink mt-2 inline-block text-xs underline-offset-4 hover:underline">
                        See it →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
