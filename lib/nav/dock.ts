/*
  The Dock's pages, grouped as the Week 6 spec fixes them:

    Demo · Your work · The business · About

  Plain data (icons are names, drawn in components/nav/Dock.tsx) so it can be
  tested under plain node. The Dock holds pages only; the account and Settings
  stay in the top-right corner.
*/

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
  id: "demo" | "work" | "business" | "about";
  label: string;
  items: DockItem[];
};

export const DOCK_GROUPS: DockGroup[] = [
  {
    id: "demo",
    label: "Demo",
    items: [{ label: "Demo", href: "/demo", icon: "demo" }],
  },
  {
    id: "work",
    label: "Your work",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Paste a brief", href: "/core", icon: "core" },
      { label: "Help desk", href: "/chat", icon: "help" },
    ],
  },
  {
    id: "business",
    label: "The business",
    items: [
      { label: "Research", href: "/research", icon: "research" },
      { label: "Product", href: "/product", icon: "product" },
      { label: "Pricing", href: "/pricing", icon: "pricing" },
      { label: "Marketing", href: "/marketing", icon: "marketing" },
    ],
  },
  {
    id: "about",
    label: "About",
    items: [
      { label: "Docs", href: "/docs", icon: "docs" },
      { label: "Support", href: "/support", icon: "support" },
    ],
  },
];
