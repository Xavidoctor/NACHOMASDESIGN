import { SettingsManager } from "@/components/admin/SettingsManager";
import { requireAdminPage } from "@/src/lib/auth/require-page-role";

export default async function AdminSettingsPage() {
  const { profile } = await requireAdminPage();
  return <SettingsManager isAdmin={profile.role === "admin"} />;
}
