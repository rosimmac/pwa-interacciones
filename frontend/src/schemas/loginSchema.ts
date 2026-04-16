/**
 * Esquema de validación del formulario de inicio de sesión.
 *
 * Reglas:
 *   - `email`: cadena con formato de dirección de correo electrónico válida (RFC 5322).
 *   - `password`: cadena no vacía; la complejidad se valida en el backend.
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido"),
  // Solo se exige presencia; la complejidad y hashing se gestionan en el servidor.
  password: z.string().min(1, "La contraseña es obligatoria"),
});

/** Tipo inferido del esquema, usado como genérico de `useForm`. */
export type LoginSchema = z.infer<typeof loginSchema>;
