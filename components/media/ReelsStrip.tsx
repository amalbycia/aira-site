import Reveal from "@/components/Reveal";
import ReelCard from "./ReelCard";
import type { ReelItem } from "./types";
import styles from "./ReelsStrip.module.css";

/**
 * Horizontal strip of vertical reels (Bunny Stream).
 *
 * Prop contract is unchanged from the pre-redesign component, so the CDN wiring
 * in lib/cms/getPage.ts (hlsSrc / videoSrc / poster) feeds it as-is.
 *
 * Layout: a scroll-snapping rail. On desktop it's a centred row; on mobile it
 * becomes a swipeable carousel with the native scroller (no JS, no jank).
 */
export default function ReelsStrip({
  eyebrow,
  heading,
  reels,
}: {
  eyebrow?: string;
  heading?: string;
  reels: ReelItem[];
}) {
  if (!reels || reels.length === 0) return null;

  return (
    <section className="section">
      <Reveal className="shell">
        {(eyebrow || heading) && (
          <div className={styles.head}>
            {eyebrow ? (
              <p className="eyebrow" data-reveal>
                {eyebrow}
              </p>
            ) : null}
            {heading ? (
              <h2 className="display" data-reveal>
                {heading}
              </h2>
            ) : null}
          </div>
        )}
      </Reveal>

      {/* The rail sits outside .shell so it can bleed to the viewport edge on
          mobile, which makes the swipe affordance obvious. */}
      <div className={styles.railWrap}>
        <ul className={styles.rail}>
          {reels.map((reel, i) => (
            <li className={styles.item} key={`${reel.poster}-${i}`}>
              <ReelCard reel={reel} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
