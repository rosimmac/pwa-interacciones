import { use, type JSX } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "@/context/AuthContext";

interface Props {
  element: JSX.Element;
}

export const PrivateRoute = ({ element }: Props) => {
  const { authStatus } = use(AuthContext);

  if (authStatus === "checking") {
    return null;
  }

  if (authStatus === "authenticated") {
    return element;
  }

  return <Navigate to="/login" replace />;
};
