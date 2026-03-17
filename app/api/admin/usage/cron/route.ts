import { NextRequest, NextResponse } from "next/server";

import { writeAuditLog } from "@/src/lib/cms/audit";
import { syncUsageSnapshots } from "@/src/lib/dashboard/service";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

function isAuthorized(request: NextRequest) {
  const expected = process.env.USAGE_SYNC_CRON_SECRET ?? process.env.CRON_SECRET;
  if (!expected) return { ok: false, reason: "Falta USAGE_SYNC_CRON_SECRET o CRON_SECRET." };

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!token || token !== expected) {
    return { ok: false, reason: "Token de cron no válido." };
  }

  return { ok: true as const };
}

export async function GET(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: 401 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const result = await syncUsageSnapshots(supabase);

    await writeAuditLog(supabase, {
      actor_id: null,
      action: "platform_usage.synced.cron",
      entity_type: "platform_usage_snapshot",
      entity_id: null,
      before_json: null,
      after_json: result,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const supabase = createSupabaseAdminClient();
    await writeAuditLog(supabase, {
      actor_id: null,
      action: "platform_usage.sync.failed.cron",
      entity_type: "platform_usage_snapshot",
      entity_id: null,
      before_json: null,
      after_json: {
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido en sincronización automática.",
      },
    });

    return NextResponse.json(
      { error: "La sincronización automática falló." },
      { status: 500 },
    );
  }
}
