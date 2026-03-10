// src/pages/ClientesPage.tsx
import { useEffect, useState } from "react";
import { api, type Cliente, type Interaccion } from "@/api/api";

import { BotonFlotante } from "@/components/BotonFlotante";
import { ClienteCard } from "./components/ClienteCard";
import { SectionTitle } from "@/components/SectionTitle";
import { AppHeader } from "@/components/AppHeader";

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [conteo, setConteo] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        // 1) Cargar clientes
        const clientesData = await api.getClientes();

        // 2) Cargar interacciones (reutilizando endpoint actual)
        const interaccionesData = await api.getInteracciones();

        // 3) Agrupar conteo por clienteId
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

  if (loading) return <p className="px-4 mt-6">Cargando clientes...</p>;

  return (
    <div className="pb-20">
      <AppHeader title="Clientes" />
      <SectionTitle>Todos los clientes</SectionTitle>

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              id={cliente.id}
              nombre={cliente.nombre}
              interaccionesCount={conteo[cliente.id] ?? 0}
            />
          ))}
        </div>
      </div>

      <BotonFlotante onClick={() => console.log("Crear cliente")} />
    </div>
  );
}
