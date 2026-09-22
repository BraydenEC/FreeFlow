"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId } from "react";

/*
  Tabs that hide rather than unmount.

  Inactive panels stay in the DOM with `hidden`, which removes them from the
  accessibility tree and from view but not from the HTML. That is deliberate:
  every content check in the Week 2 and 3 test evidence reads the rendered
  page, and those counts must not change because a section moved behind a
  tab.

  The active tab is carried in the URL so a specific section is linkable, and
  the server passes the initial value so first paint is correct.
*/

export type Tab = { id: string; label: string; content: React.ReactNode };

export default function Tabs({
  tabs,
  initial,
  param = "tab",
}: {
  tabs: Tab[];
  initial: string;
  param?: string;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const base = useId();

  const fromUrl = search.get(param);
  const active = tabs.some((t) => t.id === fromUrl) ? fromUrl! : initial;

  function select(id: string) {
    const next = new URLSearchParams(search.toString());
    next.set(param, id);
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  return (
    <div>
      <div
        role="tablist"
        className="border-hairline bg-surface flex flex-wrap gap-1 rounded-lg border p-1 md:hidden"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`${base}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${base}-panel-${t.id}`}
            onClick={() => select(t.id)}
            className={`focus-visible:ring-accent flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              active === t.id
                ? "bg-accent/15 text-accent-soft"
                : "text-ink-muted hover:bg-raised/50 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          className={active === t.id ? "page-stack pt-0" : "hidden"}
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
