/**
 * Esquema de validación del formulario de clientes (crear/editar).
 *
 * El nombre es el único campo editable de un cliente.
 * Se limita a 50 caracteres para evitar truncados silenciosos al persistir
 * en la columna de la base de datos.
 */

import { z } from "zod";

export const clientesSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
});

/** Tipo inferido del esquema, usado como genérico de `useForm`. */
export type ClienteFormData = z.infer<typeof clientesSchema>;
