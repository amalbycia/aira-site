import type { Metadata } from "next";
import { Alex_Brush, Cormorant_Garamond, DM_Sans } from "next/font/google";
import LenisProvider from "@/components/LenisProvider";
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
      className={`${alexBrush.variable} ${cormorant.variable} ${dmSans.variable}`}
    >
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
