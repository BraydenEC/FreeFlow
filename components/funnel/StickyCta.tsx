"use client";

import Link from "next/link";
import { COPY } from "@/lib/funnel/copy";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";

/*
  "Try FreeFlow free", always within reach on /demo. Goes to sign-up and
  records an anonymous try-free click (fire-and-forget).
*/

export default function StickyCta() {
  const { job } = useJob();
  return (
    <Link
      href="/signup"
      onClick={() => track("try_free_click", job)}
      className="focus-visible:ring-ink shrink-0 rounded-lg bg-[var(--job)] px-3.5 py-2 text-sm font-bold text-black focus-visible:ring-2 focus-visible:outline-none motion-safe:transition-colors"
    >
      {COPY.tryFree}
    </Link>
  );
}
