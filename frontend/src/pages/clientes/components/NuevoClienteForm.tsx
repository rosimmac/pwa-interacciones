/**
 * Formulario de creación y edición de cliente.
 *
 * Valida con Zod + react-hook-form (solo el campo `nombre`, máx. 50 caracteres).
 * El `useEffect` de reset se dispara cuando cambia `clienteToEdit`:
 *   - Con cliente: prefija el campo con su nombre actual.
 *   - Sin cliente: limpia el campo para una nueva alta.
 *
 * Los callbacks `onCreate` y `onUpdate` son opcionales; si no se proporcionan
 * el formulario loguea por consola (útil para pruebas aisladas del componente).
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientesSchema, type ClienteFormData } from "@/schemas/clientesSchema";

type Props = {
  /** Callback que cierra el modal tras guardar o cancelar. */
  onSuccess: () => void;
  /** Si se pasa, el formulario entra en modo edición con el nombre prefijado. */
  clienteToEdit?: { id: number; nombre: string } | null;
  /** Callback invocado al enviar en modo creación. */
  onCreate?: (data: ClienteFormData) => Promise<void> | void;
  /** Callback invocado al enviar en modo edición. */
  onUpdate?: (id: number, data: ClienteFormData) => Promise<void> | void;
};

export function NuevoClienteForm({
  onSuccess,
  clienteToEdit = null,
  onCreate,
  onUpdate,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clientesSchema),
    defaultValues: { nombre: "" },
  });

  /** Prefija el nombre cuando se abre en modo edición; limpia en modo creación. */
  useEffect(() => {
    if (clienteToEdit) {
      reset({ nombre: clienteToEdit.nombre });
    } else {
      reset({ nombre: "" });
    }
  }, [clienteToEdit, reset]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (clienteToEdit) {
        if (onUpdate) {
          await onUpdate(clienteToEdit.id, data);
        } else {
          // Fallback si no se pasó onUpdate: aquí iría tu llamada a API
          console.log("Actualizar cliente", clienteToEdit.id, data);
        }
      } else {
        if (onCreate) {
          await onCreate(data);
        } else {
          // Fallback si no se pasó onCreate: aquí iría tu llamada a API
          console.log("Crear cliente", data);
        }
      }
      onSuccess();
    } catch (err) {
      // Manejo de error: podrías colocar un toast
      console.error(err);
    }
  };
  const { ref, onBlur, onChange, name } = register("nombre");
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <label
        htmlFor="cliente-nombre"
        className="text-sm font-medium text-gray-700"
      >
        Cliente
      </label>

      <Input
        id="cliente-nombre"
        name={name}
        ref={ref}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={(e) => {
          setTimeout(() => {
            e.target.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }}
        placeholder="ej: Marta García"
        className="bg-white border rounded-lg h-11 mt-2"
      />
      {errors.nombre && (
        <p className="text-red-500 text-sm">{errors.nombre.message}</p>
      )}

      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
          className="h-11 px-8 bg-white text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-black/5 
               hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-gray-50"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="h-11 px-8 bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)] 
               hover:bg-blue-600/90 hover:shadow-[0_8px_26px_rgba(37,99,235,0.45)]"
          disabled={isSubmitting}
        >
          {clienteToEdit ? "Guardar cambios" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
