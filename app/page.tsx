/* Site root — currently the v4 photography page.

   TEMPORARY, for client review: James asked for the v4 photography design to
   be the only page on the live domain while he shows it to the client. The v3
   home, /events and /about are removed from the build for the same reason.

   Everything v3 is intact in git — restoring the previous site is a checkout:
     git checkout master -- app/page.tsx app/events app/about
   The v3 home page components (Preloader / Hero / Intro / Marquee /
   Testimonials / SiteFooter) are untouched in components/.

   The root re-exports the /photography page rather than duplicating it, so
   there is exactly one copy of the design to maintain and the two routes can
   never drift apart. */
export { default, metadata } from "./photography/page";

/* Declared literally, not re-exported: Next must parse route segment config
   statically at compile time and rejects a re-exported `revalidate`. Value
   matches /photography. */
export const revalidate = 60;
