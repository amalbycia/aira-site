import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only the admin console and its APIs require auth. The entire public site
// (home, photography, events, sign-in) stays open — do NOT flip this to a
// default-protect model or you'll gate the whole marketing site behind login.
const isManageRoute = createRouteMatcher(["/manage(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Admin APIs: hard 401 for unauthenticated calls (never redirect an API).
  if (isAdminApiRoute(request)) {
    const { isAuthenticated } = await auth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return;
  }

  // Admin console page: cleanly redirect unauthenticated visitors to sign-in
  // (auth.protect() 404s by default, which is a poor UX for a page).
  if (isManageRoute(request)) {
    const { isAuthenticated, redirectToSignIn } = await auth();
    if (!isAuthenticated) {
      return redirectToSignIn({ returnBackUrl: request.url });
    }
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
