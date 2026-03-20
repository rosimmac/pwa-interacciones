import { BaseCard } from "@/components/BaseCard";
import type { ReactNode } from "react";

interface InteraccionCardProps {
  id: number;
  tipo: string;
  titulo: string;
  cliente: string;
  fecha: string;
  icono: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  color: "green" | "purple" | "orange";
}

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
      badge={tipo.toUpperCase()}
      colorClasses={colorMap[color]}
    >
      <p className="text-gray-800 mt-2 text-sm leading-5">{titulo}</p>

      <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
        <span>{cliente}</span>
        <span>•</span>
        <span>{fecha}</span>
      </div>
    </BaseCard>
  );
}
