import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireAdminApi, requireEditorApi } from "@/src/lib/auth/require-api-role";
import { writeAuditLog } from "@/src/lib/cms/audit";
import { deleteReleaseById, getReleaseById, listReleases } from "@/src/lib/cms/queries";
import { releaseDeletePayloadSchema } from "@/src/lib/validators/release-schema";

export async function GET() {
  const auth = await requireEditorApi();
  if (!auth.ok) {
    return auth.response;
  }

  const { data, error } = await listReleases(auth.context.supabase);
  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar las publicaciones." }, { status: 400 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const payload = releaseDeletePayloadSchema.parse(await request.json());
    const { supabase, userId } = auth.context;

    const { data: before, error: loadError } = await getReleaseById(supabase, payload.releaseId);
    if (loadError) {
      return NextResponse.json(
        { error: "No se pudo cargar la versión para eliminarla." },
        { status: 400 },
      );
    }

    if (!before) {
      return NextResponse.json({ error: "Versión no encontrada." }, { status: 404 });
    }

    const { error: deleteError } = await deleteReleaseById(supabase, payload.releaseId);
    if (deleteError) {
      return NextResponse.json({ error: "No se pudo eliminar la versión." }, { status: 400 });
    }

    await writeAuditLog(supabase, {
      actor_id: userId,
      action: "release.deleted",
      entity_type: "release",
      entity_id: payload.releaseId,
      before_json: before,
      after_json: null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Solicitud de eliminación no válida.", details: error.flatten() },
        { status: 422 },
      );
    }

    return NextResponse.json({ error: "Error interno al eliminar la versión." }, { status: 500 });
  }
}
