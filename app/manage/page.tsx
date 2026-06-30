import { isAuthenticated } from "@/lib/auth/session";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";
import {
  listPhotos,
  listReels,
  listReviews,
  getSettingsRow,
} from "@/lib/cms/admin";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  // Load initial data server-side so the dashboard renders populated.
  const [photographyPhotos, eventsPhotos, reels, reviews, settings] =
    await Promise.all([
      listPhotos("photography"),
      listPhotos("events"),
      listReels(),
      listReviews(),
      getSettingsRow(),
    ]);

  return (
    <Dashboard
      initialPhotos={{ photography: photographyPhotos, events: eventsPhotos }}
      initialReels={reels}
      initialReviews={reviews}
      initialSettings={settings}
    />
  );
}
