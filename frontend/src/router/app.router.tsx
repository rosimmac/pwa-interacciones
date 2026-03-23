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
  { path: "/login", element: <LoginPage /> },
  { path: "/registro", element: <RegistroPage /> },
  { path: "/recuperar", element: <ForgotPasswordPage /> },
  { path: "/restablecer", element: <ResetPasswordPage /> },
  {
    element: <PrivateRoute />,
    children: [
      { path: "/interacciones", element: <InteraccionesPage /> },
      { path: "/clientes", element: <ClientesPage /> },
      {
        element: <AdminRoute />,
        children: [{ path: "/usuarios", element: <UsuariosPage /> }],
      },
    ],
  },
  { path: "*", element: <Navigate to="/interacciones" /> },
]);
