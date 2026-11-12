"use client";

import Link from "next/link";
import { COPY } from "@/lib/funnel/copy";
import { track } from "@/lib/funnel/track";
import { useJob } from "@/components/funnel/JobContext";

/*
  "Try FreeFlow free", always within reach on /demo: plain uppercase text in
  a thin square frame. Goes to sign-up and records an anonymous try-free
  click (fire-and-forget).
*/

export default function StickyCta() {
  const { trackJob } = useJob();
  return (
    <Link
      href="/signup"
      onClick={() => track("try_free_click", trackJob)}
      className="shrink-0 border border-[#3a3a3a] px-3.5 py-2.5 text-[11px] font-semibold tracking-[0.16em] text-[#f2f0ea] uppercase hover:border-[var(--job)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--job)] motion-safe:transition-colors"
    >
      {COPY.tryFree}
    </Link>
  );
}
