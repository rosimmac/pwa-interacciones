/**
 * Esquema de validación del formulario de gestión de usuarios (crear/editar).
 *
 * Campo `password`:
 *   La unión `.or(z.literal(""))` permite enviar la cadena vacía cuando se
 *   edita un usuario sin cambiar su contraseña. Si se proporciona una
 *   contraseña no vacía, debe cumplir las mismas reglas de complejidad que
 *   en el registro (≥ 8 caracteres, mayúscula y carácter especial).
 *
 * Campo `rol`:
 *   Enum estricto de tres niveles de acceso. Se usa `required_error` en lugar
 *   de `invalid_type_error` porque el campo nunca recibe un tipo distinto a
 *   string, solo puede estar ausente.
 */

import { z } from "zod";

export const usuarioSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  email: z.string().email("Email no válido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    // Lookahead: requiere al menos una letra mayúscula.
    .regex(/(?=.*[A-Z])/, "Debe contener al menos una mayúscula")
    // Lookahead: requiere al menos un símbolo especial.
    .regex(
      /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/,
      "Debe contener al menos un carácter especial",
    )
    // La cadena vacía es válida: significa "no cambiar la contraseña".
    .or(z.literal("")),
  rol: z.enum(["admin", "user", "read-only"], {
    required_error: "El rol es obligatorio",
  }),
});

/** Tipo inferido del esquema, usado como genérico de `useForm`. */
export type UsuarioFormData = z.infer<typeof usuarioSchema>;
