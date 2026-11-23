import Link from "next/link";
import { CHANGES } from "@/lib/venture/changes";
import { BUGS } from "@/lib/venture/testing";
import type { VentureCounts } from "@/lib/venture/counts";

/*
  "FreeFlow in public": the venture's own numbers, on /dashboard.

  Aggregate counts only, read through venture_counts(); no row, name or
  address ever reaches this component. When the counts can't be read (no
  database, or the call failed) it says so rather than showing zeros, because
  a zero that is really "unknown" reads as a fact. The two numbers that live
  in the repo (changes shipped, testers' bugs) always show.
*/

const fmt = (n: number) => n.toLocaleString("en-US");

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-hairline bg-surface rounded-xl border px-5 py-4">
      <p className="text-ink-muted text-xs">{label}</p>
      <p className="numeric mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {note && <p className="text-ink-faint mt-1 text-xs">{note}</p>}
    </div>
  );
}

export default function PublicNumbers({ counts }: { counts: VentureCounts | null }) {
  const fixed = BUGS.filter((b) => b.fixed).length;

  return (
    <section aria-labelledby="public-heading" className="flex flex-col gap-4">
      <div>
        <h2 id="public-heading" className="text-[15px] font-semibold">
          Early days, and here&rsquo;s every number.
        </h2>
        <p className="text-ink-muted mt-1 max-w-2xl text-sm leading-relaxed">
          FreeFlow is built in public. These are counts, never names: nobody&rsquo;s details are
          shown here.
        </p>
      </div>

      {counts === null && (
        <p role="status" className="border-hairline text-ink-muted rounded-lg border px-4 py-3 text-sm">
          Live numbers are unavailable right now. The numbers below that come from the project&rsquo;s
          own records still show.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {counts && (
          <>
            <Stat label="People using FreeFlow" value={fmt(counts.users)} />
            <Stat label="On the launch list" value={fmt(counts.launchList)} />
          </>
        )}
        <Stat
          label="Things you asked for, shipped"
          value={fmt(CHANGES.length)}
          note="Each one traced to where it was said."
        />
        <Stat
          label="Bugs testers found / fixed"
          value={BUGS.length === 0 ? "—" : `${fmt(BUGS.length)} / ${fmt(fixed)}`}
          note={BUGS.length === 0 ? "Testing starts this week." : undefined}
        />
        {counts && (
          <>
            <Stat label="Game rounds played" value={fmt(counts.roundsPlayed)} />
            <Stat label="“Try free” clicks" value={fmt(counts.tryFreeClicks)} />
          </>
        )}
      </div>

      <p className="text-ink-muted text-sm">
        What should come next?{" "}
        <Link href="/docs#roadmap" className="text-ink underline-offset-4 hover:underline">
          Vote on the roadmap
        </Link>
        .
      </p>
    </section>
  );
}
