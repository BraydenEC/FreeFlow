import {
  DOCS_PAGE_ENABLED,
  DONATIONS_ENABLED,
  MARKETING_IN_MENUS,
  RESEARCH_PAGE_ENABLED,
} from "@/lib/flags";

/*
  Every menu on the site, in one place.

    DOCK_GROUPS    the corner Dock: the user's tools, then the public pages
    TOP_LINKS      the top bar for a signed-in user: their tools
    SITE_LINKS     the top bar for a visitor: what a product site shows
                   (features, pricing, roadmap, help), like Cushion or Harvest
    FOOTER_COLUMNS the site footer: Product, Support, Legal

  The course pages (/research, /docs) and the marketing preview join the menus
  only when their switches in lib/flags.ts are on.

  Plain data (icons are names, drawn in components/nav/Dock.tsx) so it can be
  tested under plain node.
*/

/** Pages with no app chrome: the Dock and the top bar both stay away. */
export const AUTH_ROUTES = ["/signup", "/login", "/verify-email", "/forgot-password", "/reset-password"];

export type DockIcon =
  | "demo"
  | "dashboard"
  | "core"
  | "help"
  | "research"
  | "product"
  | "pricing"
  | "roadmap"
  | "marketing"
  | "docs"
  | "support";

export type DockItem = { label: string; href: string; icon: DockIcon };

export type DockGroup = {
  id: "work" | "about";
  label: string;
  items: DockItem[];
};

const TOOLS: DockItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Paste a brief", href: "/brief", icon: "core" },
  { label: "Help desk", href: "/chat", icon: "help" },
];

const ABOUT: DockItem[] = [
  { label: "Tour", href: "/demo", icon: "demo" },
  { label: "Features", href: "/features", icon: "product" },
  { label: "Pricing", href: "/pricing", icon: "pricing" },
  { label: "Roadmap", href: "/roadmap", icon: "roadmap" },
  ...(RESEARCH_PAGE_ENABLED ? [{ label: "Research", href: "/research", icon: "research" as const }] : []),
  ...(MARKETING_IN_MENUS ? [{ label: "Marketing", href: "/marketing", icon: "marketing" as const }] : []),
  ...(DOCS_PAGE_ENABLED ? [{ label: "Docs", href: "/docs", icon: "docs" as const }] : []),
];

export const DOCK_GROUPS: DockGroup[] = [
  { id: "work", label: "Your tools", items: TOOLS },
  { id: "about", label: "About FreeFlow", items: ABOUT },
];

/** The labelled links in the top bar for a signed-in user: their own tools. */
export const TOP_LINKS: DockItem[] = TOOLS;

/** The top bar for a signed-out visitor. */
export const SITE_LINKS: DockItem[] = [
  { label: "Features", href: "/features", icon: "product" },
  { label: "Pricing", href: "/pricing", icon: "pricing" },
  { label: "Roadmap", href: "/roadmap", icon: "roadmap" },
  { label: "Help", href: "/chat", icon: "help" },
];

export type FooterColumn = { heading: string; links: { label: string; href: string }[] };

/** The site footer. The contact address is added by the component (a mailto:). */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Tour", href: "/demo" },
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help desk", href: "/chat" },
      ...(DONATIONS_ENABLED ? [{ label: "Support FreeFlow", href: "/pricing#support" }] : []),
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];
