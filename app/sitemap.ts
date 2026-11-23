import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* The public pages only: no private tools, no hidden course pages. */
const PAGES = ["", "/demo", "/features", "/pricing", "/roadmap", "/chat", "/privacy", "/terms", "/signup", "/login"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.6 }));
}
