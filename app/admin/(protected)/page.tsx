import { DashboardManager } from "@/components/admin/DashboardManager";
import { requireAdminPage } from "@/src/lib/auth/require-page-role";
import { getDashboardData } from "@/src/lib/dashboard/service";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdminPage();
  const initialData = await getDashboardData(supabase, "30d");

  return <DashboardManager initialData={initialData} />;
}
