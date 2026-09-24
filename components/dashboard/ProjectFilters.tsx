"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PAYMENT_OPTIONS,
  STATUS_OPTIONS,
  type PaymentFilter,
  type StatusFilter,
} from "@/lib/projects/filter";

/*
  The filter bar.

  State lives in the URL, not in this component, so a filtered view is
  shareable and survives a refresh — the same choice the research tabs made.
  The filtering itself happens on the server, which keeps the table a server
  component and means the row count in its header is always the real one.

  The text input is the reason this is not simply three links. Pushing a route
  change per keystroke would round-trip the server on every letter, so the
  input holds its own value and pushes after a pause. The selects push
  immediately, because a select changes once.
*/

const DEBOUNCE_MS = 300;

export default function ProjectFilters({
  query,
  status,
  payment,
  total,
  showing,
}: {
  query: string;
  status: StatusFilter;
  payment: PaymentFilter;
  total: number;
  showing: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Seeded from the URL and then owned locally, so typing stays responsive
  // while the server catches up.
  const [text, setText] = useState(query);

  function push(next: Record<string, string>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === "" || v === "all") p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (text === query) return;
    const t = setTimeout(() => push({ q: text }), DEBOUNCE_MS);
    return () => clearTimeout(t);
    // push is stable enough for this; re-running on params would fight the
    // debounce every time the URL it just set comes back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, query]);

  const active = query.trim() !== "" || status !== "all" || payment !== "all";

  const control =
    "bg-raised border-hairline text-ink focus-visible:ring-accent rounded-lg border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="project-search">
        Search projects
      </label>
      <input
        id="project-search"
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search projects or clients"
        className={`${control} min-w-0 flex-1 sm:max-w-64`}
      />

      <label className="sr-only" htmlFor="project-status">
        Stage
      </label>
      <select
        id="project-status"
        value={status}
        onChange={(e) => push({ status: e.target.value })}
        className={control}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="project-payment">
        Payment
      </label>
      <select
        id="project-payment"
        value={payment}
        onChange={(e) => push({ payment: e.target.value })}
        className={control}
      >
        {PAYMENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {active && (
        <>
          <span className="text-ink-faint numeric text-xs" aria-live="polite">
            {showing} of {total}
          </span>
          <button
            type="button"
            onClick={() => {
              setText("");
              push({ q: "", status: "all", payment: "all" });
            }}
            className="text-ink-faint hover:text-ink text-xs underline-offset-4 hover:underline"
          >
            Clear
          </button>
        </>
      )}
    </div>
  );
}
