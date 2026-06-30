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

const nextConfig: NextConfig = {
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
