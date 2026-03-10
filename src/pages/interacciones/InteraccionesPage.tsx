import { api, type Interaccion } from "@/api/api";
import { BotonFlotante } from "@/components/BotonFlotante";
import {
  FiltrosTabs,
  type FiltroID,
} from "@/pages/interacciones/components/FiltrosTabs";

import { InteraccionCard } from "@/pages/interacciones/components/InteraccionCard";
import { NuevaInteraccionModal } from "@/pages/interacciones/components/NuevaInteraccionModal";

import { SectionTitle } from "@/components/SectionTitle";

import { Users, MessageSquare, NotebookText } from "lucide-react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";

export default function InteraccionesPage() {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<FiltroID>("todas");

  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const tipoFiltrado = filtro === "todas" ? undefined : filtro;

    api
      .getInteracciones({ tipo: tipoFiltrado })
      .then((data) => setInteracciones(data))
      .finally(() => setLoading(false));
  }, [filtro]);

  return (
    <div className="pb-20">
      <AppHeader title="Interacciones" />

      <FiltrosTabs value={filtro} onChange={setFiltro} />
      <SectionTitle>Todas las Interacciones</SectionTitle>

      {/* Ejemplo de datos */}
      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && (
            <p className="text-center text-gray-500">Cargando interacciones…</p>
          )}

          {!loading && interacciones.length === 0 && (
            <p className="text-center text-gray-500">No hay interacciones.</p>
          )}

          {!loading &&
            interacciones.map((item) => (
              <InteraccionCard
                key={item.id}
                tipo={item.tipo}
                titulo={item.descripcion}
                usuario={item.usuario?.nombre ?? "Usuario desconocido"}
                fecha={new Date(item.fecha).toLocaleString()}
                icono={
                  item.tipo === "reunion" ? (
                    <Users />
                  ) : item.tipo === "consulta" ? (
                    <MessageSquare />
                  ) : (
                    <NotebookText />
                  )
                }
                color={
                  item.tipo === "reunion"
                    ? "green"
                    : item.tipo === "consulta"
                      ? "purple"
                      : "orange"
                }
              />
            ))}
        </div>
      </div>
      <BotonFlotante onClick={() => setOpen(true)} />

      <NuevaInteraccionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
