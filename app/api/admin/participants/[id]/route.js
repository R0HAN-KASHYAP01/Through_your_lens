import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(_request, { params }) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }

  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: photos } = await admin.from("photos").select("path").eq("participant_id", id);
  const paths = (photos ?? []).map((p) => p.path);

  // spin and photo rows are removed by cascade, which also frees the color slot
  const { error } = await admin.from("participants").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }

  if (paths.length) await admin.storage.from("photos").remove(paths);

  return NextResponse.json({ ok: true });
}