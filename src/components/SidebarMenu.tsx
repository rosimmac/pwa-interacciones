import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { Link } from "react-router";

export function SidebarMenu() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="w-7 h-7 cursor-pointer" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-64 md:w-96 p-6 [&>button>svg]:w-6 [&>button>svg]:h-6"
      >
        <nav className="flex flex-col gap-6 mt-6">
          <SheetClose asChild>
            <Link
              to="/interacciones"
              className="text-lg font-semibold text-gray-900"
            >
              Interacciones
            </Link>
          </SheetClose>

          <SheetClose asChild>
            <Link
              to="/clientes"
              className="text-lg font-semibold text-gray-900"
            >
              Clientes
            </Link>
          </SheetClose>

          {isAdmin && (
            <SheetClose asChild>
              <Link to="/usuarios" className="text-lg font-semibold">
                Usuarios
              </Link>
            </SheetClose>
          )}
        </nav>

        <div className="mt-auto">
          <SheetClose asChild>
            <button className="text-red-600 font-medium text-sm mt-20 cursor-pointer">
              Cerrar sesión
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
