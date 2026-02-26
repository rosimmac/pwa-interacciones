import { cn } from "@/lib/utils";
import { useMemo } from "react";

export type FiltroID = "todas" | "consulta" | "reunion" | "antecedente";

type FiltroItem = {
  id: FiltroID;
  label: string;
  count: number;
  color: string; // clases del badge cuando NO está activo
};

const filtros: FiltroItem[] = [
  { id: "todas", label: "Todas", count: 4, color: "bg-blue-100 text-blue-700" },
  {
    id: "consulta",
    label: "Consultas",
    count: 1,
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "reunion",
    label: "Reuniones",
    count: 2,
    color: "bg-green-100 text-green-700",
  },
  {
    id: "antecedente",
    label: "Antecedentes",
    count: 2,
    color: "bg-orange-100 text-orange-700",
  },
];

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
  value: FiltroID; // <- acepta solo esos literales
  onChange: (next: FiltroID) => void;
  compact?: boolean;
};

export function FiltrosTabs({
  value,
  onChange,
  compact = false, // opcional para móvil
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
      className="px-4 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
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
              {f.count}
            </span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
