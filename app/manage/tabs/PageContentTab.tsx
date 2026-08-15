"use client";

import { useState } from "react";
import type { PageBrand, PageContentRow } from "@/lib/cms/admin";

type Field = {
  key: keyof PageContentRow;
  label: string;
  hint?: string;
  textarea?: boolean;
};

/** Grouped so the form reads as "the page, top to bottom". */
const GROUPS: { title: string; note?: string; fields: Field[] }[] = [
  {
    title: "Top of the page",
    note: "The big heading visitors see first.",
    fields: [
      { key: "hero_eyebrow", label: "Small label above the title", hint: "e.g. Every celebration, in full" },
      { key: "hero_title", label: "Main title" },
      { key: "hero_subtitle", label: "Sentence under the title", textarea: true },
    ],
  },
  {
    title: "Intro section",
    fields: [
      { key: "intro_eyebrow", label: "Small label" },
      { key: "intro_heading", label: "Heading" },
      { key: "intro_body", label: "Paragraph", textarea: true },
    ],
  },
  {
    title: "Section headings",
    note: "Titles above each block further down the page.",
    fields: [
      { key: "services_heading", label: "Services section heading" },
      { key: "gallery_heading", label: "Photo gallery heading" },
      { key: "reels_heading", label: "Videos and reels heading" },
      { key: "menu_heading", label: "Catering menu heading" },
    ],
  },
  {
    title: "Numbers strip",
    note: "Three figures shown as proof. Fill in both boxes of a pair, or leave both empty to hide it.",
    fields: [
      { key: "stat_1_value", label: "Number 1", hint: "e.g. 9+" },
      { key: "stat_1_label", label: "Number 1 caption", hint: "e.g. Years of experience" },
      { key: "stat_2_value", label: "Number 2" },
      { key: "stat_2_label", label: "Number 2 caption" },
      { key: "stat_3_value", label: "Number 3" },
      { key: "stat_3_label", label: "Number 3 caption" },
    ],
  },
  {
    title: "Button",
    fields: [
      { key: "cta_label", label: "Button text", hint: "e.g. Enquire now" },
      { key: "cta_href", label: "Button link", hint: "e.g. /about or a full https:// link" },
    ],
  },
];

const EMPTY: PageContentRow = {
  hero_eyebrow: null,
  hero_title: null,
  hero_subtitle: null,
  intro_eyebrow: null,
  intro_heading: null,
  intro_body: null,
  services_heading: null,
  menu_heading: null,
  gallery_heading: null,
  reels_heading: null,
  cta_label: null,
  cta_href: null,
  stat_1_value: null,
  stat_1_label: null,
  stat_2_value: null,
  stat_2_label: null,
  stat_3_value: null,
  stat_3_label: null,
};

/**
 * Page Content editor — lets the owner rewrite the words on a brand page
 * without touching code.
 *
 * Every field is optional: leaving one blank keeps the site's built-in wording,
 * so the page can never end up with an empty heading.
 */
export default function PageContentTab({
  page,
  initial,
  onToast,
}: {
  page: PageBrand;
  initial: PageContentRow | null;
  onToast: (msg: string) => void;
}) {
  const [form, setForm] = useState<PageContentRow>({ ...EMPTY, ...(initial ?? {}) });
  const [busy, setBusy] = useState(false);

  const set = (key: keyof PageContentRow, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/page-content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ page, ...form }),
    });
    setBusy(false);
    onToast(res.ok ? "Saved — your page is updated" : "Could not save changes");
  }

  return (
    <div>
      <div className="section-head">
        <h2>Page Content</h2>
        <p className="muted">
          Change the wording on the {page === "events" ? "Events" : "Photography"} page.
          Leave a box empty to keep the current wording.
        </p>
      </div>

      {GROUPS.map((g) => (
        <div className="card" key={g.title} style={{ marginBottom: "1em" }}>
          <h3 style={{ margin: "0 0 0.2em", fontSize: "1em" }}>{g.title}</h3>
          {g.note ? (
            <p className="muted" style={{ margin: "0 0 1em" }}>
              {g.note}
            </p>
          ) : null}

          {g.fields.map((f) => (
            <label className="field" key={String(f.key)}>
              <span>{f.label}</span>
              {f.textarea ? (
                <textarea
                  className="textarea"
                  rows={3}
                  value={form[f.key] ?? ""}
                  placeholder={f.hint ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type="text"
                  value={form[f.key] ?? ""}
                  placeholder={f.hint ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>
      ))}

      <button
        type="button"
        className="btn btn--primary"
        onClick={save}
        disabled={busy}
      >
        {busy ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
