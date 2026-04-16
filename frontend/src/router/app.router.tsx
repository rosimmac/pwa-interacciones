/**
 * Configuración central del router de la aplicación.
 *
 * Árbol de rutas:
 *   /login          – Formulario de inicio de sesión (pública).
 *   /registro       – Registro de nuevos usuarios (pública).
 *   /recuperar      – Solicitud de enlace de recuperación de contraseña (pública).
 *   /restablecer    – Formulario de nueva contraseña con token de recuperación (pública).
 *
 *   [PrivateRoute]  – Guard: redirige a /login si no hay sesión activa.
 *     /interacciones  – Listado y gestión de interacciones comerciales.
 *     /clientes       – Listado y gestión de clientes.
 *     [AdminRoute]    – Guard adicional: solo accesible con rol "admin".
 *       /usuarios     – Gestión de usuarios del sistema.
 *
 *   *               – Cualquier ruta no definida redirige a /interacciones.
 */

import { createBrowserRouter, Navigate } from "react-router";
import { InteraccionesPage } from "@/pages/interacciones/InteraccionesPage";
import { ClientesPage } from "@/pages/clientes/ClientesPage";
import { UsuariosPage } from "@/pages/usuarios/UsuariosPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { PrivateRoute } from "./PrivateRoute";
import { AdminRoute } from "./AdminRoute";
import { RegistroPage } from "@/pages/login/RegistroPage";
import { ForgotPasswordPage } from "@/pages/login/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/login/ResetPasswordPage";

export const appRouter = createBrowserRouter([
  // Rutas públicas – accesibles sin sesión iniciada.
  { path: "/login", element: <LoginPage /> },
  { path: "/registro", element: <RegistroPage /> },
  { path: "/recuperar", element: <ForgotPasswordPage /> },
  { path: "/restablecer", element: <ResetPasswordPage /> },
  {
    // Guard de sesión: renderiza sus hijos solo si el usuario está autenticado.
    element: <PrivateRoute />,
    children: [
      { path: "/interacciones", element: <InteraccionesPage /> },
      { path: "/clientes", element: <ClientesPage /> },
      {
        // Guard de rol: solo accesible para usuarios con rol "admin".
        element: <AdminRoute />,
        children: [{ path: "/usuarios", element: <UsuariosPage /> }],
      },
    ],
  },
  // Ruta catch-all: redirige cualquier URL desconocida a la pantalla principal.
  { path: "*", element: <Navigate to="/interacciones" /> },
]);
