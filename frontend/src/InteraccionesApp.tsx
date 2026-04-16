/**
 * Componente raíz de la aplicación.
 *
 * Ensambla los tres proveedores de nivel superior:
 *   1. `AuthProvider`    – proporciona el contexto de sesión a toda la app.
 *   2. `RouterProvider`  – inicializa el router basado en `appRouter`.
 *   3. `Toaster`         – contenedor global de notificaciones toast (sonner),
 *                          situado fuera de `AuthProvider` para que los toasts
 *                          de cierre de sesión se muestren aunque el árbol de
 *                          autenticación se desmonte.
 *
 * La clase `bg-gradient` se define en `index.css` y aplica el degradado
 * de fondo global de la aplicación.
 */

import { RouterProvider } from "react-router";
import { appRouter } from "./router/app.router";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

export const InteraccionesApp = () => {
  return (
    <>
      <AuthProvider>
        <div className="bg-gradient">
          <RouterProvider router={appRouter} />
        </div>
      </AuthProvider>

      {/*
       * El Toaster de sonner se renderiza fuera del árbol de AuthProvider
       * para que los toasts de logout no se eliminen al desmontar el proveedor.
       * `duration: 3000` define el tiempo de vida por defecto de cada toast.
       */}
      <Toaster
        position="bottom-center"
        duration={3000}
        toastOptions={{
          classNames: {
            toast: "rounded-xl shadow-lg border",
            title: "font-medium",
            description: "text-muted-foreground",
            actionButton:
              "px-3 py-2 rounded-md bg-primary text-white hover:opacity-90",
            cancelButton:
              "px-3 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80",
          },
        }}
      />
    </>
  );
};
