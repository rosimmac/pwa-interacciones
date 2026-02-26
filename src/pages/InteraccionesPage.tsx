import { BotonFlotante } from "@/components/BotonFlotante";
import { FiltrosTabs, type FiltroID } from "@/components/FiltrosTabs";
import { HeaderInteracciones } from "@/components/HeaderInteracciones";
import { InteraccionCard } from "@/components/InteraccionCard";
import { NuevaInteraccionModal } from "@/components/NuevaInteraccionModal";

import { SectionTitle } from "@/components/SectionTitle";

import { Users, MessageSquare, NotebookText } from "lucide-react";
import { useState } from "react";

export default function InteraccionesPage() {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<FiltroID>("todas");

  return (
    <div className="pb-20">
      <HeaderInteracciones />

      <FiltrosTabs value={filtro} onChange={setFiltro} />
      <SectionTitle>Todas las Interacciones</SectionTitle>

      {/* Ejemplo de datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InteraccionCard
          tipo="Reunión"
          titulo="Reunión con Marta el lunes a las 10 am para revisar errores"
          usuario="Marta García"
          fecha="Ayer, 10:00"
          icono={<Users />}
          color="green"
        />

        <InteraccionCard
          tipo="Consulta"
          titulo="Revisión del nuevo proyecto y plazos de entrega."
          usuario="Juan Pérez"
          fecha="2 feb, 14:30"
          icono={<MessageSquare />}
          color="purple"
        />

        <InteraccionCard
          tipo="Antecedente"
          titulo="Cliente con problemas recurrentes"
          usuario="Dolores Martínez"
          fecha="5 ene, 09:10"
          icono={<NotebookText />}
          color="orange"
        />

        <InteraccionCard
          tipo="Reunión"
          titulo="Reunión con Marta el lunes a las 10 am para revisar errores"
          usuario="Marta García"
          fecha="Ayer, 10:00"
          icono={<Users />}
          color="green"
        />

        <InteraccionCard
          tipo="Consulta"
          titulo="Revisión del nuevo proyecto y plazos de entrega."
          usuario="Juan Pérez"
          fecha="2 feb, 14:30"
          icono={<MessageSquare />}
          color="purple"
        />

        <InteraccionCard
          tipo="Antecedente"
          titulo="Cliente con problemas recurrentes"
          usuario="Dolores Martínez"
          fecha="5 ene, 09:10"
          icono={<NotebookText />}
          color="orange"
        />
      </div>

      <BotonFlotante onClick={() => setOpen(true)} />

      <NuevaInteraccionModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
