"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import Cursor from "@/components/Cursor";

/* Routes redesigned in v4 render on a bare canvas: no nav, no custom cursor,
   no film grain. Everything still on the v3 design keeps its full chrome.

   As each v3 page is rebuilt, add its route here. Once v4 covers the whole
   site this collapses back to rendering the chrome unconditionally (or the
   new chrome), and nothing else needs unpicking.

   SiteNav and Cursor themselves are untouched v3 files — the gating lives
   here so reverting v4 never means un-editing shared components. */
const BARE_ROUTES = ["/", "/photography", "/gallery"];

/* TEMPORARY, while the site is v4-only for the client review: the v3 nav links
   to /events and /about, which are no longer in the build, so on any route NOT
   in BARE_ROUTES (the 404, most visibly) it rendered a nav full of dead links
   over a v4 page.

   Gated globally rather than by adding the 404 to BARE_ROUTES, because the nav
   should not appear ANYWHERE until v4 has its own — a route added later would
   otherwise silently get the v3 chrome back.

   Flip this to false when the v3 pages return. */
const V4_ONLY = true;

export default function SiteChrome() {
  const pathname = usePathname();
  const bare = V4_ONLY || BARE_ROUTES.includes(pathname ?? "");

  // Flag on <html> so globals.css can switch off the body::after grain.
  useEffect(() => {
    document.documentElement.dataset.bare = bare ? "true" : "false";
  }, [bare]);

  if (bare) return null;

  return (
    <>
      <SiteNav />
      <Cursor />
    </>
  );
}
