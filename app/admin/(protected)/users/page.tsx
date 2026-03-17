import { UsersManager } from "@/components/admin/UsersManager";
import { requireAdminPage } from "@/src/lib/auth/require-page-role";

export default async function AdminUsersPage() {
  const { supabase, profile } = await requireAdminPage();
  const { data } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return <UsersManager initialUsers={data ?? []} isAdmin={profile.role === "admin"} />;
}
