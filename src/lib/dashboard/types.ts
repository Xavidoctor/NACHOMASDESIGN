import type { Tables } from "@/src/types/database.types";

export type DashboardPeriod = "7d" | "30d" | "6m" | "12m";

type MetricCard = {
  value: number;
  previous: number;
  delta: number;
  deltaPercent: number;
};

type PlatformCard = {
  platform: "vercel" | "supabase" | "cloudflare_r2" | "email";
  used: number;
  limit: number | null;
  unit: string;
  percent: number | null;
  status: "verde" | "amarillo" | "naranja" | "rojo" | "sin_datos";
  dataMode: "real" | "estimado" | "manual" | "sin_datos";
  source: string;
  lastSync: string | null;
  projection: number | null;
  notes: string;
  missingCredentials: string[];
};

export type DashboardPayload = {
  period: DashboardPeriod;
  updatedAt: string;
  summary: {
    visitors: MetricCard;
    sessions: MetricCard;
    pageViews: MetricCard;
    contacts: MetricCard;
    conversion: MetricCard;
    ctaClicks: MetricCard;
  };
  series: Array<{
    label: string;
    pageViews: number;
    contacts: number;
    ctaClicks: number;
    visitors: number;
    conversion: number;
  }>;
  topPages: Array<{ key: string; value: number }>;
  topProjects: Array<{ key: string; value: number }>;
  topSources: Array<{ key: string; value: number }>;
  devices: Array<{ key: string; value: number }>;
  countries: Array<{ key: string; value: number }>;
  performance: {
    status: "correcto" | "vigilar" | "problema";
    score: number | null;
    note: string;
  };
  usage: PlatformCard[];
  alerts: Array<Tables<"platform_alerts">>;
};
