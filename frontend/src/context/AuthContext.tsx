import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type AuthStatus = "checking" | "authenticated" | "not-authenticated";

export interface User {
  id: number;
  email: string;
  role: "admin" | "user" | "read-only";
}

interface AuthContextProps {
  authStatus: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;
  login: (id: number, email: string, role: User["role"]) => void;
  logout: () => void;
}

export const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
    const email = localStorage.getItem("authEmail");
    const role = localStorage.getItem("authRole");
    return email && role ? "authenticated" : "not-authenticated";
  });
  const [user, setUser] = useState<User | null>(() => {
    const id = localStorage.getItem("authId");
    const email = localStorage.getItem("authEmail");
    const role = localStorage.getItem("authRole") as User["role"] | null;
    return id && email && role ? { id: Number(id), email, role } : null;
  });

  const login = (id: number, email: string, role: User["role"]) => {
    setUser({ id, email, role });
    setAuthStatus("authenticated");
    localStorage.setItem("authId", String(id));
    localStorage.setItem("authEmail", email);
    localStorage.setItem("authRole", role);
  };

  const logout = () => {
    setAuthStatus("not-authenticated");
    setUser(null);
    localStorage.removeItem("authId");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authRole");
  };

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        user,
        isAuthenticated: authStatus === "authenticated",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
