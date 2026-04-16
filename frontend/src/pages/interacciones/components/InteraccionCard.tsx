/**
 * Tarjeta de visualización de una interacción comercial.
 *
 * Delega la estructura base (icono, badge, acciones editar/eliminar) en
 * `BaseCard` y aporta solo el contenido específico: descripción, cliente
 * y fecha de la interacción.
 *
 * El mapa `colorMap` traduce la prop `color` ("green" | "purple" | "orange")
 * a las clases de Tailwind concretas que necesita `BaseCard`, centralizando
 * la paleta cromática por tipo de interacción:
 *   - green  → reunión
 *   - purple → consulta
 *   - orange → antecedente
 */

import { BaseCard } from "@/components/BaseCard";
import type { ReactNode } from "react";

interface InteraccionCardProps {
  id: number;
  /** Nombre del tipo de interacción ("consulta", "reunion", "antecedente"). */
  tipo: string;
  /** Texto descriptivo de la interacción. */
  titulo: string;
  /** Nombre del cliente asociado. */
  cliente: string;
  /** Fecha y hora formateada para mostrar. */
  fecha: string;
  /** Icono de Lucide que representa el tipo de interacción. */
  icono: ReactNode;
  /** Callback de edición; si se omite, el botón de editar no se muestra. */
  onEdit?: () => void;
  /** Callback de eliminación; si se omite, el botón de eliminar no se muestra. */
  onDelete?: () => void;
  /** Paleta de color vinculada al tipo de interacción. */
  color: "green" | "purple" | "orange";
}

/** Mapeo de paletas semánticas a clases Tailwind concretas de `BaseCard`. */
const colorMap = {
  green: {
    iconBg: "bg-teal-600",
    badgeBg: "bg-gray-300/20",
    text: "text-green-700",
  },
  purple: {
    iconBg: "bg-violet-600",
    badgeBg: "bg-gray-300/20",
    text: "text-violet-700",
  },
  orange: {
    iconBg: "bg-amber-600",
    badgeBg: "bg-gray-300/20",
    text: "text-amber-700",
  },
};

export function InteraccionCard({
  tipo,
  titulo,
  cliente,
  fecha,
  icono,
  color,
  onEdit,
  onDelete,
}: InteraccionCardProps) {
  return (
    <BaseCard
      onDelete={onDelete}
      onEdit={onEdit}
      icon={icono}
      // El badge muestra el tipo en mayúsculas como etiqueta visual.
      badge={tipo.toUpperCase()}
      colorClasses={colorMap[color]}
    >
      {/* Descripción breve de la interacción */}
      <p className="text-gray-800 mt-2 text-sm leading-5">{titulo}</p>

      {/* Metadatos: cliente y fecha separados por un punto medio */}
      <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
        <span>{cliente}</span>
        <span>•</span>
        <span>{fecha}</span>
      </div>
    </BaseCard>
  );
}
