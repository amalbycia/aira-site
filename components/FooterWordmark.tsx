"use client";

import styles from "./FooterWordmark.module.css";

/**
 * The footer's closing move: the giant hollow AIRA wordmark, now interactive —
 * hover floods the outline with cream, click rides Lenis back to the top.
 * One element, transform/color transitions only.
 */
export default function FooterWordmark() {
  const toTop = () => {
    const lenis = (
      window as Window & { __lenis?: { scrollTo: (t: number) => void } }
    ).__lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.row}>
      <button
        type="button"
        className={styles.wordmark}
        onClick={toTop}
        aria-label="Back to top"
      >
        AIRA
      </button>
      <span className={styles.caption} aria-hidden="true">
        Photography &amp; Events — est. 2018, Changanassery
      </span>
    </div>
  );
}
