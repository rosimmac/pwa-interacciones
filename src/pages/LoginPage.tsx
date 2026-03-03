// src/pages/LoginPage.tsx

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { loginSchema, type LoginSchema } from "@/schemas/loginSchema";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();

  const { login } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 👉 Simulación de login
  async function onSubmit(values: LoginSchema) {
    console.log("Datos enviados:", values);

    // Simular petición a API
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Guardar token
    localStorage.setItem("token", "demo");

    // ...

    login(values.email);

    // Redirigir
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#e8f0ff]">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold mb-6">
          Inicia sesión y gestiona tus interacciones
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@sales.com"
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

          <div className="text-right">
            <Link
              to="/recuperar"
              className="text-sm text-blue-600 hover:underline"
            >
              ¿Has olvidado tu contraseña?
            </Link>
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-0"
              onClick={() => navigate("/registro")}
            >
              Registro
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-w-0 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
