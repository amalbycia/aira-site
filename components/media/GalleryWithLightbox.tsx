"use client";

import { useState } from "react";
import ColumnDriftGallery from "./ColumnDriftGallery";
import PhotoLightbox from "./PhotoLightbox";
import type { GalleryPhoto } from "./types";

/**
 * Client wrapper that pairs the (do-not-restyle) ColumnDriftGallery with the
 * click-to-open PhotoLightbox. Clicking any photo opens the draggable portrait
 * slider at that photo. Keeps all lightbox state on the client so the page can
 * stay a Server Component.
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
      <PhotoLightbox
        photos={photos}
        openIndex={openIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
