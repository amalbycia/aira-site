"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { SplitText } from "gsap/SplitText";
import styles from "./Hero.module.css";

gsap.registerPlugin(SplitText);

/**
 * The diptych hero — the site's two brands ARE the hero.
 *
 * Two full-height panels, each a live link: Aira Photography on the left,
 * Agnitantra Events on the right, photo breathing behind maroon glass, each
 * with its own arrow button (the client's day-one requirement, kept). On
 * desktop, hovering a panel swells it and recedes the other — the choice
 * becomes physical. On mobile the panels stack; no hover tricks.
 *
 * Motion budget: one entrance (brand names rise character-by-character via
 * SplitText, meta fades in) and the CSS hover swell. Nothing else — no
 * parallax, no scrub. SplitText ships with GSAP 3.15 in node_modules
 * (verified), and the entrance uses fromTo so the resting state is explicit
 * (the v2 lesson: never tween yPercent against a CSS pre-state).
 */

const PANELS = [
  {
    href: "/photography",
    index: "01",
    kicker: "Wedding photography & films",
    name: "AIRA",
    serif: "Photography",
    cta: "Our Photography",
    img: "/images/about-2.webp",
    alt: "Wedding photography by Aira Photography, Kerala",
  },
  {
    href: "/events",
    index: "02",
    kicker: "Decor · catering · production",
    name: "AGNITANTRA",
    serif: "Events & Catering",
    cta: "Events & Catering",
    img: "/images/hero-tile-1.webp",
    alt: "A celebration produced by Agnitantra Events and Caterers",
  },
] as const;

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const names = gsap.utils.toArray<HTMLElement>("[data-hero-name]", el);
      const serifs = gsap.utils.toArray<HTMLElement>("[data-hero-serif]", el);
      const meta = gsap.utils.toArray<HTMLElement>("[data-hero-meta]", el);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set([...serifs, ...meta], { opacity: 1, y: 0 });
        return;
      }

      // Split the grotesk brand names into characters.
      const splits = names.map((n) => new SplitText(n, { type: "chars" }));
      const chars = splits.flatMap((s) => s.chars as HTMLElement[]);

      const tl = gsap.timeline({ delay: 0.1 });

      tl.fromTo(
        chars,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.028,
        },
      )
        .fromTo(
          serifs,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 },
          "-=0.55",
        )
        .fromTo(
          meta,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.05 },
          "-=0.45",
        )
        .from(
          `.${styles.media} img`,
          { scale: 1.07, duration: 1.9, ease: "power2.out" },
          0,
        );

      return () => {
        splits.forEach((s) => s.revert());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.hero} aria-label="Aira Photography and Agnitantra Events">
      <div className={styles.topline} data-hero-meta>
        <span>Weddings &amp; celebrations</span>
        <span className={styles.toplineDot} aria-hidden="true" />
        <span>Kerala · Since 2018</span>
      </div>

      <div className={styles.diptych}>
        {PANELS.map((p) => (
          <Link key={p.href} href={p.href} className={styles.panel}>
            <div className={styles.media} aria-hidden="true">
              <Image
                src={p.img}
                alt=""
                fill
                priority
                sizes="(max-width: 900px) 100vw, 50vw"
                quality={80}
                {...(p.index === "01" ? { "data-hero-img": "" } : {})}
                style={{ objectFit: "cover" }}
              />
              <div className={styles.scrim} />
            </div>

            <div className={styles.panelBody}>
              <p className={styles.kicker} data-hero-meta>
                <span className={styles.kickerIndex}>{p.index}</span>
                {p.kicker}
              </p>

              <h2 className={styles.name}>
                {/* Masked line: SplitText chars rise inside this overflow box. */}
                <span className={styles.nameMask}>
                  <span data-hero-name>{p.name}</span>
                </span>
                <span className={styles.serif} data-hero-serif>
                  {p.serif}
                </span>
              </h2>

              <span className={`${styles.cta}`} data-hero-meta>
                {p.cta}
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* One H1 for the document — visually replaced by the two panels. */}
      <h1 className={styles.srTitle}>
        Aira Photography and Agnitantra Events — weddings and celebrations in Kerala
      </h1>
    </section>
  );
}
