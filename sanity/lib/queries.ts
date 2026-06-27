import { groq } from "next-sanity";

/**
 * Fetches a single PUBLISHED page document by its fixed singleton id.
 *
 * The Studio pins the two pages to stable ids ("photographyPage" /
 * "eventsPage") via the custom structure, so we fetch by `_id` rather than the
 * editable `brand` field — the id can't be changed by the client, making it
 * the reliable key. We match only the published id (not "drafts.*"), so the
 * live site reflects what the client has actually published — exactly what a
 * non-technical user expects from a "Publish" button.
 *
 * Returns the gallery as objects where `image` is the raw Sanity image
 * reference — pass it through urlFor() on the consuming side to build a CDN
 * URL. `alt` / `caption` come from the per-image fields in the `page` schema.
 * Reels are referenced docs; we resolve the fields we need for later use.
 */
export const pageByIdQuery = groq`
  *[_id == $id][0]{
    brand,
    description,
    locationText,
    "gallery": gallery[]{
      "image": @,
      "alt": alt,
      "caption": caption
    },
    "reels": reels[]->{
      _id,
      title,
      bunnyVideoId,
      thumbnail
    }
  }
`;

/** Maps a brand to its fixed singleton document id (see sanity/structure.ts). */
export const PAGE_IDS = {
  photography: "photographyPage",
  events: "eventsPage",
} as const;

/**
 * Reviews for a page: published `review` docs whose `page` is this brand OR
 * "both". Newest first. Used by the testimonial marquee.
 */
export const reviewsByBrandQuery = groq`
  *[_type == "review" && !(_id in path("drafts.**")) && (page == $brand || page == "both")]
    | order(date desc){
      _id,
      reviewerName,
      rating,
      reviewText,
      date
    }
`;

/**
 * The single global site settings document (contact, social, location, logo).
 */
export const siteSettingsQuery = groq`
  *[_id == "siteSettings"][0]{
    businessName,
    tagline,
    yearsOfExperience,
    email,
    phone,
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    locationPhotography,
    locationEvents,
    "logoUrl": logo.asset->url
  }
`;
