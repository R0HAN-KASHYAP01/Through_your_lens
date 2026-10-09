import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParticipant } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const { data: colors } = await admin.rpc("get_available_colors");
  const person = await getParticipant(admin);

  if (!person) {
    return NextResponse.json({ registered: false, colors: colors ?? [] });
  }

  const [{ data: spin }, { data: photo }] = await Promise.all([
    admin.from("spins").select("color").eq("participant_id", person.id).maybeSingle(),
    admin.from("photos").select("path").eq("participant_id", person.id).maybeSingle(),
  ]);

  let hex = null;
  if (spin) {
    const { data: c } = await admin
      .from("colors")
      .select("hex")
      .eq("name", spin.color)
      .single();
    hex = c?.hex ?? null;
  }

  let photoUrl = null;
  if (photo) {
    const { data: signed } = await admin.storage
      .from("photos")
      .createSignedUrl(photo.path, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  return NextResponse.json({
    registered: true,
    user: { name: person.name, email: person.email },
    colors: colors ?? [],
    spun: !!spin,
    color: spin?.color ?? null,
    hex,
    photo: photo ? { url: photoUrl } : null,
  });
}