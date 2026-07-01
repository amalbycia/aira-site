import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Static route list — the site's public pages. /manage is intentionally omitted
// (admin, and it's noindex via robots).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1.0 },
    { path: "/photography", priority: 0.9 },
    { path: "/events", priority: 0.9 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
