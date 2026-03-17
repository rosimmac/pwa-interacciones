import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "@/context/AuthContext";

export const PrivateRoute = () => {
  const { authStatus } = useContext(AuthContext);
  if (authStatus === "checking") return null;

  if (authStatus === "authenticated") return <Outlet />;
  return <Navigate to="/login" replace />;
};
