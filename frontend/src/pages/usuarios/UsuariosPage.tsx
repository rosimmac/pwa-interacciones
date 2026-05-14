/**
 * Página de gestión de usuarios del sistema.
 *
 * Responsabilidades:
 *   1. Carga la lista completa de usuarios al montar el componente.
 *   2. Filtrado en cliente por nombre o email según el texto de búsqueda.
 *   3. CRUD completo con feedback toast:
 *        - Crear: append al final de la lista local tras éxito de API.
 *        - Actualizar: solo incluye `password` en el payload si no está vacío,
 *          permitiendo editar otros campos sin cambiar la contraseña.
 *        - Eliminar: confirmación modal antes de la llamada a la API.
 *   4. Estado único del modal (`open` + `usuario`) para alternar entre
 *      modo creación (usuario = null) y modo edición.
 */

import { useEffect, useState } from "react";
import { api, type Usuario } from "@/api/api";

import { BotonFlotante } from "@/components/BotonFlotante";
import { UsuarioCard } from "./components/UsuarioCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AppHeader } from "@/components/AppHeader";
import { NuevoUsuarioModal } from "./components/NuevoUsuarioModal";
import type { UsuarioFormData } from "@/schemas/usuarioSchema";
import { toastUsuario } from "@/components/toast";
import { confirmDeleteToast } from "@/components/ConfirmToast";

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    usuario: Usuario | null;
  }>({ open: false, usuario: null });

  /** Carga inicial de todos los usuarios al montar la página. */
  useEffect(() => {
    async function cargar() {
      try {
        const data = await api.getUsuarios();
        setUsuarios(data);
      } catch (error) {
        console.error("Error cargando usuarios", error);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  /** Filtra por nombre o email; sin texto devuelve la lista completa. */
  const usuariosFiltrados = busqueda.trim()
    ? usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : usuarios;

  /** Abre el modal en modo creación. */
  const handleAdd = () => setModalState({ open: true, usuario: null });
  /** Abre el modal en modo edición con el usuario seleccionado. */
  const handleEdit = (usuario: Usuario) =>
    setModalState({ open: true, usuario });

  /** Crea un usuario y lo añade al final de la lista local. */
  const handleCreateUsuario = async (data: UsuarioFormData) => {
    try {
      const nuevo = await api.createUsuario(data);
      setUsuarios((prev) => [...prev, nuevo]);
      toastUsuario.okGuardado();
    } catch (e) {
      console.error(e);
      toastUsuario.errorGuardar();
    }
  };

  /**
   * Actualiza un usuario existente.
   * La contraseña solo se incluye en el payload si el campo no está vacío,
   * lo que permite modificar nombre, email o rol sin forzar un cambio de clave.
   */
  const handleUpdateUsuario = async (id: number, data: UsuarioFormData) => {
    try {
      const body: Partial<Usuario> & { password?: string } = {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
      };
      if (data.password !== "") {
        body.password = data.password;
      }
      const actualizado = await api.updateUsuario(id, body);
      setUsuarios((prev) => prev.map((u) => (u.id === id ? actualizado : u)));
      toastUsuario.okActualizado();
    } catch (e) {
      console.error(e);
      toastUsuario.errorActualizar();
    }
  };

  /**
   * Elimina un usuario tras confirmación.
   * Si el usuario cancela el toast de confirmación, la función retorna sin
   * realizar ninguna llamada de red.
   */
  const handleDeleteUsuario = async (id: number) => {
    const confirmar = await confirmDeleteToast(
      "¿Seguro que deseas eliminar el usuario?",
      "Si lo eliminas, no lo podrás recuperar",
    );
    if (!confirmar) return;

    try {
      await api.deleteUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      toastUsuario.okEliminado();
    } catch (e) {
      console.error(e);
      toastUsuario.errorEliminar();
    }
  };

  if (loading && usuarios.length === 0) {
    return <p className="px-4 mt-6">Cargando usuarios...</p>;
  }

  return (
    <div className="pb-20">
      <AppHeader
        title="Usuarios"
        placeholder="Buscar usuario..."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onClearSearch={() => setBusqueda("")}
      />

      <SectionTitle>Todos los usuarios</SectionTitle>

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && usuariosFiltrados.length === 0 && (
            <p className="text-center text-gray-500 col-span-2">
              No hay usuarios.
            </p>
          )}
          {usuariosFiltrados.map((usuario) => (
            <UsuarioCard
              key={usuario.id}
              usuario={usuario}
              onEdit={() => handleEdit(usuario)}
              onDelete={() => handleDeleteUsuario(usuario.id)}
            />
          ))}
        </div>
      </div>

      <BotonFlotante onClick={handleAdd} />

      <NuevoUsuarioModal
        open={modalState.open}
        onOpenChange={(o) =>
          setModalState((prev) => ({
            open: o,
            usuario: o ? prev.usuario : null,
          }))
        }
        usuarioToEdit={modalState.usuario}
        onCreate={handleCreateUsuario}
        onUpdate={handleUpdateUsuario}
      />
    </div>
  );
}
