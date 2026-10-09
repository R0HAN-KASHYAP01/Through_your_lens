"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Login failed");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="relative w-full max-w-sm">
        <span className="tape -top-3 left-1/2 -translate-x-1/2" />
        <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
          <div>
            <p className="eyebrow">Organizer only</p>
            <h1 className="mt-1 font-display text-3xl font-bold">Sign in</h1>
          </div>
          <div>
            <label htmlFor="a-email" className="label">Email</label>
            <input id="a-email" type="email" className="field" autoComplete="username"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="a-pass" className="label">Password</label>
            <div className="flex gap-2">
              <input id="a-pass" type={show ? "text" : "password"} className="field"
                autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShow((s) => !s)}
                className="btn btn-ghost !px-3 text-sm" aria-pressed={show}>
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button disabled={busy} className="btn btn-primary w-full">
            {busy ? "Signing in..." : "Sign in"}
          </button>
          {error && <p role="alert" className="text-center text-sm font-medium text-brick">{error}</p>}
        </form>
      </div>
    </main>
  );
}