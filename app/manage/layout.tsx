import type { Metadata, Viewport } from "next";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Manage — Agnitantra & Aira",
  robots: { index: false, follow: false },
};

// Explicit, mobile-friendly viewport for the admin (the root layout's default
// applies site-wide; this pins sensible behaviour and the brand theme colour
// for the standalone console).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7a1f1f",
};

/**
 * Standalone layout for the admin console. Deliberately does NOT include the
 * site chrome (Lenis smooth scroll, SideNav, PageTransition) — the admin is a
 * plain, fast, scrollable app. Fonts come from the root <html> classes, which
 * still apply since this nests under the root layout's <html>/<body>.
 */
export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
