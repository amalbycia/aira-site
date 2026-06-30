"use client";

import { useState } from "react";
import type { SettingsRow } from "@/lib/cms/admin";

const FIELDS: { key: keyof SettingsRow; label: string; placeholder?: string }[] = [
  { key: "business_name", label: "Business name" },
  { key: "tagline", label: "Tagline", placeholder: "Capturing moments, crafting memories." },
  { key: "years_of_experience", label: "Years of experience", placeholder: "9+" },
  { key: "email", label: "Contact email" },
  { key: "phone", label: "Phone number" },
  { key: "instagram_url", label: "Instagram URL" },
  { key: "facebook_url", label: "Facebook URL" },
  { key: "youtube_url", label: "YouTube URL" },
  { key: "location_photography", label: "Location text — Photography page" },
  { key: "location_events", label: "Location text — Events page" },
];

const empty: SettingsRow = {
  business_name: "",
  tagline: "",
  years_of_experience: "",
  email: "",
  phone: "",
  instagram_url: "",
  facebook_url: "",
  youtube_url: "",
  location_photography: "",
  location_events: "",
};

export default function SettingsTab({
  initial,
  onToast,
}: {
  initial: SettingsRow | null;
  onToast: (msg: string) => void;
}) {
  const [form, setForm] = useState<SettingsRow>(() => ({
    ...empty,
    ...(initial ?? {}),
  }));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    onToast(res.ok ? "Settings saved" : "Could not save settings");
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Site Settings</h2>
          <p>Business details, contact info, and social links shown in the footer.</p>
        </div>
      </div>

      <div className="card">
        <div className="grid-2">
          {FIELDS.map((f) => (
            <label className="field" key={f.key}>
              <span className="field__label">{f.label}</span>
              <input
                className="input"
                value={form[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
          <button className="btn btn--primary" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
