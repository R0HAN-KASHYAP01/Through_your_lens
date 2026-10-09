import Reveal from "@/components/Reveal";

const I = (d) => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const FACTS = [
  { label: "Challenge dates", value: "15 – 20 October 2026", accent: "var(--yellow)" },
  { label: "Submission deadline", value: "12:00 PM, 20 October", accent: "var(--orange)" },
  { label: "Results announced", value: "20 October 2026", accent: "var(--purple)" },
  { label: "Entry", value: "One color, one Moodboard per person", accent: "var(--blue)" },
];

const TIMELINE = [
  {
    when: "15 October",
    title: "Challenge opens",
    text: "Register with your name and email, spin the wheel and receive your color.",
    accent: "var(--yellow)",
  },
  {
    when: "15 – 20 October",
    title: "Capture your story",
    text: "Explore your surroundings and photograph something that matches your color.",
    accent: "var(--orange)",
  },
  {
    when: "20 October, 12:00 PM",
    title: "Submissions close",
    text: "Upload your one best photograph before noon. Entries after the deadline are not accepted.",
    accent: "var(--blue)",
  },
  {
    when: "20 October",
    title: "Results announced",
    text: "Winners are announced and featured on the page.",
    accent: "var(--purple)",
  },
];

const STEPS = [
  {
    n: "01", title: "Register", accent: "var(--yellow)",
    text: "Enter your name and email. That is all it takes to join.",
    icon: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  },
  {
    n: "02", title: "Discover Your Color", accent: "var(--orange)",
    text: "Spin the wheel once and receive your color. It is yours for the challenge.",
    icon: I(<><circle cx="12" cy="12" r="9" /><path d="M12 3v9l6 4" /></>),
  },
  {
    n: "03", title: "Capture Your Story", accent: "var(--purple)",
    text: "Explore your surroundings and photograph something that matches your color.",
    icon: I(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>),
  },
  {
    n: "04", title: "Upload and Participate", accent: "var(--blue)",
    text: "Submit your one best photograph and see it confirmed on your page.",
    icon: I(<><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" /></>),
  },
];

export default function HowItWorks() {
  return (
    <section id="details" className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow">The challenge</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Event details</h2>
        <p className="mx-auto mt-3 max-w-xl text-charcoal">
          Six days, one color and one photograph. All times are in IST.
        </p>
      </Reveal>

      {/* quick facts */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((f, i) => (
          <li key={f.label}>
            <Reveal delay={i * 80} className="h-full">
              <div className="card h-full overflow-hidden">
                <div className="h-2" style={{ background: f.accent }} />
                <div className="p-5">
                  <p className="eyebrow">{f.label}</p>
                  <p className="mt-2 font-display text-xl font-bold leading-snug">{f.value}</p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {/* timeline */}
      <Reveal className="mb-8 mt-16 text-center">
        <h3 className="font-display text-2xl font-bold sm:text-3xl">Timeline</h3>
      </Reveal>

      <ol className="relative mx-auto max-w-2xl">
        <span aria-hidden="true" className="absolute bottom-2 left-[19px] top-2 w-0.5 bg-sand" />
        {TIMELINE.map((t, i) => (
          <li key={t.title} className="relative pb-10 pl-14 last:pb-0">
            <span
              className="absolute left-0 top-0 grid h-10 w-10 place-items-center border-2 border-ink font-display text-sm font-bold text-ink"
              style={{ background: t.accent }}
            >
              {i + 1}
            </span>
            <Reveal delay={i * 90}>
              <p className="eyebrow">{t.when}</p>
              <h4 className="mt-1 font-display text-xl font-bold">{t.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-charcoal">{t.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* how to take part */}
      <Reveal className="mb-8 mt-16 text-center">
        <h3 className="font-display text-2xl font-bold sm:text-3xl">How to take part</h3>
      </Reveal>

      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.n}>
            <Reveal delay={i * 90} className="h-full">
              <div className="card h-full overflow-hidden transition duration-300 hover:-translate-y-1">
                <div className="h-2" style={{ background: s.accent }} />
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold" style={{ color: s.accent }}>
                      {s.n}
                    </span>
                    <span className="text-ink">{s.icon}</span>
                  </div>
                  <h4 className="mt-4 font-display text-lg font-bold">{s.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal">{s.text}</p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}