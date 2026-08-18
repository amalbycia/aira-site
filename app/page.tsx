import styles from "./page.module.css";

/* ─────────────────────────────────────────────────────────────────────────────
   v4 clean slate.

   Four empty full-height cream sections, nothing else. The v3 home page
   (Preloader / Hero / Intro / Marquee / Testimonials / SiteFooter) still
   lives untouched in components/ and on the v3-maroon-cinema tag — this file
   is the only thing that changed, so restoring it is a one-file revert.

   Sections are numbered placeholders; each gets its real design dropped in
   as James supplies it.
   ───────────────────────────────────────────────────────────────────────── */

const SECTIONS = [1, 2, 3, 4];

export default function Home() {
  return (
    <main className={styles.slate}>
      {SECTIONS.map((n) => (
        <section key={n} className={styles.section} id={`section-${n}`}>
          <div className="shell">
            <span className={styles.marker}>
              {String(n).padStart(2, "0")}
            </span>
          </div>
        </section>
      ))}
    </main>
  );
}
