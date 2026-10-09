"use client";
import { useEffect, useRef, useState } from "react";
import ColorMission from "@/components/ColorMission";

const R = 95;

const point = (deg, r) => {
  const rad = (deg * Math.PI) / 180;
  return [r * Math.sin(rad), -r * Math.cos(rad)];
};

const angleFor = (index, n) => 360 * 6 - (index + 0.5) * (360 / n);

function textOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111" : "#fff";
}

export default function Wheel({
  colors = [],
  canSpin = false,
  resultName = null,
  resultHex = null,
  onSpun = () => {},
}) {
  const [frozen, setFrozen] = useState(null); // keep segments fixed after spinning
  const list = frozen ?? colors;
  const N = list.length;
  const SEG = N > 0 ? 360 / N : 360;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [local, setLocal] = useState(null);
  const [error, setError] = useState("");
  const spunHere = useRef(false);

  const result = resultName ? { name: resultName, hex: resultHex } : local;

  // returning user: point the wheel at the color they already have
  useEffect(() => {
    if (!resultName || spunHere.current) return;
    const i = list.findIndex((c) => c.name === resultName);
    if (i !== -1) setRotation(angleFor(i, list.length));
  }, [resultName, list]);

  async function handleSpin() {
    setError("");
    setSpinning(true);
    spunHere.current = true;

    const res = await fetch("/api/spin", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setSpinning(false);
      spunHere.current = false;
      return;
    }

    const found = { name: data.color, hex: data.hex };
    const index = list.findIndex((c) => c.name === data.color);

    if (data.alreadySpun || index === -1) {
      setLocal(found);
      setSpinning(false);
      onSpun();
      return;
    }

    setFrozen(list);
    setRotation(angleFor(index, list.length));
    setTimeout(() => {
      setLocal(found);
      setSpinning(false);
      onSpun();
    }, 5200);
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="corners relative h-72 w-72 sm:h-[26rem] sm:w-[26rem]">
        {/* pointer */}
        <div
          aria-hidden="true"
          className="absolute -top-3 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[30px] border-l-transparent border-r-transparent border-t-ink drop-shadow"
        />

        {N === 0 ? (
          <div className="card grid h-full w-full place-items-center rounded-full border-4 border-ink p-10 text-center text-charcoal">
            All colors have been assigned.
          </div>
        ) : (
          <svg
            viewBox="-100 -100 200 200"
            role="img"
            aria-label="Color wheel"
            className="h-full w-full rounded-full ring-[6px] ring-ink shadow-xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)",
            }}
          >
            {list.map((c, i) => {
              const a0 = i * SEG;
              const a1 = (i + 1) * SEG;
              const mid = a0 + SEG / 2;
              const [x0, y0] = point(a0, R);
              const [x1, y1] = point(a1, R);
              return (
                <g key={c.name}>
                  {N === 1 ? (
                    <circle r={R} fill={c.hex} stroke="#F7F3EA" strokeWidth="1" />
                  ) : (
                    <path
                      d={`M0 0 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`}
                      fill={c.hex}
                      stroke="#F7F3EA"
                      strokeWidth="1"
                    />
                  )}
                  <text
                    transform={`rotate(${mid - 90}) translate(${R - 8},0)`}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill={textOn(c.hex)}
                    fontSize={N > 10 ? 6.5 : 8}
                    fontWeight="700"
                    style={{ fontFamily: "var(--font-space), sans-serif" }}
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
            <circle r="11" fill="#FFFDF8" stroke="#191919" strokeWidth="2.5" />
            <circle r="3.5" fill="#191919" />
          </svg>
        )}
      </div>

      {result ? (
        <ColorMission name={result.name} hex={result.hex} />
      ) : canSpin && N > 0 ? (
        <button onClick={handleSpin} disabled={spinning} className="btn btn-primary px-14 text-lg">
          {spinning ? "Spinning..." : "Spin the wheel"}
        </button>
      ) : N > 0 ? (
        <p className="border border-dashed border-charcoal/40 px-5 py-2.5 text-sm text-charcoal">
          Enter your name and email above to unlock the spin button
        </p>
      ) : null}

      {error && <p role="alert" className="text-sm font-medium text-brick">{error}</p>}
    </div>
  );
}