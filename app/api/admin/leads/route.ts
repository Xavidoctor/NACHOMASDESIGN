import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { requireAdminApi } from "@/src/lib/auth/require-api-role";
import { writeAuditLog } from "@/src/lib/cms/audit";
import { leadListQuerySchema, leadUpdateSchema } from "@/src/lib/validators/leads-schema";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  const query = leadListQuerySchema.parse({
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    isRead: request.nextUrl.searchParams.get("isRead") ?? undefined,
  });

  let dbQuery = auth.context.supabase
    .from("contact_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);

  if (query.status) {
    dbQuery = dbQuery.eq("status", query.status);
  }

  if (query.isRead) {
    dbQuery = dbQuery.eq("is_read", query.isRead === "si");
  }

  if (query.search) {
    const term = query.search.replace(/[%_]/g, "").trim();
    if (term) {
      dbQuery = dbQuery.or(
        `name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%,message.ilike.%${term}%`,
      );
    }
  }

  const { data, error } = await dbQuery;
  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los contactos." }, { status: 400 });
  }

  return NextResponse.json({ data: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const payload = leadUpdateSchema.parse(await request.json());
    const { supabase, userId } = auth.context;

    const { data: before, error: loadError } = await supabase
      .from("contact_leads")
      .select("*")
      .eq("id", payload.id)
      .maybeSingle();

    if (loadError) {
      return NextResponse.json({ error: "No se pudo cargar el contacto." }, { status: 400 });
    }

    if (!before) {
      return NextResponse.json({ error: "Contacto no encontrado." }, { status: 404 });
    }

    const nextPatch: {
      status?: "nuevo" | "leido" | "respondido" | "resuelto" | "archivado" | "spam";
      is_read?: boolean;
      notes?: string;
    } = {};

    if (payload.status !== undefined) {
      nextPatch.status = payload.status;
      if (
        payload.isRead === undefined &&
        (payload.status === "respondido" ||
          payload.status === "resuelto" ||
          payload.status === "archivado" ||
          payload.status === "spam")
      ) {
        nextPatch.is_read = true;
      }
      if (payload.isRead === undefined && payload.status === "nuevo") {
        nextPatch.is_read = false;
      }
    }

    if (payload.isRead !== undefined) {
      nextPatch.is_read = payload.isRead;
    }

    if (payload.notes !== undefined) {
      nextPatch.notes = payload.notes;
    }

    const { data, error } = await supabase
      .from("contact_leads")
      .update(nextPatch)
      .eq("id", payload.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el contacto." }, { status: 400 });
    }

    await writeAuditLog(supabase, {
      actor_id: userId,
      action: "lead.updated",
      entity_type: "contact_lead",
      entity_id: data.id,
      before_json: before,
      after_json: data,
    });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos de actualización no válidos.", details: error.flatten() },
        { status: 422 },
      );
    }

    return NextResponse.json({ error: "Error interno al actualizar el contacto." }, { status: 500 });
  }
}
