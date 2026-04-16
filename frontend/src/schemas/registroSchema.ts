/**
 * Esquema de validación del formulario de registro de nuevos usuarios.
 *
 * Reglas de contraseña (campo `password`):
 *   - Mínimo 8 caracteres.
 *   - Al menos una letra mayúscula (A–Z).
 *   - Al menos un carácter especial del conjunto !@#$%^&*()_+…
 *
 * Se aplica un `refine` cross-field para verificar que `password` y
 * `confirmarPassword` coinciden. El error se asocia al path
 * ["confirmarPassword"] para que react-hook-form lo muestre bajo ese campo.
 */

import { z } from "zod";

export const registroSchema = z
  .object({
    nombre: z
      .string()
      .min(2, { message: "El nombre es obligatorio (mín. 2 caracteres)." }),
    email: z.string().email({ message: "Introduce un email válido." }),
    password: z
      .string()
      .min(8, { message: "Mínimo 8 caracteres." })
      // Lookahead positivo: requiere al menos una mayúscula en cualquier posición.
      .regex(/(?=.*[A-Z])/, {
        message: "Debe contener al menos una mayúscula.",
      })
      // Lookahead positivo: requiere al menos un símbolo especial.
      .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
        message: "Debe contener al menos un carácter especial.",
      }),
    confirmarPassword: z
      .string()
      .min(8, { message: "Confirma tu contraseña." }),
  })
  // Validación cross-field: las dos contraseñas deben ser idénticas.
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmarPassword"],
  });

/** Tipo inferido del esquema, usado como genérico de `useForm`. */
export type RegistroSchema = z.infer<typeof registroSchema>;
