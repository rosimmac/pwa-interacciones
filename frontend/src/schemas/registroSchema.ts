import { z } from "zod";

export const registroSchema = z
  .object({
    nombre: z
      .string()
      .min(2, { message: "El nombre es obligatorio (mín. 2 caracteres)." }),
    email: z.string().email({ message: "Introduce un email válido." }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmarPassword: z
      .string()
      .min(6, { message: "Confirma tu contraseña." }),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarPassword"],
  });

export type RegistroSchema = z.infer<typeof registroSchema>;
