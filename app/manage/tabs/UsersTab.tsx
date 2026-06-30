"use client";

import { useState } from "react";
import type { AdminUserRow } from "@/lib/cms/admin";

const MAX = 4;

function fmtDate(d: string): string {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UsersTab({
  initial,
  currentEmail,
  onToast,
}: {
  initial: AdminUserRow[];
  currentEmail: string | null;
  onToast: (msg: string) => void;
}) {
  const [users, setUsers] = useState(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  // id of the user whose password is being changed (inline), or null
  const [pwFor, setPwFor] = useState<number | null>(null);
  const [newPw, setNewPw] = useState("");

  const atLimit = users.length >= MAX;

  async function addUser() {
    if (!email.trim() || !password) {
      onToast("Enter an email and password");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    setBusy(false);
    if (res.ok) {
      const { user } = await res.json();
      setUsers((u) => [...u, user]);
      setEmail("");
      setPassword("");
      onToast("Account created");
    } else {
      const { error } = await res.json().catch(() => ({}));
      onToast(error || "Could not create account");
    }
  }

  async function changePassword(id: number) {
    if (!newPw || newPw.length < 8) {
      onToast("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: newPw }),
    });
    setBusy(false);
    if (res.ok) {
      setPwFor(null);
      setNewPw("");
      onToast("Password updated");
    } else {
      const { error } = await res.json().catch(() => ({}));
      onToast(error || "Could not update password");
    }
  }

  async function remove(id: number, userEmail: string) {
    if (!confirm(`Remove ${userEmail}? They will no longer be able to sign in.`)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((u) => u.filter((x) => x.id !== id));
      onToast("Account removed");
    } else {
      const { error } = await res.json().catch(() => ({}));
      onToast(error || "Could not remove account");
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h2>Users</h2>
          <p>
            People who can sign in to this admin. Up to {MAX} accounts. You set
            each person&apos;s email and password.
          </p>
        </div>
      </div>

      {/* Add account */}
      <div className="card">
        {atLimit ? (
          <p className="muted" style={{ margin: 0 }}>
            You&apos;ve reached the maximum of {MAX} accounts. Remove one to add another.
          </p>
        ) : (
          <>
            <div className="grid-2">
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field__label">Email</span>
                <input
                  className="input"
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="person@email.com"
                />
              </label>
              <label className="field" style={{ marginBottom: 0 }}>
                <span className="field__label">Password (min 8 chars)</span>
                <input
                  className="input"
                  type="text"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password to give them"
                />
              </label>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn--primary" onClick={addUser} disabled={busy}>
                {busy ? "Adding…" : "Add account"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Account list */}
      {users.length === 0 ? (
        <div className="empty">
          No accounts yet. Add one above — until then, sign in with the shared
          password.
        </div>
      ) : (
        users.map((u) => {
          const isMe = currentEmail && u.email.toLowerCase() === currentEmail.toLowerCase();
          return (
            <div key={u.id} className="card">
              <div className="user-row">
                <div className="user-row__body">
                  <div className="review-row__name">
                    {u.email}
                    {isMe ? <span className="badge" style={{ marginLeft: 8 }}>You</span> : null}
                  </div>
                  <div className="review-row__meta">Added {fmtDate(u.created_at)}</div>

                  {pwFor === u.id ? (
                    <div className="user-row__pw">
                      <input
                        className="input"
                        type="text"
                        autoComplete="off"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="New password (min 8 chars)"
                      />
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => changePassword(u.id)}
                          disabled={busy}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            setPwFor(null);
                            setNewPw("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="user-row__actions">
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      setPwFor(pwFor === u.id ? null : u.id);
                      setNewPw("");
                    }}
                  >
                    {pwFor === u.id ? "Close" : "Change password"}
                  </button>
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => remove(u.id, u.email)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
