"use client";
import { EVENT } from "@/lib/event";

export default function Header() {
  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-10 pb-8 text-center">
      {/* put your logo at public/logo.png */}
      <img
        src="/logo.png"
        alt="Through-your-lens logo"
        className="mx-auto mb-4 h-20 w-20 object-contain"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      <h1 className="text-4xl font-bold sm:text-6xl">{EVENT.name}</h1>
      <p className="mt-2 text-lg text-neutral-300">{EVENT.tagline}</p>
      <p className="mx-auto mt-4 max-w-2xl text-neutral-400">{EVENT.description}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        {[EVENT.date, EVENT.time, EVENT.venue].map((t) => (
          <span key={t} className="rounded-full border border-neutral-700 px-4 py-1.5 text-neutral-200">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {EVENT.steps.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Step {i + 1}
            </p>
            <p className="mt-1 font-semibold">{s.title}</p>
            <p className="text-sm text-neutral-400">{s.text}</p>
          </div>
        ))}
      </div>
    </header>
  );
}