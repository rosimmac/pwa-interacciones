import { BaseCard } from "@/components/BaseCard";
import { UserRound } from "lucide-react";

interface ClienteCardProps {
  id: number;
  nombre: string;
  interaccionesCount?: number;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ClienteCard({
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
      onEdit={() => onEdit?.(id)}
      onDelete={() => onDelete?.(id)}
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
