import styles from "./page.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   v4 clean slate.

   Four empty full-height cream sections. No nav, no cursor, no grain, no
   content — chrome is gated off this route in components/SiteChrome.tsx.

   The v3 home page (Preloader / Hero / Intro / Marquee / Testimonials /
   SiteFooter) still lives untouched in components/ and on the v3-maroon-cinema
   tag; restoring it is a one-file checkout.
   ───────────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main className={styles.slate}>
      <section className={styles.section} id="section-1" />
      <section className={styles.section} id="section-2" />
      <section className={styles.section} id="section-3" />
      <section className={styles.section} id="section-4" />
    </main>
  );
}
