import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Branded 404 — on-theme (cream/maroon), no site chrome dependency, clear way
// back. Kept intentionally simple: a page that can't be found shouldn't rely on
// the DB, smooth-scroll, or heavy animation.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "1.4em",
        padding: "2rem 1.25rem",
        backgroundColor: "var(--color-cream)",
        color: "var(--color-ink)",
      }}
    >
      <p
        className="font-script"
        style={{
          fontFamily: "var(--font-alex-brush), cursive",
          color: "var(--color-primary)",
          fontSize: "clamp(2.4rem, 8vw, 4rem)",
          lineHeight: 1,
        }}
      >
        Lost the thread
      </p>
      <h1
        className="font-nohemi"
        style={{
          fontFamily: "var(--font-nohemi), sans-serif",
          fontWeight: 400,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          color: "var(--color-ink-muted)",
        }}
      >
        404 — this page doesn&rsquo;t exist
      </h1>
      <p
        style={{
          maxWidth: "42ch",
          lineHeight: 1.6,
          color: "var(--color-ink-muted)",
        }}
      >
        The page you were looking for may have moved or never existed. Let&rsquo;s
        get you back to the celebrations.
      </p>
      <Link
        href="/"
        className="font-nohemi"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5em",
          padding: "0.85em 1.8em",
          borderRadius: "999px",
          backgroundColor: "var(--color-primary)",
          color: "var(--color-cream)",
          textDecoration: "none",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontSize: "0.85rem",
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
