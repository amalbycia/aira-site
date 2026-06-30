import { sql, hasDb } from "@/lib/db";

/** A review shaped for the testimonial marquee. */
export type ReviewItem = {
  reviewerName: string;
  rating: number;
  reviewText: string;
  /** Pretty date string for display (e.g. "Mar 2026"); empty if unset. */
  date: string;
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

function formatDate(iso: string | Date | null): string {
  if (!iso) return "";
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

type ReviewRow = {
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string | Date | null;
};

/**
 * Published reviews for a brand ("photography" | "events"), newest first.
 * Includes reviews tagged for that page OR "both". Returns [] if the DB is
 * unconfigured/unreachable so callers fall back to their placeholder reviews.
 */
export async function getReviews(
  brand: "photography" | "events",
): Promise<ReviewItem[]> {
  if (!hasDb()) return [];
  try {
    const rows = (await sql`
      select reviewer_name, rating, review_text, review_date
      from reviews
      where page = ${brand} or page = 'both'
      order by review_date desc nulls last, sort_order asc, id desc
    `) as ReviewRow[];

    return rows.map((r) => ({
      reviewerName: r.reviewer_name,
      rating: r.rating,
      reviewText: r.review_text,
      date: formatDate(r.review_date),
    }));
  } catch (err) {
    console.error("[getReviews] query failed:", err);
    return [];
  }
}

type SettingsRow = {
  business_name: string | null;
  tagline: string | null;
  years_of_experience: string | null;
  email: string | null;
  phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  location_photography: string | null;
  location_events: string | null;
  logo_url: string | null;
};

/**
 * The single site settings row. Returns {} if unconfigured/unreachable so
 * callers fall back to their hardcoded defaults.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasDb()) return {};
  try {
    const rows = (await sql`
      select business_name, tagline, years_of_experience, email, phone,
             instagram_url, facebook_url, youtube_url,
             location_photography, location_events, logo_url
      from site_settings where id = 1
    `) as SettingsRow[];
    const s = rows[0];
    if (!s) return {};
    return {
      businessName: s.business_name ?? undefined,
      tagline: s.tagline ?? undefined,
      yearsOfExperience: s.years_of_experience ?? undefined,
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
      instagramUrl: s.instagram_url ?? undefined,
      facebookUrl: s.facebook_url ?? undefined,
      youtubeUrl: s.youtube_url ?? undefined,
      locationPhotography: s.location_photography ?? undefined,
      locationEvents: s.location_events ?? undefined,
      logoUrl: s.logo_url ?? undefined,
    };
  } catch (err) {
    console.error("[getSiteSettings] query failed:", err);
    return {};
  }
}

/**
 * Build SiteFooter props from settings for a given brand. Instagram + location
 * are brand-specific; the rest are shared. Undefined values let the footer use
 * its own fallbacks. (Identical to the old Sanity helper.)
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
