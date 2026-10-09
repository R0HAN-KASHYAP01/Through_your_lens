import "server-only";
import { createClient } from "@/lib/supabase/server";

export function isAdminEmail(email) {
  const allowed = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  return !!allowed && !!email && email.trim().toLowerCase() === allowed;
}

// Returns the Supabase user only if they are the organizer, otherwise null.
// getUser() asks Supabase to validate the session, so a forged cookie fails.
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email_confirmed_at || !isAdminEmail(user.email)) return null;
  return user;
}