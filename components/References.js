"use client";
import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";

const TILT = [-1.2, 0.8, -0.5, 1.2, -0.9, 0.6];

export default function References({ items = [] }) {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (open === null) return;
    const n = items.length;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i + 1) % n);
      if (e.key === "ArrowLeft") setOpen((i) => (i - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items.length]);

  return (
    <section id="inspiration" className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow">Get inspired</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">References</h2>
        <p className="hand mt-2 text-2xl">Tap a frame to look closer</p>
      </Reveal>

      {items.length === 0 ? (
        <p className="text-center text-charcoal">
          Add images to <code>public/references/</code> and they will appear here.
        </p>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {items.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setOpen(i)}
              className="polaroid group mb-5 block w-full break-inside-avoid text-left transition duration-300 hover:z-10 hover:scale-[1.03]"
              style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}
              aria-label={`View ${img.label}`}
            >
              <img src={img.src} alt={img.label} loading="lazy" className="h-auto w-full" />
              <span className="hand mt-1.5 block truncate text-xl capitalize text-ink">{img.label}</span>
            </button>
          ))}
        </div>
      )}

      {open !== null && items[open] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={items[open].label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setOpen(null)}
        >
          <img
            src={items[open].src}
            alt={items[open].label}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={() => setOpen(null)} aria-label="Close"
            className="btn btn-primary absolute right-4 top-4 !bg-paper !text-ink !py-2 !px-4">
            ✕
          </button>
          {items.length > 1 && (
            <>
              <button
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + items.length) % items.length); }}
                className="btn absolute left-3 top-1/2 -translate-y-1/2 !bg-paper !py-2 !px-4"
              >
                ‹
              </button>
              <button
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % items.length); }}
                className="btn absolute right-3 top-1/2 -translate-y-1/2 !bg-paper !py-2 !px-4"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}