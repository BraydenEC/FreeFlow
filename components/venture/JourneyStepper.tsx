"use client";

import { useState } from "react";
import { JOURNEY } from "@/lib/venture/journey";

/*
  The journey: the agent map at the top of /docs.

  One line from Start to Now with a numbered dot per step, a fill that shows
  how far along you are, and one card at a time. Dots are buttons; Back/Next
  and the arrow keys move between steps. Each card names what powers that
  step (Claude with a fallback, plain rules, or you approving).
*/

export default function JourneyStepper() {
  const [i, setI] = useState(0);
  const last = JOURNEY.length - 1;
  const step = JOURNEY[i];
  const go = (k: number) => setI(Math.max(0, Math.min(last, k)));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(i + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(i - 1);
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      <div className="relative px-1" role="group" aria-label="Steps of the journey">
        <div aria-hidden className="bg-hairline absolute top-[13px] right-[18px] left-[18px] h-0.5" />
        <div
          aria-hidden
          className="absolute top-[13px] left-[18px] h-0.5 bg-[var(--color-status-progress)] motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `calc((100% - 36px) * ${i / last})` }}
        />
        <ol className="relative flex justify-between">
          {JOURNEY.map((s, k) => {
            const on = k === i;
            const done = k < i;
            return (
              <li key={s.n} className="flex w-7 flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(k)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`Step ${s.n}: ${s.name}`}
                  className={`focus-visible:ring-accent flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-semibold focus-visible:ring-2 focus-visible:outline-none motion-safe:transition-all ${
                    on
                      ? "scale-110 border-[var(--color-status-progress)] bg-[var(--color-status-progress)] text-black"
                      : done
                        ? "border-[var(--color-status-progress)] bg-black text-[var(--color-status-progress)]"
                        : "border-hairline text-ink-muted bg-black"
                  }`}
                >
                  {s.n}
                </button>
                <span
                  aria-hidden
                  className={`text-[11px] whitespace-nowrap ${on ? "text-ink block" : "text-ink-muted hidden sm:block"}`}
                >
                  {s.name}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="text-ink-faint mt-1.5 flex justify-between text-[11px] tracking-[0.06em] uppercase">
        <span>Start</span>
        <span>Now</span>
      </div>

      <article
        key={step.n}
        aria-live="polite"
        className="border-hairline mt-6 rounded-2xl border p-5 sm:p-6 motion-safe:animate-[fade-up_0.35s_ease-out]"
      >
        <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
          {step.week} · step {step.n} of {JOURNEY.length}
        </p>
        <h3 className="mt-1.5 mb-4 text-2xl font-semibold tracking-tight">{step.name}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["What it was for", step.purpose],
            ["What was built", step.built],
            ["What changed", step.changed],
          ].map(([h, p]) => (
            <div key={h}>
              <h4 className="text-ink-faint mb-1 text-[11px] font-medium tracking-[0.06em] uppercase">{h}</h4>
              <p className="text-sm leading-relaxed text-[#e5e5e5]">{p}</p>
            </div>
          ))}
        </div>
        <p className="text-ink-muted mt-4 text-xs">{step.poweredBy}</p>
      </article>

      <div className="mt-3 flex justify-between">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="border-hairline focus-visible:ring-accent rounded-lg border px-3.5 py-2 text-sm disabled:opacity-30 focus-visible:ring-2 focus-visible:outline-none"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === last}
          className="border-hairline focus-visible:ring-accent rounded-lg border px-3.5 py-2 text-sm disabled:opacity-30 focus-visible:ring-2 focus-visible:outline-none"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
