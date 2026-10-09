import { EVENT } from "@/lib/event";

// color tiles are used until you add real photos to public/references/
const FALLBACK = ["#F6C945", "#F58232", "#2678C8", "#E7473D"];

function Card({ src, color, label, className, rotate }) {
  return (
    <figure
      className={`polaroid absolute transition duration-300 hover:z-20 hover:scale-[1.04] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {src ? (
        <img src={src} alt={label} className="aspect-[4/5] w-full object-cover" />
      ) : (
        <div className="aspect-[4/5] w-full" style={{ background: color }} role="img" aria-label={label} />
      )}
    </figure>
  );
}

export default function Hero({ images = [] }) {
  const pick = (i) => images[i]?.src ?? null;

  return (
    <header id="top" className="mx-auto w-full max-w-6xl px-4 pb-10 pt-12 sm:pt-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Photography challenge</p>
          <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
            Through
            <br />
            Your{" "}
            <span className="relative inline-block">
              Lens
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 -z-10 h-4 w-full -rotate-1 bg-sun sm:h-5"
              />
            </span>
          </h1>
          <p className="hand mt-4 text-3xl text-brick sm:text-4xl">{EVENT.tagline}</p>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-charcoal">{EVENT.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#register" className="btn btn-primary">Join the Challenge</a>
            <a href="#inspiration" className="btn btn-ghost">Explore the Gallery</a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2 text-sm">
            {[EVENT.date, EVENT.time, EVENT.venue].map((t) => (
              <li key={t} className="border border-sand bg-paper px-3 py-1.5 text-charcoal">
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* editorial collage */}
        <div className="relative mx-auto h-[420px] w-full max-w-md sm:h-[520px]" aria-hidden={images.length === 0}>
          <span className="tape left-10 top-0 z-10" />
          <Card src={pick(0)} color={FALLBACK[0]} label="Yellow reference photo"
            className="left-0 top-4 w-[52%]" rotate={-6} />
          <Card src={pick(1)} color={FALLBACK[1]} label="Red reference photo"
            className="right-0 top-0 w-[46%]" rotate={5} />
          <Card src={pick(2)} color={FALLBACK[2]} label="Blue reference photo"
            className="bottom-6 left-[8%] w-[44%]" rotate={4} />
          <Card src={pick(3)} color={FALLBACK[3]} label="Warm reference photo"
            className="bottom-0 right-[4%] w-[50%]" rotate={-4} />

          <span className="hand absolute -left-1 top-[46%] z-10 -rotate-6 text-2xl">Look closer</span>
          <span className="hand absolute right-0 top-[44%] z-10 rotate-3 text-2xl">Find your color</span>
          <span className="hand absolute -bottom-6 left-1/2 -translate-x-1/2 text-xl sm:text-2xl">
            Every frame tells a story
          </span>
        </div>
      </div>
    </header>
  );
}