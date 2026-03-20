import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
