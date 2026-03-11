import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientesSchema, type ClienteFormData } from "@/schemas/clientesSchema";

type Props = {
  onSuccess: () => void;
  // Si editas, pásalo; si es alta, pásalo como null
  clienteToEdit?: { id: number; nombre: string } | null;
  /**
   * Si quieres que el form ejecute la lógica de crear/actualizar, provee estos handlers.
   * Si no los pasas, emitiremos los datos por console.log y llamaremos onSuccess igualmente.
   */
  onCreate?: (data: ClienteFormData) => Promise<void> | void;
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
        {...register("nombre")}
        placeholder="ej: Marta García"
        className="bg-white border rounded-lg h-11"
      />
      {errors.nombre && (
        <p className="text-red-500 text-sm">{errors.nombre.message}</p>
      )}

      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
          className="h-11 px-6"
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="h-11 px-6 bg-[#1677ff] text-white rounded-lg hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {clienteToEdit ? "Guardar cambios" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
