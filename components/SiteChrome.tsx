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

export default function SiteChrome() {
  const pathname = usePathname();
  const bare = BARE_ROUTES.includes(pathname ?? "");

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
