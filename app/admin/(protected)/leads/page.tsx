import { LeadsManager } from "@/components/admin/LeadsManager";
import { requireAdminPage } from "@/src/lib/auth/require-page-role";

export default async function AdminLeadsPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase
    .from("contact_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);

  return <LeadsManager initialLeads={data ?? []} />;
}
