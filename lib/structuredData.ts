import { SITE_URL, SITE_NAME, BUSINESS } from "./site";

/**
 * JSON-LD structured data builders (schema.org). 2026 SEO/GEO guidance:
 *   - JSON-LD is the only format to use; markup must match on-page content.
 *   - LocalBusiness + AggregateRating drive local "prominence" and star rich
 *     results; ImageObject is the most under-used photographer tactic.
 *   - The same structured data feeds Google AI Overviews / answer engines, so
 *     it doubles as GEO. (No separate AI markup needed — Google, May 2026.)
 *
 * Everything is plain serializable objects; render with <JsonLd data={…}/>.
 */

type Json = Record<string, unknown>;

const orgId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

const postalAddress: Json = {
  "@type": "PostalAddress",
  streetAddress: BUSINESS.street,
  addressLocality: BUSINESS.locality,
  addressRegion: BUSINESS.region,
  postalCode: BUSINESS.postalCode,
  addressCountry: BUSINESS.country,
};

const geo: Json = {
  "@type": "GeoCoordinates",
  latitude: BUSINESS.latitude,
  longitude: BUSINESS.longitude,
};

const aggregateRating: Json = {
  "@type": "AggregateRating",
  ratingValue: BUSINESS.ratingValue,
  reviewCount: BUSINESS.reviewCount,
  bestRating: 5,
  worstRating: 1,
};

/**
 * The core business entity. Typed as ProfessionalService + LocalBusiness so it
 * qualifies for local rich results while describing the photography/events
 * service. Referenced by @id elsewhere so the graph stays consistent.
 */
export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": orgId,
    name: BUSINESS.brandName,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    logo: `${SITE_URL}/opengraph-image`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    foundingDate: BUSINESS.foundingYear,
    founder: { "@type": "Person", name: BUSINESS.founder },
    priceRange: "₹₹",
    address: postalAddress,
    geo,
    hasMap: BUSINESS.googleMapsUrl,
    areaServed: BUSINESS.areasServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    knowsAbout: [
      "Wedding Photography",
      "Wedding Cinematography",
      "Event Management",
      "Catering",
      "Stage Decoration",
      "Light and Sound",
    ],
    slogan: "Where creative artistry meets logistical mastery.",
    aggregateRating,
    sameAs: [...BUSINESS.sameAs],
    // Service catalogue — helps AI engines enumerate what the business offers.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Photography & Event Services",
      itemListElement: [
        "Wedding Photography",
        "Wedding Videography & Cinematography",
        "Event Shoot Coverage",
        "Stage Decoration",
        "Catering",
        "Light & Sound",
        "Makeup Artistry",
        "Car Rentals",
        "Event Management",
      ].map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name },
      })),
    },
  };
}

/** WebSite node with a search action target (sitelinks-search-box eligible). */
export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { "@id": orgId },
    inLanguage: "en-IN",
  };
}

/** Breadcrumb trail for a page. Pass ordered [name, path] pairs. */
export function breadcrumbSchema(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/**
 * ImageGallery of the portfolio photos — each an ImageObject crediting the
 * business as author/copyright holder. The single most under-used photographer
 * SEO tactic (rich results in Google Images + visual search).
 */
export function imageGallerySchema(
  images: { src: string; alt: string }[],
  opts: { name: string; pagePath: string },
): Json | null {
  if (!images.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: opts.name,
    url: `${SITE_URL}${opts.pagePath}`,
    isPartOf: { "@id": websiteId },
    image: images.slice(0, 25).map((img) => ({
      "@type": "ImageObject",
      contentUrl: img.src,
      caption: img.alt,
      creditText: BUSINESS.brandName,
      author: { "@id": orgId },
      copyrightNotice: `© ${BUSINESS.legalName}`,
      creator: { "@id": orgId },
    })),
  };
}

/** FAQPage — eligible for FAQ rich results and heavily used by AI answers. */
export function faqSchema(qa: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
