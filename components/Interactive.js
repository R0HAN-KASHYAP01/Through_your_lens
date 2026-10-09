"use client";
import { useCallback, useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import Wheel from "@/components/Wheel";
import PhotoUpload from "@/components/PhotoUpload";

function Section({ id, n, title, subtitle, children }) {
  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow">Step {n}</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-charcoal">{subtitle}</p>}
      </Reveal>
      <div className="flex flex-col items-center">{children}</div>
    </section>
  );
}

export default function Interactive() {
  const [data, setData] = useState({ loading: true, registered: false, colors: [] });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/status", { cache: "no-store" });
      const d = await res.json();
      setData({ ...d, loading: false });
    } catch {
      setData((p) => ({ ...p, loading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Something went wrong");
      await refresh();
      // wait for React to re-render before scrolling
      setTimeout(() => {
        document.getElementById("spin")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function notYou() {
    await fetch("/api/logout", { method: "POST" });
    setName("");
    setEmail("");
    await refresh();
    // the register form only exists after re-render, so wait a moment
    setTimeout(() => {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const registered = !!data.registered;
  const cardName = registered ? data.user?.name : name.trim() || "Your name";
  const cardEmail = registered ? data.user?.email : email.trim() || "your@email.com";

  return (
    <>
      {/* STEP 1 */}
      {!data.loading && !registered && (
        <Section
          id="register"
          n="1"
          title="Join the challenge"
          subtitle="Use the email you want your color and photo saved under."
        >
          <div className="relative w-full max-w-md">
            <span className="tape -top-3 left-1/2 -translate-x-1/2" />
            <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8" noValidate={false}>
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <input
                  id="name"
                  className="field"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  className="field"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button disabled={busy} className="btn btn-primary w-full">
                {busy ? "Submitting..." : "Submit and continue"}
              </button>
              {error && (
                <p role="alert" className="text-center text-sm font-medium text-brick">
                  {error}
                </p>
              )}
            </form>
          </div>
        </Section>
      )}

      {/* STEP 2 */}
      <Section
        id="spin"
        n={registered ? "1" : "2"}
        title="Spin for your color"
        subtitle="One spin per email. Your color is final."
      >
        <div
          id="user-card"
          className="card relative mb-10 flex w-full max-w-md scroll-mt-24 items-center gap-4 p-5"
        >
          <div
            className="grid h-12 w-12 shrink-0 place-items-center border-2 border-ink font-display text-lg font-bold text-ink"
            style={{ background: data.spun && data.hex ? data.hex : "var(--yellow)" }}
          >
            {cardName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-bold">{cardName}</p>
            <p className="truncate text-sm text-charcoal">{cardEmail}</p>
          </div>
          <span
            role="status"
            className={`shrink-0 px-2.5 py-1 text-xs font-semibold ${
              registered ? "bg-leaf text-white" : "border border-sand text-charcoal"
            }`}
          >
            {registered ? "Registered" : "Not registered"}
          </span>
        </div>
        {registered && (
          <button
            onClick={notYou}
            className="-mt-6 mb-10 text-xs text-charcoal underline underline-offset-4"
          >
            Not you? Use a different email
          </button>
        )}

        {data.loading ? (
          <div className="h-72 w-72 animate-pulse rounded-full bg-sand sm:h-[26rem] sm:w-[26rem]" />
        ) : (
          <Wheel
            colors={data.colors}
            canSpin={registered && !data.spun}
            resultName={data.spun ? data.color : null}
            resultHex={data.spun ? data.hex : null}
            onSpun={refresh}
          />
        )}
      </Section>

      {/* STEP 3 */}
      <Section
        id="upload"
        n={registered ? "2" : "3"}
        title="Upload your photograph"
        subtitle="One photo per person. Make it count."
      >
        <PhotoUpload
          verified={registered}
          photo={data.photo}
          color={data.color}
          hex={data.hex}
          onDone={refresh}
        />
      </Section>
    </>
  );
}