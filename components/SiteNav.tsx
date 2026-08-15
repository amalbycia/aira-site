"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./SiteNav.module.css";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
];

/**
 * Site chrome: a centred wordmark with inline links on desktop, and a single
 * menu button opening a full-screen panel on mobile.
 *
 * The client's core requirement is a "simple, non-complicated nav" — so this is
 * four links and nothing else. No mega-menu, no nested items.
 *
 * Hidden entirely on /manage (the admin console has its own chrome).
 */
export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isAdmin = pathname?.startsWith("/manage") || pathname?.startsWith("/sign-in");

  // Solidify the bar once the page has scrolled past the hero's first screen.
  useEffect(() => {
    if (isAdmin) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdmin]);

  // Close the panel on route change. Tracking the previous pathname means we
  // only call setState when the route ACTUALLY changed, rather than on every
  // run of the effect (which would trigger a cascading render).
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  // While the mobile panel is open: lock body scroll, pause Lenis (plain
  // overflow:hidden doesn't hold Lenis back), and close on Escape.
  useEffect(() => {
    if (!open) return;

    const lenis = (window as Window & { __lenis?: { stop: () => void; start: () => void } })
      .__lenis;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isAdmin) return null;

  return (
    <>
      <header
        className={`${styles.bar} ${scrolled ? styles.barScrolled : ""}`}
        data-nav-open={open ? "true" : "false"}
      >
        <div className={styles.inner}>
          {/* Left: desktop links */}
          <nav className={styles.links} aria-label="Primary">
            {LINKS.slice(1, 3).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${pathname === l.href ? styles.linkActive : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Centre: wordmark. Placeholder until the client supplies the logo. */}
          <Link href="/" className={styles.wordmark} aria-label="Aira — home">
            <span className={styles.wordmarkMain}>AIRA</span>
            <span className={styles.wordmarkSub}>Photography &amp; Events</span>
          </Link>

          {/* Right: remaining links + enquire */}
          <nav className={styles.linksRight} aria-label="Secondary">
            <Link
              href="/about"
              className={`${styles.link} ${pathname === "/about" ? styles.linkActive : ""}`}
            >
              About
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=918089703793"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.enquire}
            >
              Enquire
            </a>
          </nav>

          {/* Mobile: single menu button */}
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.menuBtnLabel}>{open ? "Close" : "Menu"}</span>
            <span className={styles.burger} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      {/* Full-screen mobile panel */}
      <div
        id="site-menu"
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.panelOpen : ""}`}
        aria-hidden={!open}
        // `inert` takes a real boolean in React 19 — passing "" makes React warn
        // and treat it as false, which would leave the closed panel focusable.
        inert={!open}
      >
        <nav className={styles.panelNav} aria-label="Mobile">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.panelLink}
              style={{ transitionDelay: open ? `${0.08 + i * 0.05}s` : "0s" }}
            >
              <span className={styles.panelIndex}>0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.panelFoot}>
          <a href="tel:+918089703793" className={styles.panelContact}>
            +91 80897 03793
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=918089703793"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.panelContact}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
