"use client";

import { useState } from "react";
import EditorialGallery from "./EditorialGallery";
import PhotoViewer from "./PhotoViewer";
import type { GalleryPhoto } from "./types";

/**
 * Client wrapper pairing the editorial gallery with the click-to-open
 * PhotoViewer. Clicking any photo opens the fullscreen viewer at that photo,
 * where it can be swiped/dragged through. Keeps all viewer state on the client
 * so the page can stay a Server Component.
 */
export default function GalleryWithLightbox({
  eyebrow,
  heading,
  photos,
}: {
  eyebrow?: string;
  heading?: string;
  photos: GalleryPhoto[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <EditorialGallery
        eyebrow={eyebrow}
        heading={heading}
        photos={photos}
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
