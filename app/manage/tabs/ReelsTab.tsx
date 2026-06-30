"use client";

import { useState, useRef } from "react";
import type { ReelRow, ContentScope } from "@/lib/cms/admin";

const CDN = process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "";
const thumb = (guid: string) => `${CDN.replace(/\/$/, "")}/${guid}/thumbnail.jpg`;

const SCOPE_LABEL: Record<ContentScope, string> = {
  photography: "Photography",
  events: "Events",
  both: "Both pages",
};

export default function ReelsTab({
  initial,
  onToast,
}: {
  initial: ReelRow[];
  onToast: (msg: string) => void;
}) {
  const [reels, setReels] = useState(initial);
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState<ContentScope>("both");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function pick() {
    if (!title.trim()) {
      onToast("Give the reel a title first");
      return;
    }
    fileRef.current?.click();
  }

  function upload(file: File) {
    setUploading(true);
    setProgress(0);

    // Step 1: upload the video file to Bunny Stream via the server proxy.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/upload-reel?title=${encodeURIComponent(title)}`, true);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = async () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        setUploading(false);
        onToast("Video upload failed");
        return;
      }
      let guid = "";
      try {
        guid = JSON.parse(xhr.responseText).guid;
      } catch {
        /* ignore */
      }
      if (!guid) {
        setUploading(false);
        onToast("Upload finished but no video id returned");
        return;
      }
      // Step 2: record the reel in the database.
      const res = await fetch("/api/admin/reels", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bunnyVideoId: guid, title: title.trim(), page: scope }),
      });
      setUploading(false);
      if (res.ok) {
        const { reel } = await res.json();
        setReels((r) => [...r, reel]);
        setTitle("");
        onToast("Reel added — it will play once Bunny finishes processing (a few min)");
      } else {
        onToast("Could not save reel");
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      onToast("Network error during upload");
    };
    xhr.setRequestHeader("content-type", "application/octet-stream");
    xhr.send(file);
  }

  async function remove(id: number) {
    if (!confirm("Remove this reel? The video is deleted from Bunny too.")) return;
    const res = await fetch(`/api/admin/reels/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReels((r) => r.filter((x) => x.id !== id));
      onToast("Reel removed");
    } else {
      onToast("Could not remove reel");
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Reels & Videos</h2>
          <p>Upload a video, choose which page it shows on. Hosted on Bunny Stream.</p>
        </div>
      </div>

      <div className="card">
        <div className="grid-2">
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="field__label">Reel title</span>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Riya & Arjun — Highlights"
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="field__label">Show on</span>
            <select className="select" value={scope} onChange={(e) => setScope(e.target.value as ContentScope)}>
              <option value="both">Both pages</option>
              <option value="photography">Photography only</option>
              <option value="events">Events only</option>
            </select>
          </label>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <button className="btn btn--primary" onClick={pick} disabled={uploading}>
            {uploading ? `Uploading… ${progress}%` : "Upload video"}
          </button>
          {uploading ? (
            <div className="dropzone__bar" style={{ flex: 1 }}>
              <div style={{ width: `${progress}%` }} />
            </div>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {reels.length === 0 ? (
        <div className="empty">No reels yet.</div>
      ) : (
        reels.map((reel) => (
          <div key={reel.id} className="card">
            <div className="reel-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="reel-row__thumb"
                src={reel.thumbnail_url || thumb(reel.bunny_video_id)}
                alt=""
                loading="lazy"
              />
              <div className="reel-row__body">
                <div className="review-row__name">{reel.title || "Untitled reel"}</div>
                <div className="review-row__meta">
                  <span className="badge">{SCOPE_LABEL[reel.page]}</span>
                </div>
              </div>
              <button className="btn btn--danger btn--sm" onClick={() => remove(reel.id)}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
