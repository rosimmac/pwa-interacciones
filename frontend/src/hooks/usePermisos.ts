import { useAuth } from "@/context/AuthContext";

export function usePermisos() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    puedeCrear: role === "admin" || role === "user",
    puedeEditar: role === "admin" || role === "user",
    puedeEliminar: role === "admin" || role === "user",
    puedeVerTodo: role === "admin",
    puedeGestionarUsuarios: role === "admin",
    puedeGestionarClientes: role === "admin" || role === "user",
  };
}
