import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setSessionCookie } from "@/lib/session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(body?.name ?? "").trim().slice(0, 80);
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const admin = createAdminClient();

  // existing email? reuse it (so the same email can never spin twice)
  let { data: person } = await admin
    .from("participants")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!person) {
    const { data, error } = await admin
      .from("participants")
      .insert({ name, email })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        // two requests at the same time: read the one that won
        const again = await admin
          .from("participants")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        person = again.data;
      }
      if (!person) {
        return NextResponse.json({ error: "Could not save your details." }, { status: 500 });
      }
    } else {
      person = data;
    }
  }

  await setSessionCookie(person.id);
  return NextResponse.json({ ok: true });
}