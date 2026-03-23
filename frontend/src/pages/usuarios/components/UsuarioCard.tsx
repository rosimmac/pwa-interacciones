import { BaseCard } from "@/components/BaseCard";
import { UserRound } from "lucide-react";
import { memo } from "react";
import type { Usuario } from "@/api/api";

const rolLabel: Record<Usuario["rol"], string> = {
  admin: "Admin",
  user: "Usuario",
  "read-only": "Solo lectura",
};

const rolColor: Record<Usuario["rol"], string> = {
  admin: "bg-blue-100 text-blue-700",
  user: "bg-green-100 text-green-700",
  "read-only": "bg-gray-100 text-gray-600",
};

interface UsuarioCardProps {
  usuario: Usuario;
  onEdit?: () => void;
  onDelete?: () => void;
}

function UsuarioCardRaw({ usuario, onEdit, onDelete }: UsuarioCardProps) {
  return (
    <BaseCard
      icon={<UserRound className="h-6 w-6 text-gray-500" />}
      badge={null}
      layout="horizontal"
      onEdit={onEdit}
      onDelete={onDelete}
      colorClasses={{
        iconBg: "bg-gray-200",
        badgeBg: "bg-transparent",
        text: "text-gray-700",
      }}
    >
      <div className="flex flex-col">
        <span className="font-medium text-gray-900 text-sm">
          {usuario.nombre}
        </span>
        <span className="text-xs text-gray-500">{usuario.email}</span>
        <span
          className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-md w-fit ${rolColor[usuario.rol]}`}
        >
          {rolLabel[usuario.rol]}
        </span>
      </div>
    </BaseCard>
  );
}

export const UsuarioCard = memo(UsuarioCardRaw);
