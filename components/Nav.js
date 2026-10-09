"use client";
import { useState } from "react";
import JoinButton from "@/components/JoinButton";

const LINKS = [
  ["Home", "#top"],
  ["Event details", "#details"],
  ["Spin", "#spin"],
  ["Upload", "#upload"],
  ["Inspiration", "#inspiration"],
];

function Mark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="#191919" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="11" fill="#F6C945" stroke="#191919" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="4.5" fill="#191919" />
      <circle cx="26" cy="14" r="1.8" fill="#F7F3EA" />
    </svg>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-40 border-b border-sand bg-ivory/95 backdrop-blur"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <a href="#top" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-lg font-bold tracking-tight">Through Your Lens</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="text-sm font-medium text-charcoal transition hover:text-ink">
                {label}
              </a>
            </li>
          ))}
          <li>
            <JoinButton className="btn btn-primary !py-2 !px-4 text-sm">
              Join the Challenge
            </JoinButton>
          </li>
        </ul>

        <button
          className="grid h-11 w-11 place-items-center border-2 border-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <ul id="mobile-menu" className="border-t border-sand bg-ivory px-4 pb-4 md:hidden">
          {LINKS.map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setOpen(false)}
                className="block border-b border-sand py-3 font-medium"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <JoinButton className="btn btn-primary w-full" onClick={() => setOpen(false)}>
              Join the Challenge
            </JoinButton>
          </li>
        </ul>
      )}
    </nav>
  );
}