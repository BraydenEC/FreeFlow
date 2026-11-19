import type { SubNavItem } from "@/lib/nav";

/*
  Which "?tab=" link the sidebar highlights.

  It must agree with the panel the page shows. The Tabs component falls back
  to the first tab when ?tab= names no tab (an old /pricing?tab=project link
  after that tab was hidden), so the sidebar falls back the same way. Pages
  whose sections are all anchors have no active tab.
*/
export function activeSubNavTab(items: SubNavItem[], tab: string | null): string | undefined {
  const ids = items.filter((i) => i.href.startsWith("?tab=")).map((i) => i.href.slice("?tab=".length));
  return tab !== null && ids.includes(tab) ? tab : ids[0];
}
