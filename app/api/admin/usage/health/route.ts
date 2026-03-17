import { NextResponse } from "next/server";

import { requireAdminApi } from "@/src/lib/auth/require-api-role";
import { getUsageHealth } from "@/src/lib/dashboard/health";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const data = await getUsageHealth(auth.context.supabase);
    return NextResponse.json({ data });
  } catch (error) {
    void error;
    return NextResponse.json(
      { error: "No se pudo cargar la salud operativa." },
      { status: 500 },
    );
  }
}
