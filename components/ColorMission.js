import { COLOR_NOTES, EVENT } from "@/lib/event";

export default function ColorMission({ name, hex }) {
  return (
    <div className="card pop relative w-full max-w-2xl overflow-hidden">
      <div className="grid sm:grid-cols-[200px_1fr]">
        <div
          className="min-h-36 border-b border-ink sm:border-b-0 sm:border-r"
          style={{ background: hex }}
          role="img"
          aria-label={`${name} color swatch`}
        />
        <div className="p-6">
          <p className="eyebrow">Your mission</p>
          <h3 className="mt-1 font-display text-3xl font-bold uppercase leading-tight sm:text-4xl">
            Capture {name}
          </h3>
          <p className="mt-1 font-mono text-xs text-charcoal">{hex?.toUpperCase()}</p>
          <p className="mt-3 leading-relaxed text-charcoal">
            {COLOR_NOTES[name] ?? "Find this color in unexpected places and make it your story."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#upload" className="btn btn-primary !py-2.5 text-sm">Go to upload</a>
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-semibold underline underline-offset-4">
              View challenge rules
            </summary>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-charcoal">
              {EVENT.rules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
}