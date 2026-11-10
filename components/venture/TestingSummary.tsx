import { BUGS, TESTER_REQUESTS } from "@/lib/venture/testing";

/*
  /docs testing summary: what Week 6's external testers found and asked for,
  and the full-site regression result. Both lists stay empty until real
  testers have used FreeFlow; nothing is shown that didn't happen.
*/

// Filled in at the Week 6 regression run (plan Task 14).
const REGRESSION: string | null = null;

export default function TestingSummary() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="border-hairline bg-surface rounded-xl border px-5 py-4">
        <h3 className="text-sm font-semibold">Bugs testers found</h3>
        {BUGS.length === 0 ? (
          <p className="text-ink-muted mt-2 text-sm">Five people outside the project test FreeFlow this week. Their bugs land here.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {BUGS.map((b) => (
              <li key={b.id}>
                <span className={b.fixed ? "text-[var(--color-status-sent)]" : "text-ink-muted"}>
                  {b.fixed ? "Fixed" : "Open"}
                </span>{" "}
                · {b.found}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-hairline bg-surface rounded-xl border px-5 py-4">
        <h3 className="text-sm font-semibold">What testers asked for</h3>
        {TESTER_REQUESTS.length === 0 ? (
          <p className="text-ink-muted mt-2 text-sm">Added after the sessions, and onto the roadmap below.</p>
        ) : (
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm">
            {TESTER_REQUESTS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-hairline bg-surface rounded-xl border px-5 py-4">
        <h3 className="text-sm font-semibold">Full-site regression</h3>
        <p className="text-ink-muted mt-2 text-sm">
          {REGRESSION ?? "Every page checked signed out, signed in and on a phone before release. Results are added here."}
        </p>
      </div>
    </div>
  );
}
