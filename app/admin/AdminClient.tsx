"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not sign in.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm rounded-2xl border border-line bg-card p-6">
      <label htmlFor="pw" className="mb-2 block text-sm text-muted">
        Admin password
      </label>
      <input
        id="pw"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-line bg-background px-4 py-2.5 text-sm outline-none focus:border-accent2"
        autoFocus
      />
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="gradient-bar mt-5 w-full rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
      }}
      className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition hover:border-accent2 hover:text-foreground"
    >
      Sign out
    </button>
  );
}

export function DeleteButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm(`Delete “${title}”? This can't be undone.`)) return;
        setBusy(true);
        const res = await fetch(`/api/admin/posts?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
        setBusy(false);
        if (res.ok) router.refresh();
        else window.alert("Could not delete the article.");
      }}
      className="text-sm text-muted transition hover:text-accent disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
