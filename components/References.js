"use client";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

const TILT = [-1.2, 0.8, -0.5, 1.2, -0.9, 0.6];
const SPEED = 60; // pixels per second, raise for faster

export default function References({ items = [] }) {
  const [open, setOpen] = useState(null);
  const [itemW, setItemW] = useState(0);

  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const hoverRef = useRef(false);
  const openRef = useRef(null);
  openRef.current = open;

  // lightbox keyboard controls
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

  // item width: 4 visible on desktop, 2 on phones
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const visible = window.innerWidth >= 768 ? 4 : 2;
      setItemW(el.clientWidth / visible);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  // automatic right-to-left movement
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !itemW || items.length === 0) return;

    const loopWidth = itemW * items.length;
    let last = performance.now();
    let raf;

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!hoverRef.current && openRef.current === null) {
        offsetRef.current = (offsetRef.current + SPEED * dt) % loopWidth;
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [itemW, items.length]);

  // three copies so there is never a gap
  const loop = [...items, ...items, ...items];

  return (
    <section id="inspiration" className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow">Get inspired</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">References</h2>
        <p className="hand mt-2 text-2xl">Tap a frame to look closer</p>
      </Reveal>

      {items.length === 0 ? (
        <p className="text-center text-charcoal">
          Add images to <code>public/</code> and they will appear here.
        </p>
      ) : (
        <div
          ref={wrapRef}
          className="overflow-hidden py-7"
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
          style={{ visibility: itemW ? "visible" : "hidden" }}
        >
          <div ref={trackRef} className="flex w-max will-change-transform">
            {loop.map((img, i) => {
              const index = i % items.length;
              const isCopy = i >= items.length;
              return (
                <div
                  key={`${img.src}-${i}`}
                  className="shrink-0 px-2"
                  style={{ width: itemW }}
                >
                  <button
                    onClick={() => setOpen(index)}
                    className="polaroid group block w-full text-left transition duration-300 hover:z-10 hover:scale-[1.03]"
                    style={{ transform: `rotate(${TILT[index % TILT.length]}deg)` }}
                    aria-label={`View ${img.label}`}
                    aria-hidden={isCopy || undefined}
                    tabIndex={isCopy ? -1 : undefined}
                  >
                    <img
                      src={img.src}
                      alt={isCopy ? "" : img.label}
                      draggable={false}
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <span className="hand mt-1.5 block truncate text-xl capitalize text-ink">
                      {img.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
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
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="btn btn-primary absolute right-4 top-4 !bg-paper !text-ink !py-2 !px-4"
          >
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