"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The admin console (/manage) needs plain native scrolling, not Lenis smooth
  // scroll — it has forms and scrollable lists, no scroll-driven animation.
  const isAdmin = pathname?.startsWith("/manage");

  useEffect(() => {
    if (isAdmin) return;
    const lenis = new Lenis({
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, [isAdmin]);

  return <>{children}</>;
}
