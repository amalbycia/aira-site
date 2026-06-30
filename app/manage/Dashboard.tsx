"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PhotoRow, ReelRow, ReviewRow, SettingsRow } from "@/lib/cms/admin";
import PhotosTab from "./tabs/PhotosTab";
import ReelsTab from "./tabs/ReelsTab";
import ReviewsTab from "./tabs/ReviewsTab";
import SettingsTab from "./tabs/SettingsTab";

type Tab = "photos" | "reels" | "reviews" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "photos", label: "Photos" },
  { id: "reels", label: "Reels & Videos" },
  { id: "reviews", label: "Reviews" },
  { id: "settings", label: "Settings" },
];

export default function Dashboard({
  initialPhotos,
  initialReels,
  initialReviews,
  initialSettings,
}: {
  initialPhotos: { photography: PhotoRow[]; events: PhotoRow[] };
  initialReels: ReelRow[];
  initialReviews: ReviewRow[];
  initialSettings: SettingsRow | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("photos");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <h1 className="admin-topbar__title">
          Agnitantra
          <span>Content Manager</span>
        </h1>
        <button className="btn btn--ghost btn--sm" onClick={logout}>
          Sign out
        </button>
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
      {tab === "settings" && (
        <SettingsTab initial={initialSettings} onToast={showToast} />
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
