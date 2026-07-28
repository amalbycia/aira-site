"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

// The full service scope, verbatim from the client brief. Shown as horizontally
// scrolling bento cards on a marquee (mirrors the TestimonialMarquee motion).
// Each gets a small line icon drawn inline so there's no asset dependency.
const SERVICES: { name: string; note: string; icon: string }[] = [
  { name: "Wedding Photography", note: "Aira Photography — timeless, cinematic storytelling.", icon: "camera" },
  { name: "Event Shoot Coverage", note: "Full coverage, start to finish.", icon: "film" },
  { name: "Stage Decoration", note: "Striking, venue-transforming design.", icon: "sparkle" },
  { name: "Stage Programs", note: "Flawlessly organised, professionally run.", icon: "mic" },
  { name: "Catering", note: "Premium menus that elevate the day.", icon: "plate" },
  { name: "Light and Sound", note: "State-of-the-art production.", icon: "bolt" },
  { name: "Makeup Artistry", note: "Professional, on-call styling.", icon: "brush" },
  { name: "Car Rentals", note: "Elegant arrivals, premium fleet.", icon: "car" },
  { name: "Dancers and Entertainment", note: "Talented performers, high energy.", icon: "star" },
];

// Minimal 24px line icons (currentColor) — keyed by the icon name above.
const ICONS: Record<string, React.ReactNode> = {
  camera: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1-1.5h4L13 7h2.5A1.5 1.5 0 0 1 17 8.5v6A1.5 1.5 0 0 1 15.5 16h-11A1.5 1.5 0 0 1 3 14.5v-6Z"/><circle cx="10" cy="11" r="2.4"/></>,
  film: <><rect x="3.5" y="5" width="13" height="10" rx="1.5"/><path d="M7 5v10M13 5v10M3.5 8.3h3M13.5 8.3h3M3.5 11.7h3M13.5 11.7h3"/></>,
  sparkle: <path d="M10 3.5l1.6 4.9L16.5 10l-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6L10 3.5Z"/>,
  mic: <><rect x="8" y="3.5" width="4" height="8" rx="2"/><path d="M6 10a4 4 0 0 0 8 0M10 14v3M8 17h4"/></>,
  plate: <><circle cx="10" cy="10" r="6.5"/><circle cx="10" cy="10" r="3"/></>,
  bolt: <path d="M11 3l-5 8h3.5L8.5 17l5-8H10l1-6Z"/>,
  brush: <><path d="M13.5 4.5l2 2-6 6-2-2 6-6Z"/><path d="M7.5 10.5 4 14c-.5 1.5.5 2.5 2 2l3.5-3.5"/></>,
  car: <><path d="M4 13v-2l1.5-3.5h9L16 11v2M4 13h12M4 13v1.5M16 13v1.5"/><circle cx="6.5" cy="13" r="1"/><circle cx="13.5" cy="13" r="1"/></>,
  star: <path d="M10 3.5l1.9 4 4.4.5-3.3 3 .9 4.3L10 13.2 6.1 15.3l.9-4.3-3.3-3 4.4-.5L10 3.5Z"/>,
};

