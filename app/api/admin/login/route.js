import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdmin, isAdminEmail } from "@/lib/admin-auth";

const fail = () =>
  NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  // any other email is rejected before Supabase is even contacted
  if (!isAdminEmail(email) || !password) return fail();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail();

  if (!(await getAdmin())) {
    await supabase.auth.signOut();
    return fail();
  }
  return NextResponse.json({ ok: true });
}