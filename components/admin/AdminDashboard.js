"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function Stat({ label, value, sub, accent }) {
  return (
    <div className="card overflow-hidden">
      <div className="h-1.5" style={{ background: accent }} />
      <div className="p-4">
        <p className="eyebrow">{label}</p>
        <p className="mt-1 font-display text-4xl font-bold">{value}</p>
        {sub && <p className="mt-1 text-xs text-charcoal">{sub}</p>}
      </div>
    </div>
  );
}

function Panel({ title, right, children, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Badge({ r }) {
  if (r.hasPhoto)
    return <span className="bg-leaf px-2 py-0.5 text-xs font-semibold text-white">Completed</span>;
  if (r.spun)
    return <span className="bg-sun px-2 py-0.5 text-xs font-semibold text-ink">Photo pending</span>;
  return <span className="border border-sand px-2 py-0.5 text-xs text-charcoal">Not spun</span>;
}

function Chip({ name, hex }) {
  if (!name) return <span className="text-charcoal">-</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-4 w-4 border border-ink" style={{ background: hex }} />
      {name}
    </span>
  );
}

export default function AdminDashboard({ data, event, adminEmail }) {
  const router = useRouter();
  const { stats, colors, rows, daily } = data;

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [colorF, setColorF] = useState("all");
  const [max, setMax] = useState(String(data.maxUses));
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    if (!view) return;
    const onKey = (e) => e.key === "Escape" && setView(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (s && !r.name.toLowerCase().includes(s) && !r.email.includes(s)) return false;
      if (colorF !== "all" && r.color !== colorF) return false;
      if (status === "not_spun" && r.spun) return false;
      if (status === "pending" && !(r.spun && !r.hasPhoto)) return false;
      if (status === "done" && !r.hasPhoto) return false;
      return true;
    });
  }, [rows, q, status, colorF]);

  const gallery = rows.filter((r) => r.hasPhoto);
  const pct = (n) => (stats.registered ? Math.round((n / stats.registered) * 100) : 0);
  const dayMax = Math.max(1, ...daily.map((d) => d.count));

  async function handle(res) {
    if (res.status === 401) {
      router.refresh(); // session ended: shows the login form
      return false;
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d.error || "Something went wrong.");
      return false;
    }
    return true;
  }

  async function remove(r) {
    if (
      !confirm(
        `Delete ${r.name} (${r.email})?\n\nTheir color and photo are removed and the color slot is freed. This cannot be undone.`
      )
    )
      return;
    setBusyId(r.id);
    setMsg("");
    const res = await fetch(`/api/admin/participants/${r.id}`, { method: "DELETE" });
    setBusyId(null);
    if (await handle(res)) {
      setMsg(`Deleted ${r.name}.`);
      router.refresh();
    }
  }

  async function saveMax(e) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxUses: Number(max) }),
    });
    if (await handle(res)) {
      setMsg(`Each color can now be given to ${max} people.`);
      router.refresh();
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const small = "btn !py-2 !px-4 text-sm";

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      {/* top bar */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Organizer dashboard</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{event.name}</h1>
          <p className="text-sm text-charcoal">Signed in as {adminEmail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.refresh()} className={`${small} btn-ghost`}>Refresh</button>
          <a href="/api/admin/export" className={`${small} btn-ghost`}>Export CSV</a>
          <a href="/" className={`${small} btn-ghost`}>View site</a>
          <button onClick={signOut} className={`${small} btn-primary`}>Sign out</button>
        </div>
      </header>

      {msg && (
        <p role="status" className="border border-sand bg-paper px-4 py-2.5 text-sm font-medium">
          {msg}
        </p>
      )}

      {/* event details */}
      <Panel title="Event details">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="hand text-2xl text-brick">{event.tagline}</p>
            <p><span className="font-semibold">Date:</span> {event.date}</p>
            <p><span className="font-semibold">Time:</span> {event.time}</p>
            <p><span className="font-semibold">Venue:</span> {event.venue}</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold">Rules</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-charcoal">
              {event.rules.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </div>
      </Panel>

      {/* numbers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Registered" value={stats.registered} accent="var(--blue)" sub="People who entered name and email" />
        <Stat label="Spun the wheel" value={stats.spun} accent="var(--orange)" sub={`${pct(stats.spun)}% of registered`} />
        <Stat label="Photos submitted" value={stats.photos} accent="var(--green)" sub={`${stats.pending} spun but no photo yet`} />
        <Stat label="Color slots left" value={stats.slotsTotal - stats.slotsUsed} accent="var(--purple)"
          sub={`${stats.colorsLeft} of ${stats.colorsTotal} colors still on the wheel`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Participation funnel">
          {[
            ["Registered", stats.registered, "var(--blue)"],
            ["Spun", stats.spun, "var(--orange)"],
            ["Submitted photo", stats.photos, "var(--green)"],
          ].map(([l, n, c]) => (
            <div key={l} className="mb-4 last:mb-0">
              <div className="mb-1 flex justify-between text-sm">
                <span>{l}</span>
                <span className="font-semibold">{n} ({pct(n)}%)</span>
              </div>
              <div className="h-3 bg-sand">
                <div className="h-full" style={{ width: `${pct(n)}%`, background: c }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Registrations per day">
          {daily.length === 0 ? (
            <p className="text-sm text-charcoal">No registrations yet.</p>
          ) : (
            <div className="flex h-40 items-end gap-2" role="img" aria-label="Registrations per day bar chart">
              {daily.map((d) => (
                <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs font-semibold">{d.count}</span>
                  <div className="w-full bg-sun" style={{ height: `${(d.count / dayMax) * 100}%`, minHeight: 4 }} />
                  <span className="text-[10px] text-charcoal">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* colors */}
      <Panel
        title="Color assignment"
        right={
          <form onSubmit={saveMax} className="flex items-center gap-2 text-sm">
            <label htmlFor="max" className="font-semibold">Max people per color</label>
            <input id="max" type="number" min="1" max="100" value={max}
              onChange={(e) => setMax(e.target.value)} className="field !w-20 !py-1.5" />
            <button className={`${small} btn-primary !py-1.5`}>Save</button>
          </form>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="eyebrow">
              <tr>
                <th className="py-2 pr-3">Color</th>
                <th className="py-2 pr-3">Assigned</th>
                <th className="w-1/3 py-2 pr-3">Usage</th>
                <th className="py-2 pr-3">Left</th>
                <th className="py-2">Photos</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((c) => (
                <tr key={c.name} className="border-t border-sand">
                  <td className="py-2 pr-3"><Chip name={c.name} hex={c.hex} /></td>
                  <td className="py-2 pr-3">{c.used} / {c.max}</td>
                  <td className="py-2 pr-3">
                    <div className="h-2.5 bg-sand">
                      <div className="h-full border-r border-ink/30"
                        style={{ width: `${(c.used / c.max) * 100}%`, background: c.hex }} />
                    </div>
                  </td>
                  <td className="py-2 pr-3">
                    {c.remaining === 0
                      ? <span className="bg-ink px-2 py-0.5 text-xs font-semibold text-paper">Full</span>
                      : c.remaining}
                  </td>
                  <td className="py-2">{c.photos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-charcoal">
          Lowering the max below a color's current count just marks it Full. Nobody loses their color.
        </p>
      </Panel>

      {/* participants */}
      <Panel
        title={`Participants (${filtered.length})`}
        right={
          <div className="flex flex-wrap gap-2">
            <input className="field !w-52 !py-2 text-sm" placeholder="Search name or email"
              aria-label="Search participants" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="field !w-40 !py-2 text-sm" aria-label="Filter by status"
              value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="not_spun">Not spun</option>
              <option value="pending">Photo pending</option>
              <option value="done">Completed</option>
            </select>
            <select className="field !w-40 !py-2 text-sm" aria-label="Filter by color"
              value={colorF} onChange={(e) => setColorF(e.target.value)}>
              <option value="all">All colors</option>
              {colors.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        }
      >
        {data.truncated && (
          <p className="mb-3 text-xs text-brick">
            Showing the newest 1000 participants. Use Export CSV for the complete list.
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="eyebrow">
              <tr>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Color</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Registered</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-charcoal">No participants match.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-sand align-middle">
                  <td className="py-2 pr-3 font-semibold">{r.name}</td>
                  <td className="py-2 pr-3 break-all">{r.email}</td>
                  <td className="py-2 pr-3"><Chip name={r.color} hex={r.hex} /></td>
                  <td className="py-2 pr-3"><Badge r={r} /></td>
                  <td className="py-2 pr-3 whitespace-nowrap">{r.registeredLabel}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    {r.hasPhoto && r.photoUrl && (
                      <button onClick={() => setView(r)} className="mr-3 underline underline-offset-4">
                        View photo
                      </button>
                    )}
                    <button onClick={() => remove(r)} disabled={busyId === r.id}
                      className="text-brick underline underline-offset-4 disabled:opacity-50">
                      {busyId === r.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* photos */}
      <Panel title={`Submitted photos (${gallery.length})`}>
        {gallery.length === 0 ? (
          <p className="text-sm text-charcoal">No photos submitted yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {gallery.map((r) => (
              <button key={r.id} onClick={() => setView(r)} className="polaroid text-left transition hover:scale-[1.03]">
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt={`Photo by ${r.name}`} loading="lazy"
                    className="aspect-square w-full object-cover" />
                ) : (
                  <div className="grid aspect-square place-items-center bg-sand text-xs">Unavailable</div>
                )}
                <p className="mt-2 truncate text-sm font-semibold">{r.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-charcoal">
                  <span className="inline-block h-3 w-3 border border-ink" style={{ background: r.hex ?? "#ccc" }} />
                  {r.color ?? "No color"}
                </p>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {/* lightbox */}
      {view && (
        <div role="dialog" aria-modal="true" aria-label={`Photo by ${view.name}`}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-ink/90 p-4"
          onClick={() => setView(null)}>
          {view.photoUrl && (
            <img src={view.photoUrl} alt={`Photo by ${view.name}`}
              className="max-h-[80vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          )}
          <p className="text-sm text-paper" onClick={(e) => e.stopPropagation()}>
            {view.name} · {view.email} · {view.color ?? "No color"} · {view.photoLabel}
          </p>
          <button onClick={() => setView(null)} aria-label="Close"
            className="btn absolute right-4 top-4 !bg-paper !py-2 !px-4">✕</button>
        </div>
      )}
    </div>
  );
}