import { createBrowserRouter, Navigate } from "react-router";
import InteraccionesPage from "@/pages/interacciones/InteraccionesPage";
import { ClientesPage } from "@/pages/clientes/ClientesPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { PrivateRoute } from "./PrivateRoute";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/interacciones",
    element: <PrivateRoute element={<InteraccionesPage />} />,
  },
  {
    path: "/clientes",
    element: <PrivateRoute element={<ClientesPage />} />,
  },
  {
    path: "*",
    element: <Navigate to="/interacciones" />,
  },
]);
