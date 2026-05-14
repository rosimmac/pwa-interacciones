/**
 * Menú lateral de navegación principal de la aplicación.
 *
 * Implementado con `Sheet` de Radix UI, que desliza desde la izquierda en
 * móvil y escritorio. Muestra los enlaces a Interacciones, Clientes y,
 * condicionalmente, Usuarios (solo si el usuario tiene rol "admin").
 *
 * El cierre de sesión presenta un `Dialog` de confirmación antes de llamar a
 * `api.logout`. El bloque `finally` garantiza que el contexto local se limpie
 * aunque la llamada de red falle.
 *
 * Exportado memoizado con `React.memo` para evitar re-renders innecesarios
 * cuando el componente padre actualiza estado no relacionado con la sesión.
 */

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Menu } from "lucide-react";
import { memo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toastAuth } from "./toast";
import { api } from "@/api/api";

export const SidebarMenu = memo(function SidebarMenu() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      logout(); // limpia el contexto y localStorage aunque falle la llamada
      toastAuth.okCerrarSesion();
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger aria-label="Abrir menú lateral">
          <Menu className="w-7 h-7 cursor-pointer" />
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-64 md:w-96 p-6 [&>button>svg]:w-6 [&>button>svg]:h-6"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Menú lateral</SheetTitle>
            <SheetDescription className="sr-only">
              Navegación principal de la aplicación.
            </SheetDescription>
          </SheetHeader>

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
                  className="text-xl md:text-2xl font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Usuarios
                </Link>
              </SheetClose>
            )}
          </nav>

          <div className="mt-auto">
            <SheetClose asChild>
              <button
                className="text-red-700 font-medium text-sm mt-12 cursor-pointer hover:text-red-800 transition-colors"
                onClick={() => setConfirmOpen(true)}
              >
                Cerrar sesión
              </button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Tu sesión actual se cerrará y tendrás que volver a iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primaryBlue" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
