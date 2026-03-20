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

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [conteo, setConteo] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [ultimoPayload, setUltimoPayload] = useState<ClienteFormData | null>(
    null,
  );
  const [modalState, setModalState] = useState<{
    open: boolean;
    cliente: Cliente | null;
  }>({ open: false, cliente: null });
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const clientesData = await api.getClientes();
        const interaccionesData = await api.getInteracciones();

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

  const texto = busqueda.toLowerCase().trim();
  const clientesFiltrados = useMemo(() => {
    if (!texto) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(texto));
  }, [clientes, texto]);

  const handleEdit = (cliente: Cliente) => {
    setModalState({ open: true, cliente });
  };

  const handleAdd = () => {
    setModalState({ open: true, cliente: null });
  };

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

            return (
              <ClienteCard
                key={cliente.id}
                id={cliente.id}
                nombre={cliente.nombre}
                interaccionesCount={count}
                onEdit={() => handleEdit(cliente)}
                onDelete={() => handleDeleteCliente(cliente.id)}
              />
            );
          })}
        </div>
      </div>

      <BotonFlotante onClick={handleAdd} />

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
