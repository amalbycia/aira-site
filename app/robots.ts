import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Allow crawling of public pages; keep the admin console and API out of the
// index. Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/manage", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
