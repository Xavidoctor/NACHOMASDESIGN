import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/auth/require-api-role";
import { getDashboardData } from "@/src/lib/dashboard/service";
import type { DashboardPeriod } from "@/src/lib/dashboard/types";

const validPeriods = new Set<DashboardPeriod>(["7d", "30d", "6m", "12m"]);

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const rawPeriod = request.nextUrl.searchParams.get("period");
  const period: DashboardPeriod =
    rawPeriod && validPeriods.has(rawPeriod as DashboardPeriod)
      ? (rawPeriod as DashboardPeriod)
      : "30d";

  try {
    const data = await getDashboardData(auth.context.supabase, period);
    return NextResponse.json({ data });
  } catch (error) {
    void error;
    return NextResponse.json(
      { error: "No se pudo cargar el dashboard." },
      { status: 500 },
    );
  }
}
