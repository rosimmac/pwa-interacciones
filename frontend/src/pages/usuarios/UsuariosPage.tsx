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

  const usuariosFiltrados = busqueda.trim()
    ? usuarios.filter(
        (u) =>
          u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          u.email.toLowerCase().includes(busqueda.toLowerCase()),
      )
    : usuarios;

  const handleAdd = () => setModalState({ open: true, usuario: null });
  const handleEdit = (usuario: Usuario) =>
    setModalState({ open: true, usuario });

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

  const handleUpdateUsuario = async (id: number, data: UsuarioFormData) => {
    try {
      const actualizado = await api.updateUsuario(id, data);
      setUsuarios((prev) => prev.map((u) => (u.id === id ? actualizado : u)));
      toastUsuario.okActualizado();
    } catch (e) {
      console.error(e);
      toastUsuario.errorActualizar();
    }
  };

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
