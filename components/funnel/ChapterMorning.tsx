"use client";

import Link from "next/link";
import { COPY } from "@/lib/funnel/copy";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";
import LaunchListForm from "@/components/funnel/LaunchListForm";

/*
  /demo chapter 6, 8:00 am: morning. (Action.)

  The one thing to do: use FreeFlow, free, now. Secondary and optional: hear
  when the lifetime version launches. No price, because there isn't one yet.
*/

export default function ChapterMorning() {
  const { job } = useJob();
  return (
    <section id="morning" aria-labelledby="morning-title" className="py-20">
      <p className="text-ink-faint numeric text-[11px] tracking-[0.08em] uppercase">8:00 am · Chapter 6</p>
      <h2 id="morning-title" className="mt-2 max-w-2xl text-[clamp(28px,4vw,44px)] leading-tight font-semibold tracking-tight">
        Morning. Everything has a place, and you slept.
      </h2>
      <p className="text-ink-muted mt-3 max-w-xl">
        Your projects, deadlines and money in one place, made by a freelancer who has been there. Free while it grows.
      </p>
      <div className="mt-7 flex flex-col items-start gap-6">
        <Link
          href="/signup"
          onClick={() => track("try_free_click", job)}
          className="focus-visible:ring-ink rounded-xl bg-[var(--job)] px-6 py-3.5 text-lg font-bold text-black focus-visible:ring-2 focus-visible:outline-none"
        >
          {COPY.useFree}
        </Link>
        <LaunchListForm source="morning" />
      </div>
    </section>
  );
}
