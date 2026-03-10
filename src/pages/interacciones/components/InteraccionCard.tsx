import { BaseCard } from "@/components/BaseCard";
import type { ReactNode } from "react";

interface InteraccionCardProps {
  tipo: string;
  titulo: string;
  usuario: string;
  fecha: string;
  icono: ReactNode;
  color: "green" | "purple" | "orange";
}

const colorMap = {
  green: {
    iconBg: "bg-green-500",
    badgeBg: "bg-gray-300/20",
    text: "text-green-700",
  },
  purple: {
    iconBg: "bg-purple-500",
    badgeBg: "bg-gray-300/20",
    text: "text-purple-700",
  },
  orange: {
    iconBg: "bg-orange-500",
    badgeBg: "bg-gray-300/20",
    text: "text-orange-700",
  },
};

export function InteraccionCard({
  tipo,
  titulo,
  usuario,
  fecha,
  icono,
  color,
}: InteraccionCardProps) {
  return (
    <BaseCard
      icon={icono}
      badge={tipo.toUpperCase()}
      colorClasses={colorMap[color]}
    >
      <p className="text-gray-800 mt-2 text-sm leading-5">{titulo}</p>

      <div className="flex items-center gap-2 mt-3 text-gray-500 text-xs">
        <span>{usuario}</span>
        <span>•</span>
        <span>{fecha}</span>
      </div>
    </BaseCard>
  );
}
