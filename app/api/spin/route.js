import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getParticipant } from "@/lib/session";

export async function POST() {
  const admin = createAdminClient();
  const person = await getParticipant(admin);
  if (!person) {
    return NextResponse.json({ error: "Please enter your name and email first." }, { status: 401 });
  }

  const { data, error } = await admin.rpc("assign_color", {
    p_participant_id: person.id,
  });

  if (error) {
    if (error.message?.includes("NO_COLORS_LEFT")) {
      return NextResponse.json(
        { error: "Sorry, all colors have been assigned." },
        { status: 410 }
      );
    }
    return NextResponse.json({ error: "Could not save spin" }, { status: 500 });
  }

  const row = data[0];
  return NextResponse.json({
    color: row.out_color,
    hex: row.out_hex,
    alreadySpun: row.out_already,
  });
}