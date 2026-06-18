"use client";

import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function SiteFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!footerRef.current || !innerRef.current) return;

      // The footer is fixed at the bottom behind <main>. On reload, before the
      // browser restores scroll-to-top and <main> paints over it, the footer
      // can flash into view. It starts `visibility: hidden` (inline style) so
      // it never paints on first frame; we reveal it here, after mount +
      // scroll restoration, then the content fades on scroll as before.
      gsap.set(footerRef.current, { autoAlpha: 1 });

      // Reveal: footer content drifts up + fades in as the footer scrolls
      // into view. Scrubbed to scroll position, eased smoothly.
      const tween = gsap.fromTo(
        innerRef.current,
        { yPercent: 18, autoAlpha: 0.2 },
        {
          yPercent: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "top 30%",
            scrub: 1,
          },
        },
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      aria-label="Site footer"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100vh",
        backgroundColor: "var(--color-primary)",
        color: "var(--color-cream)",
        zIndex: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        visibility: "hidden",
      }}
    >
      <style>{`
        .footer-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 1em;
          margin-top: 1.5em;
        }

        .footer-cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1em;
        }

        .footer-card {
          background-color: var(--color-cream);
          color: var(--color-ink);
          border-radius: 1.4em;
          padding: 1.6em 1.8em;
        }

        .footer-card--contact {
          min-height: 22em;
        }
        .footer-card--location,
        .footer-card--socials {
          min-height: 20em;
        }

        @media (max-width: 767px) {
          .footer-cards-row {
            grid-template-columns: 1fr;
          }
          .footer-nav-list a {
            font-size: 1em !important;
          }
        }
      `}</style>

      <div
        ref={innerRef}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-md) var(--space-md) 0",
          maxWidth: "84em",
          margin: "0 auto",
          width: "100%",
          minHeight: 0,
        }}
      >
        {/* Top nav row — spread out, bigger */}
        <nav
          aria-label="Footer navigation"
          style={{ paddingBottom: "var(--space-md)" }}
        >
          <ul
            className="footer-nav-list"
            style={{
              listStyle: "none",
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {[
              { label: "Home", href: "/" },
              { label: "Works", href: "#" },
              { label: "About", href: "/#about" },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="font-nohemi"
                  style={{
                    fontSize: "1.3em",
                    color: "rgba(245, 237, 224, 0.8)",
                    textDecoration: "none",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    transition: "color 180ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cream)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(245, 237, 224, 0.8)";
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Card stack — Contact (square, full width, top) / Location + Socials (row below) */}
        <div className="footer-cards-stack">
          <div className="footer-card footer-card--contact">
            <p
              className="font-nohemi"
              style={{
                fontSize: "0.65em",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-primary)",
                fontWeight: 200,
              }}
            >
              Contact
            </p>
            {/* TODO: James to supply contact card content */}
          </div>

          <div className="footer-cards-row">
            <div className="footer-card footer-card--location">
              <p
                className="font-nohemi"
                style={{
                  fontSize: "0.65em",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  fontWeight: 200,
                }}
              >
                Location
              </p>
              {/* TODO: James to supply location card content */}
            </div>

            <div className="footer-card footer-card--socials">
              <p
                className="font-nohemi"
                style={{
                  fontSize: "0.65em",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  fontWeight: 200,
                }}
              >
                Socials
              </p>
              {/* TODO: James to supply socials card content */}
            </div>
          </div>
        </div>

        {/* Empty band reserved for the big "agnitantra" wordmark — supplied later */}
        <div style={{ flex: 1, minHeight: "20vh" }} aria-hidden="true" />
      </div>
    </footer>
  );
}
