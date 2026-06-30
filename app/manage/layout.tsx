import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Manage — Agnitantra & Aira",
  robots: { index: false, follow: false },
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
