import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParticipant } from "@/lib/session";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Vercel body limit is 4.5 MB)
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request) {
  const admin = createAdminClient();
  const person = await getParticipant(admin);
  if (!person) {
    return NextResponse.json({ error: "Please enter your name and email first." }, { status: 401 });
  }

  // one photo per person
  const { data: existing } = await admin
    .from("photos")
    .select("id")
    .eq("participant_id", person.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "You have already submitted a photo." }, { status: 409 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("photo");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No photo received" }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only JPG, PNG or WEBP images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo is too large (max 4 MB)" }, { status: 413 });
  }

  const path = `${person.id}/photo.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from("photos")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (upErr) {
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }

  const { data: spin } = await admin
    .from("spins")
    .select("color")
    .eq("participant_id", person.id)
    .maybeSingle();

  const { error: dbErr } = await admin.from("photos").insert({
    participant_id: person.id,
    color: spin?.color ?? null,
    path,
  });

  if (dbErr) {
    await admin.storage.from("photos").remove([path]);
    if (dbErr.code === "23505") {
      return NextResponse.json({ error: "You have already submitted a photo." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not save photo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}