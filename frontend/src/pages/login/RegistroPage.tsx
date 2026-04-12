// src/pages/RegistroPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { registroSchema, type RegistroSchema } from "@/schemas/registroSchema";
import { toastRegistro } from "@/components/toast";
import { api, type Usuario } from "@/api/api";

export function RegistroPage() {
  const navigate = useNavigate();

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
    const nuevo: Usuario = await api.registrarUsuario(values);
    if (nuevo.id) {
      toastRegistro.okGuardado();
      navigate("/login", { replace: true });
    } else {
      toastRegistro.errorRegistro();
    }
  }

  return (
    <div className="min-h-[100svh] flex flex-col bg-[#e8f0ff] sm:grid sm:place-items-center sm:px-3 sm:py-6">
      {/* Espaciador proporcional en móvil */}
      <div className="flex-none sm:hidden" style={{ height: "15svh" }} />

      {/* Contenedor: sin card en móvil, card blanca en escritorio */}
      <div
        className={[
          "w-full space-y-6 px-5",
          "sm:max-w-md sm:bg-white sm:rounded-2xl sm:shadow-lg sm:p-8",
        ].join(" ")}
      >
        <h1 className="text-4xl sm:text-3xl font-semibold leading-tight [text-wrap:balance]">
          Crea tu cuenta y empieza a gestionar tus interacciones
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="mb-1">
              Nombre
            </Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ana López"
              aria-invalid={!!errors.nombre || undefined}
              className="h-11 bg-white"
              {...register("nombre")}
            />
            {errors.nombre && (
              <p className="text-red-600 text-sm mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="mb-1">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="example@sales.com"
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
          <div className="space-y-2">
            <Label htmlFor="password" className="mb-1">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
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

          {/* Confirmar Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmarPassword" className="mb-1">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmarPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              aria-invalid={!!errors.confirmarPassword || undefined}
              className="h-11 bg-white"
              {...register("confirmarPassword")}
            />
            {errors.confirmarPassword && (
              <p className="text-red-600 text-sm mt-1">
                {errors.confirmarPassword.message}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => navigate("/login")}
            >
              Volver
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Registrando..." : "Crear cuenta"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
