"use client";

import { useState, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import type {
  PhotoRow,
  ReelRow,
  ReviewRow,
  MenuCategoryRow,
  PageContentRow,
  PageBrand,
} from "@/lib/cms/admin";
import PhotosTab from "./tabs/PhotosTab";
import ReelsTab from "./tabs/ReelsTab";
import ReviewsTab from "./tabs/ReviewsTab";
import MenuTab from "./tabs/MenuTab";
import PageContentTab from "./tabs/PageContentTab";

// The console is organized BY PAGE (Photography vs Events), not by content type.
// Each page owns its own photos and reels; Events additionally owns the catering
// menu and the reviews. User accounts live in the Clerk dashboard; socials,
// contact, location and About copy are hardcoded — so there is no Settings tab.
type Brand = PageBrand;
type Section = "photos" | "reels" | "menu" | "reviews" | "content";

// Which sections each page exposes, in order. Both pages have their own
// Reviews now (edited independently); only Events has the catering menu.
const SECTIONS: Record<Brand, { id: Section; label: string }[]> = {
  photography: [
    { id: "photos", label: "Photos" },
    { id: "reels", label: "Reels & Videos" },
    { id: "reviews", label: "Reviews" },
    { id: "content", label: "Page Content" },
  ],
  events: [
    { id: "photos", label: "Photos" },
    { id: "reels", label: "Reels & Videos" },
    { id: "menu", label: "Events Menu" },
    { id: "reviews", label: "Reviews" },
    { id: "content", label: "Page Content" },
  ],
};

export default function Dashboard({
  initialPhotos,
  initialReels,
  initialReviews,
  initialMenu,
  initialContent,
  currentEmail,
}: {
  initialPhotos: { photography: PhotoRow[]; events: PhotoRow[] };
  initialReels: { photography: ReelRow[]; events: ReelRow[] };
  initialReviews: { photography: ReviewRow[]; events: ReviewRow[] };
  initialMenu: MenuCategoryRow[];
  initialContent: { photography: PageContentRow | null; events: PageContentRow | null };
  currentEmail: string | null;
}) {
  const [brand, setBrand] = useState<Brand>("photography");
  const [section, setSection] = useState<Section>("photos");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  // Switching page resets to that page's first section, so we never land on a
  // section the page doesn't have (e.g. Photography → Reviews).
  const selectBrand = useCallback((next: Brand) => {
    setBrand(next);
    setSection(SECTIONS[next][0].id);
  }, []);

  const sections = SECTIONS[brand];

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

      {/* Top level: pick the page you're editing. */}
      <div className="admin-pagenav">
        <div className="page-switch page-switch--brand">
          <button
            data-active={brand === "photography"}
            onClick={() => selectBrand("photography")}
          >
            Photography
          </button>
          <button
            data-active={brand === "events"}
            onClick={() => selectBrand("events")}
          >
            Events
          </button>
        </div>
      </div>

      {/* Second level: the chosen page's sections. */}
      <nav className="admin-tabs" aria-label={`${brand} sections`}>
        {sections.map((s) => (
          <button
            key={s.id}
            className="admin-tab"
            data-active={section === s.id}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* Keyed by brand so switching pages remounts the tab with fresh initial
          data (a photography reel list never bleeds into events, etc.). */}
      {section === "photos" && (
        <PhotosTab
          key={`photos-${brand}`}
          page={brand}
          initial={initialPhotos[brand]}
          onToast={showToast}
        />
      )}
      {section === "reels" && (
        <ReelsTab
          key={`reels-${brand}`}
          page={brand}
          initial={initialReels[brand]}
          onToast={showToast}
        />
      )}
      {section === "menu" && brand === "events" && (
        <MenuTab initial={initialMenu} onToast={showToast} />
      )}
      {section === "reviews" && (
        <ReviewsTab
          key={`reviews-${brand}`}
          page={brand}
          initial={initialReviews[brand]}
          onToast={showToast}
        />
      )}
      {section === "content" && (
        <PageContentTab
          key={`content-${brand}`}
          page={brand}
          initial={initialContent[brand]}
          onToast={showToast}
        />
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
