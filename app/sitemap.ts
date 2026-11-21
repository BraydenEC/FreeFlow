import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* M5: /sitemap.xml returned 404. Public pages only. */
const PAGES = ["", "/demo", "/dashboard", "/pricing", "/product", "/research", "/marketing", "/docs", "/privacy", "/terms", "/signup", "/login"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.6 }));
}
