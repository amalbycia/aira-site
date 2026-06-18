"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { CustomEase } from "gsap/dist/CustomEase";
import { ScrollTrigger } from "@/lib/gsap";

gsap.registerPlugin(CustomEase);
CustomEase.create("main", "0.65, 0.01, 0.05, 0.99");
gsap.defaults({ ease: "main", duration: 0.7 });

const NAV_LINKS = [
  { label: "Home", href: "/", num: "01" },
  { label: "About", href: "/#about", num: "02" },
  { label: "Photography", href: "/photography", num: "03" },
  { label: "Events", href: "/events", num: "04" },
  { label: "Contact", href: "/#contact", num: "05" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/agnitantraevents" },
  { label: "WhatsApp", href: "https://wa.me/919999999999" },
];

export default function SideNav() {
  const navWrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const bgPanelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const fadeTargetsRef = useRef<(HTMLElement | null)[]>([]);
  const buttonTextsRef = useRef<(HTMLParagraphElement | null)[]>([]);
  const buttonIconRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const navWrap = navWrapRef.current;
    if (!navWrap) return;

    tlRef.current = gsap.timeline();

    const openNav = () => {
      navWrap.setAttribute("data-nav-state", "open");
      tlRef.current!
        .clear()
        .set(navWrap, { display: "block" })
        .set(menuRef.current, { xPercent: 0 })
        .fromTo(buttonTextsRef.current, { yPercent: 0 }, { yPercent: -100, stagger: 0.2 })
        .fromTo(buttonIconRef.current, { rotate: 0 }, { rotate: 315 }, "<")
        .fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1 }, "<")
        .fromTo(bgPanelsRef.current, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, "<")
        .fromTo(menuLinksRef.current, { yPercent: 140, rotate: 10 }, { yPercent: 0, rotate: 0, stagger: 0.05 }, "<+=0.35")
        .fromTo(fadeTargetsRef.current, { autoAlpha: 0, yPercent: 50 }, { autoAlpha: 1, yPercent: 0, stagger: 0.04 }, "<+=0.2");
    };

    const closeNav = () => {
      navWrap.setAttribute("data-nav-state", "closed");
      tlRef.current!
        .clear()
        .to(overlayRef.current, { autoAlpha: 0 })
        .to(menuRef.current, { xPercent: 120 }, "<")
        .to(buttonTextsRef.current, { yPercent: 0 }, "<")
        .to(buttonIconRef.current, { rotate: 0 }, "<")
        .set(navWrap, { display: "none" });
    };

    const handleToggle = () => {
      const state = navWrap.getAttribute("data-nav-state");
      if (state === "open") closeNav();
      else openNav();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && navWrap.getAttribute("data-nav-state") === "open") {
        closeNav();
      }
    };

    const toggleEls = document.querySelectorAll("[data-sidenav-toggle]");
    toggleEls.forEach((el) => el.addEventListener("click", handleToggle));
    document.addEventListener("keydown", handleKeydown);

    // Hide the menu button once the footer has scrolled into view. The footer
    // is `position: fixed` so it can't be used as a ScrollTrigger target
    // directly — its bounding rect never moves with scroll. Track the spacer
    // that drives the reveal instead.
    // The footer shows on every page, but only the homepage has the reveal
    // spacer. Fall back to the footer element on other pages: track when its
    // top edge scrolls up past the bottom of the viewport.
    let hideTrigger: ScrollTrigger | undefined;
    const revealSpacer = document.querySelector("#footer-reveal-spacer");
    const footerEl = document.querySelector("footer[aria-label='Site footer']");
    const triggerTarget = revealSpacer ?? footerEl;

    if (triggerTarget && headerRef.current) {
      hideTrigger = ScrollTrigger.create({
        trigger: triggerTarget,
        start: "top bottom",
        end: "bottom bottom",
        onToggle: (self) => {
          gsap.to(headerRef.current, {
            autoAlpha: self.isActive ? 0 : 1,
            duration: 0.4,
            ease: "power2.out",
          });
        },
      });
    }

    // On mobile the dynamic address bar + late-loading hero image shift layout
    // AFTER the trigger is created, leaving its measured start/end stale so it
    // never fires. Refresh once everything has settled, and on resize.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    window.addEventListener("resize", refresh);
    const refreshTimer = window.setTimeout(refresh, 600);

    return () => {
      toggleEls.forEach((el) => el.removeEventListener("click", handleToggle));
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", refresh);
      window.clearTimeout(refreshTimer);
      hideTrigger?.kill();
      tlRef.current?.kill();
    };
  }, []);

  return (
    <>
      <style>{`
        /* ── Button (fixed top-right) ── */
        .sidenav__header {
          z-index: 100;
          justify-content: flex-end;
          align-items: center;
          display: flex;
          position: fixed;
          top: 2em;
          left: 2em;
          right: 2em;
          pointer-events: none;
        }

        .sidenav__button {
          pointer-events: all;
          z-index: 100;
          gap: 0.625em;
          background-color: transparent;
          justify-content: flex-end;
          align-items: center;
          margin: -1em;
          padding: 1em;
          display: flex;
          border: none;
          cursor: pointer;
          color: var(--color-cream);
        }

        .sidenav__button-text {
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-end;
          height: 1.5em;
          display: flex;
          overflow: hidden;
        }

        .sidenav__button-label {
          color: currentColor;
          margin-top: 0;
          margin-bottom: 0;
          font-family: var(--font-nohemi), sans-serif;
          font-size: 1.125em;
          font-weight: 400;
          letter-spacing: 0.06em;
          line-height: 1.4;
        }

        .sidenav__button-icon {
          justify-content: center;
          align-items: center;
          width: 1em;
          height: 1em;
          transition: transform 0.4s cubic-bezier(0.65, 0.05, 0, 1);
          display: flex;
        }

        .sidenav__button-icon-svg {
          width: 100%;
        }

        /* ── Nav wrap (hidden by default) ── */
        .sidenav__nav {
          z-index: 99;
          width: 100%;
          height: 100vh;
          margin-left: auto;
          margin-right: auto;
          display: none;
          position: fixed;
          inset: 0%;
        }

        /* ── Overlay ── */
        .sidenav__overlay {
          z-index: 0;
          cursor: pointer;
          background-color: rgba(19, 19, 19, 0.4);
          width: 100%;
          height: 100%;
          position: absolute;
          inset: 0%;
        }

        /* ── Menu panel ── */
        .sidenav__menu {
          gap: 5em;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          width: 35em;
          height: 100%;
          margin-left: auto;
          padding-top: 6em;
          padding-bottom: 2em;
          position: relative;
          overflow: auto;
          display: flex;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .sidenav__menu::-webkit-scrollbar {
          display: none;
        }

        /* ── Three wipe bg panels ── */
        .sidenav__menu-bg {
          z-index: 0;
          position: absolute;
          inset: 0%;
        }

        .sidenav__menu-bg-panel {
          z-index: 0;
          background-color: var(--color-primary-dark);
          border-top-left-radius: 1.25em;
          border-bottom-left-radius: 1.25em;
          position: absolute;
          inset: 0%;
        }

        .sidenav__menu-bg-panel.is--first {
          background-color: var(--color-gold);
        }

        .sidenav__menu-bg-panel.is--second {
          background-color: var(--color-primary);
        }

        /* ── Inner content ── */
        .sidenav__menu-inner {
          z-index: 1;
          gap: 5em;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-start;
          height: 100%;
          display: flex;
          position: relative;
          overflow: auto;
          width: 100%;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .sidenav__menu-inner::-webkit-scrollbar {
          display: none;
        }

        /* ── Nav list ── */
        .sidenav__menu-list {
          flex-direction: column;
          width: 100%;
          margin-bottom: 0;
          padding-left: 0;
          list-style: none;
          display: flex;
        }

        .sidenav__menu-list-item {
          height: 4em;
          margin-top: 0;
          margin-bottom: 0;
          position: relative;
          overflow: hidden;
        }

        .sidenav__menu-link {
          gap: 0.75em;
          color: var(--color-cream);
          width: 100%;
          padding-top: 0.75em;
          padding-bottom: 0.75em;
          padding-left: 2em;
          text-decoration: none;
          display: flex;
          align-items: baseline;
        }

        .sidenav__menu-link-heading {
          z-index: 1;
          font-family: var(--font-nohemi), sans-serif;
          font-size: 3em;
          font-weight: 400;
          line-height: 0.85;
          transition: color 0.3s ease, font-style 0.3s ease;
          position: relative;
          margin: 0;
          letter-spacing: 0.01em;
          color: var(--color-cream);
          white-space: nowrap;
        }

        .sidenav__menu-link:hover .sidenav__menu-link-heading {
          color: var(--color-gold);
        }

        .sidenav__menu-link-eyebrow {
          z-index: 1;
          color: var(--color-gold);
          text-transform: uppercase;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 0.75em;
          font-weight: 400;
          letter-spacing: 0.1em;
          position: relative;
        }

        /* ── Socials footer ── */
        .sidenav__menu-details {
          gap: 1.25em;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          padding-left: 2em;
          display: flex;
        }

        .sidenav__menu-socials {
          gap: 1.5em;
          flex-direction: row;
          display: flex;
        }

        .sidenav__menu-socials a {
          color: rgba(245, 237, 224, 0.55);
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 1.125em;
          font-weight: 300;
          letter-spacing: 0.04em;
          text-decoration: none;
          margin: 0;
          transition: color 200ms ease;
        }

        .sidenav__menu-socials a:hover {
          color: var(--color-cream);
        }

        .sidenav__socials-label {
          color: rgba(245, 237, 224, 0.4);
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 1.125em;
          font-weight: 400;
          letter-spacing: 0.04em;
          margin: 0;
        }

        /* ── Mobile ── */
        @media screen and (max-width: 767px) {
          .sidenav__menu-socials {
            gap: 1em;
          }

          .sidenav__menu-bg-panel {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }

          .sidenav__menu {
            width: 100%;
          }

          .sidenav__menu-list-item {
            height: 3.5em;
          }

          .sidenav__menu-link-heading {
            font-size: 2.6em;
          }
        }
      `}</style>

      {/* Fixed header with menu button */}
      <header ref={headerRef} className="sidenav__header">
        <button
          role="button"
          data-sidenav-toggle=""
          data-sidenav-button=""
          className="sidenav__button"
          aria-label="Toggle navigation menu"
        >
          <div className="sidenav__button-text">
            <p
              ref={(el) => { buttonTextsRef.current[0] = el; }}
              data-sidenav-label=""
              className="sidenav__button-label"
            >
              Menu
            </p>
            <p
              ref={(el) => { buttonTextsRef.current[1] = el; }}
              data-sidenav-label=""
              className="sidenav__button-label"
            >
              Close
            </p>
          </div>
          <div
            ref={buttonIconRef}
            data-sidenav-icon=""
            className="sidenav__button-icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              viewBox="0 0 16 16"
              fill="none"
              className="sidenav__button-icon-svg"
              aria-hidden="true"
            >
              <path d="M7.33333 16L7.33333 -3.2055e-07L8.66667 -3.78832e-07L8.66667 16L7.33333 16Z" fill="currentColor" />
              <path d="M16 8.66667L-2.62269e-07 8.66667L-3.78832e-07 7.33333L16 7.33333L16 8.66667Z" fill="currentColor" />
              <path d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z" fill="currentColor" />
              <path d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z" fill="currentColor" />
              <path d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z" fill="currentColor" />
              <path d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z" fill="currentColor" />
            </svg>
          </div>
        </button>
      </header>

      {/* Nav wrap */}
      <div
        ref={navWrapRef}
        data-sidenav-wrap=""
        data-nav-state="closed"
        className="sidenav__nav"
      >
        {/* Overlay — clicking closes nav */}
        <div
          ref={overlayRef}
          data-sidenav-overlay=""
          data-sidenav-toggle=""
          className="sidenav__overlay"
        />

        {/* Slide-in menu */}
        <nav ref={menuRef} data-sidenav-menu="" className="sidenav__menu">
          {/* Three wipe panels */}
          <div className="sidenav__menu-bg">
            <div ref={(el) => { bgPanelsRef.current[0] = el; }} data-sidenav-panel="" className="sidenav__menu-bg-panel is--first" />
            <div ref={(el) => { bgPanelsRef.current[1] = el; }} data-sidenav-panel="" className="sidenav__menu-bg-panel is--second" />
            <div ref={(el) => { bgPanelsRef.current[2] = el; }} data-sidenav-panel="" className="sidenav__menu-bg-panel" />
          </div>

          <div className="sidenav__menu-inner">
            {/* Nav links */}
            <ul className="sidenav__menu-list">
              {NAV_LINKS.map(({ label, href, num }, i) => (
                <li key={href} className="sidenav__menu-list-item">
                  <Link
                    href={href}
                    ref={(el) => { menuLinksRef.current[i] = el; }}
                    data-sidenav-link=""
                    className="sidenav__menu-link"
                  >
                    <p className="sidenav__menu-link-heading">{label}</p>
                    <p className="sidenav__menu-link-eyebrow">{num}</p>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Socials */}
            <div className="sidenav__menu-details">
              <p
                ref={(el) => { fadeTargetsRef.current[0] = el; }}
                data-sidenav-fade=""
                className="sidenav__socials-label"
              >
                Socials
              </p>
              <div className="sidenav__menu-socials">
                {SOCIALS.map(({ label, href }, i) => (
                  <a
                    key={label}
                    ref={(el) => { fadeTargetsRef.current[i + 1] = el; }}
                    href={href}
                    data-sidenav-fade=""
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
