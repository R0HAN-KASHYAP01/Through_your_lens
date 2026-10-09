import fs from "node:fs";
import path from "node:path";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Interactive from "@/components/Interactive";
import References from "@/components/References";

// every image in /public (png, jpg, jpeg, webp, gif, avif) appears in the gallery
function getReferences() {
  const dir = path.join(process.cwd(), "public");
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => /\.(png|jpe?g|webp|gif|avif)$/i.test(f))
      .sort((a, b) => a.localeCompare(b))
      .map((f) => ({
        src: `/${encodeURIComponent(f)}`,
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
        <Hero />
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