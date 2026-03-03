import { RouterProvider } from "react-router";
import { appRouter } from "./router/app.router";
import { AuthProvider } from "./context/AuthContext";

export const InteraccionesApp = () => {
  return (
    <AuthProvider>
      <div className="bg-gradient">
        <RouterProvider router={appRouter} />
      </div>
    </AuthProvider>
  );
};
