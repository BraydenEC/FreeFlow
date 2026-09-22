"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SUB_NAV } from "@/lib/nav";

/*
  The sidebar: sections of the page you are on.

  Two kinds of destination, and the difference is invisible to the reader.
  On the dashboard these are anchors to widgets. On /research and /pricing
  they are "?tab=" links, which the existing Tabs component already reads from
  the URL — so moving tab selection into the sidebar needed no new state, only
  a link. The tab row is still rendered below md, where there is no sidebar.

  Renders nothing on pages with no sub-sections, so /core and /product get the
  full width rather than an empty column.
*/

export default function SubNav() {
  const pathname = usePathname();
  const search = useSearchParams();
  const items = SUB_NAV[pathname];

  if (!items) return null;

  // Tab links carry their own active state; anchors have none to compute.
  const activeTab = search.get("tab") ?? items[0]?.href.split("=")[1];

  return (
    <aside className="border-hairline hidden w-48 shrink-0 border-r md:block">
      <nav aria-label="Page sections" className="flex flex-col gap-0.5 p-3">
        {items.map((item) => {
          const isTab = item.href.startsWith("?tab=");
          const isActive = isTab && item.href.endsWith(`=${activeTab}`);
          return (
            <Link
              key={item.label}
              href={item.href}
              scroll={!isTab}
              aria-current={isActive ? "true" : undefined}
              className={`focus-visible:ring-accent rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                isActive
                  ? "bg-raised text-ink font-medium"
                  : "text-ink-muted hover:text-ink hover:bg-raised/50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
