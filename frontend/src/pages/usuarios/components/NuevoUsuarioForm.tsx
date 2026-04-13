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
  open: boolean;
  onSuccess: () => void;
  usuarioToEdit?: Usuario | null;
  onCreate?: (data: UsuarioFormData) => Promise<void> | void;
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

  const currentRol = watch("rol");

  useEffect(() => {
    if (!open) return;
    if (usuarioToEdit) {
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
