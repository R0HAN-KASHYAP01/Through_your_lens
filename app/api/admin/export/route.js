import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/admin-data";

// stops spreadsheet formula injection from names like =HYPERLINK(...)
function cell(v) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  }

  const { rows } = await loadAdminData({ withUrls: false });
  const head = ["Name", "Email", "Registered at", "Color", "Spun at", "Photo submitted", "Photo uploaded at"];
  const lines = rows.map((r) =>
    [
      r.name,
      r.email,
      r.registeredAt,
      r.color ?? "",
      r.spunAt ?? "",
      r.hasPhoto ? "Yes" : "No",
      r.photoAt ?? "",
    ]
      .map(cell)
      .join(",")
  );

  const csv = "\uFEFF" + [head.map(cell).join(","), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="through-your-lens-participants.csv"',
      "Cache-Control": "no-store",
    },
  });
}