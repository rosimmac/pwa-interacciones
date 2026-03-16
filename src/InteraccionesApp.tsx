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
