import { DONATIONS_ENABLED } from "@/lib/flags";
/*
  The Dock's pages, in two groups (H3 in docs/user-testing/USER_TESTING_HANDOFF.md):

    Your tools       what a freelancer uses: Dashboard, Paste a brief, Help desk
    About FreeFlow   the pages about the business: demo, research, product,
                     pricing, marketing, docs

  User testers read the old four groups as one row of unlabelled icons, six of
  ten of them internal pages. The tools now come first and also sit, labelled,
  in the top bar on desktop (TOP_LINKS).

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
  | "marketing"
  | "docs"
  | "support";

export type DockItem = { label: string; href: string; icon: DockIcon };

export type DockGroup = {
  id: "work" | "about";
  label: string;
  items: DockItem[];
};

export const DOCK_GROUPS: DockGroup[] = [
  {
    id: "work",
    label: "Your tools",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Paste a brief", href: "/core", icon: "core" },
      { label: "Help desk", href: "/chat", icon: "help" },
    ],
  },
  {
    id: "about",
    label: "About FreeFlow",
    items: [
      { label: "Demo", href: "/demo", icon: "demo" },
      { label: "Research", href: "/research", icon: "research" },
      { label: "Product", href: "/product", icon: "product" },
      { label: "Pricing", href: "/pricing", icon: "pricing" },
      { label: "Marketing", href: "/marketing", icon: "marketing" },
      { label: "Docs", href: "/docs", icon: "docs" },
      // Hidden while donations are off (lib/support.ts).
      ...(DONATIONS_ENABLED ? [{ label: "Support", href: "/support", icon: "support" as const }] : []),
    ],
  },
];

/** The labelled links in the top bar on desktop: the user's own tools. */
export const TOP_LINKS: DockItem[] = DOCK_GROUPS[0].items;
