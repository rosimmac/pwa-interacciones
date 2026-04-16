/**
 * Guard de ruta para usuarios autenticados.
 *
 * Comportamiento:
 *   - `checking`          → devuelve `null` (pantalla en blanco) mientras se
 *                           verifica la sesión en el primer render, evitando
 *                           un flash de redirección innecesario.
 *   - `authenticated`     → renderiza las rutas hijas mediante `<Outlet />`.
 *   - `not-authenticated` → redirige a `/login` con `replace` para que la
 *                           URL de login no quede en el historial del navegador.
 */

import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "@/context/AuthContext";

export const PrivateRoute = () => {
  const { authStatus } = useContext(AuthContext);

  // Esperamos a que AuthProvider determine el estado inicial desde localStorage.
  if (authStatus === "checking") return null;

  if (authStatus === "authenticated") return <Outlet />;
  return <Navigate to="/login" replace />;
};
