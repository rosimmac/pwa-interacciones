import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "@/context/AuthContext";

export const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  if (user?.role !== "admin") {
    return <Navigate to="/interacciones" replace />;
  }

  return <Outlet />;
};
