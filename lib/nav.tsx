/*
  Navigation, in one place.

  Two levels, mirroring the interface this follows:

    PRIMARY_NAV  the application's sections, in the top bar, icon + label.
    SUB_NAV      the sections of the page you are on, in the sidebar.

  A page appears in SUB_NAV only if it genuinely has sub-sections. /core and
  /product do not, so they get no sidebar and their content spans the full
  width. A sidebar rendered empty to keep the columns even would be furniture
  pretending to be navigation — the same reason the Overdue widget only exists
  when something is overdue.

  Items with no href in PRIMARY_NAV stay inert rather than hidden. That rule
  has held since Week 0: a nav item leads somewhere or is visibly disabled.
*/

const iconProps = {
  className: "h-4 w-4 shrink-0",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
};

export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Core",
    href: "/core",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="3.25" />
        <path d="M12 2.75v3M12 18.25v3M21.25 12h-3M5.75 12h-3M18.36 5.64l-2.12 2.12M7.76 16.24l-2.12 2.12M18.36 18.36l-2.12-2.12M7.76 7.76 5.64 5.64" />
      </svg>
    ),
  },
  {
    label: "Research",
    href: "/research",
    icon: (
      <svg {...iconProps}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 4.5 4.5" />
      </svg>
    ),
  },
  {
    label: "Product",
    href: "/product",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7Z" />
        <path d="M3.5 7 12 11.5 20.5 7M12 11.5v10" />
      </svg>
    ),
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: (
      <svg {...iconProps}>
        <path d="M12 2.5v19M16.5 6.5H9.75a2.75 2.75 0 0 0 0 5.5h4.5a2.75 2.75 0 0 1 0 5.5H7" />
      </svg>
    ),
  },
];

export type SubNavItem = {
  label: string;
  /** A "#id" anchor, or a "?tab=" link the Tabs component already reads. */
  href: string;
};

export const SUB_NAV: Record<string, SubNavItem[]> = {
  "/": [
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
};
