"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./Hero.module.css";

/**
 * Home hero — full-bleed photograph with an oversized serif headline laid over
 * it (the Adovasio move), plus the two CTAs the client asked for from day one:
 * one to Photography, one to Events.
 *
 * Motion: a single word-rise on the headline and a slow settle on the image.
 * Nothing else. No parallax — it's the biggest source of jank on real phones.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const words = gsap.utils.toArray<HTMLElement>(`.${styles.word} > span`);
      const meta = gsap.utils.toArray<HTMLElement>(`[data-hero-fade]`);

      if (prefersReduced) {
        gsap.set(words, { yPercent: 0 });
        gsap.set(meta, { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ delay: 0.15 });

      // fromTo (not to): the resting state is defined here in JS rather than
      // inherited from the CSS pre-state. Tweening `yPercent` against a CSS
      // `translateY(105%)` leaves GSAP resolving the start from a computed
      // matrix, which lands the words mid-mask and never reaches 0.
      tl.fromTo(
        words,
        { yPercent: 105 },
        {
          yPercent: 0,
          duration: 1.05,
          ease: "power4.out",
          stagger: 0.075,
        },
      )
        .to(
          meta,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
          "-=0.6",
        )
        // Image settles from a very slight over-scale — subtle, not showy.
        .from(
          `.${styles.media} img`,
          { scale: 1.06, duration: 1.8, ease: "power2.out" },
          0,
        );
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.hero}>
      <div className={styles.media}>
        <Image
          src="/images/hero-tile-2.webp"
          alt="A wedding celebration photographed by Aira Photography in Kerala"
          fill
          priority
          sizes="100vw"
          quality={82}
          data-hero-img=""
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow} data-hero-fade>
          Changanassery · Kerala · Since 2018
        </p>

        <h1 className={styles.title}>
          <span className={styles.word}>
            <span>Every</span>
          </span>{" "}
          <span className={styles.word}>
            <span>celebration,</span>
          </span>{" "}
          <span className={styles.word}>
            <span className={styles.accent}>beautifully</span>
          </span>{" "}
          <span className={styles.word}>
            <span>held.</span>
          </span>
        </h1>

        <p className={styles.lede} data-hero-fade>
          Wedding photography and full-service event management, handled as one
          team — so your family can simply enjoy the day.
        </p>

        <div className={styles.ctas} data-hero-fade>
          <Link href="/photography" className={`btn btn--light ${styles.cta}`}>
            Our Photography
            <Arrow />
          </Link>
          <Link href="/events" className={`btn ${styles.cta} ${styles.ctaGhost}`}>
            Events &amp; Catering
            <Arrow />
          </Link>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true" data-hero-fade>
        <span>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg
      className="btn__arrow"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
