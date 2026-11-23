import { BUGS, TESTER_SESSIONS } from "@/lib/venture/testing";

/*
  /docs testing summary: Week 6's five outside testers. One card per tester
  shows what they tried; opening it lists what they asked to change and how
  each one was fixed. Native <details>, like the week-by-week timeline, so it
  works with no JavaScript, by keyboard and on touch. Testers are never named.
*/

export default function TestingSummary() {
  const fixed = BUGS.filter((b) => b.fixed).length;
  const allFixed = fixed === BUGS.length;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed">
        <span className="numeric font-semibold">{TESTER_SESSIONS.length}</span> testers raised{" "}
        <span className="numeric font-semibold">{BUGS.length}</span> issues between Nov 1 and Nov 15.{" "}
        <span className="text-[var(--color-status-sent)]">
          {allFixed ? "Every one has been fixed." : `${fixed} fixed so far.`}
        </span>
      </p>

      <ol className="flex flex-col gap-3">
        {TESTER_SESSIONS.map((s) => (
          <li key={s.tester}>
            <details className="group border-hairline bg-surface rounded-xl border">
              <summary className="focus-visible:ring-accent flex cursor-pointer list-none items-start gap-4 rounded-xl px-5 py-4 focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                <span className="text-ink-faint numeric w-14 shrink-0 pt-0.5 text-xs tracking-[0.06em] uppercase">
                  {s.date}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold">
                    {s.tester} · {s.role}
                    <span className="text-ink-faint font-normal"> · {s.device}</span>
                  </span>
                  <span className="text-ink-muted mt-1 block text-sm leading-relaxed">{s.tried}</span>
                  <span className="mt-2 block text-sm">
                    <span className="text-[var(--color-status-sent)]">
                      {s.issues.length} of {s.issues.length} fixed
                    </span>
                  </span>
                </span>
                <span aria-hidden className="text-ink-faint pt-0.5 text-sm group-open:rotate-90 motion-safe:transition-transform">
                  ›
                </span>
              </summary>
              <div className="border-hairline border-t px-5 py-4 sm:pl-[5.5rem]">
                <h4 className="text-ink-faint text-[11px] font-medium tracking-[0.06em] uppercase">
                  What they asked to change, and the fix
                </h4>
                <ul className="mt-2 flex flex-col gap-3 text-sm leading-relaxed">
                  {s.issues.map((issue) => (
                    <li key={issue.asked}>
                      <span className="block text-[#e5e5e5]">{issue.asked}</span>
                      <span className="text-ink-muted block">
                        <span className="text-[var(--color-status-sent)]">Fixed: </span>
                        {issue.fix}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}
