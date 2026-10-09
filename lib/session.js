import "server-only";
import { cookies } from "next/headers";

export const COOKIE = "tyl_pid";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Returns {id, name, email} for the person on this browser, or null
export async function getParticipant(admin) {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id || !UUID.test(id)) return null;

  const { data } = await admin
    .from("participants")
    .select("id, name, email")
    .eq("id", id)
    .maybeSingle();
  return data ?? null;
}

export async function setSessionCookie(id) {
  const store = await cookies();
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}