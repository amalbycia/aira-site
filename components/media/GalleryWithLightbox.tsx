"use client";

import { useState } from "react";
import ColumnDriftGallery from "./ColumnDriftGallery";
import PhotoViewer from "./PhotoViewer";
import type { GalleryPhoto } from "./types";

/**
 * Client wrapper that pairs the (do-not-restyle) ColumnDriftGallery with the
 * click-to-open PhotoViewer. Clicking any photo opens the fullscreen viewer at
 * that photo, where it can be swiped/dragged through. Keeps all viewer state on
 * the client so the page can stay a Server Component.
 */
export default function GalleryWithLightbox({
  eyebrow,
  heading,
  photos,
  columns = 4,
}: {
  eyebrow: string;
  heading: string;
  photos: GalleryPhoto[];
  columns?: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ColumnDriftGallery
        eyebrow={eyebrow}
        heading={heading}
        photos={photos}
        columns={columns}
        onPhotoClick={setOpenIndex}
      />
      <PhotoViewer
        photos={photos}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
