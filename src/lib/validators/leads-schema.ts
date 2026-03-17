import { z } from "zod";

export const leadStatusSchema = z.enum([
  "nuevo",
  "leido",
  "respondido",
  "resuelto",
  "archivado",
  "spam",
]);

export const leadListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: leadStatusSchema.optional(),
  isRead: z.enum(["si", "no"]).optional(),
});

export const leadUpdateSchema = z
  .object({
    id: z.string().uuid(),
    status: leadStatusSchema.optional(),
    isRead: z.boolean().optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined || value.isRead !== undefined || value.notes !== undefined,
    {
      message: "Debes enviar al menos un cambio.",
    },
  );
