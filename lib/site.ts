/**
 * Canonical site URL, used for metadata (metadataBase), sitemap, robots and
 * OpenGraph. Currently the Vercel production alias; when a real domain is
 * connected, set NEXT_PUBLIC_SITE_URL in Vercel env (e.g. https://agnitantra.com)
 * and everything below picks it up — no code change needed.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://agnitantraevents.com"
).replace(/\/$/, "");

export const SITE_NAME = "Aira Photography and Agnitantra Events";

/**
 * Business facts — the single source of truth for structured data (JSON-LD),
 * metadata and the footer. NAP (name / address / phone) MUST match the Google
 * Business Profile exactly; mismatches weaken the local "prominence" signal.
 * (2026 local-SEO guidance: schema NAP consistent with GBP.)
 */
export const BUSINESS = {
  // legalName MUST match the Google Business Profile exactly (NAP consistency),
  // so it keeps the "&" as GBP has it — don't "fix" this one.
  legalName: "Agnitantra Events & Caterers",
  brandName: "Aira Photography and Agnitantra Events",
  founder: "Amal Sebastian Kalarickal",
  foundingYear: "2018",
  phone: "+918089703793",
  phoneDisplay: "+91 80897 03793",
  whatsapp: "918089703793",
  email: "hello@agnitantra.com",
  street: "Kurishummood, Chethipuzha Kadavu",
  locality: "Changanassery",
  region: "Kerala",
  postalCode: "686104",
  country: "IN",
  // Coordinates of the Google Business pin (Changanassery).
  latitude: 9.459812,
  longitude: 76.548263,
  // Verified Google aggregate shown across the site.
  ratingValue: 4.9,
  reviewCount: 148,
  // The Google Business listing.
  googleMapsUrl: "https://www.google.com/maps?cid=10454241291312957415",
  // Areas served — drives local relevance for "in Kerala" style queries.
  areasServed: [
    "Changanassery",
    "Kottayam",
    "Kerala",
    "Kochi",
    "Thiruvananthapuram",
    "Thrissur",
  ],
  sameAs: [
    "https://www.instagram.com/aira__photography_",
    "https://www.instagram.com/agnitantra_events_and_caterers",
    "https://www.facebook.com/AgnitantraEvents/",
    "https://www.youtube.com/channel/UCJBvYbfXgCFZeEbQ6DOOpmg",
    "https://linktr.ee/AIRAPHOTOGRAPHYTM",
  ],
} as const;
