import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Alex_Brush, Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import LenisProvider from "@/components/LenisProvider";
import SiteNav from "@/components/SiteNav";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/structuredData";
import "./globals.css";

/* Display face — high-contrast editorial serif. Italic is reserved for the
   single accent word inside a headline. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

/* UI/body face — quiet grotesk that stays legible at small sizes on phones. */
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

/* Kept for the occasional script flourish (used sparingly). */
const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Aira Photography and Agnitantra Events — Weddings and Celebrations in Kerala",
    template: "%s · Aira Photography and Agnitantra Events",
  },
  description:
    "Wedding photography and full-service event management across Kerala — nine years of decor, catering, stage, sound and photography, handled as one team.",
  keywords: [
    "wedding photography Kerala",
    "event management Kerala",
    "catering Kerala",
    "wedding planner",
    "Agnitantra Events",
    "Aira Photography",
  ],
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Aira Photography and Agnitantra Events",
    description:
      "Wedding photography and full-service event management across Kerala — one team for decor, catering, stage, sound and photography.",
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aira Photography and Agnitantra Events",
    description:
      "Wedding photography and full-service event management across Kerala.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Local-intent geo hints (Changanassery, Kerala).
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Changanassery, Kerala",
    "geo.position": "9.459812;76.548263",
    ICBM: "9.459812, 76.548263",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${hanken.variable} ${alexBrush.variable}`}
    >
      <body>
        {/* Site-wide structured data: the business entity + WebSite node.
            Per-page schema (breadcrumbs, image galleries, FAQ) is added in the
            individual pages. */}
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ClerkProvider afterSignOutUrl="/">
          <LenisProvider>
            <SiteNav />
            {children}
          </LenisProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
