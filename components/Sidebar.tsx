"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

/*
  Section navigation.

  Week 0 shipped this with an icon per item and a collapsed 64px rail on
  phones. Both are gone. The interface is typographic now — small uppercase
  labels, no icons — which is what the mockup this follows uses, and the rail
  is replaced by a scroller in the top bar, because a phone should spend its
  width on content rather than on chrome that repeats what the page title
  already says.

  Settings and the account block used to live at the bottom here. They moved
  to the top bar, where they belong: they are properties of the application,
  not sections of it.

  Items with no `href` stay inert rather than hidden. That rule has held since
  Week 0 — a nav item leads somewhere or is visibly disabled.
*/

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-hairline bg-surface hidden w-52 shrink-0 border-r md:block">
      <nav aria-label="Main" className="flex flex-col gap-0.5 p-3">
        {NAV_ITEMS.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`focus-visible:ring-accent rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                pathname === item.href
                  ? "bg-raised text-ink"
                  : "text-ink-muted hover:text-ink hover:bg-raised/50"
              }`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              className="text-ink-faint/60 cursor-not-allowed px-3 py-2 text-[13px] font-medium"
            >
              {item.label}
            </span>
          ),
        )}
      </nav>
    </aside>
  );
}
