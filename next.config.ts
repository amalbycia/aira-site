import type { NextConfig } from "next";

const BUNNY_CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "";

// Extract hostname from the CDN URL for Next.js Image domain allowlist.
// Handles both "https://cdn.example.b-cdn.net" and bare "cdn.example.b-cdn.net".
function extractHostname(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

// Security headers applied to every response. These are framework-safe (they
// don't constrain script/style sources, so GSAP/Lenis/Next inline runtime keep
// working) but close the common low-effort attack surfaces. A full CSP is
// intentionally omitted — it would need per-nonce wiring for Next's inline
// bootstrap and the animation libs, and is high-risk for little gain on a
// static marketing site. Revisit if the threat model changes.
const securityHeaders = [
  // Stop MIME sniffing (e.g. a stored file being interpreted as a script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties on cross-origin navigation.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disallow being framed by other origins (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Drop access to powerful browser features the site never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The admin must never be indexed or framed anywhere.
      {
        source: "/manage/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      // Sanity CDN — serves all images uploaded via Sanity Studio
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      // Bunny CDN — serves images and assets from your Bunny Storage pull zone
      ...(BUNNY_CDN_URL
        ? [
            {
              protocol: "https" as const,
              hostname: extractHostname(BUNNY_CDN_URL),
            },
          ]
        : []),
      // Bunny Stream + Storage — thumbnails and all uploaded images/assets
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
