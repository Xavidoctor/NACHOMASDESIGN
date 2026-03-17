import { z } from "zod";

export const settingKeySchema = z.enum([
  "contact",
  "social_links",
  "seo_global",
  "navigation",
  "whatsapp",
  "admin_panel",
]);

const linkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(300),
  logoUrl: z.string().trim().max(500).optional(),
});

export const contactSettingSchema = z.object({
  heading: z.string().trim().max(160).optional(),
  intro: z.string().trim().max(700).optional(),
  email: z
    .string()
    .trim()
    .max(160)
    .refine(
      (value) => value.length === 0 || z.string().email().safeParse(value).success,
      "Introduce un correo válido o déjalo vacío.",
    ),
  contactLabel: z.string().trim().max(80).optional(),
  copyEmail: z.string().trim().max(80).optional(),
  whatsappLabel: z.string().trim().max(80).optional(),
});

export const socialLinksSettingSchema = z.object({
  links: z.array(linkSchema).max(20).default([]),
});

export const seoGlobalSettingSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(220),
  ogImage: z.string().trim().min(1).max(500).optional(),
});

export const navigationSettingSchema = z.object({
  brand: z.string().trim().min(2).max(120),
  links: z.array(linkSchema).max(20).default([]),
});

export const whatsappSettingSchema = z.object({
  number: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9]+$/, "El numero de WhatsApp solo puede contener digitos."),
  message: z.string().trim().min(5).max(600),
});

export const adminPanelSettingSchema = z
  .object({
    contact_notification_email: z.string().trim().email("Introduce un correo válido."),
    contact_notifications_enabled: z.boolean().default(true),
    contact_auto_reply_enabled: z.boolean().default(false),
    contact_auto_reply_subject: z.string().trim().min(3).max(180),
    contact_auto_reply_body: z.string().trim().min(5).max(2000),
    alerts_enabled: z.boolean().default(true),
    vercel_plan: z.string().trim().min(2).max(120),
    supabase_plan: z.string().trim().min(2).max(120),
    r2_plan_mode: z.string().trim().min(2).max(120),
    email_provider: z.string().trim().min(2).max(80),
    usage_warning_threshold: z.number().min(50).max(95),
    usage_danger_threshold: z.number().min(60).max(99),
    email_daily_limit: z.number().int().positive().nullable().optional(),
    email_monthly_limit: z.number().int().positive().nullable().optional(),
  })
  .refine((value) => value.usage_danger_threshold > value.usage_warning_threshold, {
    message: "El umbral de peligro debe ser mayor que el de advertencia.",
    path: ["usage_danger_threshold"],
  });

const settingsValueSchemaMap = {
  contact: contactSettingSchema,
  social_links: socialLinksSettingSchema,
  seo_global: seoGlobalSettingSchema,
  navigation: navigationSettingSchema,
  whatsapp: whatsappSettingSchema,
  admin_panel: adminPanelSettingSchema,
} as const;

export const settingUpsertSchema = z.object({
  key: settingKeySchema,
  valueJson: z.unknown(),
});

export function parseSettingValue(
  key: z.infer<typeof settingKeySchema>,
  valueJson: unknown,
) {
  return settingsValueSchemaMap[key].parse(valueJson);
}
