/**
 * Tarjeta base reutilizable para las entidades del dominio.
 *
 * Soporta dos variantes de layout:
 *   - `vertical`   (default): icono y badge en la cabecera, contenido debajo.
 *                  Usada por InteraccionCard.
 *   - `horizontal`: icono a la izquierda, contenido al centro, acciones a la derecha.
 *                  Usada por ClienteCard y UsuarioCard.
 *
 * Los handlers de edición y eliminación detienen la propagación del evento para
 * evitar que el clic active también el `onClick` de la tarjeta completa.
 * `colorClasses` permite personalizar la paleta por tipo de entidad sin duplicar
 * la lógica de presentación en cada tarjeta concreta.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Pencil } from "lucide-react";
import type { ReactNode } from "react";

type BaseCardProps = {
  icon: ReactNode;
  badge?: ReactNode; // puede ser tipo, categoría, etc.
  children: ReactNode; // contenido interno variable
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  layout?: "vertical" | "horizontal";
  colorClasses?: {
    iconBg: string;
    text: string;
    badgeBg: string;
  };
};

export function BaseCard({
  icon,
  badge,
  children,
  onEdit,
  onDelete,
  onClick,
  layout = "vertical", // por defecto las interacciones siguen funcionando
  colorClasses,
}: BaseCardProps) {
  const c = colorClasses ?? {
    iconBg: "bg-gray-300",
    badgeBg: "bg-gray-200/60",
    text: "text-gray-700",
  };

  // Helper para acciones seguras
  const handleSafe = (fn?: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn?.();
  };

  return (
    <Card className="rounded-2xl shadow-sm bg-white border" onClick={onClick}>
      <CardContent className="p-4">
        {/* Si es LAYOUT HORIZONTAL (Clientes) */}
        {layout === "horizontal" && (
          <div className="flex items-center justify-between">
            {/* Icono + texto */}
            <div className="flex items-center gap-4">
              <div
                className={`h-10 w-10 flex items-center justify-center rounded-xl ${c.iconBg}`}
              >
                {icon}
              </div>

              <div className="flex flex-col">{children}</div>
            </div>

            {/* Acciones - layout horizontal */}
            <div className="flex items-center gap-3">
              {onDelete && (
                <Trash2
                  type="button"
                  className="h-5 w-5 text-red-500 cursor-pointer"
                  onClick={handleSafe(onDelete)}
                />
              )}
              {onEdit && (
                <Pencil
                  type="button"
                  className="h-5 w-5 text-gray-500 cursor-pointer"
                  onClick={handleSafe(onEdit)}
                />
              )}
            </div>
          </div>
        )}

        {/* Si es LAYOUT VERTICAL (Interacciones) */}
        {layout === "vertical" && (
          <>
            {/* Header */}
            <div
              className={`flex justify-between w-full ${badge ? "items-start" : "items-center"}`}
            >
              <div
                className={`flex gap-2 ${badge ? "items-start" : "items-center"}`}
              >
                <div
                  className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl ${c.iconBg}`}
                >
                  <span className="text-white">{icon}</span>
                </div>

                {badge && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${c.badgeBg} ${c.text}`}
                  >
                    {badge}
                  </span>
                )}
              </div>

              {/* Acciones - layout vertical */}
              <div className="flex items-center gap-3">
                {onDelete && (
                  <Trash2
                    type="button"
                    className="h-5 w-5 text-red-500 cursor-pointer"
                    onClick={handleSafe(onDelete)}
                  />
                )}
                {onEdit && (
                  <Pencil
                    type="button"
                    className="h-5 w-5 text-gray-500 cursor-pointer"
                    onClick={handleSafe(onEdit)}
                  />
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="px-14 mt-1">{children}</div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
