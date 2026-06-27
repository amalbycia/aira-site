import { client } from "./client";
import { reviewsByBrandQuery, siteSettingsQuery } from "./queries";

/** A review shaped for the testimonial marquee. */
export type ReviewItem = {
  reviewerName: string;
  rating: number;
  reviewText: string;
  /** Pretty date string for display (e.g. "Mar 2026"); empty if unset. */
  date: string;
};

type RawReview = {
  _id: string;
  reviewerName: string | null;
  rating: number | null;
  reviewText: string | null;
  date: string | null;
};

/** Site-wide settings (contact, social, location) for the footer + about. */
export type SiteSettings = {
  businessName?: string;
  tagline?: string;
  yearsOfExperience?: string;
  email?: string;
  phone?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  locationPhotography?: string;
  locationEvents?: string;
  logoUrl?: string;
};

const hasSanity = () => Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Published reviews for a brand ("photography" | "events"), newest first.
 * Returns [] if Sanity is unconfigured/unreachable so callers can fall back to
 * their built-in placeholder reviews.
 */
export async function getReviews(
  brand: "photography" | "events",
): Promise<ReviewItem[]> {
  if (!hasSanity()) return [];
  try {
    const raw = await client.fetch<RawReview[]>(reviewsByBrandQuery, { brand });
    return (raw ?? [])
      .filter((r) => r.reviewerName && r.reviewText && r.rating)
      .map((r) => ({
        reviewerName: r.reviewerName!,
        rating: r.rating!,
        reviewText: r.reviewText!,
        date: formatDate(r.date),
      }));
  } catch {
    return [];
  }
}

/**
 * The single site settings document. Returns {} if unconfigured/unreachable so
 * callers can fall back to their hardcoded defaults.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSanity()) return {};
  try {
    const s = await client.fetch<SiteSettings | null>(siteSettingsQuery);
    return s ?? {};
  } catch {
    return {};
  }
}

/**
 * Build the SiteFooter props from settings for a given brand. Instagram +
 * location are brand-specific; the rest are shared. Undefined values let the
 * footer use its own fallbacks.
 */
export function footerPropsFromSettings(
  s: SiteSettings,
  brand?: "photography" | "events",
) {
  return {
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    youtubeUrl: s.youtubeUrl,
    email: s.email,
    phone: s.phone,
    locationText:
      brand === "photography"
        ? s.locationPhotography
        : brand === "events"
          ? s.locationEvents
          : s.locationPhotography || s.locationEvents,
  };
}
