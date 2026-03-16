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

export type interaccionFormData = z.infer<typeof interaccionFormSchema>;
