/**
 * Hook que centraliza la lógica de permisos basada en el rol del usuario.
 *
 * Devuelve un objeto con flags booleanos que los componentes usan para
 * mostrar u ocultar acciones (botones de editar, eliminar, etc.) sin
 * repetir la comparación de roles en cada sitio.
 *
 * Niveles de acceso:
 *   - `admin`     : acceso total (CRUD + gestión de usuarios y clientes).
 *   - `user`      : puede crear, editar y eliminar sus propias entidades.
 *   - `read-only` : solo lectura; ninguna acción de escritura disponible.
 */

import { useAuth } from "@/context/AuthContext";

export function usePermisos() {
  const { user } = useAuth();
  const role = user?.role;

  return {
    /** Puede crear nuevas interacciones y clientes. */
    puedeCrear: role === "admin" || role === "user",
    /** Puede editar interacciones y clientes existentes. */
    puedeEditar: role === "admin" || role === "user",
    /** Puede eliminar interacciones y clientes. */
    puedeEliminar: role === "admin" || role === "user",
    /** Puede ver las interacciones de todos los usuarios (no solo las propias). */
    puedeVerTodo: role === "admin",
    /** Puede acceder a la sección de gestión de usuarios (`/usuarios`). */
    puedeGestionarUsuarios: role === "admin",
    /** Puede crear y editar clientes. */
    puedeGestionarClientes: role === "admin" || role === "user",
  };
}
