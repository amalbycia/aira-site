import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once at the module level — safe to call multiple times.
gsap.registerPlugin(ScrollTrigger);

/**
 * matchMedia helper for isolated desktop / mobile animation blocks.
 *
 * RULE: animations inside the "isDesktop" callback must NEVER reference
 * targets or logic from the "isMobile" callback, and vice versa.
 * Editing one block should have zero effect on the other.
 *
 * Usage inside a useGSAP(() => { ... }) callback:
 *
 *   const mm = createMatchMedia();
 *
 *   mm.add("isDesktop", () => {
 *     gsap.from(".hero-title", { x: -100, opacity: 0, duration: 1 });
 *     // Return a cleanup function if needed:
 *     return () => { ... };
 *   });
 *
 *   mm.add("isMobile", () => {
 *     gsap.from(".hero-title", { y: 40, opacity: 0, duration: 0.6 });
 *   });
 *
 *   return () => mm.revert(); // call in useGSAP cleanup
 */
export function createMatchMedia() {
  const mm = gsap.matchMedia();

  return {
    /**
     * Add an animation block scoped to a named condition.
     * @param condition - "isDesktop" | "isMobile" | any CSS media string
     * @param animation - Function containing GSAP code; may return a cleanup fn
     */
    add(
      condition: "isDesktop" | "isMobile" | (string & {}),
      animation: gsap.ContextFunc,
    ) {
      const query =
        condition === "isDesktop"
          ? "(min-width: 1024px)"
          : condition === "isMobile"
            ? "(max-width: 1023px)"
            : condition;

      mm.add(query, animation);
    },

    /** Revert all animations and remove listeners. Call in useGSAP cleanup. */
    revert() {
      mm.revert();
    },
  };
}

export { gsap, ScrollTrigger };
