// src/pages/ResetPasswordPage.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { api } from "@/api/api";
import { toastRecuperacion } from "@/components/toast";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[^a-zA-Z0-9]/, "Debe contener al menos un carácter especial"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });
type ResetSchema = z.infer<typeof resetSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // lee ?token=abc123 de la URL
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
  });

  // Token inválido o ausente
  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-xl font-semibold">Enlace inválido</h1>
          <p className="text-sm text-gray-500">
            El enlace no es válido o ha expirado.
          </p>
          <Link
            to="/recuperar"
            className="text-sm text-blue-600 hover:underline block"
          >
            Solicitar uno nuevo
          </Link>
        </div>
      </div>
    );
  }

  async function onSubmit(values: ResetSchema) {
    try {
      await api.resetPassword(token!, values.password);
      toastRecuperacion.okRestablecido();
      setDone(true);
    } catch {
      toastRecuperacion.errorEnlace();
    }
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h1 className="text-xl font-semibold">¡Contraseña actualizada!</h1>
          <p className="text-sm text-gray-500">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/login", { replace: true })}
          >
            Ir al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold">Nueva contraseña</h1>
        <p className="text-sm text-gray-500">
          Elige una contraseña segura de al menos 8 caracteres, una mayúscula y
          un carácter especial.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Repetir contraseña</Label>
            <Input id="confirm" type="password" {...register("confirm")} />
            {errors.confirm && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirm.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
