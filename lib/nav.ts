/*
  The navigation, in one place.

  Two components render this list — the sidebar on wide screens and the top
  bar's scroller on phones — and a list defined twice is a list that drifts.

  `href` absent means the section is not built yet. Those items have been
  rendered inert rather than hidden since Week 0: they say what the product
  intends to become without pretending it is there. The rule the project has
  kept for five weeks is that a nav item leads somewhere or is visibly
  disabled; nothing links to a page that does not exist.
*/

export type NavItem = {
  label: string;
  /** Absent for sections that are not built yet. */
  href?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Core", href: "/core" },
  { label: "Research", href: "/research" },
  { label: "Product", href: "/product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Projects" },
  { label: "Time Tracking" },
];
