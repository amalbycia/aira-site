/**
 * Canonical site URL, used for metadata (metadataBase), sitemap, robots and
 * OpenGraph. Currently the Vercel production alias; when a real domain is
 * connected, set NEXT_PUBLIC_SITE_URL in Vercel env (e.g. https://agnitantra.com)
 * and everything below picks it up — no code change needed.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aira-site-rose.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Aira Photography & Agnitantra Events";
