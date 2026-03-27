import { useEffect, useMemo, useState } from "react";
import { api, type Interaccion, type Usuario, type Cliente } from "@/api/api";

import { BotonFlotante } from "@/components/BotonFlotante";
import { InteraccionCard } from "./components/InteraccionCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AppHeader } from "@/components/AppHeader";
import { NuevaInteraccionModal } from "./components/NuevaInteraccionModal";
import { FiltrosTabs, type FiltroID } from "./components/FiltrosTabs";
import { toastInteraccion } from "@/components/toast";
import { useAuth } from "@/context/AuthContext";
import { usePermisos } from "@/hooks/usePermisos";

import { Users, MessageSquare, NotebookText } from "lucide-react";
import { confirmDeleteToast } from "@/components/ConfirmToast";

export function InteraccionesPage() {
  const { user } = useAuth();
  const { puedeCrear, puedeEditar, puedeEliminar, puedeVerTodo } =
    usePermisos();

  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [usuarios, setUsuarios] = useState<Record<number, Usuario>>({});
  const [clientes, setClientes] = useState<Record<number, Cliente>>({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroID>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [modalState, setModalState] = useState<{
    open: boolean;
    interaccion: Interaccion | null;
  }>({ open: false, interaccion: null });

  useEffect(() => {
    async function cargar() {
      try {
        const [interaccionesData, usuariosData, clientesData] =
          await Promise.all([
            api.getInteracciones(),
            puedeVerTodo ? api.getUsuarios() : Promise.resolve([]),
            api.getClientes(),
          ]);

        const usuariosMap: Record<number, Usuario> = {};
        usuariosData.forEach((u) => {
          usuariosMap[u.id] = u;
        });

        const clientesMap: Record<number, Cliente> = {};
        clientesData.forEach((c) => {
          clientesMap[c.id] = c;
        });

        setInteracciones(interaccionesData);
        setUsuarios(usuariosMap);
        setClientes(clientesMap);
      } catch (error) {
        console.error("Error cargando interacciones", error);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  const texto = busqueda.toLowerCase().trim();

  const interaccionesFiltradas = useMemo(() => {
    let porRol = puedeVerTodo
      ? interacciones
      : interacciones.filter((i) => i.usuarioId === user?.id);

    if (filtro !== "todas") {
      porRol = porRol.filter((i) => i.tipo.nombre === filtro);
    }

    if (texto) {
      porRol = porRol.filter((i) => {
        const tipo = i.tipo.nombre?.toLowerCase() ?? "";
        const desc = i.descripcion?.toLowerCase() ?? "";
        const usuario = usuarios[i.usuarioId]?.nombre?.toLowerCase() ?? "";
        const cliente = clientes[i.clienteId]?.nombre?.toLowerCase() ?? "";
        return (
          tipo.includes(texto) ||
          desc.includes(texto) ||
          usuario.includes(texto) ||
          cliente.includes(texto)
        );
      });
    }

    return porRol;
  }, [
    interacciones,
    filtro,
    texto,
    usuarios,
    clientes,
    puedeVerTodo,
    user?.id,
  ]);

  const handleAdd = () => {
    setModalState({ open: true, interaccion: null });
  };

  const handleEdit = (interaccion: Interaccion) => {
    setModalState({ open: true, interaccion });
  };

  const handleCreateInteraccion = async (data: any) => {
    try {
      const payload = {
        tipo: data.tipo,
        descripcion: data.descripcion,
        clienteId: data.clienteId,
        usuarioId: user!.id,
        fecha: `${data.fecha}T${data.hora}:00`,
      };
      const nueva = await api.createInteraccion(payload);
      setInteracciones((prev) => [nueva, ...prev]);
      toastInteraccion.okGuardado();
    } catch (e) {
      console.error(e);
      toastInteraccion.errorGuardar(
        async () => await handleCreateInteraccion(data),
      );
    }
  };

  const handleUpdateInteraccion = async (id: number, data: any) => {
    try {
      const payload = {
        tipo: data.tipo,
        descripcion: data.descripcion,
        clienteId: data.clienteId,
        fecha: `${data.fecha}T${data.hora}:00`,
      };
      const actualizada = await api.updateInteraccion(id, payload);
      setInteracciones((prev) =>
        prev.map((i) => (i.id === id ? actualizada : i)),
      );
      toastInteraccion.okActualizado();
    } catch (e) {
      console.error(e);
      toastInteraccion.errorActualizar(() => handleUpdateInteraccion(id, data));
    }
  };

  const handleDeleteInteraccion = async (id: number) => {
    const confirmar = await confirmDeleteToast(
      "¿Seguro que deseas eliminar la interacción?",
      "Si la eliminas, no la podrás recuperar",
    );
    if (!confirmar) return;

    try {
      await api.deleteInteraccion(id);
      setInteracciones((prev) => prev.filter((i) => i.id !== id));
      toastInteraccion.okEliminado();
    } catch (e) {
      console.error(e);
      toastInteraccion.errorEliminar(() => handleDeleteInteraccion(id));
    }
  };

  if (loading && interacciones.length === 0) {
    return <p className="px-4 mt-6">Cargando interacciones...</p>;
  }

  return (
    <div className="pb-20">
      <AppHeader
        title="Interacciones"
        placeholder="Buscar interacción..."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onClearSearch={() => setBusqueda("")}
      />

      <FiltrosTabs value={filtro} onChange={setFiltro} />

      <SectionTitle>
        {puedeVerTodo ? "Todas las interacciones" : "Mis interacciones"}
      </SectionTitle>

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!loading && interaccionesFiltradas.length === 0 && (
            <p className="text-center text-gray-500 col-span-2">
              No hay interacciones.
            </p>
          )}

          {interaccionesFiltradas.map((item) => (
            <InteraccionCard
              key={item.id}
              id={item.id}
              tipo={item.tipo.nombre}
              titulo={item.descripcion}
              cliente={
                clientes[item.clienteId]?.nombre ?? "Cliente desconocido"
              }
              fecha={new Date(item.fecha).toLocaleString()}
              icono={
                item.tipo.nombre === "reunion" ? (
                  <Users />
                ) : item.tipo.nombre === "consulta" ? (
                  <MessageSquare />
                ) : (
                  <NotebookText />
                )
              }
              color={
                item.tipo.nombre === "reunion"
                  ? "green"
                  : item.tipo.nombre === "consulta"
                    ? "purple"
                    : "orange"
              }
              onEdit={puedeEditar ? () => handleEdit(item) : undefined}
              onDelete={
                puedeEliminar
                  ? () => handleDeleteInteraccion(item.id)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {puedeCrear && <BotonFlotante onClick={handleAdd} />}

      <NuevaInteraccionModal
        open={modalState.open}
        onOpenChange={(o) =>
          setModalState((prev) => ({
            open: o,
            interaccion: o ? prev.interaccion : null,
          }))
        }
        interaccionToEdit={modalState.interaccion}
        onCreate={handleCreateInteraccion}
        onUpdate={handleUpdateInteraccion}
      />
    </div>
  );
}
