import fs from "node:fs";
import path from "node:path";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Interactive from "@/components/Interactive";
import References from "@/components/References";

// every image in public/references/ appears in the gallery automatically
function getReferences() {
  const dir = path.join(process.cwd(), "public", "references");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp|gif|avif)$/i.test(f))
      .sort()
      .map((f) => ({
        src: `/references/${encodeURIComponent(f)}`,
        label: f.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      }));
  } catch {
    return [];
  }
}

export default function Page() {
  const items = getReferences();
  return (
    <>
      <Nav />
      <main>
        <Hero images={items.slice(0, 4)} />
        <HowItWorks />
        <Interactive />
        <References items={items} />
      </main>
      <footer className="border-t border-sand py-10 text-center">
        <p className="hand text-2xl">Every frame tells a story.</p>
        <p className="mt-1 text-sm text-charcoal">Through Your Lens</p>
      </footer>
    </>
  );
}