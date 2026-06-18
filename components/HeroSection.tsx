"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const CURVE_FLAT = "M0,120 L0,120 C360,120 1080,120 1440,120 L1440,120 Z";
const CURVE_DEEP = "M0,120 L0,60 C360,0 1080,0 1440,60 L1440,120 Z";

function initButtonCharacterStagger() {
  const offsetIncrement = 0.01;
  const buttons = document.querySelectorAll("[data-button-animate-chars]");

  buttons.forEach((button) => {
    const text = button.textContent ?? "";
    button.innerHTML = "";

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;
      if (char === " ") span.style.whiteSpace = "pre";
      button.appendChild(span);
    });
  });
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const curvePathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    initButtonCharacterStagger();
  }, []);

  useGSAP(
    () => {
      if (!curvePathRef.current || !sectionRef.current) return;

      gsap.set(curvePathRef.current, { attr: { d: CURVE_FLAT } });

      const tween = gsap.to(curvePathRef.current, {
        attr: { d: CURVE_DEEP },
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <>
      <style>{`
        .btn-animate-chars {
          color: var(--color-ink);
          cursor: pointer;
          flex-grow: 0;
          justify-content: center;
          align-items: center;
          padding: 0.75em 2em;
          font-size: 0.85em;
          font-family: var(--font-dm-sans), sans-serif;
          font-weight: 400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
          border: none;
          background-color: var(--color-gold);
          min-width: 14em;
          border-radius: 999px;
          padding: 0.9em 1.1em 0.65em 3em;
          justify-content: center;
        }

        .btn-animate-chars__text {
          white-space: nowrap;
          line-height: 1.3;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6em;
          width: 100%;
        }

        .btn-animate-chars [data-button-animate-chars] {
          overflow: hidden;
          position: relative;
          display: flex;
          justify-content: center;
          text-align: center;
        }

        .btn-animate-chars [data-button-animate-chars] span {
          display: inline-block;
          position: relative;
          text-shadow: 0px 1.3em currentColor;
          transform: translateY(0em) rotate(0.001deg);
          transition: transform 0.6s cubic-bezier(0.625, 0.05, 0, 1);
        }

        .btn-animate-chars:hover [data-button-animate-chars] span {
          transform: translateY(-1.3em) rotate(0.001deg);
        }

        .btn-animate-chars__bg {
          border-radius: 999px;
          background-color: var(--color-gold);
          position: absolute;
          inset: 0;
          transition: background-color 0.6s cubic-bezier(0.625, 0.05, 0, 1),
                      inset 0.6s cubic-bezier(0.625, 0.05, 0, 1);
        }

        .btn-animate-chars:hover .btn-animate-chars__bg {
          background-color: var(--color-gold-light);
          inset: 0.125em;
        }

        .btn-animate-chars:hover {
          color: var(--color-ink);
        }

        .hero-title {
          color: var(--color-cream);
          font-family: var(--font-nohemi), sans-serif;
          font-size: clamp(1.8rem, 4.2vw, 3.6em);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          white-space: nowrap;
          margin-bottom: 0.6em;
        }

        .hero-title__sub {
          color: var(--color-cream-dark);
          font-family: var(--font-nohemi), sans-serif;
          font-weight: 200;
          font-style: normal;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Mobile only — desktop values above are untouched */
        @media (max-width: 767px) {
          .hero-title {
            font-size: clamp(1.6rem, 7vw, 2.4rem);
            white-space: normal;
            max-width: 26ch;
            margin-left: auto;
            margin-right: auto;
          }

          .btn-animate-chars {
            min-width: 0;
            width: 100%;
            max-width: 22em;
            padding: 0.9em 1.5em;
            font-size: 0.8em;
          }

          .hero-cta-group {
            width: 100%;
            padding: 0 1em;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        aria-label="Hero"
        style={{
          backgroundColor: "var(--color-primary)",
          minHeight: "calc(100vh - 2em)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "var(--space-lg) var(--space-md)",
          position: "relative",
        }}
      >
        {/* Main title */}
        <h1 className="hero-title">
          Agnitantra Events{" "}
          <span className="hero-title__sub">&amp; Aira Photography</span>
        </h1>

        {/* Divider ornament */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1em",
            marginBottom: "var(--space-md)",
          }}
        >
          <span
            style={{
              display: "block",
              width: "4em",
              height: "1px",
              backgroundColor: "var(--color-gold)",
              opacity: 0.6,
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
              fill="#c9a96e"
              opacity="0.8"
            />
          </svg>
          <span
            style={{
              display: "block",
              width: "4em",
              height: "1px",
              backgroundColor: "var(--color-gold)",
              opacity: 0.6,
            }}
          />
        </div>

        {/* CTA Buttons */}
        <div
          className="hero-cta-group"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1em",
            justifyContent: "center",
          }}
        >
          <Link href="/photography" className="btn-animate-chars">
            <div className="btn-animate-chars__bg" />
            <span className="btn-animate-chars__text">
              <span data-button-animate-chars="">Our Photography</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>

          <Link href="/events" className="btn-animate-chars">
            <div className="btn-animate-chars__bg" />
            <span className="btn-animate-chars__text">
              <span data-button-animate-chars="">Events &amp; Catering</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M1 7h12M8 2l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>

        {/* Curved transition into next section */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: "-1px",
            left: 0,
            width: "100%",
            height: "8vw",
            minHeight: "60px",
            maxHeight: "120px",
            display: "block",
          }}
        >
          <path
            ref={curvePathRef}
            fill="var(--color-cream)"
          />
        </svg>
      </section>
    </>
  );
}
