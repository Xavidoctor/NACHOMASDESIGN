import { z } from "zod";

export const adminUserRoleSchema = z.enum(["admin", "editor"]);

export const adminUserListQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
});

export const adminUserUpdateSchema = z
  .object({
    id: z.string().uuid(),
    role: adminUserRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => value.role !== undefined || value.isActive !== undefined, {
    message: "Debes indicar al menos un cambio para el usuario.",
  });
