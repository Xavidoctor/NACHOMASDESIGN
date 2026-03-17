import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/auth/require-api-role";
import { writeAuditLog } from "@/src/lib/cms/audit";
import { syncUsageSnapshots } from "@/src/lib/dashboard/service";

export async function POST() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const result = await syncUsageSnapshots(auth.context.supabase, {
      userId: auth.context.userId,
    });

    await writeAuditLog(auth.context.supabase, {
      actor_id: auth.context.userId,
      action: "platform_usage.synced",
      entity_type: "platform_usage_snapshot",
      entity_id: null,
      before_json: null,
      after_json: result,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    await writeAuditLog(auth.context.supabase, {
      actor_id: auth.context.userId,
      action: "platform_usage.sync.failed",
      entity_type: "platform_usage_snapshot",
      entity_id: null,
      before_json: null,
      after_json: {
        error: error instanceof Error ? error.message : "Error desconocido al sincronizar consumos.",
      },
    });

    return NextResponse.json(
      { error: "No se pudieron sincronizar los consumos." },
      { status: 500 },
    );
  }
}
