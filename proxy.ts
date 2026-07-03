import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only the admin console and its APIs require auth. The entire public site
// (home, photography, events, sign-in) stays open — do NOT flip this to a
// default-protect model or you'll gate the whole marketing site behind login.
const isProtectedRoute = createRouteMatcher([
  "/manage(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next internals and static files; run on everything else + API routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
