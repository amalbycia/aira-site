import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Allow crawling of public pages; keep the admin console and API out of the
// index. AI answer-engine crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-
// Extended, etc.) are explicitly welcomed too — they honour the same rules, and
// being crawlable is the prerequisite for GEO citations. Points every crawler
// at the sitemap.
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/manage", "/api/", "/sign-in"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Named AI/search crawlers — same access as everyone; listed so their
      // access is explicit and unambiguous.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "Bingbot",
        ],
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
