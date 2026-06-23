import type { Metadata } from "next";
import { Alex_Brush, Cormorant_Garamond, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import LenisProvider from "@/components/LenisProvider";
import SideNav from "@/components/SideNav";
import PageTransition from "@/components/PageTransition";
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
  title: "Aira Photography & Agnitantra Events",
  description:
    "Wedding photography and event management — 9+ years of crafting unforgettable celebrations.",
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
