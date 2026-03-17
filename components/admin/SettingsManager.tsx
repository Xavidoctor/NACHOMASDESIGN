"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { MediaLibraryPicker } from "@/components/admin/MediaLibraryPicker";
import {
  IMAGE_ACCEPT,
  normalizeUploadError,
  uploadAssetToLibrary,
} from "@/src/lib/admin/media-client";
import {
  defaultAdminPanelSettings,
  normalizeAdminPanelSettings,
} from "@/src/lib/cms/admin-panel-settings";
import type { Tables } from "@/src/types/database.types";

type SettingRow = Tables<"site_settings">;
type SettingKey =
  | "contact"
  | "social_links"
  | "seo_global"
  | "navigation"
  | "whatsapp"
  | "admin_panel";
type LinkItem = { label: string; href: string; logoUrl?: string };

type SettingsState = {
  contact: {
    heading: string;
    intro: string;
    email: string;
    contactLabel: string;
    copyEmail: string;
    whatsappLabel: string;
  };
  social_links: {
    links: LinkItem[];
  };
  seo_global: {
    title: string;
    description: string;
    ogImage: string;
  };
  navigation: {
    brand: string;
    links: LinkItem[];
  };
  whatsapp: {
    number: string;
    message: string;
  };
  admin_panel: {
    contact_notification_email: string;
    contact_notifications_enabled: boolean;
    contact_auto_reply_enabled: boolean;
    contact_auto_reply_subject: string;
    contact_auto_reply_body: string;
    alerts_enabled: boolean;
    vercel_plan: string;
    supabase_plan: string;
    r2_plan_mode: string;
    email_provider: string;
    usage_warning_threshold: number;
    usage_danger_threshold: number;
    email_daily_limit: string;
    email_monthly_limit: string;
  };
};

type UsageHealthState = {
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
  platforms: Array<{
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
  }>;
};

const tabs: Array<{ key: SettingKey; label: string }> = [
  { key: "contact", label: "Contacto" },
  { key: "social_links", label: "Redes sociales" },
  { key: "seo_global", label: "SEO global" },
  { key: "navigation", label: "Navegación" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "admin_panel", label: "Panel admin" },
];

