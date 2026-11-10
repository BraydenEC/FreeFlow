"use client";

import { useState } from "react";
import { PROMPTS } from "@/lib/venture/prompts";

/*
  /docs prompt library: the prompts the owner gave the coding agent, quoted as
  written (typos kept), filterable by week with chips.
*/

const WEEKS = [...new Set(PROMPTS.map((p) => p.week))].sort((a, b) => a - b);

export default function PromptLibrary() {
  const [week, setWeek] = useState<number | null>(null);
  const shown = week === null ? PROMPTS : PROMPTS.filter((p) => p.week === week);

  const chip = (active: boolean) =>
    `focus-visible:ring-accent rounded-full border px-3 py-1 text-xs focus-visible:ring-2 focus-visible:outline-none ${
      active ? "border-ink bg-ink text-app font-medium" : "border-hairline text-ink-muted hover:text-ink"
    }`;

  return (
    <div>
      <div role="group" aria-label="Filter prompts by week" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={week === null} onClick={() => setWeek(null)} className={chip(week === null)}>
          All
        </button>
        {WEEKS.map((w) => (
          <button key={w} type="button" aria-pressed={week === w} onClick={() => setWeek(w)} className={chip(week === w)}>
            Week {w}
          </button>
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {shown.map((p) => (
          <li key={`${p.week}-${p.title}`} className="border-hairline bg-surface rounded-xl border px-5 py-4">
            <p className="text-ink-faint text-[11px] tracking-[0.06em] uppercase">
              Week {p.week} · {p.title}
            </p>
            <blockquote className="mt-2 font-mono text-[13px] leading-relaxed text-[#e5e5e5]">“{p.text}”</blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
