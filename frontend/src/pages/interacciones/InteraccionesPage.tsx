/**
 * Página principal de Interacciones.
 *
 * Responsabilidades:
 *   1. Carga inicial paralela de interacciones, usuarios y clientes mediante
 *      `Promise.all`, reduciendo el tiempo total de espera a una sola ronda de red.
 *   2. Conversión de arrays a mapas indexados por `id` (Record<number, T>) para
 *      acceder en O(1) a nombre de usuario y cliente durante el renderizado.
 *   3. Filtrado reactivo con `useMemo` que combina tres criterios:
 *        - Rol: `read-only` / `user` solo ven sus propias interacciones.
 *        - Tipo: pestaña activa en `FiltrosTabs` ("todas" | "reunion" | "consulta" | "antecedente").
 *        - Texto libre: busca en tipo, descripción, nombre de usuario y nombre de cliente.
 *   4. CRUD completo con feedback toast:
 *        - Crear: prepend optimista en la lista local tras éxito de API.
 *        - Actualizar: sustitución inmutável del elemento modificado.
 *        - Eliminar: confirmación modal antes de la llamada de API.
 *   5. Control de permisos con `usePermisos`: los botones de editar/eliminar y el
 *      `BotonFlotante` solo se montan si el rol del usuario lo permite.
 */

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
  /** Mapa id → Usuario para resolución O(1) del nombre en cada tarjeta. */
  const [usuarios, setUsuarios] = useState<Record<number, Usuario>>({});
  /** Mapa id → Cliente para resolución O(1) del nombre en cada tarjeta. */
  const [clientes, setClientes] = useState<Record<number, Cliente>>({});
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroID>("todas");
  const [busqueda, setBusqueda] = useState("");
  /**
   * Estado único del modal: `open` controla la visibilidad e `interaccion`
   * determina si se abre en modo creación (null) o edición.
   * Al cerrar, `interaccion` se resetea a null para limpiar el estado del formulario.
   */
  const [modalState, setModalState] = useState<{
    open: boolean;
    interaccion: Interaccion | null;
  }>({ open: false, interaccion: null });

  /**
   * Carga inicial de datos en paralelo.
   * Los usuarios solo se cargan si el rol tiene permiso para verlos todos;
   * los demás roles reciben un array vacío para evitar llamadas innecesarias.
   */
  useEffect(() => {
    async function cargar() {
      try {
        const [interaccionesData, usuariosData, clientesData] =
          await Promise.all([
            api.getInteracciones(),
            puedeVerTodo ? api.getUsuarios() : Promise.resolve([]),
            api.getClientes(),
          ]);

        // Indexación por id para acceso O(1) desde las tarjetas
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

  /** Texto de búsqueda normalizado (minúsculas, sin espacios extremos). */
  const texto = busqueda.toLowerCase().trim();

  /**
   * Lista de interacciones tras aplicar los tres filtros encadenados:
   *   1. Filtro de rol: usuarios sin `puedeVerTodo` solo ven las suyas.
   *   2. Filtro de tipo: según la pestaña activa en FiltrosTabs.
   *   3. Filtro de texto: búsqueda libre sobre tipo, descripción, usuario y cliente.
   */
  const interaccionesFiltradas = useMemo(() => {
    let porRol = puedeVerTodo
      ? interacciones
      : interacciones.filter((i) => i.usuarioId === user?.id);

    if (filtro !== "todas") {
      porRol = porRol.filter((i) => i.tipo.nombre.toLowerCase() === filtro);
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

  /** Abre el modal en modo creación (sin interacción preseleccionada). */
  const handleAdd = () => {
    setModalState({ open: true, interaccion: null });
  };

  /** Abre el modal en modo edición con los datos de la interacción seleccionada. */
  const handleEdit = (interaccion: Interaccion) => {
    setModalState({ open: true, interaccion });
  };

  /**
   * Traduce el nombre de tipo de interacción al `tipoId` numérico que espera el backend.
   * Nota: tanto "reunion" como "antecedente" mapean al id 2 según el esquema de BD actual.
   */
  const idtipoFromTipoString = (tipo: string) => {
    let tipoId: number = 0;
    switch (tipo) {
      case "consulta":
        tipoId = 1;
        break;
      case "reunion":
        tipoId = 2;
        break;
      case "antecedente":
        tipoId = 2;
        break;
    }
    return tipoId;
  };

  /**
   * Crea una nueva interacción en el servidor y la añade al principio de la lista local.
   * El `estadoId: 1` corresponde al estado inicial "activo/pendiente".
   * En caso de error muestra un toast con botón de reintento.
   */
  const handleCreateInteraccion = async (data: any) => {
    try {
      const payload = {
        tipoId: idtipoFromTipoString(data.tipo),
        estadoId: 1,
        descripcion: data.descripcion,
        clienteId: data.clienteId,
        usuarioId: user!.id,
        // Combina fecha (YYYY-MM-DD) y hora (HH:mm) en formato ISO 8601
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

  /**
   * Actualiza una interacción existente y sustituye el elemento en la lista local.
   * El `estadoId: 2` corresponde al estado "editado/actualizado".
   * En caso de error muestra un toast con botón de reintento.
   */
  const handleUpdateInteraccion = async (id: number, data: any) => {
    try {
      const payload = {
        tipoId: idtipoFromTipoString(data.tipo),
        estadoId: 2,
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

  /**
   * Elimina una interacción tras confirmación del usuario.
   * Usa `confirmDeleteToast` para mostrar un toast modal no bloqueante.
   * Si el usuario cancela, la función retorna sin realizar ninguna llamada de red.
   */
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

  /** Pantalla de carga inicial: solo se muestra la primera vez, antes de recibir datos. */
  if (loading && interacciones.length === 0) {
    return <p className="px-4 mt-6">Cargando interacciones...</p>;
  }

  return (
    <div className="pb-20">
      {/* Cabecera con buscador de texto libre */}
      <AppHeader
        title="Interacciones"
        placeholder="Buscar interacción..."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onClearSearch={() => setBusqueda("")}
      />

      {/* Pestañas de filtro por tipo: todas / reunion / consulta / antecedente */}
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

          {/* Icono y color varían según tipo; fallback de cliente si fue eliminado */}
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
                item.tipo.nombre.toLowerCase() === "reunion" ? (
                  <Users />
                ) : item.tipo.nombre.toLowerCase() === "consulta" ? (
                  <MessageSquare />
                ) : (
                  <NotebookText />
                )
              }
              color={
                item.tipo.nombre.toLowerCase() === "reunion"
                  ? "green"
                  : item.tipo.nombre.toLowerCase() === "consulta"
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

      {/* El botón flotante solo se muestra si el rol puede crear interacciones */}
      {puedeCrear && <BotonFlotante onClick={handleAdd} />}

      {/*
       * Al cerrar el modal (o = false) se resetea `interaccion` a null para
       * que la próxima apertura siempre comience en modo creación por defecto.
       */}
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