const defaults: SettingsState = {
  contact: {
    heading: "Contacto",
    intro: "Si tienes un proyecto, escríbeme y lo vemos.",
    email: "hola@nachomasdesign.com",
    contactLabel: "Enviar correo",
    copyEmail: "Copiar correo",
    whatsappLabel: "Contactar por WhatsApp",
  },
  social_links: {
    links: [],
  },
  seo_global: {
    title: "Nacho Mas Design | Portfolio",
    description: "Portfolio de Nacho Mas Design.",
    ogImage: "/og-cover.svg",
  },
  navigation: {
    brand: "Nacho Mas Design",
    links: [
      { label: "Inicio", href: "/" },
      { label: "Sobre mí", href: "/#sobre-mi" },
      { label: "Proyectos", href: "/works" },
    ],
  },
  whatsapp: {
    number: "34650304969",
    message:
      "Hola Nacho, he visto tu portfolio en nachomasdesign.com y me gustaria hablar contigo sobre un proyecto.",
  },
  admin_panel: {
    contact_notification_email: defaultAdminPanelSettings.contact_notification_email,
    contact_notifications_enabled: defaultAdminPanelSettings.contact_notifications_enabled,
    contact_auto_reply_enabled: defaultAdminPanelSettings.contact_auto_reply_enabled,
    contact_auto_reply_subject: defaultAdminPanelSettings.contact_auto_reply_subject,
    contact_auto_reply_body: defaultAdminPanelSettings.contact_auto_reply_body,
    alerts_enabled: defaultAdminPanelSettings.alerts_enabled,
    vercel_plan: defaultAdminPanelSettings.vercel_plan,
    supabase_plan: defaultAdminPanelSettings.supabase_plan,
    r2_plan_mode: defaultAdminPanelSettings.r2_plan_mode,
    email_provider: defaultAdminPanelSettings.email_provider,
    usage_warning_threshold: defaultAdminPanelSettings.usage_warning_threshold,
    usage_danger_threshold: defaultAdminPanelSettings.usage_danger_threshold,
    email_daily_limit:
      defaultAdminPanelSettings.email_daily_limit !== null
        ? String(defaultAdminPanelSettings.email_daily_limit)
        : "",
    email_monthly_limit:
      defaultAdminPanelSettings.email_monthly_limit !== null
        ? String(defaultAdminPanelSettings.email_monthly_limit)
        : "",
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asLinks(value: unknown, fallback: LinkItem[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item): LinkItem | null => {
      const obj = asRecord(item);
      const label = asString(obj.label).trim();
      const href = asString(obj.href).trim();
      const logoUrl = asString(obj.logoUrl).trim();
      return label || href || logoUrl
        ? { label, href, ...(logoUrl ? { logoUrl } : {}) }
        : null;
    })
    .filter((item): item is LinkItem => item !== null);
}

function buildState(rows: SettingRow[]): SettingsState {
  const byKey = new Map(rows.map((row) => [row.key as SettingKey, asRecord(row.value_json)]));

  const contact = byKey.get("contact") ?? {};
  const social = byKey.get("social_links") ?? {};
  const seo = byKey.get("seo_global") ?? {};
  const nav = byKey.get("navigation") ?? {};
  const wa = byKey.get("whatsapp") ?? {};
  const adminPanel = normalizeAdminPanelSettings(byKey.get("admin_panel") ?? {});

  return {
    contact: {
      heading: asString(contact.heading, defaults.contact.heading),
      intro: asString(contact.intro, defaults.contact.intro),
      email: asString(contact.email, defaults.contact.email),
      contactLabel: asString(contact.contactLabel, defaults.contact.contactLabel),
      copyEmail: asString(contact.copyEmail, defaults.contact.copyEmail),
      whatsappLabel: asString(contact.whatsappLabel, defaults.contact.whatsappLabel),
    },
    social_links: {
      links: asLinks(social.links, defaults.social_links.links),
    },
    seo_global: {
      title: asString(seo.title, defaults.seo_global.title),
      description: asString(seo.description, defaults.seo_global.description),
      ogImage: asString(seo.ogImage, defaults.seo_global.ogImage),
    },
    navigation: {
      brand: asString(nav.brand, defaults.navigation.brand),
      links: asLinks(nav.links, defaults.navigation.links),
    },
    whatsapp: {
      number: asString(wa.number, defaults.whatsapp.number),
      message: asString(wa.message, defaults.whatsapp.message),
    },
    admin_panel: {
      contact_notification_email: adminPanel.contact_notification_email,
      contact_notifications_enabled: adminPanel.contact_notifications_enabled,
      contact_auto_reply_enabled: adminPanel.contact_auto_reply_enabled,
      contact_auto_reply_subject: adminPanel.contact_auto_reply_subject,
      contact_auto_reply_body: adminPanel.contact_auto_reply_body,
      alerts_enabled: adminPanel.alerts_enabled,
      vercel_plan: adminPanel.vercel_plan,
      supabase_plan: adminPanel.supabase_plan,
      r2_plan_mode: adminPanel.r2_plan_mode,
      email_provider: adminPanel.email_provider,
      usage_warning_threshold: adminPanel.usage_warning_threshold,
      usage_danger_threshold: adminPanel.usage_danger_threshold,
      email_daily_limit:
        adminPanel.email_daily_limit !== null ? String(adminPanel.email_daily_limit) : "",
      email_monthly_limit:
        adminPanel.email_monthly_limit !== null ? String(adminPanel.email_monthly_limit) : "",
    },
  };
}

export function SettingsManager({ isAdmin }: { isAdmin: boolean }) {
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [values, setValues] = useState<SettingsState>(defaults);
  const [activeTab, setActiveTab] = useState<SettingKey>("contact");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingLogoIndex, setUploadingLogoIndex] = useState<number | null>(null);
  const [isUploadingOgImage, setIsUploadingOgImage] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSyncingUsage, setIsSyncingUsage] = useState(false);
  const [usageHealth, setUsageHealth] = useState<UsageHealthState | null>(null);
  const [isLoadingUsageHealth, setIsLoadingUsageHealth] = useState(false);
  const [usageHealthError, setUsageHealthError] = useState("");
  const [libraryTarget, setLibraryTarget] = useState<
    { type: "social_logo"; index: number } | { type: "seo_og" } | null
  >(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const seoOgInputRef = useRef<HTMLInputElement | null>(null);

  const rawJson = useMemo(() => JSON.stringify(values[activeTab], null, 2), [activeTab, values]);

  async function loadRows() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No se pudieron cargar los ajustes.");
      const nextRows = payload.data ?? [];
      setRows(nextRows);
      setValues(buildState(nextRows));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRows();
  }, []);

  useEffect(() => {
    if (activeTab !== "admin_panel") return;
    void loadUsageHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function saveActiveSetting() {
    if (!isAdmin) {
      setError("Solo el administrador puede actualizar ajustes globales.");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setError("");
    try {
      const valueJson =
        activeTab === "admin_panel"
          ? {
              ...values.admin_panel,
              email_daily_limit: values.admin_panel.email_daily_limit
                ? Number(values.admin_panel.email_daily_limit)
                : null,
              email_monthly_limit: values.admin_panel.email_monthly_limit
                ? Number(values.admin_panel.email_monthly_limit)
                : null,
            }
          : values[activeTab];

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activeTab, valueJson }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No se pudo guardar el ajuste.");
      const tabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? activeTab;
      setMessage(`Ajuste "${tabLabel}" actualizado.`);
      await loadRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }

  async function syncUsageNow() {
    if (!isAdmin) {
      setError("Solo el administrador puede sincronizar consumos.");
      return;
    }
    setIsSyncingUsage(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/usage/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo sincronizar el consumo.");
      }
      setMessage("Consumos sincronizados correctamente.");
      await loadUsageHealth();
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Error inesperado al sincronizar.");
    } finally {
      setIsSyncingUsage(false);
    }
  }

  async function loadUsageHealth() {
    setIsLoadingUsageHealth(true);
    setUsageHealthError("");
    try {
      const response = await fetch("/api/admin/usage/health", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo cargar la salud operativa.");
      }
      setUsageHealth(payload.data ?? null);
    } catch (healthError) {
      setUsageHealthError(
        healthError instanceof Error ? healthError.message : "Error inesperado al cargar la salud operativa.",
      );
    } finally {
      setIsLoadingUsageHealth(false);
    }
  }

  function updateLinks(target: "social_links" | "navigation", links: LinkItem[]) {
    setValues((prev) => ({ ...prev, [target]: { ...prev[target], links } }));
  }

  async function uploadSocialLogo(index: number, file: File) {
    if (!isAdmin) {
      setError("Solo el administrador puede subir logos.");
      return;
    }

    setUploadingLogoIndex(index);
    setMessage("");
    setError("");

    try {
      const asset = await uploadAssetToLibrary({
        file,
        expectedKind: "image",
        scope: "setting",
        settingKey: "social_links",
      });

      const nextLinks = [...values.social_links.links];
      const target = nextLinks[index];
      if (!target) return;
      nextLinks[index] = { ...target, logoUrl: asset.public_url };
      updateLinks("social_links", nextLinks);
      setMessage("Logo subido. Recuerda guardar ajustes.");
    } catch (err) {
      setError(
        normalizeUploadError(
          err instanceof Error ? err.message : "Error inesperado al subir el logo.",
        ),
      );
    } finally {
      setUploadingLogoIndex(null);
    }
  }

  async function uploadSeoOgImage(file: File) {
    if (!isAdmin) {
      setError("Solo el administrador puede subir recursos.");
      return;
    }

    setIsUploadingOgImage(true);
    setMessage("");
    setError("");
    try {
      const asset = await uploadAssetToLibrary({
        file,
        expectedKind: "image",
        scope: "setting",
        settingKey: "seo_global",
      });
      setValues((prev) => ({
        ...prev,
        seo_global: {
          ...prev.seo_global,
          ogImage: asset.public_url,
        },
      }));
      setMessage("Imagen OG subida. Recuerda guardar ajustes.");
    } catch (uploadError) {
      setError(
        normalizeUploadError(
          uploadError instanceof Error
            ? uploadError.message
            : "No se pudo subir la imagen OG.",
        ),
      );
    } finally {
      setIsUploadingOgImage(false);
    }
  }

  function openLibraryFor(target: { type: "social_logo"; index: number } | { type: "seo_og" }) {
    setLibraryTarget(target);
    setIsLibraryOpen(true);
  }

  function applyLibraryAsset(selection: Array<Tables<"cms_assets">>) {
    const chosen = selection[0];
    if (!chosen || !libraryTarget) return;

    if (libraryTarget.type === "seo_og") {
      setValues((prev) => ({
        ...prev,
        seo_global: {
          ...prev.seo_global,
          ogImage: chosen.public_url,
        },
      }));
      setMessage("Imagen OG aplicada desde biblioteca.");
      return;
    }

    const nextLinks = [...values.social_links.links];
    const target = nextLinks[libraryTarget.index];
    if (!target) return;
    nextLinks[libraryTarget.index] = { ...target, logoUrl: chosen.public_url };
    updateLinks("social_links", nextLinks);
    setMessage("Logo aplicado desde biblioteca.");
  }

  function cronStatusBadge(status: UsageHealthState["cron"]["status"]) {
    if (status === "activo") return "border-emerald-300/35 bg-emerald-500/10 text-emerald-200";
    if (status === "pendiente") return "border-amber-300/35 bg-amber-500/10 text-amber-200";
    return "border-red-300/35 bg-red-500/10 text-red-200";
  }

  function dataModeLabel(mode: UsageHealthState["platforms"][number]["dataMode"]) {
    if (mode === "real") return "Real";
    if (mode === "estimado") return "Estimado";
    if (mode === "manual") return "Manual";
    return "Sin datos";
  }

  function dataModeBadge(mode: UsageHealthState["platforms"][number]["dataMode"]) {
    if (mode === "real") return "border-emerald-300/35 bg-emerald-500/10 text-emerald-200";
    if (mode === "estimado") return "border-amber-300/35 bg-amber-500/10 text-amber-200";
    if (mode === "manual") return "border-sky-300/35 bg-sky-500/10 text-sky-200";
    return "border-white/20 bg-white/10 text-neutral-300";
  }

  function renderLinksEditor(target: "social_links" | "navigation") {
    const links = values[target].links;
    const isSocial = target === "social_links";
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-300">Enlaces</p>
          <button type="button" onClick={() => updateLinks(target, [...links, { label: "", href: "", logoUrl: undefined }])} className="rounded-md border border-white/20 px-2 py-1 text-xs">+ Añadir</button>
        </div>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={index} className={`grid gap-2 ${isSocial ? "md:grid-cols-[1fr_1fr_1fr_auto]" : "md:grid-cols-[1fr_1fr_auto]"}`}>
              <input value={link.label} onChange={(event) => { const next = [...links]; next[index] = { ...next[index], label: event.target.value }; updateLinks(target, next); }} placeholder="Etiqueta" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
              <input value={link.href} onChange={(event) => { const next = [...links]; next[index] = { ...next[index], href: event.target.value }; updateLinks(target, next); }} placeholder="Enlace" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
              {isSocial ? (
                <div className="space-y-2 rounded-md border border-white/10 bg-black/30 p-2">
                  <input value={link.logoUrl ?? ""} onChange={(event) => { const next = [...links]; next[index] = { ...next[index], logoUrl: event.target.value || undefined }; updateLinks(target, next); }} placeholder="URL del logo (opcional)" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm" />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer rounded-md border border-white/20 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-white/10">
                      {uploadingLogoIndex === index ? "Subiendo..." : "Subir logo"}
                      <input
                        type="file"
                        accept={IMAGE_ACCEPT}
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void uploadSocialLogo(index, file);
                          }
                          event.currentTarget.value = "";
                        }}
                        disabled={uploadingLogoIndex === index}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => openLibraryFor({ type: "social_logo", index })}
                      className="rounded-md border border-white/20 px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-white/10"
                    >
                      Biblioteca
                    </button>
                    {link.logoUrl ? <img src={link.logoUrl} alt={`Logo ${link.label || "red social"}`} className="h-6 w-6 rounded-sm border border-white/10 object-contain bg-black/40 p-0.5" /> : null}
                  </div>
                </div>
              ) : null}
              <button type="button" onClick={() => updateLinks(target, links.filter((_, i) => i !== index))} className="rounded-md border border-red-400/30 px-2 py-1 text-xs text-red-300">Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <input
        ref={seoOgInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void uploadSeoOgImage(file);
          }
          event.currentTarget.value = "";
        }}
      />
      <MediaLibraryPicker
        abierto={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onConfirm={applyLibraryAsset}
        tipoPermitido="image"
      />

      <div className="space-y-2">
        <h1 className="font-display text-4xl tracking-wide">Ajustes</h1>
        <p className="text-sm text-neutral-400">Editor visual para contenido global y configuración operativa del panel.</p>
      </div>

      {!isAdmin ? <div className="rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Tu rol es editor: puedes leer ajustes, pero no modificarlos.</div> : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`rounded-md border px-3 py-2 text-xs uppercase tracking-[0.12em] ${activeTab === tab.key ? "border-white/30 text-white" : "border-white/15 text-neutral-300"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.02] p-5">
        {activeTab === "contact" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input value={values.contact.heading} onChange={(event) => setValues((prev) => ({ ...prev, contact: { ...prev.contact, heading: event.target.value } }))} placeholder="Título" className="rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input value={values.contact.email} onChange={(event) => setValues((prev) => ({ ...prev, contact: { ...prev.contact, email: event.target.value } }))} placeholder="Correo electrónico (opcional)" className="rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <textarea value={values.contact.intro} onChange={(event) => setValues((prev) => ({ ...prev, contact: { ...prev.contact, intro: event.target.value } }))} rows={3} placeholder="Introducción" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 md:col-span-2" />
            <input value={values.contact.contactLabel} onChange={(event) => setValues((prev) => ({ ...prev, contact: { ...prev.contact, contactLabel: event.target.value } }))} placeholder="Etiqueta de contacto" className="rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input value={values.contact.copyEmail} onChange={(event) => setValues((prev) => ({ ...prev, contact: { ...prev.contact, copyEmail: event.target.value } }))} placeholder="Etiqueta copiar correo" className="rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <input value={values.contact.whatsappLabel} onChange={(event) => setValues((prev) => ({ ...prev, contact: { ...prev.contact, whatsappLabel: event.target.value } }))} placeholder="Etiqueta de WhatsApp" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 md:col-span-2" />
          </div>
        ) : null}

        {activeTab === "social_links" ? renderLinksEditor("social_links") : null}

        {activeTab === "seo_global" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input value={values.seo_global.title} onChange={(event) => setValues((prev) => ({ ...prev, seo_global: { ...prev.seo_global, title: event.target.value } }))} placeholder="Título SEO" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 md:col-span-2" />
            <textarea value={values.seo_global.description} onChange={(event) => setValues((prev) => ({ ...prev, seo_global: { ...prev.seo_global, description: event.target.value } }))} rows={3} placeholder="Descripción SEO" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 md:col-span-2" />
            <div className="space-y-2 rounded-md border border-white/10 bg-black/25 p-3 md:col-span-2">
              <input value={values.seo_global.ogImage} onChange={(event) => setValues((prev) => ({ ...prev, seo_global: { ...prev.seo_global, ogImage: event.target.value } }))} placeholder="URL de imagen OG" className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2" />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => seoOgInputRef.current?.click()}
                  disabled={isUploadingOgImage}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed"
                >
                  {isUploadingOgImage ? "Subiendo..." : "Subir a R2"}
                </button>
                <button
                  type="button"
                  onClick={() => openLibraryFor({ type: "seo_og" })}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-white/10"
                >
                  Elegir de biblioteca
                </button>
              </div>
              {values.seo_global.ogImage ? (
                <img
                  src={values.seo_global.ogImage}
                  alt="Vista previa OG"
                  className="h-28 w-full rounded-md border border-white/10 object-cover"
                />
              ) : null}
            </div>
          </div>
        ) : null}

        {activeTab === "navigation" ? (
          <div className="space-y-4">
            <input value={values.navigation.brand} onChange={(event) => setValues((prev) => ({ ...prev, navigation: { ...prev.navigation, brand: event.target.value } }))} placeholder="Marca" className="rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            {renderLinksEditor("navigation")}
          </div>
        ) : null}

        {activeTab === "whatsapp" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input value={values.whatsapp.number} onChange={(event) => setValues((prev) => ({ ...prev, whatsapp: { ...prev.whatsapp, number: event.target.value } }))} placeholder="Número (solo dígitos)" className="rounded-md border border-white/15 bg-black/40 px-3 py-2" />
            <textarea value={values.whatsapp.message} onChange={(event) => setValues((prev) => ({ ...prev, whatsapp: { ...prev.whatsapp, message: event.target.value } }))} rows={3} placeholder="Mensaje precargado" className="rounded-md border border-white/15 bg-black/40 px-3 py-2 md:col-span-2" />
          </div>
        ) : null}

        {activeTab === "admin_panel" ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Email destino de notificaciones</span>
                <input
                  value={values.admin_panel.contact_notification_email}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        contact_notification_email: event.target.value,
                      },
                    }))
                  }
                  placeholder="ignaciomasgomis@gmail.com"
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Proveedor de email</span>
                <input
                  value={values.admin_panel.email_provider}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, email_provider: event.target.value },
                    }))
                  }
                  placeholder="resend"
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.admin_panel.contact_notifications_enabled}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        contact_notifications_enabled: event.target.checked,
                      },
                    }))
                  }
                />
                Activar notificaciones de nuevos leads
              </label>
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.admin_panel.contact_auto_reply_enabled}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        contact_auto_reply_enabled: event.target.checked,
                      },
                    }))
                  }
                />
                Activar respuesta automática
              </label>
              <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={values.admin_panel.alerts_enabled}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, alerts_enabled: event.target.checked },
                    }))
                  }
                />
                Activar alertas de consumo y límites
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-neutral-300">Asunto de respuesta automática</span>
                <input
                  value={values.admin_panel.contact_auto_reply_subject}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        contact_auto_reply_subject: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-neutral-300">Cuerpo de respuesta automática</span>
                <textarea
                  rows={4}
                  value={values.admin_panel.contact_auto_reply_body}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        contact_auto_reply_body: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Plan Vercel</span>
                <input
                  value={values.admin_panel.vercel_plan}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, vercel_plan: event.target.value },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Plan Supabase</span>
                <input
                  value={values.admin_panel.supabase_plan}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, supabase_plan: event.target.value },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Modo plan R2</span>
                <input
                  value={values.admin_panel.r2_plan_mode}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, r2_plan_mode: event.target.value },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Umbral de advertencia (%)</span>
                <input
                  type="number"
                  min={50}
                  max={95}
                  value={values.admin_panel.usage_warning_threshold}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        usage_warning_threshold: Number(event.target.value || 70),
                      },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Umbral de peligro (%)</span>
                <input
                  type="number"
                  min={60}
                  max={99}
                  value={values.admin_panel.usage_danger_threshold}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: {
                        ...prev.admin_panel,
                        usage_danger_threshold: Number(event.target.value || 85),
                      },
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Límite diario de emails (opcional)</span>
                <input
                  type="number"
                  min={1}
                  value={values.admin_panel.email_daily_limit}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, email_daily_limit: event.target.value },
                    }))
                  }
                  placeholder="Sin límite"
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-neutral-300">Límite mensual de emails (opcional)</span>
                <input
                  type="number"
                  min={1}
                  value={values.admin_panel.email_monthly_limit}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      admin_panel: { ...prev.admin_panel, email_monthly_limit: event.target.value },
                    }))
                  }
                  placeholder="Sin límite"
                  className="w-full rounded-md border border-white/15 bg-black/40 px-3 py-2"
                />
              </label>
            </div>

            <div className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-neutral-300">
              <p className="mb-2">Consumo por plataformas</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void syncUsageNow()}
                  disabled={isSyncingUsage}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed"
                >
                  {isSyncingUsage ? "Sincronizando..." : "Sincronizar consumos ahora"}
                </button>
                <button
                  type="button"
                  onClick={() => void loadUsageHealth()}
                  disabled={isLoadingUsageHealth}
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed"
                >
                  {isLoadingUsageHealth ? "Actualizando..." : "Refrescar salud operativa"}
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-neutral-200">Salud operativa</p>
                {usageHealth ? (
                  <span className="text-xs text-neutral-500">
                    Actualizado: {new Date(usageHealth.generatedAt).toLocaleString("es-ES")}
                  </span>
                ) : null}
              </div>

              {usageHealthError ? (
                <p className="text-xs text-red-300">{usageHealthError}</p>
              ) : null}

              {usageHealth ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-white/10 bg-black/40 p-3 text-xs text-neutral-300">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-1 ${cronStatusBadge(usageHealth.cron.status)}`}>
                        Cron {usageHealth.cron.status}
                      </span>
                      <span>Secreto: {usageHealth.cron.configuredBy}</span>
                    </div>
                    <p className="mt-2 text-neutral-400">
                      Última ejecución correcta:{" "}
                      {usageHealth.cron.lastSuccessAt
                        ? new Date(usageHealth.cron.lastSuccessAt).toLocaleString("es-ES")
                        : "Sin registros"}
                    </p>
                    <p className="text-neutral-400">
                      Último error de cron:{" "}
                      {usageHealth.cron.lastErrorAt
                        ? `${new Date(usageHealth.cron.lastErrorAt).toLocaleString("es-ES")} · ${usageHealth.cron.lastError ?? "Sin detalle"}`
                        : "Sin errores"}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {usageHealth.platforms.map((platform) => (
                      <article key={platform.platform} className="rounded-md border border-white/10 bg-black/40 p-3 text-xs text-neutral-300">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="uppercase tracking-[0.12em] text-neutral-200">
                            {platform.platform === "cloudflare_r2" ? "Cloudflare R2" : platform.platform}
                          </p>
                          <span className={`rounded-full border px-2 py-1 ${dataModeBadge(platform.dataMode)}`}>
                            {dataModeLabel(platform.dataMode)}
                          </span>
                        </div>
                        <p className="text-neutral-400">
                          Última sync:{" "}
                          {platform.lastSyncAt
                            ? new Date(platform.lastSyncAt).toLocaleString("es-ES")
                            : "Sin sincronizaciones"}
                        </p>
                        <p className="text-neutral-400">
                          Métrica: {platform.lastMetricKey ?? "N/D"}{" "}
                          {platform.lastMetricValue !== null
                            ? `(${platform.lastMetricValue} ${platform.lastMetricUnit ?? ""})`
                            : ""}
                        </p>
                        <p className="text-neutral-400">Fuente: {platform.source ?? "N/D"}</p>
                        <p className={platform.credentialsOk ? "text-emerald-300" : "text-amber-300"}>
                          Credenciales: {platform.credentialsOk ? "Correctas" : "Incompletas"}
                        </p>
                        {platform.missingCredentials.length ? (
                          <p className="text-amber-300">
                            Faltan: {platform.missingCredentials.join(", ")}
                          </p>
                        ) : null}
                        {platform.lastError ? (
                          <p className="text-red-300">Último error: {platform.lastError}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>

                  {usageHealth.globalLastError.message ? (
                    <div className="rounded-md border border-red-300/30 bg-red-500/10 p-2 text-xs text-red-200">
                      Último error global:{" "}
                      {usageHealth.globalLastError.at
                        ? `${new Date(usageHealth.globalLastError.at).toLocaleString("es-ES")} · `
                        : ""}
                      {usageHealth.globalLastError.message}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">No hay errores globales recientes.</p>
                  )}
                </div>
              ) : isLoadingUsageHealth ? (
                <p className="text-xs text-neutral-500">Cargando salud operativa...</p>
              ) : (
                <p className="text-xs text-neutral-500">Pulsa “Refrescar salud operativa” para ver el estado actual.</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="border-t border-white/10 pt-4">
          <button type="button" onClick={() => setShowAdvanced((prev) => !prev)} className="rounded-md border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.12em] text-neutral-300">{showAdvanced ? "Ocultar JSON avanzado" : "JSON avanzado"}</button>
          {showAdvanced ? <pre className="mt-3 overflow-x-auto rounded-md border border-white/10 bg-black/40 p-3 text-xs text-neutral-300">{rawJson}</pre> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button type="button" disabled={isLoading || !isAdmin} onClick={() => void saveActiveSetting()} className="rounded-md border border-white/25 px-4 py-2 text-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed">Guardar {tabs.find((tab) => tab.key === activeTab)?.label ?? activeTab}</button>
          <button type="button" onClick={() => void loadRows()} className="rounded-md border border-white/15 px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5">Recargar</button>
          {message ? <span className="text-sm text-emerald-300">{message}</span> : null}
          {error ? <span className="text-sm text-red-300">{error}</span> : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.1em] text-neutral-400"><tr><th className="px-3 py-2 text-left">Clave</th><th className="px-3 py-2 text-left">Actualizado</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => (<tr key={row.key}><td className="px-3 py-2 text-neutral-200">{row.key}</td><td className="px-3 py-2 text-neutral-400">{new Date(row.updated_at).toLocaleString("es-ES")}</td></tr>))}
            {!rows.length && !isLoading ? <tr><td colSpan={2} className="px-3 py-8 text-center text-neutral-400">No hay ajustes guardados todavía.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
