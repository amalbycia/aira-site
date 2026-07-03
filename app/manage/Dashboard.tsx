"use client";

import { useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import type {
  PhotoRow,
  ReelRow,
  ReviewRow,
  MenuCategoryRow,
} from "@/lib/cms/admin";
import PhotosTab from "./tabs/PhotosTab";
import ReelsTab from "./tabs/ReelsTab";
import ReviewsTab from "./tabs/ReviewsTab";
import MenuTab from "./tabs/MenuTab";

// The admin manages only content that actually changes: photos, reels, reviews,
// and the events catering menu. User accounts are managed in the Clerk
// dashboard (not here). Everything else on the site — socials, contact,
// location, About copy — is intentionally hardcoded, so there is no Settings tab.
type Tab = "photos" | "reels" | "reviews" | "menu";

const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Photos" },
  { id: "reels", label: "Reels & Videos" },
  { id: "reviews", label: "Reviews" },
  { id: "menu", label: "Events Menu" },
];

export default function Dashboard({
  initialPhotos,
  initialReels,
  initialReviews,
  initialMenu,
  currentEmail,
}: {
  initialPhotos: { photography: PhotoRow[]; events: PhotoRow[] };
  initialReels: ReelRow[];
  initialReviews: ReviewRow[];
  initialMenu: MenuCategoryRow[];
  currentEmail: string | null;
}) {
  const [tab, setTab] = useState<Tab>("photos");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <h1 className="admin-topbar__title">
          Agnitantra
          <span>Content Manager</span>
        </h1>
        <div className="admin-topbar__user">
          {currentEmail ? (
            <span className="admin-topbar__email" title={currentEmail}>
              {currentEmail}
            </span>
          ) : null}
          {/* Clerk account menu — sign out, manage account. Returns to the home
              page after sign-out. */}
          <UserButton />

        </div>
      </header>

      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className="admin-tab"
            data-active={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "photos" && (
        <PhotosTab initial={initialPhotos} onToast={showToast} />
      )}
      {tab === "reels" && <ReelsTab initial={initialReels} onToast={showToast} />}
      {tab === "reviews" && (
        <ReviewsTab initial={initialReviews} onToast={showToast} />
      )}
      {tab === "menu" && <MenuTab initial={initialMenu} onToast={showToast} />}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