export default function AboutStory() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tweens: gsap.core.Tween[] = [];
      const cleanups: (() => void)[] = [];

      // Services marquee: a GSAP loop scrolls the doubled track left and wraps
      // seamlessly; hover/focus pauses it. Reduced-motion → static horizontal
      // scroll. (Same approach as TestimonialMarquee, kept consistent.)
      const track = trackRef.current;
      if (track) {
        if (prefersReduced) {
          track.style.overflowX = "auto";
        } else {
          const half = track.scrollWidth / 2;
          const loop = gsap.to(track, {
            x: -half,
            duration: 38,
            ease: "none",
            repeat: -1,
            modifiers: { x: (x) => `${parseFloat(x) % half}px` },
          });
          tweens.push(loop);
          const pause = () => loop.pause();
          const play = () => loop.play();
          track.addEventListener("mouseenter", pause);
          track.addEventListener("mouseleave", play);
          track.addEventListener("focusin", pause);
          track.addEventListener("focusout", play);
          cleanups.push(() => {
            track.removeEventListener("mouseenter", pause);
            track.removeEventListener("mouseleave", play);
            track.removeEventListener("focusin", pause);
            track.removeEventListener("focusout", play);
          });
        }
      }

      if (prefersReduced) {
        return () => {
          tweens.forEach((t) => t.kill());
          cleanups.forEach((c) => c());
        };
      }

      // Generic soft rise-in for any [data-reveal] element. once:true means a
      // fast scroll past still leaves it fully visible (never stuck hidden).
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        tweens.push(
          gsap.from(el, {
            y: 34,
            autoAlpha: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          }),
        );
      });

      // The big "9+" counts up as it enters.
      const stat = root.querySelector<HTMLElement>("[data-count]");
      if (stat) {
        const obj = { v: 0 };
        tweens.push(
          gsap.to(obj, {
            v: 9,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: stat, start: "top 85%" },
            onUpdate: () => {
              stat.firstChild!.textContent = String(Math.round(obj.v));
            },
          }),
        );
      }

      return () => {
        tweens.forEach((t) => {
          t.scrollTrigger?.kill();
          t.kill();
        });
        cleanups.forEach((c) => c());
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-label="About Aira and Agnitantra" className="about-story">
      <style>{`
        .about-story {
          /* Warm, layered backdrop (all on-brand: cream + gold + maroon) so the
             page reads richer than flat cream, without leaving the theme. */
          background-color: var(--color-cream);
          background-image:
            radial-gradient(60% 45% at 85% 0%, rgba(201,169,110,0.20), transparent 70%),
            radial-gradient(55% 40% at 0% 100%, rgba(122,31,31,0.10), transparent 70%);
          color: var(--color-ink);
          padding: var(--space-2xl) var(--space-md) var(--space-xl);
          position: relative;
          overflow: hidden;
        }
        /* Faint oversized gold sparkle drifting behind the intro for depth. */
        .about-story::before {
          content: "";
          position: absolute;
          top: -6em; right: -6em;
          width: 26em; height: 26em;
          background: radial-gradient(circle, rgba(201,169,110,0.16), transparent 68%);
          pointer-events: none;
        }
        .about-wrap { max-width: 60em; margin: 0 auto; position: relative; }

        /* Framed intro block — same technique as the homepage About section:
           a fine gold hairline over a soft warm panel, finished with gold
           corner ticks. Editorial and light, never a bulky card. */
        .about-intro {
          position: relative;
          z-index: 1;
          padding: clamp(2em, 4vw, 3.4em) clamp(1.6em, 4vw, 3em);
          border: 1px solid rgba(201, 169, 110, 0.55);
          border-radius: 1.4em;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.55), rgba(245,237,224,0.35));
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.6) inset,
            0 30px 70px -46px rgba(122, 31, 31, 0.45);
          backdrop-filter: blur(1px);
        }
        /* Gold corner ticks — kept subtle so the frame stays refined. */
        .about-intro__corner {
          position: absolute;
          width: 1.4em;
          height: 1.4em;
          border-color: var(--color-gold);
          opacity: 0.85;
          pointer-events: none;
        }
        .about-intro__corner--tl { top: 0.7em; left: 0.7em; border-top: 1.5px solid; border-left: 1.5px solid; border-top-left-radius: 0.5em; }
        .about-intro__corner--tr { top: 0.7em; right: 0.7em; border-top: 1.5px solid; border-right: 1.5px solid; border-top-right-radius: 0.5em; }
        .about-intro__corner--bl { bottom: 0.7em; left: 0.7em; border-bottom: 1.5px solid; border-left: 1.5px solid; border-bottom-left-radius: 0.5em; }
        .about-intro__corner--br { bottom: 0.7em; right: 0.7em; border-bottom: 1.5px solid; border-right: 1.5px solid; border-bottom-right-radius: 0.5em; }
        /* Last paragraph sits flush to the frame's bottom padding. */
        .about-intro .about-para:last-of-type { margin-bottom: 0; }

        .about-eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(2rem, 4.5vw, 2.8em);
          line-height: 1;
          margin-bottom: 0.15em;
        }
        .about-lede {
          font-family: var(--font-sometimes-times), serif;
          font-weight: 400;
          font-size: clamp(1.5rem, 3.4vw, 2.6em);
          line-height: 1.3;
          color: var(--color-ink);
          margin: 0 0 1em;
          max-width: 22ch;
        }
        .about-para {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 300;
          font-size: clamp(1rem, 1.5vw, 1.1em);
          line-height: 1.9;
          color: var(--color-ink-muted);
          margin: 0 0 1.4em;
          max-width: 60ch;
        }
        .about-para strong { color: var(--color-primary); font-weight: 400; }

        /* ── Founder + years feature band ── */
        .about-feature {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: clamp(1.5em, 4vw, 3.5em);
          align-items: center;
          margin: var(--space-xl) 0;
          padding: var(--space-lg) clamp(1.4em, 4vw, 2.6em);
          border: 1px solid rgba(201, 169, 110, 0.45);
          border-radius: 1.6em;
          /* Deep maroon gradient — the band becomes a rich focal moment, with a
             soft gold glow bleeding from the top-right. */
          background:
            radial-gradient(90% 140% at 100% 0%, rgba(201,169,110,0.22), transparent 60%),
            linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          box-shadow: 0 30px 70px -34px rgba(122, 31, 31, 0.6);
          position: relative;
          overflow: hidden;
        }
        .about-stat {
          font-family: var(--font-sometimes-times), serif;
          font-weight: 400;
          font-size: clamp(3.5rem, 10vw, 7em);
          line-height: 0.9;
          color: var(--color-cream);
          display: flex;
          align-items: flex-start;
        }
        .about-stat sup {
          font-size: 0.4em;
          margin-top: 0.5em;
          margin-left: 0.05em;
          color: var(--color-gold-light);
        }
        .about-stat__label {
          display: block;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: 0.13em;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-gold-light);
          margin-top: 1.2em;
        }
        .about-feature__text {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 300;
          font-size: clamp(1rem, 1.5vw, 1.1em);
          line-height: 1.8;
          color: var(--color-cream-dark);
        }
        .about-feature__text strong { color: #ffffff; font-weight: 400; }

        /* ── Service scope — bento marquee (full-bleed) ── */
        .about-svc { margin: var(--space-xl) 0 var(--space-lg); overflow: hidden; }
        .about-svc__head-wrap {
          max-width: 60em;
          margin: 0 auto 1.4em;
          padding: 0 var(--space-md);
        }
        .about-svc__eyebrow {
          font-family: var(--font-script), cursive;
          color: var(--color-primary);
          font-size: clamp(1.7rem, 3.6vw, 2.3em);
          line-height: 1;
          margin-bottom: 0.05em;
        }
        .about-svc__head {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(1.3rem, 2.6vw, 1.9em);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .about-svc__viewport { position: relative; }
        .about-svc__viewport::before,
        .about-svc__viewport::after {
          content: "";
          position: absolute; top: 0; bottom: 0; width: 5em; z-index: 2;
          pointer-events: none;
        }
        .about-svc__viewport::before { left: 0; background: linear-gradient(90deg, var(--color-cream), transparent); }
        .about-svc__viewport::after { right: 0; background: linear-gradient(270deg, var(--color-cream), transparent); }

        .about-svc__track {
          display: flex;
          gap: 1.2em;
          width: max-content;
          padding: 0.6em var(--space-md);
          will-change: transform;
        }

        .bento {
          flex: 0 0 auto;
          width: 17em;
          min-height: 12.5em;
          margin: 0;
          padding: 1.5em;
          display: flex;
          flex-direction: column;
          gap: 0.7em;
          background: var(--color-white);
          border: 1px solid var(--color-cream-dark);
          border-radius: 1.3em;
          box-shadow: 0 16px 44px rgba(122, 31, 31, 0.05);
          position: relative;
          overflow: hidden;
        }
        /* Subtle gold corner flourish so the cards read as "bento", not plain. */
        .bento::after {
          content: "";
          position: absolute;
          right: -2.2em; top: -2.2em;
          width: 5em; height: 5em;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,169,110,0.18), transparent 70%);
        }
        /* Every 3rd card inverts to maroon for visual rhythm. */
        .bento:nth-child(3n) {
          background: var(--color-primary-dark);
          border-color: transparent;
        }
        .bento:nth-child(3n) .bento__icon { border-color: rgba(201,169,110,0.5); color: var(--color-gold-light); }
        .bento:nth-child(3n) .bento__num { color: var(--color-gold-light); }
        .bento:nth-child(3n) .bento__name { color: var(--color-cream); }
        .bento:nth-child(3n) .bento__note { color: var(--color-cream-dark); }

        .bento__num {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 300; font-size: 0.86em;
          letter-spacing: 0.14em;
          color: var(--color-gold);
        }
        .bento__icon {
          width: 2.6em; height: 2.6em;
          display: grid; place-items: center;
          border: 1px solid var(--color-cream-dark);
          border-radius: 0.8em;
          color: var(--color-primary);
        }
        .bento__name {
          display: block;
          font-family: var(--font-sometimes-times), serif;
          font-size: clamp(1.1rem, 1.8vw, 1.35em);
          line-height: 1.2;
          color: var(--color-ink);
        }
        .bento__note {
          display: block;
          margin-top: 0.35em;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 300; font-size: 0.98em;
          line-height: 1.5;
          color: var(--color-ink-muted);
        }
        figcaption { margin-top: auto; }

        /* ── Closing CTA ── */
        .about-cta {
          text-align: center;
          margin-top: var(--space-xl);
        }
        .about-cta__line {
          font-family: var(--font-sometimes-times), serif;
          font-size: clamp(1.4rem, 3vw, 2.2em);
          line-height: 1.35;
          color: var(--color-ink);
          max-width: 24ch;
          margin: 0 auto 1.2em;
        }
        .about-cta__buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1em;
          justify-content: center;
        }
        .about-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6em;
          padding: 0.9em 2em;
          border-radius: 999px;
          font-family: var(--font-nohemi), sans-serif;
          font-size: 0.85em;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background-color 200ms ease, color 200ms ease, transform 200ms ease;
        }
        .about-pill--solid {
          background-color: var(--color-primary);
          color: var(--color-cream);
        }
        .about-pill--solid:hover {
          background-color: var(--color-primary-light);
          transform: translateY(-2px);
        }
        .about-pill--ghost {
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
        }
        .about-pill--ghost:hover {
          background-color: var(--color-primary);
          color: var(--color-cream);
          transform: translateY(-2px);
        }

        @media (max-width: 767px) {
          .about-feature { grid-template-columns: 1fr; text-align: left; gap: 1em; }
          .about-svc__track { gap: 1em; padding: 0.6em 1em; }
          .bento { width: 72vw; max-width: 16em; padding: 1.3em; }
          .bento__name { font-size: max(17px, 1.15em); }
          .bento__note { font-size: max(14px, 0.9em); }
          .about-svc__viewport::before, .about-svc__viewport::after { width: 2em; }
        }
      `}</style>

      <div className="about-wrap">
        <div className="about-intro" data-reveal>
          <span className="about-intro__corner about-intro__corner--tl" aria-hidden="true" />
          <span className="about-intro__corner about-intro__corner--tr" aria-hidden="true" />
          <span className="about-intro__corner about-intro__corner--bl" aria-hidden="true" />
          <span className="about-intro__corner about-intro__corner--br" aria-hidden="true" />

          <p className="about-eyebrow">about us</p>
          <h2 className="about-lede">
            Where creative artistry meets logistical mastery.
          </h2>

          <p className="about-para">
            Founded in <strong>2018</strong> by <strong>Amal Sebastian
            Kalarickal</strong>, Aira Photography and Agnitantra Events and
            Caterers has grown into a premier, all-inclusive event management
            solution. We seamlessly integrate creative artistry with logistical
            expertise to bring diverse celebrations to life — delivering
            exceptional visual storytelling through high-quality photography,
            videography, and complete event coverage.
          </p>
          <p className="about-para">
            Beyond capturing memories, we transform venues with striking stage
            decorations and organise flawless stage programs, so every event has a
            captivating, professional presence. Driven by a commitment to
            full-service excellence, we handle every intricate detail — giving our
            clients a genuinely stress-free experience.
          </p>
        </div>

        {/* ── 9+ years feature ── */}
        <div className="about-feature" data-reveal>
          <div className="about-stat" data-count aria-label="Nine plus years">
            9<sup>+</sup>
            <span className="about-stat__label">years of craft</span>
          </div>
          <p className="about-feature__text">
            Nearly a decade of weddings and celebrations across Kerala and
            beyond. From technical production to live entertainment,{" "}
            <strong>Amal Sebastian Kalarickal&rsquo;s venture stands as a trusted
            partner</strong>{" "}
            for sophisticated, memorable, and meticulously coordinated events.
          </p>
        </div>

      </div>

      {/* ── Service scope — full-bleed bento marquee ── */}
      <div className="about-svc" aria-label="Our services">
        <div className="about-svc__head-wrap" data-reveal>
          <p className="about-svc__eyebrow">what we do</p>
          <h3 className="about-svc__head">Everything, under one roof</h3>
        </div>
        <div className="about-svc__viewport">
          <div ref={trackRef} className="about-svc__track">
            {[...SERVICES, ...SERVICES].map((s, i) => (
              <figure className="bento" key={i} aria-hidden={i >= SERVICES.length}>
                <span className="bento__num">{String((i % SERVICES.length) + 1).padStart(2, "0")}</span>
                <span className="bento__icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none"
                    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[s.icon]}
                  </svg>
                </span>
                <figcaption>
                  <span className="bento__name">{s.name}</span>
                  <span className="bento__note">{s.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      <div className="about-wrap">
        {/* ── Closing CTA ── */}
        <div className="about-cta" data-reveal>
          <p className="about-cta__line">
            Let&rsquo;s make your celebration effortless.
          </p>
          <div className="about-cta__buttons">
            <Link href="/photography" className="about-pill about-pill--ghost">
              Our Photography
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/events" className="about-pill about-pill--solid">
              Events and Caterers
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
