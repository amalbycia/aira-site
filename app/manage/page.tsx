import { isAuthenticated } from "@/lib/auth/session";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";
import {
  listPhotos,
  listReels,
  listReviews,
  listAdminUsers,
  listMenu,
} from "@/lib/cms/admin";
import { getSessionEmail } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ManagePage() {
  if (!(await isAuthenticated())) {
    return <LoginForm />;
  }

  // Load initial data server-side so the dashboard renders populated.
  const [
    photographyPhotos,
    eventsPhotos,
    reels,
    reviews,
    users,
    menu,
    currentEmail,
  ] = await Promise.all([
    listPhotos("photography"),
    listPhotos("events"),
    listReels(),
    listReviews(),
    listAdminUsers(),
    listMenu(),
    getSessionEmail(),
  ]);

  return (
    <Dashboard
      initialPhotos={{ photography: photographyPhotos, events: eventsPhotos }}
      initialReels={reels}
      initialReviews={reviews}
      initialUsers={users}
      initialMenu={menu}
      currentEmail={currentEmail}
    />
  );
}
