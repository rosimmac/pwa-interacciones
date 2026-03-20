import { z } from "zod";

export const clientesSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
});

export type ClienteFormData = z.infer<typeof clientesSchema>;
