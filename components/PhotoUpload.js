"use client";
import { useRef, useState } from "react";

const MAX_SIDE = 1600;
const OK = ["image/jpeg", "image/png", "image/webp"];

// shrink big phone photos in the browser so they upload fast
async function compress(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bitmap = await createImageBitmap(file);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
}

// XHR so we can show real upload progress
function send(blob, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/photo");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let d = {};
      try { d = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(d);
      else reject(new Error(d.error || "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Network error. Please try again."));
    const fd = new FormData();
    fd.append("photo", blob, "photo.jpg");
    xhr.send(fd);
  });
}

export default function PhotoUpload({ verified, photo, color, hex, onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const input = useRef(null);

  const accent = hex || "var(--charcoal)";

  function choose(f) {
    setError("");
    if (!f) return;
    if (!OK.includes(f.type)) return setError("Please choose a JPG, PNG or WEBP image.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clear() {
    setFile(null);
    setPreview("");
    setProgress(0);
    if (input.current) input.current.value = "";
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError("");
    setProgress(0);
    try {
      const blob = await compress(file);
      if (!blob) throw new Error("Could not read this image.");
      await send(blob, setProgress);
      onDone(); // refresh from the server: only now is it really saved
    } catch (err) {
      setError(err.message || "Upload failed");
    }
    setBusy(false);
  }

  if (!verified) {
    return (
      <div className="card w-full max-w-md p-8 text-center text-charcoal">
        Enter your name and email to unlock photo upload.
      </div>
    );
  }

  if (photo) {
    return (
      <div className="relative w-full max-w-sm pt-4 text-center">
        <span className="tape left-1/2 top-0 -translate-x-1/2" />
        <div className="polaroid pop mx-auto -rotate-1">
          {photo.url ? (
            <img src={photo.url} alt="Your submitted photograph" className="max-h-96 w-full object-cover" />
          ) : (
            <div className="grid h-60 place-items-center text-charcoal">Photo saved</div>
          )}
          <p className="hand mt-2 text-2xl text-ink">{color ? `My ${color} story` : "My story"}</p>
        </div>
        <p role="status" className="mt-5 inline-block bg-leaf px-3 py-1 text-sm font-semibold text-white">
          Submitted
        </p>
        <p className="mt-2 text-sm text-charcoal">Only one photo is allowed per person.</p>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-xl p-6 sm:p-8">
      {color && (
        <p className="mb-4 flex items-center justify-center gap-2 text-sm text-charcoal">
          <span className="inline-block h-4 w-4 border border-ink" style={{ background: accent }} />
          Your color: <strong className="text-ink">{color}</strong>
        </p>
      )}

      {preview ? (
        <div className="text-center">
          <img src={preview} alt="Preview of the selected photo" className="mx-auto max-h-80 object-contain" />

          {busy && (
            <div className="mt-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-2 w-full bg-sand">
                <div className="h-full transition-all" style={{ width: `${progress}%`, background: accent }} />
              </div>
              <p className="mt-1 text-xs text-charcoal">{progress}%</p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button onClick={upload} disabled={busy} className="btn btn-primary">
              {busy ? "Uploading..." : "Upload photo"}
            </button>
            <button onClick={clear} disabled={busy} className="btn btn-ghost">
              Choose another
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files?.[0]); }}
          className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-12 text-center transition"
          style={{
            borderColor: drag ? "var(--ink)" : accent,
            background: drag ? "rgba(246,201,69,.2)" : "var(--ivory)",
          }}
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
          </svg>
          <span className="mt-3 font-display text-lg font-bold">Drop your photograph here</span>
          <span className="mt-1 text-sm text-charcoal">
            or <span className="font-semibold underline underline-offset-4">browse files</span>
          </span>
          <span className="mt-3 text-xs text-charcoal">JPG, PNG or WEBP. One photo only.</span>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => choose(e.target.files?.[0])}
          />
        </label>
      )}

      {error && <p role="alert" className="mt-4 text-center text-sm font-medium text-brick">{error}</p>}
      <p className="mt-4 text-center text-xs text-charcoal">
        You can submit only once, so choose your best frame.
      </p>
    </div>
  );
}