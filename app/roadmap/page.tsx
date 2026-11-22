import Link from "next/link";
import Roadmap from "@/components/venture/Roadmap";
import { CONTACT_EMAIL } from "@/lib/site";
import { getServerSupabase } from "@/lib/supabase/server";
import { getVentureCounts } from "@/lib/venture/counts";
import { WHATS_NEW } from "@/lib/venture/whats-new";

/*
  /roadmap: what's coming (with upvotes) and what changed (newest first).

  The roadmap and its votes moved here from /docs, which was course material.
  Vote counts come from venture_counts(); with no database they show "–" and
  the page still renders.
*/

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Roadmap — FreeFlow",
  description: "What's coming to FreeFlow next, what you can vote for, and what changed recently.",
};

const day = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function RoadmapPage() {
  const counts = await getVentureCounts(await getServerSupabase());

  return (
    <main className="mx-auto max-w-5xl page-stack px-5 sm:px-8">
      <header className="max-w-2xl">
        <h1 className="page-title">Roadmap</h1>
        <p className="mt-3 text-2xl leading-snug font-semibold tracking-tight">What&rsquo;s coming, and what just changed.</p>
        <p className="text-ink-muted mt-3 text-sm leading-relaxed">
          Vote for what you want first: one vote per item. Something missing?{" "}
          <Link href="/chat" className="text-ink underline-offset-4 hover:underline">
            Ask the help desk
          </Link>{" "}
          or email{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=FreeFlow%20idea`} className="text-ink underline-offset-4 hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </header>

      <section aria-labelledby="coming-up">
        <h2 id="coming-up" className="text-ink-faint mb-3 text-[11px] font-semibold tracking-[0.08em] uppercase">
          Coming up
        </h2>
        <Roadmap votes={counts?.votes ?? null} />
      </section>

      <section id="whats-new" aria-labelledby="whats-new-title" className="max-w-3xl scroll-mt-20">
        <h2 id="whats-new-title" className="text-ink-faint text-[11px] font-semibold tracking-[0.08em] uppercase">
          What&rsquo;s new
        </h2>
        <ol className="border-hairline mt-3 divide-y divide-[var(--color-hairline)] border-y">
          {WHATS_NEW.map((c) => (
            <li key={`${c.date}-${c.title}`} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-6">
              <time dateTime={c.date} className="numeric text-ink-faint w-28 shrink-0 text-xs sm:pt-0.5">
                {day.format(new Date(`${c.date}T12:00:00Z`))}
              </time>
              <span className="text-ink-muted text-sm leading-relaxed">{c.title}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
