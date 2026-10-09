import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const fmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});
const label = (iso) => (iso ? fmt.format(new Date(iso)) : "");
const dayKey = (iso) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export async function loadAdminData({ withUrls = true } = {}) {
  const admin = createAdminClient();

  const [p, s, ph, c] = await Promise.all([
    admin
      .from("participants")
      .select("id, name, email, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(1000),
    admin.from("spins").select("participant_id, color, created_at").limit(1000),
    admin.from("photos").select("participant_id, color, path, created_at").limit(1000),
    admin.from("colors").select("name, hex, max_uses, sort_order").order("sort_order"),
  ]);

  if (p.error || s.error || ph.error || c.error) {
    throw new Error("Could not load dashboard data");
  }

  const people = p.data ?? [];
  const spins = s.data ?? [];
  const photos = ph.data ?? [];
  const colorRows = c.data ?? [];

  const spinBy = new Map(spins.map((x) => [x.participant_id, x]));
  const photoBy = new Map(photos.map((x) => [x.participant_id, x]));
  const hexBy = new Map(colorRows.map((x) => [x.name, x.hex]));

  // private bucket: create temporary links so the organizer can see photos
  let urlBy = new Map();
  if (withUrls && photos.length) {
    const { data: signed } = await admin.storage
      .from("photos")
      .createSignedUrls(photos.map((x) => x.path), 3600);
    urlBy = new Map((signed ?? []).filter((x) => x.signedUrl).map((x) => [x.path, x.signedUrl]));
  }

  const rows = people.map((u) => {
    const spin = spinBy.get(u.id);
    const photo = photoBy.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      registeredAt: u.created_at,
      registeredLabel: label(u.created_at),
      spun: !!spin,
      color: spin?.color ?? null,
      hex: spin ? hexBy.get(spin.color) ?? null : null,
      spunAt: spin?.created_at ?? null,
      spunLabel: label(spin?.created_at),
      hasPhoto: !!photo,
      photoAt: photo?.created_at ?? null,
      photoLabel: label(photo?.created_at),
      photoUrl: photo ? urlBy.get(photo.path) ?? null : null,
    };
  });

  const colors = colorRows.map((col) => {
    const used = spins.filter((x) => x.color === col.name).length;
    return {
      name: col.name,
      hex: col.hex,
      max: col.max_uses,
      used,
      remaining: Math.max(0, col.max_uses - used),
      photos: photos.filter((x) => x.color === col.name).length,
    };
  });

  // registrations per day (last 14 days with activity)
  const perDay = new Map();
  for (const u of people) {
    const k = dayKey(u.created_at);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  const daily = [...perDay.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([day, count]) => ({ day, count }));

  return {
    rows,
    colors,
    daily,
    maxUses: colors[0]?.max ?? 3,
    truncated: (p.count ?? 0) > people.length,
    stats: {
      registered: p.count ?? people.length,
      spun: spins.length,
      photos: photos.length,
      pending: rows.filter((r) => r.spun && !r.hasPhoto).length,
      slotsTotal: colors.reduce((a, x) => a + x.max, 0),
      slotsUsed: colors.reduce((a, x) => a + x.used, 0),
      colorsLeft: colors.filter((x) => x.remaining > 0).length,
      colorsTotal: colors.length,
    },
  };
}