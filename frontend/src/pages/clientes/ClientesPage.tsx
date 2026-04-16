/**
 * Página de gestión de clientes.
 *
 * Responsabilidades:
 *   1. Carga clientes e interacciones en paralelo secuencial al montar:
 *      primero los clientes, luego las interacciones para calcular el
 *      conteo de interacciones por cliente (Record<clienteId, count>).
 *   2. Filtrado en cliente por nombre via `useMemo`.
 *   3. CRUD completo con feedback toast y reintento:
 *        - Crear: guarda el último payload en `ultimoPayload` para poder
 *          reintentar si la llamada de API falla.
 *        - Actualizar: ídem, reintento con el mismo payload.
 *        - Eliminar: confirmación modal antes de la llamada de API.
 *   4. Control de permisos con `usePermisos`: los botones de editar/eliminar
 *      y el `BotonFlotante` solo se montan si el rol lo permite.
 */

import { useEffect, useMemo, useState } from "react";
import { api, type Cliente, type Interaccion } from "@/api/api";

import { BotonFlotante } from "@/components/BotonFlotante";
import { ClienteCard } from "./components/ClienteCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AppHeader } from "@/components/AppHeader";
import { NuevoClienteModal } from "./components/NuevoClienteModal";
import type { ClienteFormData } from "@/schemas/clientesSchema";
import { toastCliente } from "@/components/toast";
import { confirmDeleteToast } from "@/components/ConfirmToast";
import { usePermisos } from "@/hooks/usePermisos";

export function ClientesPage() {
  const { puedeCrear, puedeEditar, puedeEliminar } = usePermisos();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  /** Mapa clienteId → número de interacciones, para mostrar el contador en cada tarjeta. */
  const [conteo, setConteo] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  /**
   * Último payload enviado. Se persiste para poder reintentarlo desde el toast
   * de error sin que el usuario tenga que volver a abrir el formulario.
   */
  const [ultimoPayload, setUltimoPayload] = useState<ClienteFormData | null>(
    null,
  );
  const [modalState, setModalState] = useState<{
    open: boolean;
    cliente: Cliente | null;
  }>({ open: false, cliente: null });
  const [busqueda, setBusqueda] = useState("");

  /**
   * Carga inicial: clientes e interacciones secuencialmente.
   * Las interacciones se usan solo para construir el mapa de conteo;
   * no se almacenan en estado para evitar redundancia con InteraccionesPage.
   */
  useEffect(() => {
    async function cargar() {
      try {
        const clientesData = await api.getClientes();
        const interaccionesData = await api.getInteracciones();

        // Cuenta cuántas interacciones tiene cada cliente
        const counts: Record<number, number> = {};
        interaccionesData.forEach((i: Interaccion) => {
          counts[i.clienteId] = (counts[i.clienteId] || 0) + 1;
        });

        setClientes(clientesData);
        setConteo(counts);
      } catch (error) {
        console.error("Error cargando clientes/interacciones", error);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  /** Filtra por nombre; sin texto devuelve la lista completa. */
  const texto = busqueda.toLowerCase().trim();
  const clientesFiltrados = useMemo(() => {
    if (!texto) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(texto));
  }, [clientes, texto]);

  /** Abre el modal en modo edición con el cliente seleccionado. */
  const handleEdit = (cliente: Cliente) => {
    setModalState({ open: true, cliente });
  };

  /** Abre el modal en modo creación. */
  const handleAdd = () => {
    setModalState({ open: true, cliente: null });
  };

  /**
   * Crea un cliente, lo añade a la lista local y registra su conteo inicial (0).
   * Guarda el payload antes de la llamada para poder reintentar desde el toast de error.
   */
  const handleCreateCliente = async (data: ClienteFormData) => {
    setUltimoPayload(data);
    try {
      const nuevo = await api.createCliente(data);
      setClientes((prev) => [...prev, nuevo]);
      setConteo((prev) => ({ ...prev, [nuevo.id]: 0 }));
      toastCliente.okGuardado();
    } catch (e) {
      console.error(e);
      toastCliente.errorGuardar(async () => {
        if (ultimoPayload) await handleCreateCliente(ultimoPayload);
      });
    }
  };

  /**
   * Actualiza un cliente y reemplaza el elemento en la lista local.
   * Igual que en crear, guarda el payload para reintento desde el toast.
   */
  const handleUpdateCliente = async (id: number, data: ClienteFormData) => {
    setUltimoPayload(data);
    try {
      const actualizado = await api.updateCliente(id, data);
      setClientes((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
      toastCliente.okActualizado();
    } catch (e) {
      console.error(e);
      toastCliente.errorActualizar(async () => {
        if (ultimoPayload) await handleUpdateCliente(id, ultimoPayload);
      });
    }
  };

  /**
   * Elimina un cliente tras confirmación modal.
   * Si el usuario cancela, retorna sin realizar ninguna llamada de red.
   */
  const handleDeleteCliente = async (id: number) => {
    const confirmar = await confirmDeleteToast(
      "¿Seguro que deseas eliminar el cliente?",
      "Si lo eliminas, no lo podrás recuperar",
    );
    if (!confirmar) return;

    try {
      await api.deleteCliente(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
      toastCliente.okEliminado();
    } catch (e) {
      console.error(e);
      toastCliente.errorEliminar(() => handleDeleteCliente(id));
    }
  };

  if (loading && clientes.length === 0) {
    return <p className="px-4 mt-6">Cargando clientes...</p>;
  }

  return (
    <div className="pb-20">
      <AppHeader
        title="Clientes"
        placeholder="Buscar cliente..."
        searchValue={busqueda}
        onSearchChange={setBusqueda}
        onClearSearch={() => setBusqueda("")}
      />

      <SectionTitle>Todos los clientes</SectionTitle>

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientesFiltrados.map((cliente) => {
            const count = conteo[cliente.id] ?? 0;
            console.log("onEdit:", puedeEditar ? "función" : undefined);
            console.log("onDelete:", puedeEliminar ? "función" : undefined);

            return (
              <ClienteCard
                key={cliente.id}
                id={cliente.id}
                nombre={cliente.nombre}
                interaccionesCount={count}
                onEdit={puedeEditar ? () => handleEdit(cliente) : undefined}
                onDelete={
                  puedeEliminar
                    ? () => handleDeleteCliente(cliente.id)
                    : undefined
                }
              />
            );
          })}
        </div>
      </div>

      {puedeCrear && <BotonFlotante onClick={handleAdd} />}

      <NuevoClienteModal
        open={modalState.open}
        onOpenChange={(o) =>
          setModalState((prev) => ({
            open: o,
            cliente: o ? prev.cliente : null,
          }))
        }
        clienteToEdit={modalState.cliente}
        onCreate={handleCreateCliente}
        onUpdate={handleUpdateCliente}
      />
    </div>
  );
}
