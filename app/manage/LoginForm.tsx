"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <p className="admin-login__brand">Agnitantra</p>
        <p className="admin-login__sub">Content Manager</p>
        {error ? <div className="admin-login__error">{error}</div> : null}
        <div className="field">
          <label className="field__label" htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="current-password"
            placeholder="Enter password"
          />
        </div>
        <button className="btn btn--primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
