"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(ScrollTrigger);

// The full service scope, verbatim from the client brief. Indexed editorial
// rows (NOT a bento grid) — matches the Events ServicesList rhythm.
const SERVICES = [
  { name: "Photography & Videography", note: "Aira Photography — timeless, cinematic storytelling." },
  { name: "Event Shoot Coverage", note: "Full coverage, start to finish." },
  { name: "Stage Decoration", note: "Striking, venue-transforming design." },
  { name: "Stage Programs", note: "Flawlessly organised, professionally run." },
  { name: "Catering", note: "Premium menus that elevate the day." },
  { name: "Light & Sound", note: "State-of-the-art production." },
  { name: "Makeup Artistry", note: "Professional, on-call styling." },
  { name: "Car Rentals", note: "Elegant arrivals, premium fleet." },
  { name: "Dancers & Entertainment", note: "Talented performers, high energy." },
];

export default function AboutStory() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return; // static, fully visible — accessibility

      const tweens: gsap.core.Tween[] = [];

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

      // Service rows stagger in as a group.
      const rows = root.querySelectorAll<HTMLElement>(".about-svc__row");
      if (rows.length) {
        tweens.push(
          gsap.from(rows, {
            y: 26,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: ".about-svc", start: "top 82%", once: true },
          }),
        );
      }

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
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} aria-label="About Aira & Agnitantra" className="about-story">
      <style>{`
        .about-story {
          background-color: var(--color-cream);
          color: var(--color-ink);
          padding: var(--space-2xl) var(--space-md) var(--space-xl);
          position: relative;
          overflow: hidden;
        }
        .about-wrap { max-width: 60em; margin: 0 auto; }

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
          font-weight: 200;
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
          border: 1px solid var(--color-cream-dark);
          border-radius: 1.6em;
          background: var(--color-white);
          box-shadow: 0 24px 60px -40px rgba(122, 31, 31, 0.4);
        }
        .about-stat {
          font-family: var(--font-sometimes-times), serif;
          font-weight: 400;
          font-size: clamp(3.5rem, 10vw, 7em);
          line-height: 0.9;
          color: var(--color-primary);
          display: flex;
          align-items: flex-start;
        }
        .about-stat sup {
          font-size: 0.4em;
          margin-top: 0.5em;
          margin-left: 0.05em;
          color: var(--color-gold);
        }
        .about-stat__label {
          display: block;
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: 0.13em;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--color-ink-muted);
          margin-top: 1.2em;
        }
        .about-feature__text {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: clamp(1rem, 1.5vw, 1.1em);
          line-height: 1.8;
          color: var(--color-ink-muted);
        }
        .about-feature__text strong { color: var(--color-ink); font-weight: 400; }

        /* ── Service scope ── */
        .about-svc { margin: var(--space-xl) 0 var(--space-lg); }
        .about-svc__head {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 400;
          font-size: clamp(1.3rem, 2.6vw, 1.9em);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin-bottom: 1.2em;
        }
        .about-svc__row {
          display: grid;
          grid-template-columns: 2.4em 1fr;
          gap: 0.8em;
          align-items: baseline;
          padding: 1em 0;
          border-top: 1px solid var(--color-cream-dark);
        }
        .about-svc__row:last-child { border-bottom: 1px solid var(--color-cream-dark); }
        .about-svc__num {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: 0.8em;
          color: var(--color-gold);
          letter-spacing: 0.05em;
        }
        .about-svc__name {
          font-family: var(--font-sometimes-times), serif;
          font-size: clamp(1.15rem, 2vw, 1.5em);
          color: var(--color-ink);
          line-height: 1.2;
        }
        .about-svc__note {
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-size: 0.92em;
          color: var(--color-ink-muted);
          margin-top: 0.25em;
        }

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
          .about-svc__row { grid-template-columns: 2em 1fr; }
        }
      `}</style>

      <div className="about-wrap">
        <p className="about-eyebrow" data-reveal>about us</p>
        <h2 className="about-lede" data-reveal>
          Where creative artistry meets logistical mastery.
        </h2>

        <p className="about-para" data-reveal>
          Founded in <strong>2018</strong> by <strong>Amal Sebastian
          Kalarickal</strong>, Aira Photography &amp; Agnitantra Events &amp;
          Caterers has grown into a premier, all-inclusive event management
          solution. We seamlessly integrate creative artistry with logistical
          expertise to bring diverse celebrations to life — delivering
          exceptional visual storytelling through high-quality photography,
          videography, and complete event coverage.
        </p>
        <p className="about-para" data-reveal>
          Beyond capturing memories, we transform venues with striking stage
          decorations and organise flawless stage programs, so every event has a
          captivating, professional presence. Driven by a commitment to
          full-service excellence, we handle every intricate detail — giving our
          clients a genuinely stress-free experience.
        </p>

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

        {/* ── Service scope ── */}
        <div className="about-svc">
          <h3 className="about-svc__head" data-reveal>Everything, under one roof</h3>
          {SERVICES.map((s, i) => (
            <div className="about-svc__row" key={s.name}>
              <span className="about-svc__num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="about-svc__name">{s.name}</div>
                <div className="about-svc__note">{s.note}</div>
              </div>
            </div>
          ))}
        </div>

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
              Events &amp; Catering
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
