import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { Link } from "react-router";

export function SidebarMenu() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Sheet>
      <SheetTrigger aria-label="Abrir menú lateral">
        <Menu className="w-7 h-7 cursor-pointer" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-64 md:w-96 p-6 [&>button>svg]:w-6 [&>button>svg]:h-6"
      >
        {/* Header accesible (oculto) para evitar warnings de Radix */}
        <SheetHeader>
          <SheetTitle className="sr-only">Menú lateral</SheetTitle>
          <SheetDescription className="sr-only">
            Navegación principal de la aplicación.
          </SheetDescription>
        </SheetHeader>

        {/* Menú de navegación */}
        <nav
          className="flex flex-col gap-6 mt-16"
          aria-label="Navegación principal"
        >
          <SheetClose asChild>
            <Link
              to="/interacciones"
              className="text-xl md:text-2xl font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Interacciones
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/clientes"
              className="text-xl md:text-2xl font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Clientes
            </Link>
          </SheetClose>

          {isAdmin && (
            <SheetClose asChild>
              <Link
                to="/usuarios"
                className="text-lg md:text-xl font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Usuarios
              </Link>
            </SheetClose>
          )}
        </nav>

        {/* Acciones inferiores */}
        <div className="mt-auto">
          <SheetClose asChild>
            <button className="text-red-700 font-medium text-sm mt-12 cursor-pointer hover:text-red-800 transition-colors">
              Cerrar sesión
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
