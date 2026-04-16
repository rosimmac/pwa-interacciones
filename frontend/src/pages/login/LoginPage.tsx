/**
 * Página de inicio de sesión.
 *
 * Valida con Zod + react-hook-form. Al enviar llama a `api.login`, almacena
 * el token y los datos del usuario en el contexto de autenticación y redirige
 * a `/interacciones`.
 *
 * El atributo `noValidate` en el formulario desactiva la validación HTML5
 * nativa del navegador (incluyendo la del `<input type="email">`) para que
 * toda la validación pase por react-hook-form + Zod, lo que garantiza
 * mensajes de error coherentes y permite los tests de integración con jsdom.
 *
 * Layout adaptativo:
 *   - Móvil:    pantalla completa con fondo azul claro, formulario sin tarjeta.
 *   - Desktop:  tarjeta blanca centrada con `sm:max-w-md`.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { loginSchema, type LoginSchema } from "@/schemas/loginSchema";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { api } from "@/api/api";

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

  async function onSubmit(values: LoginSchema) {
    try {
      const { token, usuario } = await api.login(values.email, values.password);

      login(
        {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          role: usuario.rol, // backend usa "rol", el contexto usa "role"
        },
        token,
      );

      navigate("/interacciones", { replace: true });
    } catch {
      // El interceptor de 401 ya gestiona tokens inválidos,
      // aquí capturamos credenciales incorrectas
      alert("Email o contraseña incorrectos"); // luego lo cambiamos por un toast
    }
  }
  return (
    <div className="min-h-[100svh] flex flex-col bg-[#e8f0ff] sm:grid sm:place-items-center sm:px-3 sm:py-6">
      <div className="flex-none sm:hidden" style={{ height: "25svh" }} />

      <div
        className={[
          "w-full space-y-6 px-5",
          "sm:max-w-md sm:bg-white sm:rounded-2xl sm:shadow-lg sm:p-8 sm:px-8",
        ].join(" ")}
      >
        <h1 className="text-4xl sm:text-3xl font-semibold leading-tight [text-wrap:balance]">
          Inicia sesión y gestiona tus interacciones
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Email */}
          <div className="space-y-4">
            <Label htmlFor="email" className="mb-1">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="admin@sales.com"
              aria-invalid={!!errors.email || undefined}
              className="h-11 bg-white"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-4">
            <Label htmlFor="password" className="mb-1">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              aria-invalid={!!errors.password || undefined}
              className="h-11 bg-white"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Enlace */}
          <div className="flex justify-end">
            <Link
              to="/recuperar"
              className="text-sm text-blue-600 hover:underline active:opacity-80"
            >
              ¿Has olvidado tu contraseña?
            </Link>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => navigate("/registro")}
            >
              Registro
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
