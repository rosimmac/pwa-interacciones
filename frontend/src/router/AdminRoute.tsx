/**
 * Guard de ruta para acciones exclusivas de administrador.
 *
 * Se anida dentro de `PrivateRoute`, por lo que solo se evalúa para
 * usuarios ya autenticados. Si el rol no es "admin", redirige a
 * `/interacciones` con `replace` para que la URL restringida no quede
 * en el historial del navegador.
 */

import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "@/context/AuthContext";

export const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  if (user?.role !== "admin") {
    return <Navigate to="/interacciones" replace />;
  }

  return <Outlet />;
};
