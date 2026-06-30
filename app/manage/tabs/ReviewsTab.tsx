"use client";

import { useState } from "react";
import type { ReviewRow, ContentScope } from "@/lib/cms/admin";

const SCOPE_LABEL: Record<ContentScope, string> = {
  photography: "Photography",
  events: "Events",
  both: "Both pages",
};

type Draft = {
  id?: number;
  reviewerName: string;
  rating: number;
  reviewText: string;
  reviewDate: string;
  page: ContentScope;
};

const emptyDraft = (): Draft => ({
  reviewerName: "",
  rating: 5,
  reviewText: "",
  reviewDate: "",
  page: "both",
});

function fmtDate(d: string | null): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ReviewsTab({
  initial,
  onToast,
}: {
  initial: ReviewRow[];
  onToast: (msg: string) => void;
}) {
  const [reviews, setReviews] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  function openNew() {
    setDraft(emptyDraft());
  }
  function openEdit(r: ReviewRow) {
    setDraft({
      id: r.id,
      reviewerName: r.reviewer_name,
      rating: r.rating,
      reviewText: r.review_text,
      reviewDate: r.review_date ? r.review_date.slice(0, 10) : "",
      page: r.page,
    });
  }

  async function save() {
    if (!draft) return;
    if (!draft.reviewerName.trim() || !draft.reviewText.trim()) {
      onToast("Name and review text are required");
      return;
    }
    setBusy(true);
    const body = JSON.stringify({
      reviewerName: draft.reviewerName.trim(),
      rating: draft.rating,
      reviewText: draft.reviewText.trim(),
      reviewDate: draft.reviewDate || undefined,
      page: draft.page,
    });
    const isEdit = draft.id != null;
    const res = await fetch(
      isEdit ? `/api/admin/reviews/${draft.id}` : "/api/admin/reviews",
      { method: isEdit ? "PUT" : "POST", headers: { "content-type": "application/json" }, body },
    );
    setBusy(false);
    if (!res.ok) {
      onToast("Could not save review");
      return;
    }
    if (isEdit) {
      setReviews((list) =>
        list.map((r) =>
          r.id === draft.id
            ? {
                ...r,
                reviewer_name: draft.reviewerName.trim(),
                rating: draft.rating,
                review_text: draft.reviewText.trim(),
                review_date: draft.reviewDate || null,
                page: draft.page,
              }
            : r,
        ),
      );
      onToast("Review updated");
    } else {
      const { review } = await res.json();
      setReviews((list) => [review, ...list]);
      onToast("Review added");
    }
    setDraft(null);
  }

  async function remove(id: number) {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((list) => list.filter((r) => r.id !== id));
      onToast("Review deleted");
    } else {
      onToast("Could not delete review");
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Reviews</h2>
          <p>Testimonials shown in the marquee on each page.</p>
        </div>
        <button className="btn btn--primary" onClick={openNew}>
          + Add review
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="empty">No reviews yet.</div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="card">
            <div className="review-row">
              <div className="review-row__body">
                <div className="review-row__name">{r.reviewer_name}</div>
                <div className="review-row__meta">
                  <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  {" · "}
                  <span className="badge">{SCOPE_LABEL[r.page]}</span>
                  {r.review_date ? ` · ${fmtDate(r.review_date)}` : ""}
                </div>
                <p className="review-row__text">{r.review_text}</p>
              </div>
              <div className="review-row__actions">
                <button className="btn btn--ghost btn--sm" onClick={() => openEdit(r)}>
                  Edit
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => remove(r.id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {draft ? (
        <div className="modal-backdrop" onClick={() => setDraft(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.id != null ? "Edit review" : "Add review"}</h3>
            <div className="grid-2">
              <label className="field">
                <span className="field__label">Reviewer name</span>
                <input
                  className="input"
                  value={draft.reviewerName}
                  onChange={(e) => setDraft({ ...draft, reviewerName: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Rating</span>
                <select
                  className="select"
                  value={draft.rating}
                  onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field__label">Review text</span>
              <textarea
                className="textarea"
                value={draft.reviewText}
                onChange={(e) => setDraft({ ...draft, reviewText: e.target.value })}
              />
            </label>
            <div className="grid-2">
              <label className="field">
                <span className="field__label">Date (optional)</span>
                <input
                  type="date"
                  className="input"
                  value={draft.reviewDate}
                  onChange={(e) => setDraft({ ...draft, reviewDate: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Show on</span>
                <select
                  className="select"
                  value={draft.page}
                  onChange={(e) => setDraft({ ...draft, page: e.target.value as ContentScope })}
                >
                  <option value="both">Both pages</option>
                  <option value="photography">Photography only</option>
                  <option value="events">Events only</option>
                </select>
              </label>
            </div>
            <div className="modal__actions">
              <button className="btn btn--ghost" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button className="btn btn--primary" onClick={save} disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
