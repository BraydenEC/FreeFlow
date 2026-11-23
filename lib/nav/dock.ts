import {
  DOCS_PAGE_ENABLED,
  DONATIONS_ENABLED,
  FEATURES_PAGE_ENABLED,
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

  The course pages (/research, /docs) and the marketing engine join the menus
  only when their switches in lib/flags.ts are on. With /features off, the
  menus link Product (/product, the feature map) in its place.

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
  { label: "Paste a brief", href: "/core", icon: "core" },
  { label: "Help desk", href: "/chat", icon: "help" },
];

/** Features (the public page) or Product (the feature map), whichever is on. */
const FEATURES_LINK: DockItem = FEATURES_PAGE_ENABLED
  ? { label: "Features", href: "/features", icon: "product" }
  : { label: "Product", href: "/product", icon: "product" };

const RESEARCH_LINK: DockItem[] = RESEARCH_PAGE_ENABLED ? [{ label: "Research", href: "/research", icon: "research" }] : [];
const MARKETING_LINK: DockItem[] = MARKETING_IN_MENUS ? [{ label: "Marketing", href: "/marketing", icon: "marketing" }] : [];
const DOCS_LINK: DockItem[] = DOCS_PAGE_ENABLED ? [{ label: "Docs", href: "/docs", icon: "docs" }] : [];

const ABOUT: DockItem[] = [
  { label: "Tour", href: "/demo", icon: "demo" },
  ...RESEARCH_LINK,
  FEATURES_LINK,
  { label: "Pricing", href: "/pricing", icon: "pricing" },
  ...MARKETING_LINK,
  { label: "Roadmap", href: "/roadmap", icon: "roadmap" },
  ...DOCS_LINK,
];

export const DOCK_GROUPS: DockGroup[] = [
  { id: "work", label: "Your tools", items: TOOLS },
  { id: "about", label: "About FreeFlow", items: ABOUT },
];

/** The labelled links in the top bar for a signed-in user: their own tools. */
export const TOP_LINKS: DockItem[] = TOOLS;

/** The top bar for a signed-out visitor. */
export const SITE_LINKS: DockItem[] = [
  FEATURES_LINK,
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
      ...RESEARCH_LINK,
      { label: FEATURES_LINK.label, href: FEATURES_LINK.href },
      { label: "Pricing", href: "/pricing" },
      ...MARKETING_LINK,
      { label: "Roadmap", href: "/roadmap" },
      ...DOCS_LINK,
    ].map(({ label, href }) => ({ label, href })),
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
