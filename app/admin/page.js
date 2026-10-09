import { getAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/admin-data";
import { EVENT } from "@/lib/event";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Organizer | Through Your Lens",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const admin = await getAdmin();

  // anyone who is not the organizer only ever sees the login form
  if (!admin) return <AdminLogin />;

  const data = await loadAdminData();
  return <AdminDashboard data={data} event={EVENT} adminEmail={admin.email} />;
}