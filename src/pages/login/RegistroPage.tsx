// src/pages/RegistroPage.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { registroSchema, type RegistroSchema } from "@/schemas/registroSchema";
import { toastRegistro } from "@/components/toast";
import { useAuth } from "@/context/AuthContext";

export function RegistroPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroSchema>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmarPassword: "",
    },
  });
  async function onSubmit(values: RegistroSchema) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    login(values.email, "user"); //establece la sesión
    toastRegistro.okGuardado();
    navigate("/interacciones", { replace: true });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold mb-6">
          Crea tu cuenta y empieza a gestionar tus interacciones
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ana López"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-red-600 text-sm mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@sales.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Contraseña"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmar Password */}
          <div>
            <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
            <Input
              id="confirmarPassword"
              type="password"
              placeholder="Repite tu contraseña"
              {...register("confirmarPassword")}
            />
            {errors.confirmarPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmarPassword.message}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-0"
              onClick={() => navigate("/login")}
            >
              Volver
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-w-0 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Registrando..." : "Crear cuenta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
