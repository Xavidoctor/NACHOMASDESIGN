import { z } from "zod";
import { CONTACT_FORM_MIN_MESSAGE } from "@/lib/constants";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  email: z.string().trim().email("Introduce un email valido."),
  company: z.string().trim().max(100, "La empresa es demasiado larga.").optional().or(z.literal("")),
  service: z.string().trim().min(2, "Selecciona un servicio."),
  message: z
    .string()
    .trim()
    .min(CONTACT_FORM_MIN_MESSAGE, `El mensaje debe tener al menos ${CONTACT_FORM_MIN_MESSAGE} caracteres.`),
  website: z.string().optional()
});

export type ContactFormValues = z.infer<typeof contactSchema>;
