import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/src/types/database.types";

export type SupabaseUsageMetric = {
  metricKey: string;
  metricValue: number;
  metricUnit: string;
  source: "supabase_sql" | "supabase_management_api" | "fallback";
  note: string;
  limit?: number | null;
  meta?: Record<string, unknown>;
};

export type SupabaseUsageResult = {
  metrics: SupabaseUsageMetric[];
  missingCredentials: string[];
};

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function fetchSupabaseUsage(
  supabase: SupabaseClient<Database>,
): Promise<SupabaseUsageResult> {
  const metrics: SupabaseUsageMetric[] = [];
  const missingCredentials: string[] = [];

  let dbSizeRes: number | null = null;
  let storageRes: unknown = null;
  let mauRes: number | null = null;

  try {
    const response = await supabase.rpc("get_database_size_bytes");
    dbSizeRes = response.data ?? null;
  } catch {
    dbSizeRes = null;
  }

  try {
    const response = await supabase.rpc("get_storage_usage_summary");
    storageRes = response.data ?? null;
  } catch {
    storageRes = null;
  }

  try {
    const response = await supabase.rpc("get_monthly_active_users_estimate");
    mauRes = response.data ?? null;
  } catch {
    mauRes = null;
  }

  const dbSize = asNumber(dbSizeRes);
  if (dbSize !== null) {
    metrics.push({
      metricKey: "supabase_db_size_used",
      metricValue: dbSize,
      metricUnit: "bytes",
      source: "supabase_sql",
      note: "Tamaño real de base de datos leído desde PostgreSQL.",
    });
  } else {
    metrics.push({
      metricKey: "supabase_db_size_used",
      metricValue: 0,
      metricUnit: "bytes",
      source: "fallback",
      note: "No se pudo leer tamaño real de base de datos. Revisa permisos de función RPC.",
    });
  }

  const storageData =
    storageRes && typeof storageRes === "object"
      ? (storageRes as Record<string, unknown>)
      : null;
  const storageBytes = asNumber(storageData?.bytes ?? null);
  const storageObjects = asNumber(storageData?.objects ?? null);

  metrics.push({
    metricKey: "supabase_storage_used",
    metricValue: storageBytes ?? 0,
    metricUnit: "bytes",
    source: storageBytes !== null ? "supabase_sql" : "fallback",
    note:
      storageBytes !== null
        ? "Uso real del Storage de Supabase."
        : "No se pudo leer uso real de Storage en Supabase.",
  });

  metrics.push({
    metricKey: "supabase_storage_objects_used",
    metricValue: storageObjects ?? 0,
    metricUnit: "objetos",
    source: storageObjects !== null ? "supabase_sql" : "fallback",
    note:
      storageObjects !== null
        ? "Conteo real de objetos en Supabase Storage."
        : "No se pudo leer conteo real de objetos en Supabase Storage.",
  });

  const mau = asNumber(mauRes);
  metrics.push({
    metricKey: "supabase_mau_used",
    metricValue: mau ?? 0,
    metricUnit: "usuarios",
    source: mau !== null ? "supabase_sql" : "fallback",
    note:
      mau !== null
        ? "Estimación real de usuarios activos del mes (auth.users)."
        : "No se pudo calcular MAU desde auth.users.",
  });

  const managementToken = process.env.SUPABASE_MANAGEMENT_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  if (!managementToken) missingCredentials.push("SUPABASE_MANAGEMENT_TOKEN");
  if (!projectRef) missingCredentials.push("SUPABASE_PROJECT_REF");

  if (managementToken && projectRef) {
    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/usage`,
        {
          headers: {
            Authorization: `Bearer ${managementToken}`,
          },
          cache: "no-store",
        },
      );
      if (response.ok) {
        const payload = (await response.json()) as Record<string, unknown>;
        const egressRaw =
          asNumber(payload.egress ?? null) ??
          asNumber(payload.egress_bytes ?? null) ??
          asNumber(
            (payload.bandwidth as Record<string, unknown> | undefined)?.used_bytes ?? null,
          );
        if (egressRaw !== null) {
          metrics.push({
            metricKey: "supabase_egress_used",
            metricValue: egressRaw,
            metricUnit: "bytes",
            source: "supabase_management_api",
            note: "Egress obtenido desde la API de management de Supabase.",
          });
        } else {
          metrics.push({
            metricKey: "supabase_egress_used",
            metricValue: 0,
            metricUnit: "bytes",
            source: "fallback",
            note:
              "La API de management respondió, pero no incluyó una métrica de egress compatible.",
          });
        }
      } else {
        metrics.push({
          metricKey: "supabase_egress_used",
          metricValue: 0,
          metricUnit: "bytes",
          source: "fallback",
          note: `La API de management devolvió ${response.status}. Se usa fallback para egress.`,
          meta: { status: response.status },
        });
      }
    } catch {
      metrics.push({
        metricKey: "supabase_egress_used",
        metricValue: 0,
        metricUnit: "bytes",
        source: "fallback",
        note: "No se pudo obtener egress desde la API de management de Supabase.",
      });
    }
  } else {
    metrics.push({
      metricKey: "supabase_egress_used",
      metricValue: 0,
      metricUnit: "bytes",
      source: "fallback",
      note:
        "Egress no disponible sin credenciales de management (SUPABASE_MANAGEMENT_TOKEN y SUPABASE_PROJECT_REF).",
    });
  }

  return { metrics, missingCredentials };
}

export async function refreshAnalyticsRollups(
  supabase: SupabaseClient<Database>,
  fromDate: string,
) {
  const { error } = await supabase.rpc("refresh_analytics_rollups", { p_from: fromDate });
  if (error) {
    throw new Error("No se pudieron refrescar los rollups de analytics.");
  }
}
