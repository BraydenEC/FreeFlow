import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { DOCS_PAGE_ENABLED, FEATURES_PAGE_ENABLED, MARKETING_IN_MENUS, RESEARCH_PAGE_ENABLED } from "@/lib/flags";

/* The public pages only: no private tools, and only the switched-on pages (lib/flags.ts). */
const PAGES = [
  "",
  "/demo",
  "/dashboard",
  ...(RESEARCH_PAGE_ENABLED ? ["/research"] : []),
  FEATURES_PAGE_ENABLED ? "/features" : "/product",
  "/pricing",
  ...(MARKETING_IN_MENUS ? ["/marketing"] : []),
  "/roadmap",
  ...(DOCS_PAGE_ENABLED ? ["/docs"] : []),
  "/chat",
  "/privacy",
  "/terms",
  "/signup",
  "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.6 }));
}
