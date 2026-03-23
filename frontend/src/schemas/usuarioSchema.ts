import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres").optional(),
  rol: z.enum(["admin", "user", "read-only"], {
    required_error: "El rol es obligatorio",
  }),
});

export type UsuarioFormData = z.infer<typeof usuarioSchema>;
