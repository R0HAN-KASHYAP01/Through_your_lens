import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const n = Number(body?.maxUses);
  if (!Number.isInteger(n) || n < 1 || n > 100) {
    return NextResponse.json({ error: "Enter a whole number from 1 to 100." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("colors").update({ max_uses: n }).neq("name", "");
  if (error) {
    return NextResponse.json({ error: "Could not save." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}