import type { Metadata } from "next";
import { Alex_Brush, Cormorant_Garamond, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import LenisProvider from "@/components/LenisProvider";
import SideNav from "@/components/SideNav";
import PageTransition from "@/components/PageTransition";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import "./globals.css";

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const sometimesTimes = localFont({
  variable: "--font-sometimes-times",
  src: [
    {
      path: "../public/fonts/SometimesTimes/SometimesTimes-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
});

const nohemi = localFont({
  variable: "--font-nohemi",
  src: [
    { path: "../public/fonts/Nohemi/Nohemi-Thin.woff2", weight: "100", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-ExtraLight.woff2", weight: "200", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-Bold.woff2", weight: "700", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "../public/fonts/Nohemi/Nohemi-Black.woff2", weight: "900", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Aira Photography & Agnitantra Events — Weddings & Celebrations in Kerala",
    template: "%s · Aira Photography & Agnitantra Events",
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
    title: "Aira Photography & Agnitantra Events",
    description:
      "Wedding photography and full-service event management across Kerala — one team for decor, catering, stage, sound and photography.",
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aira Photography & Agnitantra Events",
    description:
      "Wedding photography and full-service event management across Kerala.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${alexBrush.variable} ${cormorant.variable} ${dmSans.variable} ${nohemi.variable} ${sometimesTimes.variable}`}
    >
      <body>
        <LenisProvider>
          <SideNav />
          {children}
          <PageTransition />
        </LenisProvider>
      </body>
    </html>
  );
}
