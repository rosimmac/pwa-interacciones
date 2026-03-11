// src/pages/ClientesPage.tsx
import { useEffect, useMemo, useState } from "react";
import { api, type Cliente, type Interaccion } from "@/api/api";

import { BotonFlotante } from "@/components/BotonFlotante";
import { ClienteCard } from "./components/ClienteCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AppHeader } from "@/components/AppHeader";
import { NuevoClienteModal } from "./components/NuevoClienteModal";

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [conteo, setConteo] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  // Estado del modal

  const [openClienteModal, setOpenClienteModal] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<{
    id: number;
    nombre: string;
  } | null>(null);

  // -------------------------------
  // 🔍 Estado del buscador
  // -------------------------------
  const [busqueda, setBusqueda] = useState("");

  // -------------------------------
  // 📡 Cargar clientes + conteo
  // -------------------------------
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

  // -------------------------------
  // 🔎 Filtrado local por nombre
  // -------------------------------
  const texto = busqueda.toLowerCase().trim();

  const clientesFiltrados = useMemo(() => {
    if (!texto) return clientes;
    return clientes.filter((c) => c.nombre.toLowerCase().includes(texto));
  }, [clientes, texto]);

  // -------------------------------
  // ✏️ Editar cliente
  // -------------------------------
  const handleEdit = (cliente: Cliente) => {
    setClienteToEdit(cliente);
    setOpenClienteModal(true);
  };

  // -------------------------------
  // ➕ Añadir cliente
  // -------------------------------
  const handleAdd = () => {
    setClienteToEdit(null);
    setOpenClienteModal(true);
  };

  // -------------------------------
  // 🖼 Render
  // -------------------------------
  if (loading) return <p className="px-4 mt-6">Cargando clientes...</p>;

  return (
    <div className="pb-20">
      {/* Header con buscador */}
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
          {clientesFiltrados.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              id={cliente.id}
              nombre={cliente.nombre}
              interaccionesCount={conteo[cliente.id] ?? 0}
              onEdit={() => handleEdit(cliente)}
            />
          ))}
        </div>
      </div>

      <BotonFlotante onClick={handleAdd} />

      <NuevoClienteModal
        open={openClienteModal}
        onOpenChange={(o) => {
          setOpenClienteModal(o);
          if (!o) setClienteToEdit(null);
        }}
        clienteToEdit={clienteToEdit}
      />
    </div>
  );
}
