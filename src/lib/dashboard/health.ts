import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Tables } from "@/src/types/database.types";

type UsageSnapshotRow = Tables<"platform_usage_snapshots">;
type AuditLogRow = Tables<"audit_logs">;

export type PlatformHealthItem = {
  platform: "vercel" | "supabase" | "cloudflare_r2" | "email";
  lastSyncAt: string | null;
  source: string | null;
  lastMetricKey: string | null;
  lastMetricValue: number | null;
  lastMetricUnit: string | null;
  dataMode: "real" | "estimado" | "manual" | "sin_datos";
  credentialsOk: boolean;
  missingCredentials: string[];
  lastError: string | null;
};

export type UsageHealthPayload = {
  generatedAt: string;
  cron: {
    secretConfigured: boolean;
    configuredBy: "USAGE_SYNC_CRON_SECRET" | "CRON_SECRET" | "none";
    lastSuccessAt: string | null;
    lastErrorAt: string | null;
    lastError: string | null;
    status: "activo" | "pendiente" | "sin_configurar";
  };
  globalLastError: {
    at: string | null;
    message: string | null;
  };
  platforms: PlatformHealthItem[];
};

function sourceMode(source: string | null): PlatformHealthItem["dataMode"] {
  if (!source) return "sin_datos";
  if (source.includes("api") || source.includes("sql") || source.includes("interno_real")) return "real";
  if (source.includes("manual")) return "manual";
  if (source.includes("fallback") || source.includes("interno")) return "estimado";
  return "estimado";
}

function requiredCredentialsByPlatform(
  platform: PlatformHealthItem["platform"],
): string[] {
  if (platform === "vercel") return ["VERCEL_API_TOKEN", "VERCEL_PROJECT_ID"];
  if (platform === "supabase") return ["SUPABASE_MANAGEMENT_TOKEN", "SUPABASE_PROJECT_REF"];
  if (platform === "cloudflare_r2") {
    return ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"];
  }
  return ["RESEND_API_KEY"];
}

function envMissing(keys: string[]) {
  return keys.filter((key) => !process.env[key]);
}

function parseErrorFromAudit(log: AuditLogRow | null) {
  if (!log?.after_json || typeof log.after_json !== "object") return null;
  const after = log.after_json as Record<string, unknown>;
  const error = after.error;
  if (typeof error === "string" && error.trim()) return error.trim();
  return null;
}

function parseSnapshotError(snapshot: UsageSnapshotRow | null) {
  if (!snapshot?.meta_json || typeof snapshot.meta_json !== "object") return null;
  const meta = snapshot.meta_json as Record<string, unknown>;
  const note = meta.note;
  if (typeof note === "string" && note.toLowerCase().includes("no se pudo")) return note;
  return null;
}

export async function getUsageHealth(
  supabase: SupabaseClient<Database>,
): Promise<UsageHealthPayload> {
  const [snapshotsRes, logsRes] = await Promise.all([
    supabase
      .from("platform_usage_snapshots")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("audit_logs")
      .select("*")
      .in("action", [
        "platform_usage.synced",
        "platform_usage.synced.cron",
        "platform_usage.sync.failed",
        "platform_usage.sync.failed.cron",
      ])
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const snapshots = snapshotsRes.data ?? [];
  const logs = logsRes.data ?? [];

  const latestByPlatform = new Map<PlatformHealthItem["platform"], UsageSnapshotRow | null>();
  const platforms: PlatformHealthItem["platform"][] = [
    "vercel",
    "supabase",
    "cloudflare_r2",
    "email",
  ];
  for (const platform of platforms) {
    latestByPlatform.set(
      platform,
      snapshots.find((row) => row.platform === platform) ?? null,
    );
  }

  const globalFailed = logs.find((log) =>
    ["platform_usage.sync.failed", "platform_usage.sync.failed.cron"].includes(log.action),
  ) ?? null;

  const lastCronSuccess = logs.find((log) => log.action === "platform_usage.synced.cron") ?? null;
  const lastCronFailed = logs.find((log) => log.action === "platform_usage.sync.failed.cron") ?? null;

  const configuredBy = process.env.USAGE_SYNC_CRON_SECRET
    ? "USAGE_SYNC_CRON_SECRET"
    : process.env.CRON_SECRET
      ? "CRON_SECRET"
      : "none";
  const secretConfigured = configuredBy !== "none";
  const cronFresh =
    lastCronSuccess && Date.now() - new Date(lastCronSuccess.created_at).getTime() < 48 * 60 * 60 * 1000;

  return {
    generatedAt: new Date().toISOString(),
    cron: {
      secretConfigured,
      configuredBy,
      lastSuccessAt: lastCronSuccess?.created_at ?? null,
      lastErrorAt: lastCronFailed?.created_at ?? null,
      lastError: parseErrorFromAudit(lastCronFailed),
      status: !secretConfigured ? "sin_configurar" : cronFresh ? "activo" : "pendiente",
    },
    globalLastError: {
      at: globalFailed?.created_at ?? null,
      message: parseErrorFromAudit(globalFailed),
    },
    platforms: platforms.map((platform) => {
      const snapshot = latestByPlatform.get(platform) ?? null;
      const required = requiredCredentialsByPlatform(platform);
      const missing = envMissing(required);
      const mode = sourceMode(snapshot?.source ?? null);

      return {
        platform,
        lastSyncAt: snapshot?.created_at ?? null,
        source: snapshot?.source ?? null,
        lastMetricKey: snapshot?.metric_key ?? null,
        lastMetricValue: snapshot ? Number(snapshot.metric_value) : null,
        lastMetricUnit: snapshot?.metric_unit ?? null,
        dataMode: mode,
        credentialsOk: missing.length === 0,
        missingCredentials: missing,
        lastError: parseSnapshotError(snapshot),
      };
    }),
  };
}
