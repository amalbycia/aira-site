"use client";

import { useState, useRef, useCallback } from "react";
import type { PhotoRow, PageBrand } from "@/lib/cms/admin";
import { compressImage } from "../compressImage";

export default function PhotosTab({
  initial,
  onToast,
}: {
  initial: { photography: PhotoRow[]; events: PhotoRow[] };
  onToast: (msg: string) => void;
}) {
  const [page, setPage] = useState<PageBrand>("photography");
  const [photos, setPhotos] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = photos[page];
  const setCurrent = (next: PhotoRow[]) =>
    setPhotos((p) => ({ ...p, [page]: next }));

  // ── Upload (compress in browser → POST one at a time) ──────────────────────
  const upload = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;
      setUploading(true);
      setProgress({ done: 0, total: images.length });

      const added: PhotoRow[] = [];
      for (let i = 0; i < images.length; i++) {
        try {
          const compressed = await compressImage(images[i]);
          const fd = new FormData();
          fd.append("file", compressed);
          fd.append("page", page);
          const res = await fetch("/api/admin/photos", { method: "POST", body: fd });
          if (res.ok) {
            const { photo } = await res.json();
            added.push(photo);
          }
        } catch {
          /* skip this file, keep going */
        }
        setProgress({ done: i + 1, total: images.length });
      }

      setPhotos((p) => ({ ...p, [page]: [...p[page], ...added] }));
      setUploading(false);
      onToast(`${added.length} photo${added.length === 1 ? "" : "s"} added`);
    },
    [page, onToast],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    upload(Array.from(e.dataTransfer.files));
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function remove(id: number) {
    if (!confirm("Remove this photo? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCurrent(current.filter((p) => p.id !== id));
      onToast("Photo removed");
    } else {
      onToast("Could not remove photo");
    }
  }

  // ── Reorder ─────────────────────────────────────────────────────────────────
  // Two paths so it works everywhere: HTML5 drag on desktop (pointer), and
  // move up/down buttons that work on touch devices where native drag doesn't.
  const dragId = useRef<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  async function persistOrder(list: PhotoRow[]) {
    setCurrent(list);
    const res = await fetch("/api/admin/photos/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: list.map((p) => p.id) }),
    });
    onToast(res.ok ? "Order saved" : "Could not save order");
  }

  /** Move the photo at index `from` by `dir` (-1 up, +1 down). */
  async function move(from: number, dir: -1 | 1) {
    const to = from + dir;
    if (to < 0 || to >= current.length) return;
    const list = [...current];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    await persistOrder(list);
  }

  function onCardDragStart(id: number) {
    dragId.current = id;
  }
  function onCardDragOver(e: React.DragEvent, id: number) {
    e.preventDefault();
    if (id !== overId) setOverId(id);
  }
  async function onCardDrop(targetId: number) {
    const sourceId = dragId.current;
    dragId.current = null;
    setOverId(null);
    if (sourceId == null || sourceId === targetId) return;

    const list = [...current];
    const from = list.findIndex((p) => p.id === sourceId);
    const to = list.findIndex((p) => p.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    await persistOrder(list);
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Photo Gallery</h2>
          <p>
            Reorder with the arrows (or drag on desktop). They appear on the site
            in this order.
          </p>
        </div>
        <div className="page-switch">
          <button data-active={page === "photography"} onClick={() => setPage("photography")}>
            Photography
          </button>
          <button data-active={page === "events"} onClick={() => setPage("events")}>
            Events
          </button>
        </div>
      </div>

      <div
        className="dropzone"
        data-drag={dragActive}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            upload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        {uploading ? (
          <div className="dropzone__progress">
            Uploading {progress.done} / {progress.total}…
            <div className="dropzone__bar">
              <div style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
            </div>
          </div>
        ) : (
          <>
            <strong>Click to choose</strong> or drag photos here
            <br />
            <span className="muted" style={{ fontSize: "0.8rem" }}>
              Any size — they’re optimized automatically before upload.
            </span>
          </>
        )}
      </div>

      {current.length === 0 ? (
        <div className="empty">No photos yet. Add some above.</div>
      ) : (
        <div className="photo-grid">
          {current.map((photo, i) => (
            <figure
              key={photo.id}
              className={`photo-card${overId === photo.id ? " drop-target" : ""}`}
              draggable
              onDragStart={() => onCardDragStart(photo.id)}
              onDragOver={(e) => onCardDragOver(e, photo.id)}
              onDrop={() => onCardDrop(photo.id)}
            >
              <span className="photo-card__order">{i + 1}</span>
              <button
                className="photo-card__del"
                title="Remove photo"
                aria-label="Remove photo"
                onClick={() => remove(photo.id)}
              >
                ✕
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt ?? ""} loading="lazy" />
              <div className="photo-card__move">
                <button
                  className="photo-card__arrow"
                  aria-label="Move earlier"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  ‹
                </button>
                <button
                  className="photo-card__arrow"
                  aria-label="Move later"
                  disabled={i === current.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ›
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
