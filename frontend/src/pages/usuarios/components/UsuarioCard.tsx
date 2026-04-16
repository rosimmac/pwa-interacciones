/**
 * Tarjeta de visualización de un usuario del sistema.
 *
 * Muestra nombre, email y rol del usuario dentro de un `BaseCard` horizontal.
 * El rol se presenta con una etiqueta coloreada según `rolColor`, que asocia
 * cada nivel de acceso a una paleta semántica:
 *   - admin      → azul
 *   - user       → verde
 *   - read-only  → gris
 *
 * Se exporta memoizado con `React.memo` para evitar re-renders cuando el
 * componente padre actualiza estado no relacionado con este usuario.
 */

import { BaseCard } from "@/components/BaseCard";
import { UserRound } from "lucide-react";
import { memo } from "react";
import type { Usuario } from "@/api/api";

/** Texto legible del rol para mostrar en la interfaz. */
const rolLabel: Record<Usuario["rol"], string> = {
  admin: "Admin",
  user: "Usuario",
  "read-only": "Solo lectura",
};

/** Clases Tailwind de la etiqueta de rol según nivel de acceso. */
const rolColor: Record<Usuario["rol"], string> = {
  admin: "bg-blue-100 text-blue-700",
  user: "bg-green-100 text-green-700",
  "read-only": "bg-gray-100 text-gray-600",
};

interface UsuarioCardProps {
  usuario: Usuario;
  /** Callback de edición; si se omite, el botón de editar no se muestra. */
  onEdit?: () => void;
  /** Callback de eliminación; si se omite, el botón de eliminar no se muestra. */
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
        {/* Etiqueta coloreada del rol */}
        <span
          className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-md w-fit ${rolColor[usuario.rol]}`}
        >
          {rolLabel[usuario.rol]}
        </span>
      </div>
    </BaseCard>
  );
}

/** Versión memoizada para uso en listas con muchos elementos. */
export const UsuarioCard = memo(UsuarioCardRaw);
