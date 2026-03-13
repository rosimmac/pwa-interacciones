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
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";

export default function InteraccionesPage() {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<FiltroID>("todas");
  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setLoading(true);
    const tipoFiltrado = filtro === "todas" ? undefined : filtro;
    api
      .getInteracciones({ tipo: tipoFiltrado })
      .then((data) => setInteracciones(data))
      .finally(() => setLoading(false));
  }, [filtro]);

  const texto = busqueda.toLowerCase().trim();
  const interaccionesFiltradas = useMemo(() => {
    if (!texto) return interacciones;
    return interacciones.filter((i) => {
      const tipo = i.tipo?.toLowerCase() ?? "";
      const desc = i.descripcion?.toLowerCase() ?? "";
      const cliente = i.cliente?.nombre?.toLowerCase() ?? "";
      const usuario = i.usuario?.nombre?.toLowerCase() ?? "";
      return (
        tipo.includes(texto) ||
        desc.includes(texto) ||
        cliente.includes(texto) ||
        usuario.includes(texto)
      );
    });
  }, [interacciones, texto]);

  const handleDeleteInteraccion = async (id: number) => {
    console.log("🗑️ Eliminando interacción con id:", id);
    await api.deleteInteraccion(id);
    setInteracciones((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCrearInteraccion = async (data: Omit<Interaccion, "id">) => {
    const nueva = await api.createInteraccion(data);
    setInteracciones((prev) => [nueva, ...prev]);
  };

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
      <SectionTitle>Todas las Interacciones</SectionTitle>

      <div className="px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && interacciones.length === 0 && (
            <p className="text-center text-gray-500">Cargando interacciones…</p>
          )}

          {!loading && interaccionesFiltradas.length === 0 && (
            <p className="text-center text-gray-500">No hay interacciones.</p>
          )}

          {interaccionesFiltradas.map((item) => (
            <InteraccionCard
              key={item.id}
              id={item.id}
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
              onDelete={() => handleDeleteInteraccion(item.id)}
            />
          ))}
        </div>
      </div>
      <BotonFlotante onClick={() => setOpen(true)} />
      <NuevaInteraccionModal
        open={open}
        onOpenChange={setOpen}
        onCrear={handleCrearInteraccion}
      />
    </div>
  );
}
