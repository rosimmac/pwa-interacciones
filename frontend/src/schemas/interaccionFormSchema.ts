/**
 * Esquema de validación del formulario de nueva/editar interacción.
 *
 * - `tipo`: enum estricto de tres categorías de interacción comercial.
 * - `descripcion`: texto libre con un mínimo de 3 caracteres.
 * - `clienteId`: ID numérico del cliente seleccionado; el valor 0 actúa
 *   como centinela de "sin selección" y es rechazado por `min(1)`.
 *   Se usa `invalid_type_error` porque el campo puede llegar como NaN
 *   cuando el Select no ha sido tocado todavía.
 * - `fecha` y `hora`: cadenas ISO separadas que se combinan antes de
 *   enviar al backend (`${fecha}T${hora}:00`).
 */

import { z } from "zod";

export const interaccionFormSchema = z.object({
  tipo: z.enum(["consulta", "reunion", "antecedente"]),
  descripcion: z
    .string()
    .min(3, { message: "La descripción es obligatoria (mín. 3 caracteres)." }),
  clienteId: z
    .number({ invalid_type_error: "Selecciona un cliente." })
    .min(1, { message: "Selecciona un cliente." }),
  fecha: z.string().min(1, { message: "La fecha es obligatoria." }),
  hora: z.string().min(1, { message: "La hora es obligatoria." }),
});

/** Tipo inferido del esquema, usado como genérico de `useForm`. */
export type interaccionFormData = z.infer<typeof interaccionFormSchema>;
