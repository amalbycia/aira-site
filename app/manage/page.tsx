import { auth, currentUser } from "@clerk/nextjs/server";
import Dashboard from "./Dashboard";
import { listPhotos, listReels, listReviews, listMenu } from "@/lib/cms/admin";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  // proxy.ts already gates /manage via Clerk; this redirect is a safety net so
  // the page never renders content for an unauthenticated request.
  const { isAuthenticated, redirectToSignIn } = await auth();
  if (!isAuthenticated) return redirectToSignIn();

  // Load initial data server-side so the dashboard renders populated, split by
  // page (photos, reels and reviews are all strictly per-page now — each page
  // has its own Reviews section). User accounts are managed in the Clerk
  // dashboard.
  const [
    photographyPhotos,
    eventsPhotos,
    photographyReels,
    eventsReels,
    photographyReviews,
    eventsReviews,
    menu,
    user,
  ] = await Promise.all([
    listPhotos("photography"),
    listPhotos("events"),
    listReels("photography"),
    listReels("events"),
    listReviews("photography"),
    listReviews("events"),
    listMenu(),
    currentUser(),
  ]);

  const currentEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    null;

  return (
    <Dashboard
      initialPhotos={{ photography: photographyPhotos, events: eventsPhotos }}
      initialReels={{ photography: photographyReels, events: eventsReels }}
      initialReviews={{ photography: photographyReviews, events: eventsReviews }}
      initialMenu={menu}
      currentEmail={currentEmail}
    />
  );
}
