import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* M5: /robots.txt returned 404. Private pages and the API stay out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/brief", "/auth/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
