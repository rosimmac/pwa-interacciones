/**
 * Formulario de creación y edición de usuario.
 *
 * Valida con Zod + react-hook-form. La contraseña acepta cadena vacía en
 * modo edición (el schema usa `.or(z.literal(""))`) para no obligar al
 * administrador a cambiarla en cada actualización.
 *
 * El campo `rol` usa un `<Select>` de Radix que no está integrado de forma
 * nativa con `register`, por lo que se controla mediante `watch` + `setValue`
 * con `shouldValidate: true` para que los errores de validación se actualicen
 * en tiempo real al cambiar la selección.
 *
 * El `useEffect` de reset se dispara cuando cambia `open` o `usuarioToEdit`.
 * El `setTimeout(..., 0)` en el modo edición difiere el reset un tick para
 * asegurar que el componente ya está montado antes de escribir en los campos.
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usuarioSchema, type UsuarioFormData } from "@/schemas/usuarioSchema";
import type { Usuario } from "@/api/api";

type Props = {
  /** Indica si el modal contenedor está abierto; dispara el reset de campos. */
  open: boolean;
  /** Callback que cierra el modal y opcionalmente refresca la lista. */
  onSuccess: () => void;
  /** Si se proporciona, el formulario entra en modo edición con los datos prefijados. */
  usuarioToEdit?: Usuario | null;
  /** Callback invocado al enviar el formulario en modo creación. */
  onCreate?: (data: UsuarioFormData) => Promise<void> | void;
  /** Callback invocado al enviar el formulario en modo edición. */
  onUpdate?: (id: number, data: UsuarioFormData) => Promise<void> | void;
};

export function NuevoUsuarioForm({
  open,
  onSuccess,
  usuarioToEdit = null,
  onCreate,
  onUpdate,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nombre: "", email: "", password: "", rol: "user" },
  });

  /** Valor actual del campo rol; necesario porque Select no usa register nativo. */
  const currentRol = watch("rol");

  /**
   * Resetea el formulario cada vez que el modal se abre.
   * - Modo edición: prefija los campos con los datos del usuario; la contraseña
   *   se deja vacía deliberadamente para no exponer el hash almacenado.
   * - Modo creación: resetea a los valores por defecto.
   */
  useEffect(() => {
    if (!open) return;
    if (usuarioToEdit) {
      // setTimeout(..., 0) asegura que el DOM esté listo antes del reset
      setTimeout(() => {
        reset({
          nombre: usuarioToEdit.nombre,
          email: usuarioToEdit.email,
          password: "",
          rol: usuarioToEdit.rol,
        });
      }, 0);
    } else {
      reset({ nombre: "", email: "", password: "", rol: "user" });
    }
  }, [open, usuarioToEdit, reset]);

  /** Delega en `onCreate` o `onUpdate` según el modo del formulario. */
  const onSubmit = async (data: UsuarioFormData) => {
    try {
      if (usuarioToEdit) {
        await onUpdate?.(usuarioToEdit.id, data);
      } else {
        await onCreate?.(data);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre" className="text-muted-foreground">
          Nombre
        </Label>
        <Input
          id="nombre"
          {...register("nombre")}
          placeholder="ej: Ana López"
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="ej: ana@empresa.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-muted-foreground">
          {usuarioToEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
        </Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Mínimo 8 caracteres, una mayúscula, y un carácter especial"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Rol</Label>
        <Select
          value={currentRol}
          onValueChange={(val) =>
            setValue("rol", val as UsuarioFormData["rol"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un rol…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="read-only">Solo lectura</SelectItem>
          </SelectContent>
        </Select>
        {errors.rol && (
          <p className="text-sm text-destructive">{errors.rol.message}</p>
        )}
      </div>

      <div className="flex justify-center items-center gap-2 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onSuccess}
          className="h-11 px-8 bg-white text-gray-700 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-black/5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:bg-gray-50"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-8 bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:bg-blue-600/90 hover:shadow-[0_8px_26px_rgba(37,99,235,0.45)]"
        >
          {usuarioToEdit ? "Guardar cambios" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
