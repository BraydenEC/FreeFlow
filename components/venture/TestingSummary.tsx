import {
  ITERATION_LOG,
  REGRESSION,
  TESTER_FINDINGS,
  TESTER_SESSIONS,
  TESTING_METHOD,
} from "@/lib/venture/testing";

/*
  /docs Testing section, in three parts:
  1. Five external users: the method, then one card per tester (what they
     tried and liked; opened, what they asked to change and the fix). Native
     <details>, like the week-by-week timeline, so it works with no
     JavaScript, by keyboard and on touch. Testers are never named.
  2. The full-site regression test, as a check / result table.
  3. The iteration log: what changed after testing.
*/

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {children}
    </div>
  );
}

const FIXED = "text-[var(--color-status-sent)]";

export default function TestingSummary() {
  const allFixed = TESTER_FINDINGS.fixed === TESTER_FINDINGS.found;

  return (
    <div className="flex flex-col gap-10">
      <Sub title="5 external users">
        <p className="text-ink-muted max-w-2xl text-sm leading-relaxed">{TESTING_METHOD}</p>
        <p className="text-sm leading-relaxed">
          They raised <span className="numeric font-semibold">{TESTER_FINDINGS.found}</span> findings.{" "}
          <span className={FIXED}>
            {allFixed ? "Every one has been fixed." : `${TESTER_FINDINGS.fixed} fixed so far.`}
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
                    <span className="mt-2 block text-sm leading-relaxed">
                      <span className="text-ink-faint">Liked: </span>
                      {s.liked}
                    </span>
                    <span className={`mt-1 block text-sm ${FIXED}`}>All {s.issues.length} changes made</span>
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
                          <span className={FIXED}>Fixed: </span>
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
      </Sub>

      <Sub title="Full-site regression test">
        <p className="text-ink-muted max-w-2xl text-sm leading-relaxed">{REGRESSION.run}</p>
        <div className="border-hairline bg-surface overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-hairline border-b">
                <th scope="col" className="text-ink-faint px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase">
                  Check
                </th>
                <th scope="col" className="text-ink-faint px-5 py-3 text-[11px] font-medium tracking-[0.06em] uppercase">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {REGRESSION.checks.map((c) => (
                <tr key={c.check} className="border-hairline border-b last:border-b-0 align-top">
                  <th scope="row" className="w-[34%] px-5 py-3 font-medium break-words">
                    {c.check}
                  </th>
                  <td className="text-ink-muted px-5 py-3 leading-relaxed">{c.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub title="What changed after testing">
        <ol className="flex flex-col gap-3">
          {ITERATION_LOG.map((g, i) => (
            <li key={g.title} className="border-hairline bg-surface rounded-xl border px-5 py-4">
              <h4 className="text-[15px] font-semibold">
                <span className="text-ink-faint numeric mr-2">{i + 1}.</span>
                {g.title}
              </h4>
              <p className="text-ink-muted mt-1 text-sm leading-relaxed">{g.intro}</p>
              <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-[#e5e5e5]">
                {g.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              {g.more && (
                <>
                  <p className="text-ink-muted mt-3 text-sm leading-relaxed">{g.more.intro}</p>
                  <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-[#e5e5e5]">
                    {g.more.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ol>
      </Sub>
    </div>
  );
}
