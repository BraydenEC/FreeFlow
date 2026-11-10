/*
  Navigation, in one place.

  Two levels:

    DOCK_GROUPS  every page, in the Dock at the bottom of the screen
                 (lib/nav/dock.ts, drawn by components/nav/Dock.tsx).
    SUB_NAV      the sections of the page you are on, in the sidebar.

  The Dock replaced the top bar's page links in Week 6; the top bar keeps only
  Settings and the account, top right.

  A page appears in SUB_NAV only if it genuinely has sub-sections. /core and
  /product do not, so they get no sidebar and their content spans the full
  width. A sidebar rendered empty to keep the columns even would be furniture
  pretending to be navigation — the same reason the Overdue widget only exists
  when something is overdue.
*/

export { DOCK_GROUPS } from "@/lib/nav/dock";

export type SubNavItem = {
  label: string;
  /** A "#id" anchor, or a "?tab=" link the Tabs component already reads. */
  href: string;
};

export const SUB_NAV: Record<string, SubNavItem[]> = {
  "/dashboard": [
    { label: "Overview", href: "#widget-metrics" },
    { label: "Projects", href: "#widget-projects" },
    { label: "Core", href: "#widget-core" },
    { label: "Research", href: "#widget-research" },
  ],
  "/research": [
    { label: "Competitors", href: "?tab=competitors" },
    { label: "Benchmarks", href: "?tab=benchmarks" },
    { label: "Risks", href: "?tab=risks" },
    { label: "Intake", href: "?tab=intake" },
  ],
  "/pricing": [
    { label: "Simulator", href: "?tab=simulator" },
    { label: "Tiers", href: "?tab=tiers" },
    { label: "Per-project", href: "?tab=project" },
    { label: "Assumptions", href: "?tab=assumptions" },
    { label: "Saved", href: "?tab=saved" },
  ],
  "/marketing": [
    { label: "Context", href: "#band-context" },
    { label: "Content", href: "#band-content" },
    { label: "Calendar", href: "#band-calendar" },
    { label: "A/B test", href: "#band-ab" },
    { label: "Saved", href: "#band-saved" },
  ],
};
