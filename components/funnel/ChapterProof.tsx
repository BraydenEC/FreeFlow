import Link from "next/link";
import { CHANGES } from "@/lib/venture/changes";

/*
  /demo chapter 4: you said, we changed. (Desire, as proof.)

  Real changes made because a real person said something, from
  lib/venture/changes.ts, where each entry cites the repo file that records it.
  Reported speech, never a quote, and nobody named: no testimonials, counts or
  logos. The last card is a clearly labelled invitation, not a fake entry.
*/

const when = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

export default function ChapterProof() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="py-16">
      <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Chapter 4</p>
      <h2 id="proof-title" className="mt-2 text-3xl font-semibold tracking-tight">
        You said. We changed it.
      </h2>
      <p className="text-ink-muted mt-2 max-w-2xl">
        Real changes, each traced to where it was said. No names, no made-up quotes.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CHANGES.map((c) => (
          <li key={c.id} className="border-hairline bg-surface flex flex-col gap-3 rounded-2xl border p-4 text-sm">
            <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">
              A freelancer friend · {when(c.date)}
            </p>
            <p className="leading-relaxed text-[#d4d4d4]">{c.said}</p>
            <p className="border-hairline border-t pt-3 leading-relaxed text-white">
              <span className="font-medium text-[var(--job)]">We changed: </span>
              {c.changed}
            </p>
          </li>
        ))}
        <li className="border-hairline text-ink-faint flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-center text-sm">
          <span>Your request could be next.</span>
          <Link href="/docs#roadmap" className="text-ink-muted hover:text-ink underline-offset-4 hover:underline">
            See and vote on the roadmap
          </Link>
        </li>
      </ul>
    </section>
  );
}
