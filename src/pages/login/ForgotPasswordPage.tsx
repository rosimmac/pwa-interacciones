// src/pages/ForgotPasswordPage.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useState } from "react";

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});
type ForgotSchema = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotSchema) {
    // Simulación: en producción aquí haríamos POST /api/auth/forgot-password
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Email de recuperación enviado a:", values.email);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm space-y-4 text-center">
          <div className="text-4xl">📧</div>
          <h1 className="text-xl font-semibold">Revisa tu correo</h1>
          <p className="text-sm text-gray-600">
            Si <span className="font-medium">{getValues("email")}</span> está
            registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:underline block"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm space-y-4 ">
        <h1 className="text-xl font-semibold">Recuperar contraseña</h1>
        <p className="text-sm text-gray-500">
          Introduce tu email y te enviaremos un enlace para restablecerla.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-0"
              asChild
            >
              <Link to="/login">Cancelar</Link>
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-w-0 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
