import { createBrowserRouter, Navigate } from "react-router";
import { InteraccionesPage } from "@/pages/interacciones/InteraccionesPage";
import { ClientesPage } from "@/pages/clientes/ClientesPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { PrivateRoute } from "./PrivateRoute";
import { RegistroPage } from "@/pages/login/RegistroPage";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/registro",
    element: <RegistroPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: "/interacciones", element: <InteraccionesPage /> },
      { path: "/clientes", element: <ClientesPage /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/interacciones" />,
  },
]);
