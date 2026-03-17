import { z } from "zod";

export const analyticsEventTypeSchema = z.enum([
  "page_view",
  "project_view",
  "cta_click",
  "contact_form_view",
  "contact_form_submit",
]);

export const analyticsTrackPayloadSchema = z.object({
  eventType: analyticsEventTypeSchema,
  path: z.string().trim().min(1).max(400),
  pageTitle: z.string().trim().max(240).optional(),
  referrer: z.string().trim().max(500).optional(),
  source: z.string().trim().max(80).optional(),
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  value: z.record(z.string(), z.unknown()).optional(),
});
