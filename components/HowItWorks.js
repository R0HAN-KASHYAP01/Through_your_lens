import Reveal from "@/components/Reveal";

const I = (d) => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const STEPS = [
  {
    n: "01", title: "Register", accent: "var(--yellow)",
    text: "Enter your name and email. That is all it takes to join.",
    icon: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>),
  },
  {
    n: "02", title: "Discover Your Color", accent: "var(--orange)",
    text: "Spin the wheel once and receive your color. It is yours for the day.",
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
    <section id="how" className="mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
      <Reveal className="mb-10 text-center">
        <p className="eyebrow">The process</p>
        <h2 className="mt-2 font-display text-3xl font-bold sm:text-5xl">How it works</h2>
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
                  <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
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