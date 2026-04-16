/**
 * Tarjeta de visualización de un cliente.
 *
 * Muestra el nombre del cliente y, opcionalmente, el recuento de interacciones
 * asociadas. Delega la estructura visual (icono, acciones editar/eliminar) en
 * `BaseCard` con layout horizontal.
 *
 * Los callbacks `onEdit` y `onDelete` reciben el `id` del cliente en lugar de
 * un objeto completo para mantener la interfaz mínima y evitar prop drilling.
 *
 * Se exporta memoizada con `React.memo` para evitar re-renders cuando el padre
 * actualiza estado no relacionado con este cliente.
 */

import { BaseCard } from "@/components/BaseCard";
import { UserRound } from "lucide-react";
import { memo } from "react";

interface ClienteCardProps {
  id: number;
  nombre: string;
  interaccionesCount?: number;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ClienteCardRaw({
  id,
  nombre,
  interaccionesCount,
  onEdit,
  onDelete,
}: ClienteCardProps) {
  return (
    <BaseCard
      // Icono grande de la izquierda (avatar)
      icon={<UserRound className="h-6 w-6 text-gray-500" />}
      // Los clientes NO tienen badge, así que NULL
      badge={null}
      layout="horizontal"
      // Acciones: edit/delete
      onEdit={onEdit ? () => onEdit(id) : undefined}
      onDelete={onDelete ? () => onDelete(id) : undefined}
      // Colores propios de clienteCard
      colorClasses={{
        iconBg: "bg-gray-200",
        badgeBg: "bg-transparent",
        text: "text-gray-700",
      }}
    >
      {/* --- CONTENIDO PERSONALIZADO DEL CLIENTE --- */}
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 text-sm">{nombre}</span>

        {interaccionesCount !== undefined && (
          <span className="text-xs text-gray-500">
            Interacciones ({interaccionesCount})
          </span>
        )}
      </div>
    </BaseCard>
  );
}

export const ClienteCard = memo(ClienteCardRaw);
