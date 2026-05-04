/**
 * Barra de filtros por tipo de interacción.
 *
 * Renderiza un grupo de botones tipo "tab" (role="tablist") con un badge
 * numérico estático. Cada botón cambia de color al activarse siguiendo la
 * paleta semántica del tipo:
 *   - todas       → azul
 *   - consulta    → violeta
 *   - reunion     → verde
 *   - antecedente → naranja
 *
 * Las clases base de botón y badge se calculan con `useMemo` para evitar
 * recalcular el string de Tailwind en cada render; solo se recalculan si
 * cambia la prop `compact`.
 *
 * La prop `compact` reduce el padding para vistas móviles en espacio reducido.
 */

import { cn } from "@/lib/utils";
import { useMemo } from "react";

export type FiltroID = "todas" | "consulta" | "reunion" | "antecedente";

type FiltroItem = {
  id: FiltroID;
  label: string;
  count: number;
  /** Clases Tailwind del badge cuando el filtro NO está activo. */
  color: string;
};

const filtros: Omit<FiltroItem, "count">[] = [
  { id: "todas", label: "Todas", color: "bg-blue-100 text-blue-700" },
  {
    id: "consulta",
    label: "Consultas",
    color: "bg-purple-100 text-purple-700",
  },
  { id: "reunion", label: "Reuniones", color: "bg-green-100 text-green-700" },
  {
    id: "antecedente",
    label: "Antecedentes",
    color: "bg-orange-100 text-orange-700",
  },
];

/**
 * Devuelve las clases Tailwind del botón y del badge para el estado activo
 * según el tipo de filtro. Se mantiene separado de `filtros` para no mezclar
 * datos con lógica de presentación.
 */
function classesActivasPorId(id: FiltroID) {
  switch (id) {
    case "todas":
      return {
        button: "bg-blue-600 text-white shadow-md hover:bg-blue-700",
        badge: "bg-white text-blue-600",
      };
    case "consulta":
      return {
        button: "bg-purple-600 text-white shadow-md hover:bg-purple-700",
        badge: "bg-white text-purple-600",
      };
    case "reunion":
      return {
        button: "bg-green-600 text-white shadow-md hover:bg-green-700",
        badge: "bg-white text-green-600",
      };
    case "antecedente":
      return {
        button: "bg-orange-600 text-white shadow-md hover:bg-orange-700",
        badge: "bg-white text-orange-600",
      };
  }
}

type FiltrosTabsProps = {
  /** Filtro actualmente seleccionado. */
  value: FiltroID;
  /** Callback invocado al cambiar la selección. */
  onChange: (next: FiltroID) => void;
  /** Si es true, reduce el padding para entornos con espacio horizontal limitado. */
  compact?: boolean;
  counts: Record<FiltroID, number>;
};

export function FiltrosTabs({
  value,
  onChange,
  compact = false, // opcional para móvil
  counts,
}: FiltrosTabsProps) {
  const baseButton = useMemo(
    () =>
      cn(
        " cursor-pointer flex items-center gap-4 rounded-xl text-sm font-medium transition-colors",
        compact ? "px-3 py-1.5" : "px-4 py-2",
        // estilo inactivo
        "bg-gray-100 text-gray-700 hover:bg-gray-200",
      ),
    [compact],
  );

  const baseBadge = useMemo(() => cn("text-xs px-2 py-1 rounded-lg"), []);

  return (
    <div
      className="px-4 mt-4 grid grid-cols-2 gap-3 md:flex md:flex-wrap"
      role="tablist"
      aria-label="Filtros de interacciones"
    >
      {filtros.map((f) => {
        const activo = f.id === value;
        const activeClasses = classesActivasPorId(f.id);

        return (
          <button
            key={f.id}
            role="tab"
            aria-selected={activo}
            aria-pressed={activo}
            className={cn(baseButton, activo && activeClasses.button)}
            onClick={() => onChange(f.id)}
          >
            <span
              className={cn(baseBadge, activo ? activeClasses.badge : f.color)}
            >
              {counts[f.id]}
            </span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
