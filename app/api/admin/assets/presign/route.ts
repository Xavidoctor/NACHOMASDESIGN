import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireEditorApi } from "@/src/lib/auth/require-api-role";
import { writeAuditLog } from "@/src/lib/cms/audit";
import { buildCmsAssetStorageKey } from "@/src/lib/r2/keys";
import { buildPublicR2Url, createR2PresignedPutUrl } from "@/src/lib/r2/presign";
import { assetPresignSchema } from "@/src/lib/validators/assets-schema";

export async function POST(request: NextRequest) {
  const auth = await requireEditorApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const payload = assetPresignSchema.parse(await request.json());

    const storageKey = buildCmsAssetStorageKey({
      kind: payload.kind,
      filename: payload.filename,
      scope: payload.scope,
      pageKey: payload.pageKey,
      sectionKey: payload.sectionKey,
      settingKey: payload.settingKey,
      folder: payload.folder,
    });

    let uploadUrl = "";
    let publicUrl = "";
    try {
      uploadUrl = await createR2PresignedPutUrl({
        storageKey,
        contentType: payload.contentType,
      });
      publicUrl = buildPublicR2Url(storageKey);
    } catch {
      return NextResponse.json(
        { error: "R2 no está configurado para subida directa." },
        { status: 400 },
      );
    }

    await writeAuditLog(auth.context.supabase, {
      actor_id: auth.context.userId,
      action: "asset.presign.created",
      entity_type: "cms_asset",
      entity_id: storageKey,
      before_json: null,
      after_json: {
        scope: payload.scope,
        kind: payload.kind,
        contentType: payload.contentType,
        storageKey,
      },
    });

    return NextResponse.json({
      uploadUrl,
      storageKey,
      publicUrl,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Solicitud de subida no válida.", details: error.flatten() },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Error interno al preparar la subida del recurso." },
      { status: 500 },
    );
  }
}
