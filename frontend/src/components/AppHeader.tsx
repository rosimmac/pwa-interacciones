/**
 * Cabecera de página reutilizable.
 *
 * Muestra el título de la sección, el botón de apertura del menú lateral
 * y, opcionalmente, un campo de búsqueda controlado desde la página padre.
 *
 * El componente se exporta en dos formas:
 *   - `AppHeaderRaw`  – versión sin memoización, útil para pruebas.
 *   - `AppHeader`     – versión memoizada con `React.memo` para evitar
 *                       re-renders cuando las props no cambian.
 */

import { SidebarMenu } from "@/components/SidebarMenu";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { memo } from "react";

type PageHeaderProps = {
  /** Texto del título de la sección actual. */
  title: string;
  /** Placeholder del buscador; si se omite se genera automáticamente. */
  placeholder?: string;

  /** Control del buscador (controlado desde la página) */
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  /** Opcional: acción al enviar (Enter) */
  onSearchSubmit?: (value: string) => void;

  /** Opcional: botón para limpiar */
  onClearSearch?: () => void;

  /** Ocultar buscador si no procede en alguna vista */
  hideSearch?: boolean;
};

export function AppHeaderRaw({
  title,
  placeholder,
  searchValue = "",
  onSearchChange,
  onClearSearch,
  hideSearch = false,
}: PageHeaderProps) {
  return (
    <header className="w-full bg-blue-600 text-white px-4 py-6 flex flex-col gap-10 shadow-md">
      {/* Título + menú */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <SidebarMenu />
      </div>

      {/* Buscador — se oculta cuando `hideSearch` es true */}
      {!hideSearch && (
        <div className="w-full -mt-6">
          <div className="relative w-full text-white">
            {/* Icono decorativo de búsqueda, no interactivo */}
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 z-20 pointer-events-none"
            />

            <Input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              // Si no se pasa placeholder, se genera uno con el título de la sección.
              placeholder={placeholder ?? `Buscar ${title.toLowerCase()}...`}
              className="
                w-full pl-10 pr-10 py-3
                rounded-lg
                bg-white/20
                border border-white/10
                text-white
                placeholder:text-white/70
                backdrop-blur-sm
                focus-visible:ring-1 focus-visible:ring-white/50
              "
            />

            {/* Botón de borrar — solo visible cuando hay texto y se ha pasado `onClearSearch` */}
            {!!searchValue && onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/** Versión memoizada para uso en producción. */
export const AppHeader = memo(AppHeaderRaw);
